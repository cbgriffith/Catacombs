using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Catacombs.Database
{
    public sealed class DatabaseInitializationService : IHostedService
    {
        private const string MigrationResourceName =
            "Catacombs.Database.Migrations.001_initial_schema.sql";

        private readonly NpgsqlDataSource _dataSource;
        private readonly ILogger<DatabaseInitializationService> _logger;

        public DatabaseInitializationService(
            NpgsqlDataSource dataSource,
            ILogger<DatabaseInitializationService> logger)
        {
            _dataSource = dataSource;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await using var migrationStream = Assembly
                .GetExecutingAssembly()
                .GetManifestResourceStream(MigrationResourceName)
                ?? throw new InvalidOperationException(
                    $"Embedded database migration '{MigrationResourceName}' was not found.");

            using var reader = new StreamReader(migrationStream);
            var migrationSql = await reader.ReadToEndAsync(cancellationToken);

            await using var command = _dataSource.CreateCommand(migrationSql);
            await command.ExecuteNonQueryAsync(cancellationToken);

            _logger.LogInformation("PostgreSQL database schema is ready.");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
