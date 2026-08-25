using Catacombs.Models;
using Catacombs.Utils;
using Npgsql;
using System.Data;
using System.Data.Common;

namespace Catacombs.Repositories
{
    public class UsersRepository : BaseRepository, IUsersRepository
    {
        public UsersRepository(NpgsqlDataSource dataSource) : base(dataSource)
        {
        }

        public Users GetById(int id)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT u.id,
                       u.username,
                       u.email,
                       u.password_hash,
                       u.role,
                       u.is_banned,
                       u.banned_at,
                       u.banned_by_user_id,
                       u.ban_reason
                  FROM users u
                 WHERE u.id = @id";

            DbUtils.AddParameter(command, "@id", id, DbType.Int32);

            using var reader = command.ExecuteReader();
            return reader.Read() ? MapUser(reader) : null;
        }

        public Users GetByEmail(string email)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT u.id,
                       u.username,
                       u.email,
                       u.password_hash,
                       u.role,
                       u.is_banned,
                       u.banned_at,
                       u.banned_by_user_id,
                       u.ban_reason
                  FROM users u
                 WHERE u.email = @email";

            DbUtils.AddParameter(command, "@email", email, DbType.String);

            using var reader = command.ExecuteReader();
            if (!reader.Read())
            {
                return null;
            }

            return MapUser(reader);
        }

        public void Add(Users users)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO users (username, email, password_hash)
                VALUES (@username, @email, @passwordHash)
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
                "@passwordHash",
                users.passwordHash,
                DbType.String);

            users.id = (int)command.ExecuteScalar();
        }

        public void UpdatePasswordHash(int userId, string passwordHash)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                UPDATE users
                   SET password_hash = @passwordHash
                 WHERE id = @id";

            DbUtils.AddParameter(command, "@id", userId, DbType.Int32);
            DbUtils.AddParameter(
                command,
                "@passwordHash",
                passwordHash,
                DbType.String);

            command.ExecuteNonQuery();
        }

        private static Users MapUser(DbDataReader reader)
        {
            return new Users
            {
                id = DbUtils.GetInt(reader, "id"),
                username = DbUtils.GetString(reader, "username"),
                email = DbUtils.GetString(reader, "email"),
                passwordHash = DbUtils.GetString(reader, "password_hash"),
                role = DbUtils.GetString(reader, "role"),
                isBanned = reader.GetBoolean(
                    reader.GetOrdinal("is_banned")),
                bannedAt = DbUtils.GetNullableDateTime(reader, "banned_at"),
                bannedByUserId = DbUtils.GetNullableInt(
                    reader,
                    "banned_by_user_id"),
                banReason = DbUtils.GetNullableString(reader, "ban_reason")
            };
        }
    }
}
