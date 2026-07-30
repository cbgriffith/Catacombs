using Catacombs.Models;
using Catacombs.Utils;
using Npgsql;
using System.Collections.Generic;
using System.Data;
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
                   m.movie_id
              FROM movies m";

        public MoviesRepository(NpgsqlDataSource dataSource) : base(dataSource)
        {
        }

        public Movies GetMovieById(int id, int userId)
        {
            return GetMovies(
                    " WHERE m.user_id = @userId AND m.id = @id",
                    userId,
                    id: id)
                .SingleOrDefault();
        }

        public Movies GetMovieByTmdbId(int movieId, int userId)
        {
            return GetMovies(
                    @" WHERE m.user_id = @userId
                             AND m.movie_id = @movieId",
                    userId,
                    tmdbMovieId: movieId)
                .SingleOrDefault();
        }

        public List<Movies> GetCollection(int userId)
        {
            return GetMovies(
                " WHERE m.user_id = @userId",
                userId);
        }

        public List<Movies> GetAllMovies(int userId)
        {
            return GetMovies(
                " WHERE m.user_id = @userId AND m.watched = false",
                userId);
        }

        public List<Movies> GetAllSeenMovies(int userId)
        {
            return GetMovies(
                " WHERE m.user_id = @userId AND m.watched = true",
                userId);
        }

        public List<Movies> GetAllLikedMovies(int userId)
        {
            return GetMovies(
                @" WHERE m.user_id = @userId
                         AND m.watched = true
                         AND m.rating = 1",
                userId);
        }

        public List<Movies> GetAllDislikedMovies(int userId)
        {
            return GetMovies(
                @" WHERE m.user_id = @userId
                         AND m.watched = true
                         AND m.rating = -1",
                userId);
        }

        public void Add(Movies movie, int userId)
        {
            UpsertMovie(movie, userId, updateStatus: false);
        }

        public Movies SetStatus(Movies movie, int userId)
        {
            UpsertMovie(movie, userId, updateStatus: true);
            return movie;
        }

        private void UpsertMovie(
            Movies movie,
            int userId,
            bool updateStatus)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            var statusUpdateSql = updateStatus
                ? @"rating = EXCLUDED.rating,
                     watched = EXCLUDED.watched,"
                : string.Empty;

            command.CommandText = $@"
                INSERT INTO movies
                    (user_id, title, rating, watched, poster_path, overview,
                     popularity, vote_average, release_date, movie_id)
                VALUES
                    (@userId, @title, @rating, @watched, @posterPath, @overview,
                     @popularity, @voteAverage, @releaseDate, @movieId)
                ON CONFLICT (user_id, movie_id)
                DO UPDATE SET
                    {statusUpdateSql}
                    title = EXCLUDED.title,
                    poster_path = EXCLUDED.poster_path,
                    overview = EXCLUDED.overview,
                    popularity = EXCLUDED.popularity,
                    vote_average = EXCLUDED.vote_average,
                    release_date = EXCLUDED.release_date
                RETURNING id, rating, watched";

            DbUtils.AddParameter(
                command,
                "@userId",
                userId,
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

            using var reader = command.ExecuteReader();
            reader.Read();

            movie.id = reader.GetInt32(0);
            movie.rating = reader.GetInt32(1);
            movie.watched = reader.GetBoolean(2);
            movie.userId = userId;
        }

        public bool Delete(int id, int userId)
        {
            return ExecuteForMovie(
                @"DELETE FROM movies
                   WHERE id = @id AND user_id = @userId",
                id,
                userId);
        }

        public bool SeenIt(int id, int userId)
        {
            return ExecuteForMovie(
                @"UPDATE movies
                     SET watched = true
                   WHERE id = @id AND user_id = @userId",
                id,
                userId);
        }

        public bool LikedIt(int id, int userId)
        {
            return ExecuteForMovie(
                @"UPDATE movies
                     SET rating = 1
                   WHERE id = @id AND user_id = @userId",
                id,
                userId);
        }

        public bool DislikedIt(int id, int userId)
        {
            return ExecuteForMovie(
                @"UPDATE movies
                     SET rating = -1
                   WHERE id = @id AND user_id = @userId",
                id,
                userId);
        }

        private List<Movies> GetMovies(
            string filterSql,
            int userId,
            int? id = null,
            int? tmdbMovieId = null)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = MovieSelectSql + filterSql;
            DbUtils.AddParameter(
                command,
                "@userId",
                userId,
                DbType.Int32);

            if (id.HasValue)
            {
                DbUtils.AddParameter(
                    command,
                    "@id",
                    id.Value,
                    DbType.Int32);
            }

            if (tmdbMovieId.HasValue)
            {
                DbUtils.AddParameter(
                    command,
                    "@movieId",
                    tmdbMovieId.Value,
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

        private bool ExecuteForMovie(
            string commandText,
            int id,
            int userId)
        {
            using var connection = Connection;
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = commandText;
            DbUtils.AddParameter(command, "@id", id, DbType.Int32);
            DbUtils.AddParameter(
                command,
                "@userId",
                userId,
                DbType.Int32);
            return command.ExecuteNonQuery() > 0;
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
                movieId = DbUtils.GetInt(reader, "movie_id")
            };
        }
    }
}
