import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard"
import { Button } from "reactstrap";

export const MovieList = () => {
  let { movies, getMoviesByRating, pageNumber } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    getMoviesByRating()
    // eslint-disable-next-line
  }, [])

  const nextPage = () => {
    if (pageNumber < 60) {
      pageNumber++;
    } else {
      pageNumber = 60;
    }
    // window.location.reload(false);
  }

  return (
    <>
      <div>
        <h1>Top Rated</h1>
        <div>
          {
            movies?.map(movie => {
              return <MovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </div>
      <p>Page Number: {pageNumber}</p>
      <Button color="danger" onClick={nextPage}>Next Page</Button>
    </>
  )
}