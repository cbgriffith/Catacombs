import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieCard } from "./MovieCard"

export const MovieList = () => {
  const { movies, getMovies } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    getMovies()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div>
        <h1>List of Movies</h1>
        <div>
          {
            movies.map(movie => {
              return <MovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </div>
    </>
  )
}