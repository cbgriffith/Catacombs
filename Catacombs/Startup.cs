using Catacombs.Database;
using Catacombs.HealthChecks;
using Catacombs.Models;
using Catacombs.Repositories;
using Catacombs.Services.Tmdb;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.RateLimiting;
using System.Threading.Tasks;

namespace Catacombs
{
    public class Startup
    {
        private const string DevelopmentClientCorsPolicy =
            "DevelopmentClient";
        private const string LoginRateLimitPolicy = "Login";
        private const string PasswordChangeRateLimitPolicy =
            "PasswordChange";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var postgresConnectionString = Configuration.GetConnectionString("Catacombs")
                ?? throw new InvalidOperationException(
                    "The PostgreSQL connection string 'Catacombs' is not configured.");

            services.AddSingleton(_ => NpgsqlDataSource.Create(postgresConnectionString));
            services.AddHostedService<DatabaseInitializationService>();
            services.AddHealthChecks()
                .AddCheck<PostgreSqlHealthCheck>("postgresql");

            services.AddTransient<IUsersRepository, UsersRepository>();
            services.AddTransient<IMoviesRepository, MoviesRepository>();
            services.Configure<TmdbOptions>(
                Configuration.GetSection(TmdbOptions.SectionName));
            services.AddHttpClient<ITmdbClient, TmdbClient>(client =>
            {
                client.BaseAddress =
                    new Uri("https://api.themoviedb.org/3/");
                client.Timeout = TimeSpan.FromSeconds(15);
            });
            services.Configure<PasswordHasherOptions>(options =>
            {
                options.IterationCount = 210_000;
            });
            services.AddScoped<IPasswordHasher<Users>, PasswordHasher<Users>>();

            services.AddCors(options =>
            {
                options.AddPolicy(
                    DevelopmentClientCorsPolicy,
                    policy => policy
                        .WithOrigins(
                            "http://localhost:3000",
                            "https://localhost:3000",
                            "http://127.0.0.1:3000",
                            "https://127.0.0.1:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
            });
            services.AddAntiforgery(options =>
            {
                options.HeaderName = "X-XSRF-TOKEN";
                options.Cookie.Name = "__Host-Catacombs.Antiforgery";
                options.Cookie.HttpOnly = true;
                options.Cookie.Path = "/";
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });
            services
                .AddAuthentication(
                    CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "__Host-Catacombs.Auth";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.Path = "/";
                    options.Cookie.SameSite = SameSiteMode.None;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.ExpireTimeSpan = TimeSpan.FromHours(8);
                    options.SlidingExpiration = true;
                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode =
                            StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    };
                    options.Events.OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode =
                            StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    };
                });
            services.AddAuthorization();
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode =
                    StatusCodes.Status429TooManyRequests;
                options.AddPolicy(
                    LoginRateLimitPolicy,
                    context => RateLimitPartition.GetFixedWindowLimiter(
                        context.Connection.RemoteIpAddress?.ToString()
                            ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 5,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));
                options.AddPolicy(
                    PasswordChangeRateLimitPolicy,
                    context => RateLimitPartition.GetFixedWindowLimiter(
                        context.Connection.RemoteIpAddress?.ToString()
                            ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 5,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));
            });

            services.AddControllersWithViews();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Catacombs", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment() || env.IsEnvironment("Local"))
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Catacombs v1"));
            }

            app.UseHttpsRedirection();

            app.UseRouting();
            if (env.IsDevelopment() || env.IsEnvironment("Local"))
            {
                app.UseCors(DevelopmentClientCorsPolicy);
            }
            app.UseRateLimiter();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHealthChecks("/health");
                endpoints.MapControllers();
            });
        }
    }
}
