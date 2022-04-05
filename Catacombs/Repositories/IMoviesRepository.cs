﻿using Catacombs.Models;
using System.Collections.Generic;

namespace Catacombs.Repositories
{
    public interface IMoviesRepository
    {
        List<Movies> GetAllMoviesByUser(int userId);
    }
}
