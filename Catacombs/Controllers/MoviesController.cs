using Catacombs.Models;
using Catacombs.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Catacombs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {

        private readonly IMoviesRepository _moviesRepository;
        public MoviesController(IMoviesRepository moviesRepository)
        {
            _moviesRepository = moviesRepository;
        }
        // GET: api/<MoviesController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<MoviesController>/5
        //[HttpGet("{id}")]
        //public string Get(int id)
        //{
        //    return "value";
        //}

        // GET api/<PostController>/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var movie = _moviesRepository.GetMovieById(id);
            if (movie == null)
            {
                return NotFound();
            }
            return Ok(movie);
        }

        [HttpGet("user/{id}")]
        public IActionResult GetByUserId(int id)
        {
            var movies = _moviesRepository.GetAllMoviesByUser(id);
            if (movies == null)
            {
                return NotFound();
            }
            return Ok(movies);
        }

        // POST api/<MoviesController>
        //[HttpPost]
        //public void Post([FromBody] string value)
        //{
        //}

        // POST api/<MoviesController>
        [HttpPost]
        public IActionResult Movies(Movies movie)
        {
            _moviesRepository.Add(movie);
            return CreatedAtAction("Get", new { id = movie.id }, movie);
        }

        // PUT api/<MoviesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<MoviesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
