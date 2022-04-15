import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard"
import { Container } from "reactstrap";
import "./Movie.css"

export const NowPlayingList = () => {
  const { movies, nowPlaying } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    nowPlaying()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <Container>
        <h1 style={{ textAlign: "center" }}>Now Playing</h1>
        <div id="movielist">
          {
            movies?.map(movie => {
              return <MovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </Container>
    </>
  )
}