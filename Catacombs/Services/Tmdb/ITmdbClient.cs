using System.Threading;
using System.Threading.Tasks;

namespace Catacombs.Services.Tmdb
{
    public interface ITmdbClient
    {
        Task<TmdbResponse> GetMovieListAsync(
            TmdbMovieList list,
            int page,
            CancellationToken cancellationToken);

        Task<TmdbResponse> SearchMoviesAsync(
            string query,
            int page,
            int? primaryReleaseYear,
            CancellationToken cancellationToken);

        Task<TmdbResponse> BrowseHorrorMoviesAsync(
            int page,
            int? decade,
            double minimumRating,
            int minimumVoteCount,
            TmdbMovieSort sort,
            CancellationToken cancellationToken);

        Task<TmdbResponse> GetSimilarMoviesAsync(
            int movieId,
            int page,
            CancellationToken cancellationToken);

        Task<TmdbResponse> GetExternalIdsAsync(
            int movieId,
            CancellationToken cancellationToken);

        Task<TmdbResponse> GetVideosAsync(
            int movieId,
            CancellationToken cancellationToken);

        Task<TmdbResponse> GetMovieMetadataAsync(
            int movieId,
            CancellationToken cancellationToken);
    }
}
