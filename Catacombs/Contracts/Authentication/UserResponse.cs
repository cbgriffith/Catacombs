using Catacombs.Models;

namespace Catacombs.Contracts.Authentication
{
    public sealed class UserResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }

        public static UserResponse FromUser(Users user)
        {
            return new UserResponse
            {
                Id = user.id,
                Username = user.username,
                Email = user.email
            };
        }
    }
}
