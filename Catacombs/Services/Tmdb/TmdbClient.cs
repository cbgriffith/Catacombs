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
        private readonly TimeProvider _timeProvider;

        public TmdbClient(
            HttpClient httpClient,
            IOptions<TmdbOptions> options,
            TimeProvider timeProvider = null)
        {
            _httpClient = httpClient;
            _readAccessToken = options.Value.ReadAccessToken;
            _timeProvider = timeProvider ?? TimeProvider.System;
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
                TmdbMovieList.HiddenGems => "discover/movie",
                TmdbMovieList.Upcoming => "discover/movie",
                TmdbMovieList.NowPlaying => "discover/movie",
                _ => throw new ArgumentOutOfRangeException(nameof(list))
            };

            var query = new Dictionary<string, string>
            {
                ["language"] = "en-US",
                ["region"] = "US",
                ["page"] = FormatNumber(page),
                ["include_adult"] = "false",
                ["include_video"] = "false",
                ["with_genres"] = "27",
                ["without_genres"] = "10751,10770"
            };

            if (list == TmdbMovieList.Popular ||
                list == TmdbMovieList.TopRated)
            {
                query["with_original_language"] = "en";
                query["sort_by"] =
                    list == TmdbMovieList.Popular
                        ? "popularity.desc"
                        : "vote_average.desc";
            }

            if (list == TmdbMovieList.Upcoming ||
                list == TmdbMovieList.NowPlaying)
            {
                AddTheatricalReleaseFilters(query, list);
            }

            if (list == TmdbMovieList.HiddenGems)
            {
                AddHiddenGemFilters(query);
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

        private void AddHiddenGemFilters(
            IDictionary<string, string> query)
        {
            var today = DateOnly.FromDateTime(
                _timeProvider.GetUtcNow().UtcDateTime);

            query["sort_by"] = "vote_average.desc";
            query["vote_average.gte"] = "6";
            query["vote_count.gte"] = "100";
            query["vote_count.lte"] = "2500";
            query["primary_release_date.lte"] = FormatDate(today);
        }

        private void AddTheatricalReleaseFilters(
            IDictionary<string, string> query,
            TmdbMovieList list)
        {
            var today = DateOnly.FromDateTime(
                _timeProvider.GetUtcNow().UtcDateTime);
            var releaseStart =
                list == TmdbMovieList.Upcoming
                    ? today
                    : today.AddDays(-45);
            var releaseEnd =
                list == TmdbMovieList.Upcoming
                    ? today.AddMonths(6)
                    : today;

            query["sort_by"] = "popularity.desc";
            query["with_release_type"] = "2|3";
            query["release_date.gte"] = FormatDate(releaseStart);
            query["release_date.lte"] = FormatDate(releaseEnd);
            query["primary_release_date.gte"] =
                FormatDate(today.AddYears(-1));
            query["primary_release_date.lte"] =
                FormatDate(releaseEnd);
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

        public Task<TmdbResponse> GetSimilarMoviesAsync(
            int movieId,
            int page,
            CancellationToken cancellationToken)
        {
            return GetAsync(
                $"movie/{FormatNumber(movieId)}/similar",
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

        public Task<TmdbResponse> GetMovieMetadataAsync(
            int movieId,
            CancellationToken cancellationToken)
        {
            return GetAsync(
                $"movie/{FormatNumber(movieId)}",
                new Dictionary<string, string>
                {
                    ["append_to_response"] = "external_ids,videos",
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

        private static string FormatDate(DateOnly value)
        {
            return value.ToString(
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture);
        }
    }
}
