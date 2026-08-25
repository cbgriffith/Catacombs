using Catacombs.Contracts.Administration;
using Catacombs.Models;
using Catacombs.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;

namespace Catacombs.Controllers
{
    [Authorize(Roles = UserRoles.Admin)]
    [AutoValidateAntiforgeryToken]
    [Route("api/admin/users")]
    [ApiController]
    public sealed class AdminUsersController : ControllerBase
    {
        private readonly IUsersRepository _usersRepository;

        public AdminUsersController(IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult GetUsers()
        {
            var users = _usersRepository.GetAll()
                .Select(AdminUserResponse.FromUser);

            return Ok(users);
        }

        [HttpPut("{userId:int}/ban")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public IActionResult BanUser(
            int userId,
            BanUserRequest request)
        {
            if (!TryGetCurrentUserId(out var currentUserId))
            {
                return Unauthorized();
            }

            var user = _usersRepository.GetById(userId);
            if (user == null)
            {
                return NotFound();
            }

            if (user.id == currentUserId)
            {
                return BadRequestProblem(
                    "You cannot ban your own account.");
            }

            if (string.Equals(
                user.role,
                UserRoles.Admin,
                StringComparison.Ordinal))
            {
                return BadRequestProblem(
                    "Administrator accounts cannot be banned.");
            }

            if (user.isBanned)
            {
                return ConflictProblem(
                    "This account is already banned.");
            }

            var reason = string.IsNullOrWhiteSpace(request.Reason)
                ? null
                : request.Reason.Trim();

            if (!_usersRepository.Ban(
                user.id,
                currentUserId,
                reason))
            {
                return ConflictProblem(
                    "The account could not be banned because its status changed.");
            }

            return Ok(AdminUserResponse.FromUser(
                _usersRepository.GetById(user.id)));
        }

        [HttpDelete("{userId:int}/ban")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public IActionResult UnbanUser(int userId)
        {
            var user = _usersRepository.GetById(userId);
            if (user == null)
            {
                return NotFound();
            }

            if (!user.isBanned)
            {
                return ConflictProblem(
                    "This account is not currently banned.");
            }

            if (!_usersRepository.Unban(user.id))
            {
                return ConflictProblem(
                    "The account could not be unbanned because its status changed.");
            }

            return Ok(AdminUserResponse.FromUser(
                _usersRepository.GetById(user.id)));
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            return int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out userId);
        }

        private static BadRequestObjectResult BadRequestProblem(
            string title)
        {
            return new BadRequestObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = title
            });
        }

        private static ConflictObjectResult ConflictProblem(string title)
        {
            return new ConflictObjectResult(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = title
            });
        }
    }
}
