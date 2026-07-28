using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

namespace Catacombs.Services.Tmdb
{
    public sealed class TmdbClient : ITmdbClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _readAccessToken;

        public TmdbClient(
            HttpClient httpClient,
            IOptions<TmdbOptions> options)
        {
            _httpClient = httpClient;
            _readAccessToken = options.Value.ReadAccessToken;
        }

        public Task<TmdbResponse> GetMovieListAsync(
            TmdbMovieList list,
            int page,
            CancellationToken cancellationToken)
        {
            var path = list switch
            {
                TmdbMovieList.Popular => "discover/movie",
                TmdbMovieList.TopRated => "discover/movie",
                TmdbMovieList.Upcoming => "movie/upcoming",
                TmdbMovieList.NowPlaying => "movie/now_playing",
                _ => throw new ArgumentOutOfRangeException(nameof(list))
            };

            var query = new Dictionary<string, string>
            {
                ["language"] = "en-US",
                ["region"] = "US",
                ["page"] = FormatNumber(page)
            };

            if (list == TmdbMovieList.Popular ||
                list == TmdbMovieList.TopRated)
            {
                query["include_adult"] = "false";
                query["include_video"] = "false";
                query["with_genres"] = "27";
                query["with_original_language"] = "en";
                query["sort_by"] =
                    list == TmdbMovieList.Popular
                        ? "popularity.desc"
                        : "vote_average.desc";
            }

            if (list == TmdbMovieList.TopRated)
            {
                query["vote_count.gte"] = "200";
            }

            return GetAsync(
                path,
                query,
                cancellationToken);
        }

        public Task<TmdbResponse> SearchMoviesAsync(
            string query,
            int page,
            CancellationToken cancellationToken)
        {
            return GetAsync(
                "search/movie",
                new Dictionary<string, string>
                {
                    ["query"] = query,
                    ["include_adult"] = "false",
                    ["language"] = "en-US",
                    ["region"] = "US",
                    ["page"] = FormatNumber(page)
                },
                cancellationToken);
        }

        public Task<TmdbResponse> GetRecommendationsAsync(
            int movieId,
            int page,
            CancellationToken cancellationToken)
        {
            return GetAsync(
                $"movie/{FormatNumber(movieId)}/recommendations",
                new Dictionary<string, string>
                {
                    ["language"] = "en-US",
                    ["page"] = FormatNumber(page)
                },
                cancellationToken);
        }

        public Task<TmdbResponse> GetExternalIdsAsync(
            int movieId,
            CancellationToken cancellationToken)
        {
            return GetAsync(
                $"movie/{FormatNumber(movieId)}/external_ids",
                new Dictionary<string, string>(),
                cancellationToken);
        }

        public Task<TmdbResponse> GetVideosAsync(
            int movieId,
            CancellationToken cancellationToken)
        {
            return GetAsync(
                $"movie/{FormatNumber(movieId)}/videos",
                new Dictionary<string, string>
                {
                    ["language"] = "en-US"
                },
                cancellationToken);
        }

        private async Task<TmdbResponse> GetAsync(
            string path,
            IDictionary<string, string> query,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_readAccessToken))
            {
                throw new TmdbConfigurationException(
                    "The TMDB API Read Access Token is not configured.");
            }

            var requestUri = QueryHelpers.AddQueryString(path, query);
            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                requestUri);
            request.Headers.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                _readAccessToken);
            request.Headers.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));

            using var response = await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);
            var content = await response.Content.ReadAsStringAsync(
                cancellationToken);

            return new TmdbResponse(
                response.StatusCode,
                content,
                response.Content.Headers.ContentType?.ToString()
                    ?? "application/json");
        }

        private static string FormatNumber(int value)
        {
            return value.ToString(CultureInfo.InvariantCulture);
        }
    }
}
