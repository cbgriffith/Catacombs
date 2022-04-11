using System;

namespace Catacombs.Models
{
    public class Movies
    {
        public int id { get; set; }
        public int userId { get; set; }
        public string title { get; set; }
        public int rating { get; set; }
        public bool watched { get; set; }
        public string poster_path { get; set; }
        public string overview { get; set; }
        public double popularity { get; set; }
        public double vote_average { get; set; }
        public DateTime release_date { get; set; }
        public Users Users { get; set; }
    }
}
