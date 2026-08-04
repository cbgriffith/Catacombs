using Catacombs.Services.Tmdb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Catacombs.Controllers
{
    [Authorize]
    [ApiController]
    [Produces("application/json")]
    [Route("api/tmdb")]
    public sealed class TmdbController : ControllerBase
    {
        private readonly ITmdbClient _tmdbClient;

        public TmdbController(ITmdbClient tmdbClient)
        {
            _tmdbClient = tmdbClient;
        }

        [HttpGet("movies/popular")]
        public Task<IActionResult> Popular(
            [FromQuery, Range(1, 500)] int page = 1,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetMovieListAsync(
                    TmdbMovieList.Popular,
                    page,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/top-rated")]
        public Task<IActionResult> TopRated(
            [FromQuery, Range(1, 500)] int page = 1,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetMovieListAsync(
                    TmdbMovieList.TopRated,
                    page,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/hidden-gems")]
        public Task<IActionResult> HiddenGems(
            [FromQuery, Range(1, 500)] int page = 1,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetMovieListAsync(
                    TmdbMovieList.HiddenGems,
                    page,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/upcoming")]
        public Task<IActionResult> Upcoming(
            [FromQuery, Range(1, 500)] int page = 1,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetMovieListAsync(
                    TmdbMovieList.Upcoming,
                    page,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/now-playing")]
        public Task<IActionResult> NowPlaying(
            [FromQuery, Range(1, 500)] int page = 1,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetMovieListAsync(
                    TmdbMovieList.NowPlaying,
                    page,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/search")]
        public Task<IActionResult> Search(
            [FromQuery, Required, StringLength(200)] string query,
            [FromQuery, Range(1, 500)] int page = 1,
            [FromQuery, Range(1000, 9999)] int? year = null,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.SearchMoviesAsync(
                    query.Trim(),
                    page,
                    year,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/browse")]
        public Task<IActionResult> BrowseHorror(
            [FromQuery, Range(1, 500)] int page = 1,
            [FromQuery, Range(1890, 2090)] int? decade = null,
            [FromQuery, Range(0, 10)] double minimumRating = 0,
            [FromQuery, Range(0, 1000000)] int minimumVotes = 100,
            [FromQuery, Range(1, 600)] int? minimumRuntime = null,
            [FromQuery, Range(1, 600)] int? maximumRuntime = null,
            [FromQuery] TmdbMovieSort sort = TmdbMovieSort.Popular,
            CancellationToken cancellationToken = default)
        {
            if (decade.HasValue && decade.Value % 10 != 0)
            {
                return Task.FromResult<IActionResult>(
                    BadRequest(new ProblemDetails
                    {
                        Title = "The decade must begin with a year ending in 0."
                    }));
            }

            if (minimumRuntime.HasValue &&
                maximumRuntime.HasValue &&
                minimumRuntime.Value > maximumRuntime.Value)
            {
                return Task.FromResult<IActionResult>(
                    BadRequest(new ProblemDetails
                    {
                        Title =
                            "The minimum runtime cannot exceed the maximum."
                    }));
            }

            return ProxyAsync(
                token => _tmdbClient.BrowseHorrorMoviesAsync(
                    page,
                    decade,
                    minimumRating,
                    minimumVotes,
                    minimumRuntime,
                    maximumRuntime,
                    sort,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/{movieId:int}/similar")]
        public Task<IActionResult> SimilarMovies(
            [FromRoute, Range(1, int.MaxValue)] int movieId,
            [FromQuery, Range(1, 500)] int page = 1,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetSimilarMoviesAsync(
                    movieId,
                    page,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/{movieId:int}/external-ids")]
        public Task<IActionResult> ExternalIds(
            [FromRoute, Range(1, int.MaxValue)] int movieId,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetExternalIdsAsync(
                    movieId,
                    token),
                cancellationToken);
        }

        [HttpGet("movies/{movieId:int}/videos")]
        public Task<IActionResult> Videos(
            [FromRoute, Range(1, int.MaxValue)] int movieId,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetVideosAsync(movieId, token),
                cancellationToken);
        }

        [HttpGet("movies/{movieId:int}/metadata")]
        public Task<IActionResult> Metadata(
            [FromRoute, Range(1, int.MaxValue)] int movieId,
            CancellationToken cancellationToken = default)
        {
            return ProxyAsync(
                token => _tmdbClient.GetMovieMetadataAsync(
                    movieId,
                    token),
                cancellationToken);
        }

        private async Task<IActionResult> ProxyAsync(
            Func<CancellationToken, Task<TmdbResponse>> request,
            CancellationToken cancellationToken)
        {
            try
            {
                var response = await request(cancellationToken);

                if (response.StatusCode == HttpStatusCode.Unauthorized ||
                    response.StatusCode == HttpStatusCode.Forbidden ||
                    (int)response.StatusCode >= 500)
                {
                    return MovieServiceProblem(
                        StatusCodes.Status502BadGateway);
                }

                return new ContentResult
                {
                    Content = response.Content,
                    ContentType = response.ContentType,
                    StatusCode = (int)response.StatusCode
                };
            }
            catch (TmdbConfigurationException)
            {
                return MovieServiceProblem(
                    StatusCodes.Status503ServiceUnavailable);
            }
            catch (OperationCanceledException)
                when (!cancellationToken.IsCancellationRequested)
            {
                return MovieServiceProblem(
                    StatusCodes.Status504GatewayTimeout);
            }
            catch (HttpRequestException)
            {
                return MovieServiceProblem(
                    StatusCodes.Status502BadGateway);
            }
        }

        private ObjectResult MovieServiceProblem(int statusCode)
        {
            return Problem(
                statusCode: statusCode,
                title: "The movie service is temporarily unavailable.");
        }
    }
}
