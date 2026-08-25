using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Catacombs.Models;
using Catacombs.Repositories;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;
using Xunit;

namespace Catacombs.Tests;

public sealed class SecurityIntegrationTests : IAsyncLifetime
{
    private const string TestPassword =
        "Catacombs integration test passphrase! 2026";

    private readonly CatacombsApplicationFactory _factory = new();
    private readonly List<string> _testEmails = [];
    private readonly HttpClient _client;

    public SecurityIntegrationTests()
    {
        _client = CreateClient();
    }

    [Fact]
    public async Task RegistrationStoresAHashInsteadOfThePlaintextPassword()
    {
        var email = NewEmail("hash");

        var response = await RegisterAsync(
            _client,
            "Hash Tester",
            email.ToUpperInvariant());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        using (var document = await ReadJsonAsync(response))
        {
            Assert.Equal(
                email,
                document.RootElement.GetProperty("email").GetString());
            Assert.False(
                document.RootElement.TryGetProperty(
                    "passwordHash",
                    out _));
        }

        await using var scope = _factory.Services.CreateAsyncScope();
        var dataSource =
            scope.ServiceProvider.GetRequiredService<NpgsqlDataSource>();

        await using var connection = await dataSource.OpenConnectionAsync();
        await using var command = new NpgsqlCommand(
            """
            SELECT id, username, email, password_hash
              FROM users
             WHERE email = @email
            """,
            connection);
        command.Parameters.AddWithValue("email", email);

        await using var reader = await command.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());

        var user = new Users
        {
            id = reader.GetInt32(0),
            username = reader.GetString(1),
            email = reader.GetString(2),
            passwordHash = reader.GetString(3)
        };

        Assert.NotEqual(TestPassword, user.passwordHash);

        var passwordHasher = scope.ServiceProvider
            .GetRequiredService<IPasswordHasher<Users>>();
        var verificationResult = passwordHasher.VerifyHashedPassword(
            user,
            user.passwordHash,
            TestPassword);

