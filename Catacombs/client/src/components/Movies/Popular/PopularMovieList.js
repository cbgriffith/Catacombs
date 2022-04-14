import React, { useContext, useEffect } from "react"
import { MovieContext } from "../../Repositories/MovieProvider"
import { MovieCard } from "../MovieCard"
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import "../Movie.css"

export const PopularMovieList = () => {
  const { movies, popularMovies } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    popularMovies()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div className="container">
        <h1 style={{textAlign:"center"}}>Most Popular Horror Movies</h1>
        <div id="movielist">
          {
            movies?.map(movie => {
              return <MovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </div>
      <Pagination inverse style={{textAlign:"center"}} aria-label="Page navigation example">
        <PaginationItem disabled>
          <PaginationLink previous href="" />
        </PaginationItem>
        <PaginationItem active>
          <PaginationLink href="">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/popular/2">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/popular/3">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/popular/4">
            4
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/popular/5">
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink next href="/movies/popular/2" />
        </PaginationItem>
      </Pagination>
    </>
  )
}