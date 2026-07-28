using Catacombs.Models;
using Catacombs.Utils;
using Npgsql;
using System.Data;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;

namespace Catacombs.Repositories
{
    public class MoviesRepository : BaseRepository, IMoviesRepository
    {
        private const string MovieSelectSql = @"
            SELECT m.id,
                   m.user_id,
                   m.title,
                   m.rating,
                   m.watched,
                   m.poster_path,
                   m.overview,
                   m.popularity,
                   m.vote_average,
                   m.release_date,
                   m.movie_id,
                   u.id AS owner_id,
                   u.username AS owner_username,
                   u.email AS owner_email
              FROM movies m
                   INNER JOIN users u ON m.user_id = u.id";

        public MoviesRepository(NpgsqlDataSource dataSource) : base(dataSource)
        {
        }

        public List<Movies> GetAllMoviesByUser(int userId)
        {
            return GetMovies(
                " WHERE m.user_id = @userId",
                "@userId",
                userId);
        }

        public Movies GetMovieById(int id)
        {
            return GetMovies(" WHERE m.id = @id", "@id", id)
                .SingleOrDefault();
        }

        public List<Movies> GetAllMovies()
        {
            return GetMovies(" WHERE m.watched = false");
        }

        public List<Movies> GetAllSeenMovies()
        {
            return GetMovies(" WHERE m.watched = true");
        }

        public List<Movies> GetAllLikedMovies()
        {
            return GetMovies(
                " WHERE m.watched = true AND m.rating = 1");
        }

        public List<Movies> GetAllDislikedMovies()
        {
            return GetMovies(
                " WHERE m.watched = true AND m.rating = -1");
        }

        public void Add(Movies movie)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO movies
                    (user_id, title, rating, watched, poster_path, overview,
                     popularity, vote_average, release_date, movie_id)
                VALUES
                    (@userId, @title, @rating, @watched, @posterPath, @overview,
                     @popularity, @voteAverage, @releaseDate, @movieId)
                RETURNING id";

            DbUtils.AddParameter(
                command,
                "@userId",
                movie.userId,
                DbType.Int32);
            DbUtils.AddParameter(
                command,
                "@title",
                movie.title,
                DbType.String);
            DbUtils.AddParameter(
                command,
                "@rating",
                movie.rating,
                DbType.Int32);
            DbUtils.AddParameter(
                command,
                "@watched",
                movie.watched,
                DbType.Boolean);
            DbUtils.AddParameter(
                command,
                "@posterPath",
                movie.poster_path,
                DbType.String);
            DbUtils.AddParameter(
                command,
                "@overview",
                movie.overview,
                DbType.String);
            DbUtils.AddParameter(
                command,
                "@popularity",
                movie.popularity,
                DbType.Double);
            DbUtils.AddParameter(
                command,
                "@voteAverage",
                movie.vote_average,
                DbType.Double);
            DbUtils.AddParameter(
                command,
                "@releaseDate",
                movie.release_date,
                DbType.Date);
            DbUtils.AddParameter(
                command,
                "@movieId",
                movie.movieId,
                DbType.Int32);

            movie.id = (int)command.ExecuteScalar();
        }

        public void Delete(int id)
        {
            ExecuteForMovie(
                "DELETE FROM movies WHERE id = @id",
                id);
        }

        public void SeenIt(int id)
        {
            ExecuteForMovie(
                "UPDATE movies SET watched = true WHERE id = @id",
                id);
        }

        public void LikedIt(int id)
        {
            ExecuteForMovie(
                "UPDATE movies SET rating = 1 WHERE id = @id",
                id);
        }

        public void DislikedIt(int id)
        {
            ExecuteForMovie(
                "UPDATE movies SET rating = -1 WHERE id = @id",
                id);
        }

        private List<Movies> GetMovies(
            string filterSql,
            string parameterName = null,
            object parameterValue = null)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = MovieSelectSql + filterSql;

            if (parameterName != null)
            {
                DbUtils.AddParameter(
                    command,
                    parameterName,
                    parameterValue,
                    DbType.Int32);
            }

            using var reader = command.ExecuteReader();
            var movies = new List<Movies>();

            while (reader.Read())
            {
                movies.Add(NewMovieFromReader(reader));
            }

            return movies;
        }

        private void ExecuteForMovie(string commandText, int id)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = commandText;
            DbUtils.AddParameter(command, "@id", id, DbType.Int32);
            command.ExecuteNonQuery();
        }

        private static Movies NewMovieFromReader(DbDataReader reader)
        {
            return new Movies
            {
                id = DbUtils.GetInt(reader, "id"),
                userId = DbUtils.GetInt(reader, "user_id"),
                title = DbUtils.GetString(reader, "title"),
                rating = DbUtils.GetInt(reader, "rating"),
                watched = reader.GetBoolean(reader.GetOrdinal("watched")),
                poster_path = DbUtils.GetString(reader, "poster_path"),
                overview = DbUtils.GetString(reader, "overview"),
                popularity = reader.GetDouble(reader.GetOrdinal("popularity")),
                vote_average = reader.GetDouble(
                    reader.GetOrdinal("vote_average")),
                release_date = DbUtils.GetDateTime(reader, "release_date"),
                movieId = DbUtils.GetInt(reader, "movie_id"),
                Users = new Users
                {
                    id = DbUtils.GetInt(reader, "owner_id"),
                    username = DbUtils.GetString(reader, "owner_username"),
                    email = DbUtils.GetString(reader, "owner_email")
                }
            };
        }
    }
}
