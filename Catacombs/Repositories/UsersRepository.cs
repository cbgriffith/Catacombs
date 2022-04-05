using Catacombs.Models;
using Catacombs.Repositories;
using Catacombs.Utils;
using Microsoft.Extensions.Configuration;

namespace Catacombs.Repositories
{
    public class UsersRepository : BaseRepository, IUsersRepository
    {
        public UsersRepository(IConfiguration configuration) : base(configuration) { }

        public Users GetByEmail(string email)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT u.id, u.username, u.email, u.password
                          FROM users u
                         WHERE Email = @email";

                    DbUtils.AddParameter(cmd, "@email", email);

                    Users users = null;

                    var reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        users = new Users()
                        {
                            id = DbUtils.GetInt(reader, "id"),
                            username = DbUtils.GetString(reader, "username"),
                            email = DbUtils.GetString(reader, "email"),
                            password = DbUtils.GetString(reader, "password")
                        };
                    }
                    reader.Close();

                    return users;
                }
            }
        }

        public void Add(Users users)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"INSERT INTO Users (username, email, password) 
                                        OUTPUT INSERTED.ID
                                        VALUES (@username, @email, @password)"; 
                    DbUtils.AddParameter(cmd, "@username", users.username);
                    DbUtils.AddParameter(cmd, "@email", users.email);
                    DbUtils.AddParameter(cmd, "@password", users.password);

                    users.id = (int)cmd.ExecuteScalar();
                }
            }
        }
    }
}