using System.ComponentModel.DataAnnotations;

namespace Catacombs.Contracts.Authentication
{
    public sealed class RegisterRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(320)]
        public string Email { get; set; }

        [Required]
        [StringLength(128, MinimumLength = 8)]
        public string Password { get; set; }
    }
}
