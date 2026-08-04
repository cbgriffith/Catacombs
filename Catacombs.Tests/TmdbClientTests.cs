using System.Net;
using System.Net.Http.Headers;
using Catacombs.Services.Tmdb;
using Microsoft.Extensions.Options;
using Xunit;

namespace Catacombs.Tests;

public sealed class TmdbClientTests
{
    private const string TestToken = "test-read-access-token";

    [Fact]
    public async Task MovieListsUseBearerAuthenticationAndPagination()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        var response = await client.GetMovieListAsync(
            TmdbMovieList.Popular,
            3,
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Bearer", handler.Authorization?.Scheme);
        Assert.Equal(TestToken, handler.Authorization?.Parameter);
        Assert.Equal(
            "/3/discover/movie?language=en-US&region=US&page=3" +
            "&include_adult=false&include_video=false&with_genres=27" +
            "&without_genres=10751,10770" +
            "&with_original_language=en&sort_by=popularity.desc",
            handler.RequestUri?.PathAndQuery);
    }

    [Theory]
    [InlineData(TmdbMovieList.Popular)]
    [InlineData(TmdbMovieList.TopRated)]
    [InlineData(TmdbMovieList.HiddenGems)]
    [InlineData(TmdbMovieList.Upcoming)]
    [InlineData(TmdbMovieList.NowPlaying)]
    public async Task CuratedMovieListsExcludeFamilyAndTvMovies(
        TmdbMovieList list)
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.GetMovieListAsync(
            list,
            1,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Contains("without_genres=10751,10770", query);
    }

    [Fact]
    public async Task TopRatedListFiltersForEstablishedHorrorMovies()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.GetMovieListAsync(
            TmdbMovieList.TopRated,
            1,
            CancellationToken.None);

