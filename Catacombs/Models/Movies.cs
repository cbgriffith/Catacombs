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
        public int popularity { get; set; }
        public decimal vote_average { get; set; }
        public Users Users { get; set; }
    }
}
