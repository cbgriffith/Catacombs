using Catacombs.Models;
using System;

namespace Catacombs.Contracts.Authentication
{
    public sealed class UserResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public bool IsAdmin { get; set; }

        public static UserResponse FromUser(Users user)
        {
            return new UserResponse
            {
                Id = user.id,
                Username = user.username,
                Email = user.email,
                IsAdmin = string.Equals(
                    user.role,
                    UserRoles.Admin,
                    StringComparison.Ordinal)
            };
        }
    }
}
