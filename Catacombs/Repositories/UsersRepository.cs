using Catacombs.Models;
using Catacombs.Utils;
using Npgsql;
using System.Data;

namespace Catacombs.Repositories
{
    public class UsersRepository : BaseRepository, IUsersRepository
    {
        public UsersRepository(NpgsqlDataSource dataSource) : base(dataSource)
        {
        }

        public Users GetByEmail(string email)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT u.id, u.username, u.email, u.password
                  FROM users u
                 WHERE u.email = @email";

            DbUtils.AddParameter(command, "@email", email, DbType.String);

            using var reader = command.ExecuteReader();
            if (!reader.Read())
            {
                return null;
            }

            return new Users
            {
                id = DbUtils.GetInt(reader, "id"),
                username = DbUtils.GetString(reader, "username"),
                email = DbUtils.GetString(reader, "email"),
                password = DbUtils.GetString(reader, "password")
            };
        }

        public void Add(Users users)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO users (username, email, password)
                VALUES (@username, @email, @password)
                RETURNING id";

            DbUtils.AddParameter(
                command,
                "@username",
                users.username,
                DbType.String);
            DbUtils.AddParameter(
                command,
                "@email",
                users.email,
                DbType.String);
            DbUtils.AddParameter(
                command,
                "@password",
                users.password,
                DbType.String);

            users.id = (int)command.ExecuteScalar();
        }
    }
}
