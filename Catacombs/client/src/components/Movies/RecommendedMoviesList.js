import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { RecommendedMovieCard } from "./RecommendedMovieCard"
import { Button } from "reactstrap";
import { useNavigate, useParams} from "react-router-dom";

export const RecommendedMovieList = () => {
  let { movies, recommendedMovies } = useContext(MovieContext)
  const navigate = useNavigate();


  //useEffect - reach out to the world for something
  const {id} = useParams();
  useEffect(() => {
    recommendedMovies(id)
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <Button onClick={() => navigate(-1)}>Go back</Button>
      <div>
        <h1>Recommended Movies</h1>
        <div>
          {
            movies?.map(movie => {
              return <RecommendedMovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </div>
      <Button onClick={() => navigate(-1)}>Go back</Button>
    </>
  )
}