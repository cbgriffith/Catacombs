using Catacombs.Contracts.Movies;
using Catacombs.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Globalization;
using System.Security.Claims;

namespace Catacombs.Controllers
{
    [Authorize]
    [AutoValidateAntiforgeryToken]
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly IMoviesRepository _moviesRepository;

        public MoviesController(IMoviesRepository moviesRepository)
        {
            _moviesRepository = moviesRepository;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Get()
        {
            return ForCurrentUser(
                userId => Ok(_moviesRepository.GetAllMovies(userId)));
        }

        [HttpGet("collection")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetCollection()
        {
            return ForCurrentUser(
                userId => Ok(_moviesRepository.GetCollection(userId)));
        }

        [HttpGet("summary")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetSummary()
        {
            return ForCurrentUser(
                userId => Ok(_moviesRepository.GetSummary(userId)));
        }

        [HttpGet("seen")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetAllSeenMovies()
        {
            return ForCurrentUser(
                userId => Ok(_moviesRepository.GetAllSeenMovies(userId)));
        }

        [HttpGet("liked")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetAllLikedMovies()
        {
            return ForCurrentUser(
                userId => Ok(_moviesRepository.GetAllLikedMovies(userId)));
        }

        [HttpGet("disliked")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetAllDislikedMovies()
        {
            return ForCurrentUser(
                userId => Ok(_moviesRepository.GetAllDislikedMovies(userId)));
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(int id)
        {
            return ForCurrentUser(userId =>
            {
                var movie = _moviesRepository.GetMovieById(id, userId);
                return movie == null ? NotFound() : Ok(movie);
            });
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Add(CreateMovieRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                ModelState.AddModelError(
                    nameof(request.Title),
                    "Title must contain at least one character.");
                return ValidationProblem(ModelState);
            }

            return ForCurrentUser(userId =>
            {
                var existingMovie = _moviesRepository.GetMovieByTmdbId(
                    request.MovieId,
                    userId);

                if (existingMovie != null)
                {
                    return Ok(existingMovie);
                }

                var movie = request.ToMovie();
                _moviesRepository.Add(movie, userId);

                return CreatedAtAction(
                    nameof(Get),
                    new { id = movie.id },
                    movie);
            });
        }

        [HttpPut("status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult SetStatus(SetMovieStatusRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                ModelState.AddModelError(
                    nameof(request.Title),
                    "Title must contain at least one character.");
                return ValidationProblem(ModelState);
            }

            return ForCurrentUser(userId =>
            {
                var movie = request.ToMovie();
                return Ok(_moviesRepository.SetStatus(movie, userId));
            });
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Delete(int id)
        {
            return ForCurrentUser(
                userId => _moviesRepository.Delete(id, userId)
                    ? NoContent()
                    : NotFound());
        }

        [HttpPatch("seenit/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult SeenIt(int id)
        {
            return ForCurrentUser(
                userId => _moviesRepository.SeenIt(id, userId)
                    ? NoContent()
                    : NotFound());
        }

        [HttpPatch("likedit/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult LikedIt(int id)
        {
            return ForCurrentUser(
                userId => _moviesRepository.LikedIt(id, userId)
                    ? NoContent()
                    : NotFound());
        }

        [HttpPatch("dislikedit/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult DislikedIt(int id)
        {
            return ForCurrentUser(
                userId => _moviesRepository.DislikedIt(id, userId)
                    ? NoContent()
                    : NotFound());
        }

        private IActionResult ForCurrentUser(
            Func<int, IActionResult> action)
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(
                userIdValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var userId))
            {
                return Unauthorized();
            }

            return action(userId);
        }
    }
}
