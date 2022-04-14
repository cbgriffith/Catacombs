import React, { useContext, useEffect } from "react"
import { MovieContext } from "../../Repositories/MovieProvider"
import { MovieCard } from "../MovieCard"
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

export const TopRatedMovieListP2 = () => {
  const { movies, getMoviesByRating2 } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    getMoviesByRating2()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div>
        <h1>Top Rated Horror Movies</h1>
        <h4>Page 2</h4>
        <div>
          {
            movies?.map(movie => {
              return <MovieCard key={movie.id} movie={movie} />
            })
          }
        </div>
      </div>
      <Pagination aria-label="Page navigation example">
        <PaginationItem>
          <PaginationLink previous href="/movies/rating" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/rating">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem active>
          <PaginationLink href="">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/rating/3">
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/rating/4">
            4
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/rating/5">
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink next href="/movies/rating/3" />
        </PaginationItem>
      </Pagination>
    </>
  )
}