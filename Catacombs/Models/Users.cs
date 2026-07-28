using System.Text.Json.Serialization;

namespace Catacombs.Models
{
    public class Users
    {
        public int id { get; set; }
        public string username { get; set; }
        public string email { get; set; }

        [JsonIgnore]
        public string passwordHash { get; set; }
    }
}
