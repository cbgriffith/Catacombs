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
                              m.vote_average, m.release_date, m.movieId,
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

        public Movies GetMovieById(int id)
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
                              m.vote_average, m.release_date, m.movieId,
                              u.username, u.email, u.password
                         FROM Movies m
                              LEFT JOIN Users u ON m.userId = u.id
                        WHERE m.id = @id";

                    cmd.Parameters.AddWithValue("@id", id);
                    var reader = cmd.ExecuteReader();

                    Movies movies = null;

                    if (reader.Read())
                    {
                        movies = NewMovieFromReader(reader);
                    }

                    reader.Close();

                    return movies;
                }
            }
        }

        public List<Movies> GetAllMovies()
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
                              m.vote_average, m.release_date, m.movieId,
                              u.username, u.email, u.password
                         FROM Movies m
                              LEFT JOIN Users u ON m.userId = u.id
                        WHERE m.watched = 0";
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

        public List<Movies> GetAllSeenMovies()
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
                              m.vote_average, m.release_date, m.movieId,
                              u.username, u.email, u.password
                         FROM Movies m
                              LEFT JOIN Users u ON m.userId = u.id
                        WHERE m.watched = 1";
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

        public List<Movies> GetAllLikedMovies()
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
                              m.vote_average, m.release_date, m.movieId,
                              u.username, u.email, u.password
                         FROM Movies m
                              LEFT JOIN Users u ON m.userId = u.id
                        WHERE m.watched = 1 AND m.rating = 1";
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

        public List<Movies> GetAllDislikedMovies()
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
                              m.vote_average, m.release_date, m.movieId,
                              u.username, u.email, u.password
                         FROM Movies m
                              LEFT JOIN Users u ON m.userId = u.id
                        WHERE m.watched = 1 AND m.rating = -1";
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

        public void Add(Movies movie)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        INSERT INTO Movies (userId, title, rating, watched, poster_path, overview, popularity, vote_average, release_date, movieId)
                        OUTPUT INSERTED.ID
                        VALUES (@userId, @title, @rating, @watched, @poster_path, @overview, @popularity, @vote_average, @release_date, @movieId)";

                    DbUtils.AddParameter(cmd, "@userId", movie.userId);
                    DbUtils.AddParameter(cmd, "@title", movie.title);
                    DbUtils.AddParameter(cmd, "@rating", movie.rating);
                    DbUtils.AddParameter(cmd, "@watched", movie.watched);
                    DbUtils.AddParameter(cmd, "@poster_path", movie.poster_path);
                    DbUtils.AddParameter(cmd, "@overview", movie.overview);
                    DbUtils.AddParameter(cmd, "@popularity", movie.popularity);
                    DbUtils.AddParameter(cmd, "@vote_average", movie.vote_average);
                    DbUtils.AddParameter(cmd, "@release_date", movie.release_date);
                    DbUtils.AddParameter(cmd, "@movieId", movie.movieId);

                    movie.id = (int)cmd.ExecuteScalar();
                }
            }
        }

        public void Delete(int id)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"DELETE FROM Movies WHERE id = @id";

                    DbUtils.AddParameter(cmd, "@id", id);

                    cmd.ExecuteNonQuery();
                }
            }
        }

        public void SeenIt(int id)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"UPDATE Movies
                                        SET Watched = 1
                                        Where id = @id";
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public void LikedIt(int id)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"UPDATE Movies
                                        SET rating = 1
                                        Where id = @id";
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public void DislikedIt(int id)
        {
            using (var conn = Connection)
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"UPDATE Movies
                                        SET rating = -1
                                        Where id = @id";
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.ExecuteNonQuery();
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
                popularity = reader.GetDouble(reader.GetOrdinal("popularity")),
                vote_average = reader.GetDouble(reader.GetOrdinal("vote_average")),
                release_date = reader.GetDateTime(reader.GetOrdinal("release_date")),
                movieId = reader.GetInt32(reader.GetOrdinal("movieId")),
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
