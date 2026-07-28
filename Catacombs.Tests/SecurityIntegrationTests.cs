using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Catacombs.Models;
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
    public async Task MovieChangesRequireAuthenticationAndAnAntiforgeryToken()
    {
        var anonymousResponse = await _client.GetAsync("/api/movies");
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            anonymousResponse.StatusCode);

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
        string email)
    {
        return await SendWithAntiforgeryAsync(
            client,
            HttpMethod.Post,
            "/api/auth/register",
            new
            {
                username,
                email,
                password = TestPassword
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
