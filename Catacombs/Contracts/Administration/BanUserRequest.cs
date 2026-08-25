using System.ComponentModel.DataAnnotations;

namespace Catacombs.Contracts.Administration
{
    public sealed class BanUserRequest
    {
        [StringLength(500)]
        public string Reason { get; set; }
    }
}
