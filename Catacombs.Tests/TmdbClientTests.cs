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
            "&with_original_language=en&sort_by=popularity.desc",
            handler.RequestUri?.PathAndQuery);
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
    public async Task SearchSafelyEncodesTheUsersQuery()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.SearchMoviesAsync(
            "Alien & Aliens",
            2,
            CancellationToken.None);

        Assert.Equal(
            "/3/search/movie?query=Alien%20%26%20Aliens" +
            "&include_adult=false&language=en-US&region=US&page=2",
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
    public async Task MetadataCombinesSocialIdsAndVideosInOneRequest()
    {
        var handler = new RecordingHandler();
        var client = CreateClient(handler, TestToken);

        await client.GetMovieMetadataAsync(
            348,
            CancellationToken.None);

        Assert.Equal(
            "/3/movie/348?append_to_response=external_ids,videos" +
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
        string token)
    {
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        var options = Options.Create(new TmdbOptions
        {
            ReadAccessToken = token
        });

        return new TmdbClient(httpClient, options);
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
