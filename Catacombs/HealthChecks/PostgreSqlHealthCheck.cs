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
                await using var command = _dataSource.CreateCommand("SELECT 1");
                await command.ExecuteScalarAsync(cancellationToken);

                return HealthCheckResult.Healthy("PostgreSQL is reachable.");
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
