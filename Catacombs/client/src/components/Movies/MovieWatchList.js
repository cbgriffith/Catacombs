import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieWatchListCard } from "./MovieWatchListCard"
import { Container } from "reactstrap";
import "./Movie.css"

export const MovieWatchList = () => {
  let { movies, getAllMovies } = useContext(MovieContext)
  const user = JSON.parse(sessionStorage.getItem("userProfile"))
  const [reload, setReload] = useState();


  //useEffect - reach out to the world for something
  useEffect(() => {
    getAllMovies()
    // eslint-disable-next-line
  }, [reload])

  return (
    <>
      <Container>
        <h1 style={{ textAlign: "center" }}>Watch List</h1>
        <div id="movielist">
          {movies.filter(m => m.userId === user.id).map((movie) => (
            <MovieWatchListCard key={movie.id} movie={movie} reloadProp={setReload}/>
          ))}
        </div>
      </Container>
    </>
  )
}