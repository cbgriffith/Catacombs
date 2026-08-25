using Catacombs.Authentication;
using Catacombs.Contracts.Authentication;
using Catacombs.Models;
using Catacombs.Repositories;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using System;
using System.Globalization;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Catacombs.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private const string UniqueEmailConstraint = "uq_users_email";
        private const string UniqueUsernameIndex =
            "uq_users_username_ci";

        private readonly IUsersRepository _usersRepository;
        private readonly IPasswordHasher<Users> _passwordHasher;
        private readonly IAntiforgery _antiforgery;

        public AuthController(
            IUsersRepository usersRepository,
            IPasswordHasher<Users> passwordHasher,
            IAntiforgery antiforgery)
        {
            _usersRepository = usersRepository;
            _passwordHasher = passwordHasher;
            _antiforgery = antiforgery;
        }

        [HttpGet("antiforgery-token")]
        [ProducesResponseType(
            typeof(AntiforgeryTokenResponse),
            StatusCodes.Status200OK)]
        public ActionResult<AntiforgeryTokenResponse> GetAntiforgeryToken()
        {
            var tokenSet = _antiforgery.GetAndStoreTokens(HttpContext);
            var requestToken = tokenSet.RequestToken
                ?? throw new InvalidOperationException(
                    "The antiforgery request token was not generated.");

            Response.Headers["Cache-Control"] = "no-store";
            return Ok(new AntiforgeryTokenResponse
            {
                Token = requestToken
            });
        }

        [HttpPost("register")]
        [ValidateAntiForgeryToken]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public IActionResult Register(RegisterRequest request)
        {
            var normalizedUsername = request.Username.Trim();

            if (normalizedUsername.Length < 2)
            {
                ModelState.AddModelError(
                    nameof(request.Username),
                    "Username must contain at least 2 characters.");
                return ValidationProblem(ModelState);
            }

            var normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            if (_usersRepository.GetByUsername(normalizedUsername) != null)
            {
                return DuplicateUsernameConflict();
            }

            if (_usersRepository.GetByEmail(normalizedEmail) != null)
            {
                return DuplicateEmailConflict();
            }

            var user = new Users
            {
                username = normalizedUsername,
                email = normalizedEmail
            };
            user.passwordHash = _passwordHasher.HashPassword(
                user,
                request.Password);

            try
            {
                _usersRepository.Add(user);
            }
            catch (PostgresException exception)
                when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
            {
                if (string.Equals(
                    exception.ConstraintName,
                    UniqueUsernameIndex,
                    StringComparison.Ordinal))
                {
                    return DuplicateUsernameConflict();
                }

                if (string.Equals(
                    exception.ConstraintName,
                    UniqueEmailConstraint,
                    StringComparison.Ordinal))
                {
                    return DuplicateEmailConflict();
                }

                throw;
            }

            return StatusCode(
                StatusCodes.Status201Created,
                UserResponse.FromUser(user));
        }

        [HttpPost("login")]
        [ValidateAntiForgeryToken]
        [EnableRateLimiting("Login")]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<UserResponse>> Login(
            LoginRequest request)
        {
            var normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();
            var user = _usersRepository.GetByEmail(normalizedEmail);

            if (user == null)
            {
                _passwordHasher.HashPassword(new Users(), request.Password);
                return InvalidCredentials();
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.passwordHash,
                request.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return InvalidCredentials();
            }

            if (user.isBanned)
            {
                return BannedAccount();
            }

            if (verificationResult ==
                PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.passwordHash = _passwordHasher.HashPassword(
                    user,
                    request.Password);
                _usersRepository.UpdatePasswordHash(
                    user.id,
                    user.passwordHash);
            }

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                UserClaimsPrincipalFactory.CreatePrincipal(user),
                new AuthenticationProperties
                {
                    AllowRefresh = true,
                    IsPersistent = false
                });

            Response.Headers["Cache-Control"] = "no-store";
            return Ok(UserResponse.FromUser(user));
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserResponse>> CurrentUser()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(
                userIdValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var userId))
            {
                await HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized();
            }

            var user = _usersRepository.GetById(userId);
            if (user == null)
            {
                await HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized();
            }

            Response.Headers["Cache-Control"] = "no-store";
            return Ok(UserResponse.FromUser(user));
        }

        [Authorize]
        [HttpPost("change-password")]
        [ValidateAntiForgeryToken]
        [EnableRateLimiting("PasswordChange")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> ChangePassword(
            ChangePasswordRequest request)
        {
            var userIdValue = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(
                userIdValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var userId))
            {
                await HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized();
            }

            var user = _usersRepository.GetById(userId);
            if (user == null)
            {
                await HttpContext.SignOutAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized();
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.passwordHash,
                request.CurrentPassword);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "The current password is incorrect."
                });
            }

            if (string.Equals(
                request.CurrentPassword,
                request.NewPassword,
                StringComparison.Ordinal))
            {
                ModelState.AddModelError(
                    nameof(request.NewPassword),
                    "The new password must be different from the current password.");
                return ValidationProblem(ModelState);
            }

            user.passwordHash = _passwordHasher.HashPassword(
                user,
                request.NewPassword);
            _usersRepository.UpdatePasswordHash(
                user.id,
                user.passwordHash);

            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);

            return NoContent();
        }

        [Authorize]
        [HttpPost("logout")]
        [ValidateAntiForgeryToken]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);
            return NoContent();
        }

        private static ConflictObjectResult DuplicateEmailConflict()
        {
            return new ConflictObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "An account with that email already exists."
            });
        }

        private static UnauthorizedObjectResult InvalidCredentials()
        {
            return new UnauthorizedObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid email or password."
            });
        }

        private static ConflictObjectResult DuplicateUsernameConflict()
        {
            return new ConflictObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "That username is already in use."
            });
        }

        private static ObjectResult BannedAccount()
        {
            return new ObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "This account has been banned."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}