        Assert.Contains(
            "with_genres=27",
            handler.RequestUri?.Query);
        Assert.Contains(
            "sort_by=vote_average.desc",
            handler.RequestUri?.Query);
        Assert.Contains(
            "vote_count.gte=200",
            handler.RequestUri?.Query);
    }

    [Fact]
    public async Task HiddenGemsBalanceQualityAndLowerExposure()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(
            handler,
            TestToken,
            new FixedTimeProvider(
                new DateTimeOffset(
                    2026,
                    7,
                    29,
                    12,
                    0,
                    0,
                    TimeSpan.Zero)));

        await client.GetMovieListAsync(
            TmdbMovieList.HiddenGems,
            2,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Equal(
            "/3/discover/movie",
            handler.RequestUri?.AbsolutePath);
        Assert.Contains("page=2", query);
        Assert.Contains("with_genres=27", query);
        Assert.Contains("sort_by=vote_average.desc", query);
        Assert.Contains("vote_average.gte=6", query);
        Assert.Contains("vote_count.gte=100", query);
        Assert.Contains("vote_count.lte=2500", query);
        Assert.Contains("without_genres=10751,10770", query);
        Assert.Contains(
            "primary_release_date.lte=2026-07-29",
            query);
    }

    [Fact]
    public async Task UpcomingListFiltersForNewHorrorTheatricalReleases()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(
            handler,
            TestToken,
            new FixedTimeProvider(
                new DateTimeOffset(
                    2026,
                    7,
                    28,
                    12,
                    0,
                    0,
                    TimeSpan.Zero)));

        await client.GetMovieListAsync(
            TmdbMovieList.Upcoming,
            1,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Equal(
            "/3/discover/movie",
            handler.RequestUri?.AbsolutePath);
        Assert.Contains("with_genres=27", query);
        Assert.Contains("with_release_type=2|3", query);
        Assert.Contains("release_date.gte=2026-07-28", query);
        Assert.Contains("release_date.lte=2027-01-28", query);
        Assert.Contains("primary_release_date.gte=2025-07-28", query);
    }

    [Fact]
    public async Task NowPlayingListFiltersForRecentHorrorTheatricalReleases()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(
            handler,
            TestToken,
            new FixedTimeProvider(
                new DateTimeOffset(
                    2026,
                    7,
                    28,
                    12,
                    0,
                    0,
                    TimeSpan.Zero)));

        await client.GetMovieListAsync(
            TmdbMovieList.NowPlaying,
            1,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Equal(
            "/3/discover/movie",
            handler.RequestUri?.AbsolutePath);
        Assert.Contains("with_genres=27", query);
        Assert.Contains("with_release_type=2|3", query);
        Assert.Contains("release_date.gte=2026-06-13", query);
        Assert.Contains("release_date.lte=2026-07-28", query);
        Assert.Contains("primary_release_date.gte=2025-07-28", query);
    }

    [Fact]
    public async Task SearchSafelyEncodesTheUsersQuery()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.SearchMoviesAsync(
            "Alien & Aliens",
            2,
            null,
            CancellationToken.None);

        Assert.Equal(
            "/3/search/movie?query=Alien%20%26%20Aliens" +
            "&include_adult=false&language=en-US&region=US&page=2",
            handler.RequestUri?.PathAndQuery);
    }

    [Fact]
    public async Task SearchCanFilterByPrimaryReleaseYear()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.SearchMoviesAsync(
            "Alien",
            1,
            1979,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Contains("query=Alien", query);
        Assert.Contains("primary_release_year=1979", query);
    }

    [Fact]
    public async Task BrowseHorrorAppliesFiltersBeforePagination()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(
            handler,
            TestToken,
            new FixedTimeProvider(
                new DateTimeOffset(
                    2026,
                    8,
                    4,
                    12,
                    0,
                    0,
                    TimeSpan.Zero)));

        await client.BrowseHorrorMoviesAsync(
            3,
            1980,
            6.5,
            250,
            TmdbMovieSort.HighestRated,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Equal(
            "/3/discover/movie",
            handler.RequestUri?.AbsolutePath);
        Assert.Contains("page=3", query);
        Assert.Contains("with_genres=27", query);
        Assert.Contains("without_genres=10751,10770", query);
        Assert.Contains("primary_release_date.gte=1980-01-01", query);
        Assert.Contains("primary_release_date.lte=1989-12-31", query);
        Assert.Contains("vote_average.gte=6.5", query);
        Assert.Contains("vote_count.gte=250", query);
        Assert.Contains("sort_by=vote_average.desc", query);
    }

    [Theory]
    [InlineData(TmdbMovieSort.Popular, "popularity.desc")]
    [InlineData(TmdbMovieSort.HighestRated, "vote_average.desc")]
    [InlineData(TmdbMovieSort.Newest, "primary_release_date.desc")]
    [InlineData(TmdbMovieSort.Oldest, "primary_release_date.asc")]
    public async Task BrowseHorrorUsesTheSelectedSort(
        TmdbMovieSort sort,
        string expectedSort)
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.BrowseHorrorMoviesAsync(
            1,
            null,
            0,
            100,
            sort,
            CancellationToken.None);

        var query = Uri.UnescapeDataString(
            handler.RequestUri?.Query ?? string.Empty);

        Assert.Contains($"sort_by={expectedSort}", query);
    }

    [Fact]
    public async Task SimilarMoviesUseTheOfficialSimilarEndpoint()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.GetSimilarMoviesAsync(
            348,
            2,
            CancellationToken.None);

        Assert.Equal(
            "/3/movie/348/similar?language=en-US&page=2",
            handler.RequestUri?.PathAndQuery);
    }

    [Fact]
    public async Task VideosUseTheOfficialMovieVideosEndpoint()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.GetVideosAsync(348, CancellationToken.None);

        Assert.Equal(
            "/3/movie/348/videos?language=en-US",
            handler.RequestUri?.PathAndQuery);
    }

    [Fact]
    public async Task MetadataCombinesDetailsExtrasInOneRequest()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.GetMovieMetadataAsync(
            348,
            CancellationToken.None);

        Assert.Equal(
            "/3/movie/348?append_to_response=" +
            "external_ids,videos,watch%2Fproviders" +
            "&language=en-US",
            handler.RequestUri?.PathAndQuery);
        Assert.Equal(1, handler.RequestCount);
    }

    [Fact]
    public async Task MissingTokenStopsTheRequestBeforeItLeavesTheApp()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, string.Empty);

        await Assert.ThrowsAsync<TmdbConfigurationException>(
            () => client.GetMovieListAsync(
                TmdbMovieList.TopRated,
                1,
                CancellationToken.None));

        Assert.Equal(0, handler.RequestCount);
    }

    private static TmdbClient CreateClient(
        RecordingHandler handler,
        string token,
        TimeProvider? timeProvider = null)
    {
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        var options = Options.Create(new TmdbOptions
        {
            ReadAccessToken = token
        });

        return new TmdbClient(httpClient, options, timeProvider);
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow)
        : TimeProvider
    {
        public override DateTimeOffset GetUtcNow()
        {
            return utcNow;
        }
    }

    private sealed class RecordingHandler : HttpMessageHandler
    {
        public int RequestCount { get; private set; }
        public Uri? RequestUri { get; private set; }
        public AuthenticationHeaderValue? Authorization { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            RequestCount++;
            RequestUri = request.RequestUri;
            Authorization = request.Headers.Authorization;

            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    """{"page":1,"results":[]}""",
                    System.Text.Encoding.UTF8,
                    "application/json")
            });
        }
    }
}
