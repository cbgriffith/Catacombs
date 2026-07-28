using System.ComponentModel.DataAnnotations;

namespace Catacombs.Contracts.Authentication
{
    public sealed class LoginRequest
    {
        [Required]
        [EmailAddress]
        [StringLength(320)]
        public string Email { get; set; }

        [Required]
        [StringLength(128, MinimumLength = 1)]
        public string Password { get; set; }
    }
}
