namespace Catacombs.Models
{
    public sealed class MovieCollectionSummary
    {
        public int WatchlistCount { get; init; }
        public int WatchedCount { get; init; }
        public int LikedCount { get; init; }
        public int DislikedCount { get; init; }
    }
}
