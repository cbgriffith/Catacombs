using Catacombs.Models;
using Catacombs.Repositories;
using Catacombs.Utils;
using Microsoft.Extensions.Configuration;

namespace Tabloid.Repositories
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

        //public void Deactivate(int id)
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"UPDATE UserProfile
        //                                SET UserTypeId = 3
        //                                Where Id = @Id";
        //            cmd.Parameters.AddWithValue("@Id", id);
        //            cmd.ExecuteNonQuery();
        //        }
        //    }
        //}

        //public void Reactivate(int id)
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"UPDATE UserProfile
        //                                SET UserTypeId = 2
        //                                Where Id = @Id";
        //            cmd.Parameters.AddWithValue("@Id", id);
        //            cmd.ExecuteNonQuery();
        //        }
        //    }
        //}


        //public List<UserProfile> GetAll()
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"
        //            SELECT up.Id AS UserProfileId, up.FirstName, up.LastName, up.DisplayName, 
        //                       up.Email, up.CreateDateTime AS UserProfileCreatedDate, up.ImageLocation UserProfileImageUrl, up.UserTypeId,
        //                       ut.Name AS UserTypeName
        //                  FROM UserProfile up
        //                       LEFT JOIN UserType ut on up.UserTypeId = ut.Id
        //                       Order By DisplayName
        //            ";

        //            var reader = cmd.ExecuteReader();

        //            var posts = new List<UserProfile>();
        //            while (reader.Read())
        //            {
        //                posts.Add(new UserProfile()
        //                {
        //                    Id = DbUtils.GetInt(reader, "UserProfileId"),
        //                    DisplayName = DbUtils.GetString(reader, "DisplayName"),
        //                    FirstName = DbUtils.GetString(reader, "FirstName"),
        //                    LastName = DbUtils.GetString(reader, "LastName"),
        //                    Email = DbUtils.GetString(reader, "Email"),
        //                    CreateDateTime = DbUtils.GetDateTime(reader, "UserProfileCreatedDate"),
        //                    ImageLocation = DbUtils.GetString(reader, "UserProfileImageUrl"),
        //                    UserTypeId = DbUtils.GetInt(reader, "UserTypeId"),
        //                    UserType = new UserType()
        //                    {
        //                        Id = DbUtils.GetInt(reader, "UserTypeId"),
        //                        Name = DbUtils.GetString(reader, "UserTypeName"),
        //                    }
        //                });
        //            }

        //            reader.Close();

        //            return posts;
        //        }
        //    }
        //}

        //public List<UserProfile> GetAdminProfiles()
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"
        //            SELECT up.Id AS UserProfileId, up.FirstName, up.LastName, up.DisplayName, 
        //                       up.Email, up.CreateDateTime AS UserProfileCreatedDate, up.ImageLocation UserProfileImageUrl, up.UserTypeId,
        //                       ut.Name AS UserTypeName
        //                  FROM UserProfile up
        //                       LEFT JOIN UserType ut on up.UserTypeId = ut.Id
        //                       WHERE up.UserTypeId = 1
        //                       Order By DisplayName
        //            ";

        //            var reader = cmd.ExecuteReader();

        //            var posts = new List<UserProfile>();
        //            while (reader.Read())
        //            {
        //                posts.Add(new UserProfile()
        //                {
        //                    Id = DbUtils.GetInt(reader, "UserProfileId"),
        //                    DisplayName = DbUtils.GetString(reader, "DisplayName"),
        //                    FirstName = DbUtils.GetString(reader, "FirstName"),
        //                    LastName = DbUtils.GetString(reader, "LastName"),
        //                    Email = DbUtils.GetString(reader, "Email"),
        //                    CreateDateTime = DbUtils.GetDateTime(reader, "UserProfileCreatedDate"),
        //                    ImageLocation = DbUtils.GetString(reader, "UserProfileImageUrl"),
        //                    UserTypeId = DbUtils.GetInt(reader, "UserTypeId"),
        //                    UserType = new UserType()
        //                    {
        //                        Id = DbUtils.GetInt(reader, "UserTypeId"),
        //                        Name = DbUtils.GetString(reader, "UserTypeName"),
        //                    }
        //                });
        //            }

        //            reader.Close();

        //            return posts;
        //        }
        //    }
        //}

        //public UserProfile GetById(int id)
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"
        //               SELECT u.id, u.FirstName, u.LastName, u.DisplayName, u.Email,
        //                      u.CreateDateTime, u.ImageLocation, u.UserTypeId,
        //                      ut.[Name] AS UserTypeName
        //                 FROM UserProfile u
        //                      LEFT JOIN UserType ut ON u.UserTypeId = ut.id
        //                WHERE u.Id = @id";
        //            cmd.Parameters.AddWithValue("@id", id);

        //            var reader = cmd.ExecuteReader();

        //            if (reader.Read())
        //            {
        //                UserProfile userProfile = new UserProfile()
        //                {
        //                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
        //                    Email = reader.GetString(reader.GetOrdinal("Email")),
        //                    FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
        //                    LastName = reader.GetString(reader.GetOrdinal("LastName")),
        //                    DisplayName = reader.GetString(reader.GetOrdinal("DisplayName")),
        //                    CreateDateTime = reader.GetDateTime(reader.GetOrdinal("CreateDateTime")),
        //                    ImageLocation = DbUtils.GetNullableString(reader, "ImageLocation"),
        //                    UserTypeId = reader.GetInt32(reader.GetOrdinal("UserTypeId")),
        //                    UserType = new UserType()
        //                    {
        //                        Id = reader.GetInt32(reader.GetOrdinal("UserTypeId")),
        //                        Name = reader.GetString(reader.GetOrdinal("UserTypeName"))
        //                    },
        //                };
        //                reader.Close();
        //                return userProfile;
        //            }
        //            reader.Close();
        //            return null;

        //        }
        //    }
        //}

        //public void UpdateProfileType(UserProfile userProfile)
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"
        //                       UPDATE UserProfile
        //                        SET DisplayName = @displayName,
        //                        FirstName = @firstName,
        //                        LastName = @lastName,
        //                        Email = @email,
        //                        ImageLocation = @imageLocation,
        //                        UserTypeId = @userTypeId
        //                        WHERE Id = @Id";

        //            DbUtils.AddParameter(cmd, "@displayName", userProfile.DisplayName);
        //            DbUtils.AddParameter(cmd, "@firstName", userProfile.FirstName);
        //            DbUtils.AddParameter(cmd, "@lastName", userProfile.LastName);
        //            DbUtils.AddParameter(cmd, "@email", userProfile.Email);
        //            DbUtils.AddParameter(cmd, "@imageLocation", userProfile.ImageLocation);
        //            DbUtils.AddParameter(cmd, "@userTypeId", userProfile.UserTypeId);
        //            DbUtils.AddParameter(cmd, "@Id", userProfile.Id);


        //            cmd.ExecuteNonQuery();
        //        }
        //    }
        //}

        //public List<UserType> GetUserTypes()
        //{
        //    using (var conn = Connection)
        //    {
        //        conn.Open();
        //        using (var cmd = conn.CreateCommand())
        //        {
        //            cmd.CommandText = @"SELECT Id, Name
        //                                FROM UserType                    
        //            ";

        //            var reader = cmd.ExecuteReader();

        //            var userTypes = new List<UserType>();
        //            while (reader.Read())
        //            {
        //                userTypes.Add(new UserType()
        //                {
        //                    Id = DbUtils.GetInt(reader, "Id"),
        //                    Name = DbUtils.GetString(reader, "Name"),

        //                });
        //            }

        //            reader.Close();

        //            return userTypes;
        //        }
        //    }
        //}

        /*
        public UserProfile GetByFirebaseUserId(string firebaseUserId)
        {
            return _context.UserProfile
                       .Include(up => up.UserType) 
                       .FirstOrDefault(up => up.FirebaseUserId == firebaseUserId);
        }

        public void Add(UserProfile userProfile)
        {
            _context.Add(userProfile);
            _context.SaveChanges();
        }
        */
    }
}