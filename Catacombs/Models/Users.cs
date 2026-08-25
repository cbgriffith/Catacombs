using System;
using System.Text.Json.Serialization;

namespace Catacombs.Models
{
    public class Users
    {
        public int id { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string role { get; set; }
        public bool isBanned { get; set; }
        public DateTime? bannedAt { get; set; }
        public int? bannedByUserId { get; set; }
        public string banReason { get; set; }

        [JsonIgnore]
        public string passwordHash { get; set; }
    }
}
