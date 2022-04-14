import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieWatchListCard } from "./MovieWatchListCard"
import { Button } from "reactstrap";

export const MovieWatchList = () => {
  let { movies, getAllMovies, pageNumber } = useContext(MovieContext)
  const user = JSON.parse(sessionStorage.getItem("userProfile"))
  const [reload, setReload] = useState();


  //useEffect - reach out to the world for something
  useEffect(() => {
    getAllMovies()
    // eslint-disable-next-line
  }, [reload])

  //   const nextPage = () => {
  //     if (pageNumber < 60){
  //     pageNumber++;
  //     } else {
  //       pageNumber = 60;
  //     }
  //     window.location.reload(false);
  //   }

  return (
    <>
      <div>
        <h1>Watch List</h1>
        <div>
          {movies.filter(m => m.userId === user.id).map((movie) => (
            <MovieWatchListCard key={movie.id} movie={movie} reloadProp={setReload}/>
          ))}
        </div>
      </div>
      {/* <p>Page Number: {pageNumber}</p> */}
      {/* <Button color="danger" onClick={nextPage}>Next Page</Button> */}
    </>
  )
}