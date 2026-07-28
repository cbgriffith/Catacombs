using Npgsql;

namespace Catacombs.Repositories
{
    public abstract class BaseRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        protected BaseRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        protected NpgsqlConnection Connection => _dataSource.CreateConnection();
    }
}
