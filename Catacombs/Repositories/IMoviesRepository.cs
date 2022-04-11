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
    }
}
