using Catacombs.Models;
using Catacombs.Repositories;
using Catacombs.Utils;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace Catacombs.Repositories
{
    public class MoviesRepository : BaseRepository, IMoviesRepository
    {
        public MoviesRepository(IConfiguration configuration) : base(configuration) { }

        public List<Movies> GetAllMoviesByUser(int userId)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                       SELECT m.id, m.userId, 
                              m.title,
                              m.rating, m.watched, m.poster_path,
                              m.overview, m.popularity,
                              m.vote_average,
                              u.username, u.email, u.password
                         FROM Movies m
                              LEFT JOIN Users u ON m.userId = u.id
                        WHERE m.userId = @userId";

                    cmd.Parameters.AddWithValue("@userId", userId);
                    var reader = cmd.ExecuteReader();

                    var movies = new List<Movies>();

                    while (reader.Read())
                    {
                        movies.Add(NewMovieFromReader(reader));
                    }

                    reader.Close();

                    return movies;
                }
            }
        }

        private Movies NewMovieFromReader(SqlDataReader reader)
        {
            return new Movies()
            {
                id = reader.GetInt32(reader.GetOrdinal("id")),
                userId = reader.GetInt32(reader.GetOrdinal("userId")),
                title = reader.GetString(reader.GetOrdinal("title")),
                rating = reader.GetInt32(reader.GetOrdinal("rating")),
                watched = reader.GetBoolean(reader.GetOrdinal("watched")),
                poster_path = reader.GetString(reader.GetOrdinal("poster_path")),
                overview = reader.GetString(reader.GetOrdinal("overview")),
                popularity = reader.GetInt32(reader.GetOrdinal("popularity")),
                vote_average = reader.GetDecimal(reader.GetOrdinal("vote_average")),
                Users = new Users()
                {
                    id = reader.GetInt32(reader.GetOrdinal("id")),
                    username = reader.GetString(reader.GetOrdinal("username")),
                    email = reader.GetString(reader.GetOrdinal("email")),
                    password = reader.GetString(reader.GetOrdinal("password"))
                }
            };
        }
    }
}
