import React, { useContext, useEffect } from "react"
import { MovieContext } from "./MovieProvider"
import { MovieCard } from "./MovieCard"
import { Button } from "reactstrap";

export const MovieWatchList = () => {
  let { movies, getAllMovies, pageNumber } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    getAllMovies()
    // eslint-disable-next-line
  }, [])

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
          {
            movies.map(movie => {
              return <MovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </div>
      {/* <p>Page Number: {pageNumber}</p> */}
      {/* <Button color="danger" onClick={nextPage}>Next Page</Button> */}
    </>
  )
}