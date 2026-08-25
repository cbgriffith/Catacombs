using Catacombs.Models;
using System;

namespace Catacombs.Contracts.Administration
{
    public sealed class AdminUserResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsBanned { get; set; }
        public DateTime? BannedAt { get; set; }
        public string BanReason { get; set; }

        public static AdminUserResponse FromUser(Users user)
        {
            return new AdminUserResponse
            {
                Id = user.id,
                Username = user.username,
                Email = user.email,
                Role = user.role,
                IsBanned = user.isBanned,
                BannedAt = user.bannedAt,
                BanReason = user.banReason
            };
        }
    }
}
