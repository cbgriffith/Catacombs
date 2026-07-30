using Catacombs.Models;
using System.Collections.Generic;

namespace Catacombs.Repositories
{
    public interface IMoviesRepository
    {
        Movies GetMovieById(int id, int userId);
        Movies GetMovieByTmdbId(int movieId, int userId);
        void Add(Movies movie, int userId);
        Movies SetStatus(Movies movie, int userId);
        MovieCollectionSummary GetSummary(int userId);
        List<Movies> GetCollection(int userId);
        List<Movies> GetAllMovies(int userId);
        List<Movies> GetAllSeenMovies(int userId);
        bool Delete(int id, int userId);
        List<Movies> GetAllLikedMovies(int userId);
        List<Movies> GetAllDislikedMovies(int userId);
        bool SeenIt(int id, int userId);
        bool LikedIt(int id, int userId);
        bool DislikedIt(int id, int userId);
    }
}