        Assert.NotEqual(
            PasswordVerificationResult.Failed,
            verificationResult);
    }

    [Fact]
    public async Task RegistrationCreatesAnActiveNonAdminUser()
    {
        var email = NewEmail("account-defaults");

        var response = await RegisterAsync(
            _client,
            "Account Defaults",
            email);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        await using var scope = _factory.Services.CreateAsyncScope();
        var usersRepository = scope.ServiceProvider
            .GetRequiredService<IUsersRepository>();
        var user = usersRepository.GetByEmail(email);

        Assert.NotNull(user);
        Assert.Equal(UserRoles.User, user.role);
        Assert.False(user.isBanned);
        Assert.Null(user.bannedAt);
        Assert.Null(user.bannedByUserId);
        Assert.Null(user.banReason);
    }

    [Fact]
    public async Task RegistrationRequiresAtLeastEightPasswordCharacters()
    {
        var shortPasswordResponse = await RegisterAsync(
            _client,
            "Short Password",
            NewEmail("short-password"),
            "Seven77");

        Assert.Equal(
            HttpStatusCode.BadRequest,
            shortPasswordResponse.StatusCode);

        var minimumPasswordResponse = await RegisterAsync(
            _client,
            "Minimum Password",
            NewEmail("minimum-password"),
            "Eight888");

        Assert.Equal(
            HttpStatusCode.Created,
            minimumPasswordResponse.StatusCode);
    }

    [Fact]
    public async Task LoginRejectsTheWrongPasswordAndMaintainsASession()
    {
        var email = NewEmail("session");

        var registerResponse = await RegisterAsync(
            _client,
            "Session Tester",
            email);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var rejectedLogin = await LoginAsync(
            _client,
            email,
            "Definitely the wrong password");
        Assert.Equal(HttpStatusCode.Unauthorized, rejectedLogin.StatusCode);

        var acceptedLogin = await LoginAsync(
            _client,
            email,
            TestPassword);
        Assert.Equal(HttpStatusCode.OK, acceptedLogin.StatusCode);

        var currentUser = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, currentUser.StatusCode);

        using (var document = await ReadJsonAsync(currentUser))
        {
            Assert.Equal(
                email,
                document.RootElement.GetProperty("email").GetString());
        }

        var logout = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Post,
            "/api/auth/logout");
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        var signedOutUser = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, signedOutUser.StatusCode);
    }

    [Fact]
    public async Task ChangingPasswordValidatesTheRequestAndSignsOut()
    {
        const string newPassword =
            "A new Catacombs password! 2026";
        var email = NewEmail("change-password");

        var registerResponse = await RegisterAsync(
            _client,
            "Password Tester",
            email);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var loginResponse = await LoginAsync(
            _client,
            email,
            TestPassword);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var wrongCurrentPassword = await ChangePasswordAsync(
            _client,
            "Not the current password",
            newPassword,
            newPassword);
        Assert.Equal(
            HttpStatusCode.BadRequest,
            wrongCurrentPassword.StatusCode);

        var mismatchedPasswords = await ChangePasswordAsync(
            _client,
            TestPassword,
            newPassword,
            "A different confirmation password");
        Assert.Equal(
            HttpStatusCode.BadRequest,
            mismatchedPasswords.StatusCode);

        var unchangedPassword = await ChangePasswordAsync(
            _client,
            TestPassword,
            TestPassword,
            TestPassword);
        Assert.Equal(
            HttpStatusCode.BadRequest,
            unchangedPassword.StatusCode);

        var changedPassword = await ChangePasswordAsync(
            _client,
            TestPassword,
            newPassword,
            newPassword);
        Assert.Equal(
            HttpStatusCode.NoContent,
            changedPassword.StatusCode);

        var signedOutUser = await _client.GetAsync("/api/auth/me");
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            signedOutUser.StatusCode);

        var oldPasswordLogin = await LoginAsync(
            _client,
            email,
            TestPassword);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            oldPasswordLogin.StatusCode);

        var newPasswordLogin = await LoginAsync(
            _client,
            email,
            newPassword);
        Assert.Equal(
            HttpStatusCode.OK,
            newPasswordLogin.StatusCode);
    }

    [Fact]
    public async Task MovieChangesRequireAuthenticationAndAnAntiforgeryToken()
    {
        var anonymousResponse = await _client.GetAsync("/api/movies");
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            anonymousResponse.StatusCode);

        var anonymousSummaryResponse =
            await _client.GetAsync("/api/movies/summary");
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            anonymousSummaryResponse.StatusCode);

        var anonymousTmdbResponse =
            await _client.GetAsync("/api/tmdb/movies/popular");
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            anonymousTmdbResponse.StatusCode);

        await RegisterAndLoginAsync(_client, "antiforgery");

        var missingTokenResponse = await _client.PostAsJsonAsync(
            "/api/movies",
            NewMovieRequest(41001));

        Assert.Equal(
            HttpStatusCode.BadRequest,
            missingTokenResponse.StatusCode);

        var validResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Post,
            "/api/movies",
            NewMovieRequest(41002));

        Assert.Equal(HttpStatusCode.Created, validResponse.StatusCode);
    }

    [Fact]
    public async Task MovieEndpointsKeepEachUsersMoviesPrivate()
    {
        using var firstClient = CreateClient();
        using var secondClient = CreateClient();

        await RegisterAndLoginAsync(firstClient, "owner-a");
        await RegisterAndLoginAsync(secondClient, "owner-b");

        var createResponse = await SendWithAntiforgeryAsync(
            firstClient,
            HttpMethod.Post,
            "/api/movies",
            NewMovieRequest(
                movieId: 42001,
                userId: int.MaxValue,
                rating: 1,
                watched: true));

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        int movieId;
        using (var document = await ReadJsonAsync(createResponse))
        {
            var movie = document.RootElement;
            movieId = movie.GetProperty("id").GetInt32();

            Assert.Equal(0, movie.GetProperty("rating").GetInt32());
            Assert.False(movie.GetProperty("watched").GetBoolean());
            Assert.False(movie.TryGetProperty("userId", out _));
        }

        var secondUsersMovies = await secondClient.GetAsync("/api/movies");
        Assert.Equal(HttpStatusCode.OK, secondUsersMovies.StatusCode);

        using (var document = await ReadJsonAsync(secondUsersMovies))
        {
            Assert.Equal(0, document.RootElement.GetArrayLength());
        }

        var secondUsersCollection =
            await secondClient.GetAsync("/api/movies/collection");
        Assert.Equal(HttpStatusCode.OK, secondUsersCollection.StatusCode);

        using (var document = await ReadJsonAsync(secondUsersCollection))
        {
            Assert.Equal(0, document.RootElement.GetArrayLength());
        }

        var forbiddenRead =
            await secondClient.GetAsync($"/api/movies/{movieId}");
        Assert.Equal(HttpStatusCode.NotFound, forbiddenRead.StatusCode);

        var forbiddenUpdate = await SendWithAntiforgeryAsync(
            secondClient,
            HttpMethod.Patch,
            $"/api/movies/seenit/{movieId}");
        Assert.Equal(HttpStatusCode.NotFound, forbiddenUpdate.StatusCode);

        var forbiddenDelete = await SendWithAntiforgeryAsync(
            secondClient,
            HttpMethod.Delete,
            $"/api/movies/{movieId}");
        Assert.Equal(HttpStatusCode.NotFound, forbiddenDelete.StatusCode);

        var ownerUpdate = await SendWithAntiforgeryAsync(
            firstClient,
            HttpMethod.Patch,
            $"/api/movies/seenit/{movieId}");
        Assert.Equal(HttpStatusCode.NoContent, ownerUpdate.StatusCode);

        var ownerRead =
            await firstClient.GetAsync($"/api/movies/{movieId}");
        Assert.Equal(HttpStatusCode.OK, ownerRead.StatusCode);

        using (var document = await ReadJsonAsync(ownerRead))
        {
            Assert.True(
                document.RootElement.GetProperty("watched").GetBoolean());
        }

        var ownerDelete = await SendWithAntiforgeryAsync(
            firstClient,
            HttpMethod.Delete,
            $"/api/movies/{movieId}");
        Assert.Equal(HttpStatusCode.NoContent, ownerDelete.StatusCode);

        var deletedMovie =
            await firstClient.GetAsync($"/api/movies/{movieId}");
        Assert.Equal(HttpStatusCode.NotFound, deletedMovie.StatusCode);
    }

    [Fact]
    public async Task MovieStatusSupportsTheCompleteViewingWorkflow()
    {
        await RegisterAndLoginAsync(_client, "movie-status");
        const int tmdbMovieId = 43001;

        var likedResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Put,
            "/api/movies/status",
            NewMovieStatusRequest(
                tmdbMovieId,
                watched: true,
                rating: 1));

        Assert.Equal(HttpStatusCode.OK, likedResponse.StatusCode);

        int savedMovieId;
        using (var document = await ReadJsonAsync(likedResponse))
        {
            var movie = document.RootElement;
            savedMovieId = movie.GetProperty("id").GetInt32();
            Assert.True(movie.GetProperty("watched").GetBoolean());
            Assert.Equal(1, movie.GetProperty("rating").GetInt32());
        }

        var dislikedResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Put,
            "/api/movies/status",
            NewMovieStatusRequest(
                tmdbMovieId,
                watched: true,
                rating: -1));

        Assert.Equal(HttpStatusCode.OK, dislikedResponse.StatusCode);

        using (var document = await ReadJsonAsync(dislikedResponse))
        {
            var movie = document.RootElement;
            Assert.Equal(
                savedMovieId,
                movie.GetProperty("id").GetInt32());
            Assert.Equal(-1, movie.GetProperty("rating").GetInt32());
        }

        var unratedResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Put,
            "/api/movies/status",
            NewMovieStatusRequest(
                tmdbMovieId,
                watched: true,
                rating: 0));

        Assert.Equal(HttpStatusCode.OK, unratedResponse.StatusCode);

        var watchlistResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Put,
            "/api/movies/status",
            NewMovieStatusRequest(
                tmdbMovieId,
                watched: false,
                rating: 0));

        Assert.Equal(HttpStatusCode.OK, watchlistResponse.StatusCode);

        using (var document = await ReadJsonAsync(watchlistResponse))
        {
            var movie = document.RootElement;
            Assert.False(movie.GetProperty("watched").GetBoolean());
            Assert.Equal(0, movie.GetProperty("rating").GetInt32());
        }

        var duplicateWatchlistResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Post,
            "/api/movies",
            NewMovieRequest(tmdbMovieId));

        Assert.Equal(
            HttpStatusCode.OK,
            duplicateWatchlistResponse.StatusCode);

        var invalidResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Put,
            "/api/movies/status",
            NewMovieStatusRequest(
                tmdbMovieId,
                watched: false,
                rating: 1));

        Assert.Equal(HttpStatusCode.BadRequest, invalidResponse.StatusCode);

        var watchlist = await _client.GetAsync("/api/movies");
        using var watchlistDocument = await ReadJsonAsync(watchlist);
        Assert.Single(watchlistDocument.RootElement.EnumerateArray());

        const int secondTmdbMovieId = 43002;
        var secondMovieResponse = await SendWithAntiforgeryAsync(
            _client,
            HttpMethod.Put,
            "/api/movies/status",
            NewMovieStatusRequest(
                secondTmdbMovieId,
                watched: true,
                rating: 1));

        Assert.Equal(HttpStatusCode.OK, secondMovieResponse.StatusCode);

        var collection = await _client.GetAsync(
            "/api/movies/collection");
        Assert.Equal(HttpStatusCode.OK, collection.StatusCode);

        using var collectionDocument = await ReadJsonAsync(collection);
        var collectionMovies = collectionDocument.RootElement
            .EnumerateArray()
            .ToList();

        Assert.Equal(2, collectionMovies.Count);
        Assert.Contains(
            collectionMovies,
            movie => movie.GetProperty("movieId").GetInt32()
                == tmdbMovieId
                && !movie.GetProperty("watched").GetBoolean());
        Assert.Contains(
            collectionMovies,
            movie => movie.GetProperty("movieId").GetInt32()
                == secondTmdbMovieId
                && movie.GetProperty("watched").GetBoolean());
    }

    [Fact]
    public async Task MovieSummaryCountsTheCurrentUsersCollection()
    {
        await RegisterAndLoginAsync(_client, "movie-summary");

        var movieStates = new[]
        {
            new { MovieId = 44001, Watched = false, Rating = 0 },
            new { MovieId = 44002, Watched = true, Rating = 1 },
            new { MovieId = 44003, Watched = true, Rating = -1 },
            new { MovieId = 44004, Watched = true, Rating = 0 }
        };

        foreach (var movieState in movieStates)
        {
            var response = await SendWithAntiforgeryAsync(
                _client,
                HttpMethod.Put,
                "/api/movies/status",
                NewMovieStatusRequest(
                    movieState.MovieId,
                    movieState.Watched,
                    movieState.Rating));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        var summaryResponse =
            await _client.GetAsync("/api/movies/summary");
        Assert.Equal(HttpStatusCode.OK, summaryResponse.StatusCode);

        using var document = await ReadJsonAsync(summaryResponse);
        var summary = document.RootElement;

        Assert.Equal(
            1,
            summary.GetProperty("watchlistCount").GetInt32());
        Assert.Equal(
            3,
            summary.GetProperty("watchedCount").GetInt32());
        Assert.Equal(
            1,
            summary.GetProperty("likedCount").GetInt32());
        Assert.Equal(
            1,
            summary.GetProperty("dislikedCount").GetInt32());
    }

    [Fact]
    public async Task LoginIsLimitedAfterFiveFailedAttempts()
    {
        var email = NewEmail("rate-limit");

        for (var attempt = 0; attempt < 5; attempt++)
        {
            var response = await LoginAsync(
                _client,
                email,
                TestPassword);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        var limitedResponse = await LoginAsync(
            _client,
            email,
            TestPassword);

        Assert.Equal(
            HttpStatusCode.TooManyRequests,
            limitedResponse.StatusCode);
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        try
        {
            if (_testEmails.Count > 0)
            {
                await using var scope =
                    _factory.Services.CreateAsyncScope();
                var dataSource = scope.ServiceProvider
                    .GetRequiredService<NpgsqlDataSource>();

                await using var connection =
                    await dataSource.OpenConnectionAsync();

                foreach (var email in _testEmails)
                {
                    await using var command = new NpgsqlCommand(
                        "DELETE FROM users WHERE email = @email",
                        connection);
                    command.Parameters.AddWithValue("email", email);
                    await command.ExecuteNonQueryAsync();
                }
            }
        }
        finally
        {
            _client.Dispose();
            await _factory.DisposeAsync();
        }
    }

    private HttpClient CreateClient()
    {
        return _factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                BaseAddress = new Uri("https://localhost"),
                HandleCookies = true
            });
    }

    private string NewEmail(string scenario)
    {
        var email =
            $"integration-{scenario}-{Guid.NewGuid():N}@catacombs.local";
        _testEmails.Add(email);
        return email;
    }

    private async Task RegisterAndLoginAsync(
        HttpClient client,
        string scenario)
    {
        var email = NewEmail(scenario);

        var registerResponse = await RegisterAsync(
            client,
            $"Test {scenario}",
            email);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        var loginResponse = await LoginAsync(
            client,
            email,
            TestPassword);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
    }

    private static async Task<HttpResponseMessage> RegisterAsync(
        HttpClient client,
        string username,
        string email,
        string password = TestPassword)
    {
        return await SendWithAntiforgeryAsync(
            client,
            HttpMethod.Post,
            "/api/auth/register",
            new
            {
                username,
                email,
                password
            });
    }

    private static async Task<HttpResponseMessage> LoginAsync(
        HttpClient client,
        string email,
        string password)
    {
        return await SendWithAntiforgeryAsync(
            client,
            HttpMethod.Post,
            "/api/auth/login",
            new
            {
                email,
                password
            });
    }

    private static async Task<HttpResponseMessage> ChangePasswordAsync(
        HttpClient client,
        string currentPassword,
        string newPassword,
        string confirmNewPassword)
    {
        return await SendWithAntiforgeryAsync(
            client,
            HttpMethod.Post,
            "/api/auth/change-password",
            new
            {
                currentPassword,
                newPassword,
                confirmNewPassword
            });
    }

    private static async Task<HttpResponseMessage>
        SendWithAntiforgeryAsync(
            HttpClient client,
            HttpMethod method,
            string path,
            object? body = null)
    {
        var tokenResponse =
            await client.GetAsync("/api/auth/antiforgery-token");
        if (!tokenResponse.IsSuccessStatusCode)
        {
            var errorBody =
                await tokenResponse.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Antiforgery token request failed with " +
                $"{(int)tokenResponse.StatusCode}: {errorBody}");
        }

        using var tokenDocument = await ReadJsonAsync(tokenResponse);
        var token = tokenDocument.RootElement
            .GetProperty("token")
            .GetString();

        Assert.False(string.IsNullOrWhiteSpace(token));

        using var request = new HttpRequestMessage(method, path);
        request.Headers.Add("X-XSRF-TOKEN", token);

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return await client.SendAsync(request);
    }

    private static object NewMovieRequest(
        int movieId,
        int? userId = null,
        int? rating = null,
        bool? watched = null)
    {
        return new
        {
            title = $"Integration Test Movie {movieId}",
            poster_path = "/integration-test.jpg",
            overview = "Created by the automated security tests.",
            popularity = 12.5,
            vote_average = 7.4,
            release_date = "2026-01-02",
            movieId,
            userId,
            rating,
            watched
        };
    }

    private static object NewMovieStatusRequest(
        int movieId,
        bool watched,
        int rating)
    {
        return new
        {
            title = $"Integration Test Movie {movieId}",
            poster_path = "/integration-test.jpg",
            overview = "Created by the automated security tests.",
            popularity = 12.5,
            vote_average = 7.4,
            release_date = "2026-01-02",
            movieId,
            watched,
            rating
        };
    }

    private static async Task<JsonDocument> ReadJsonAsync(
        HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json);
    }

    private sealed class CatacombsApplicationFactory
        : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(
            IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                logging.AddDebug();
            });
            builder.ConfigureServices(services =>
            {
                services
                    .AddDataProtection()
                    .UseEphemeralDataProtectionProvider();
            });
        }
    }
}
