using System.ComponentModel.DataAnnotations;

namespace Catacombs.Contracts.Authentication
{
    public sealed class ChangePasswordRequest
    {
        [Required]
        [StringLength(128, MinimumLength = 1)]
        public string CurrentPassword { get; set; }

        [Required]
        [StringLength(128, MinimumLength = 8)]
        public string NewPassword { get; set; }

        [Required]
        [StringLength(128)]
        [Compare(
            nameof(NewPassword),
            ErrorMessage = "The new passwords must match.")]
        public string ConfirmNewPassword { get; set; }
    }
}
