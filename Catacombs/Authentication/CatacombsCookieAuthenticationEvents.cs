using Catacombs.Models;
using Catacombs.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Catacombs.Authentication
{
    public sealed class CatacombsCookieAuthenticationEvents
        : CookieAuthenticationEvents
    {
        private readonly IUsersRepository _usersRepository;

        public CatacombsCookieAuthenticationEvents(
            IUsersRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public override async Task ValidatePrincipal(
            CookieValidatePrincipalContext context)
        {
            var userIdValue = context.Principal?.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(
                userIdValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var userId))
            {
                await RejectPrincipalAsync(context);
                return;
            }

            var user = _usersRepository.GetById(userId);
            if (user == null || user.isBanned)
            {
                await RejectPrincipalAsync(context);
                return;
            }

            if (!ClaimsAreCurrent(context.Principal, user))
            {
                context.ReplacePrincipal(
                    UserClaimsPrincipalFactory.CreatePrincipal(user));
                context.ShouldRenew = true;
            }
        }

        public override Task RedirectToLogin(
            RedirectContext<CookieAuthenticationOptions> context)
        {
            context.Response.StatusCode =
                StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        public override Task RedirectToAccessDenied(
            RedirectContext<CookieAuthenticationOptions> context)
        {
            context.Response.StatusCode =
                StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }

        private static bool ClaimsAreCurrent(
            ClaimsPrincipal principal,
            Users user)
        {
            return string.Equals(
                    principal.FindFirstValue(ClaimTypes.Name),
                    user.username,
                    System.StringComparison.Ordinal)
                && string.Equals(
                    principal.FindFirstValue(ClaimTypes.Email),
                    user.email,
                    System.StringComparison.Ordinal)
                && string.Equals(
                    principal.FindFirstValue(ClaimTypes.Role),
                    user.role,
                    System.StringComparison.Ordinal);
        }

        private static async Task RejectPrincipalAsync(
            CookieValidatePrincipalContext context)
        {
            context.RejectPrincipal();
            await context.HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme);
        }
    }
}
