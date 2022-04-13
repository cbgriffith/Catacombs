using Catacombs.Models;
using System.Collections.Generic;

namespace Catacombs.Repositories
{
    public interface IMoviesRepository
    {
        List<Movies> GetAllMoviesByUser(int userId);
        Movies GetMovieById(int id);
        void Add(Movies movie);
        List<Movies> GetAllMovies();
        List<Movies> GetAllSeenMovies();
        void Delete(int id);
        List<Movies> GetAllLikedMovies();
        List<Movies> GetAllDislikedMovies();
        void SeenIt(int id);
        void LikedIt(int id);
        void DislikedIt(int id);
    }                      
}
