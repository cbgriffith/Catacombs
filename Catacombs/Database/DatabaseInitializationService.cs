using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace Catacombs.Database
{
    public sealed class DatabaseInitializationService : IHostedService
    {
        private const string MigrationResourcePrefix =
            "Catacombs.Database.Migrations.";

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
            await using var connection = await _dataSource.OpenConnectionAsync(
                cancellationToken);

            await AcquireMigrationLockAsync(connection, cancellationToken);
            await EnsureMigrationTableAsync(connection, cancellationToken);

            var appliedMigrations = await GetAppliedMigrationsAsync(
                connection,
                cancellationToken);

            foreach (var resourceName in GetMigrationResourceNames())
            {
                var migrationName = resourceName[MigrationResourcePrefix.Length..];

                if (appliedMigrations.Contains(migrationName))
                {
                    continue;
                }

                await ApplyMigrationAsync(
                    connection,
                    resourceName,
                    migrationName,
                    cancellationToken);
            }

            _logger.LogInformation("PostgreSQL database schema is ready.");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        private static async Task AcquireMigrationLockAsync(
            NpgsqlConnection connection,
            CancellationToken cancellationToken)
        {
            await using var command = new NpgsqlCommand(
                "SELECT pg_advisory_lock(hashtext('catacombs_schema_migrations'))",
                connection);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        private static async Task EnsureMigrationTableAsync(
            NpgsqlConnection connection,
            CancellationToken cancellationToken)
        {
            await using var command = new NpgsqlCommand(@"
                CREATE TABLE IF NOT EXISTS schema_migrations
                (
                    migration_name varchar(255) PRIMARY KEY,
                    applied_at timestamp with time zone NOT NULL DEFAULT now()
                )",
                connection);

            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        private static async Task<HashSet<string>> GetAppliedMigrationsAsync(
            NpgsqlConnection connection,
            CancellationToken cancellationToken)
        {
            await using var command = new NpgsqlCommand(
                "SELECT migration_name FROM schema_migrations",
                connection);
            await using var reader = await command.ExecuteReaderAsync(
                cancellationToken);

            var appliedMigrations = new HashSet<string>(
                StringComparer.Ordinal);

            while (await reader.ReadAsync(cancellationToken))
            {
                appliedMigrations.Add(reader.GetString(0));
            }

            return appliedMigrations;
        }

        private static IEnumerable<string> GetMigrationResourceNames()
        {
            return Assembly
                .GetExecutingAssembly()
                .GetManifestResourceNames()
                .Where(name =>
                    name.StartsWith(
                        MigrationResourcePrefix,
                        StringComparison.Ordinal) &&
                    name.EndsWith(".sql", StringComparison.Ordinal))
                .OrderBy(name => name, StringComparer.Ordinal);
        }

        private async Task ApplyMigrationAsync(
            NpgsqlConnection connection,
            string resourceName,
            string migrationName,
            CancellationToken cancellationToken)
        {
            var assembly = Assembly.GetExecutingAssembly();
            await using var migrationStream =
                assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException(
                    $"Embedded database migration '{resourceName}' was not found.");

            using var reader = new StreamReader(migrationStream);
            var migrationSql = await reader.ReadToEndAsync(cancellationToken);

            await using var transaction = await connection.BeginTransactionAsync(
                cancellationToken);

            try
            {
                await using var migrationCommand = new NpgsqlCommand(
                    migrationSql,
                    connection,
                    transaction);
                await migrationCommand.ExecuteNonQueryAsync(cancellationToken);

                await using var recordCommand = new NpgsqlCommand(@"
                    INSERT INTO schema_migrations (migration_name)
                    VALUES (@migrationName)",
                    connection,
                    transaction);
                recordCommand.Parameters.AddWithValue(
                    "@migrationName",
                    migrationName);
                await recordCommand.ExecuteNonQueryAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);
                _logger.LogInformation(
                    "Applied database migration {MigrationName}.",
                    migrationName);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
