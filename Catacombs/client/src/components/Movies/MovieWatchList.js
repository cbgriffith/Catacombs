import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieWatchListCard } from "./MovieWatchListCard"
import { MovieCollectionHeading } from "./MovieCollectionHeading"
import { Container } from "reactstrap";
import "./Movie.css"

export const MovieWatchList = () => {
  let { movies, getAllMovies } = useContext(MovieContext)
  const [reload, setReload] = useState();


  //useEffect - reach out to the world for something
  useEffect(() => {
    getAllMovies()
    // eslint-disable-next-line
  }, [reload])

  return (
    <>
      <div id="main">
        <Container>
          <MovieCollectionHeading
            eyebrow="Up Next"
            title="Your Watchlist"
            description="Movies waiting in the dark for their turn."
          />
          <div className="discovery-movie-grid">
            {movies.map((movie) => (
              <MovieWatchListCard key={movie.id} movie={movie} reloadProp={setReload} />
            ))}
          </div>
        </Container>
      </div>
    </>
  )
}
