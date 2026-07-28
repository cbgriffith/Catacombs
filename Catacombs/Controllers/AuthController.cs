using Catacombs.Contracts.Authentication;
using Catacombs.Models;
using Catacombs.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Catacombs.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IPasswordHasher<Users> _passwordHasher;

        public AuthController(
            IUsersRepository usersRepository,
            IPasswordHasher<Users> passwordHasher)
        {
            _usersRepository = usersRepository;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("register")]
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
                return DuplicateEmailConflict();
            }

            return StatusCode(
                StatusCodes.Status201Created,
                UserResponse.FromUser(user));
        }

        private static ConflictObjectResult DuplicateEmailConflict()
        {
            return new ConflictObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "An account with that email already exists."
            });
        }
    }
}
