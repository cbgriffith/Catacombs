using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Catacombs.HealthChecks
{
    public sealed class PostgreSqlHealthCheck : IHealthCheck
    {
        private readonly NpgsqlDataSource _dataSource;

        public PostgreSqlHealthCheck(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                await using var command = _dataSource.CreateCommand(@"
                    SELECT to_regclass('public.users') IS NOT NULL
                       AND to_regclass('public.movies') IS NOT NULL");
                var schemaIsReady = await command.ExecuteScalarAsync(
                    cancellationToken);

                return schemaIsReady is true
                    ? HealthCheckResult.Healthy(
                        "PostgreSQL is reachable and the schema is ready.")
                    : HealthCheckResult.Unhealthy(
                        "PostgreSQL is reachable, but the schema is incomplete.");
            }
            catch (Exception exception)
            {
                return HealthCheckResult.Unhealthy(
                    "PostgreSQL is not reachable.",
                    exception);
            }
        }
    }
}
