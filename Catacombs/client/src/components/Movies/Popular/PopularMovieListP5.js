import React, { useContext, useEffect } from "react"
import { MovieContext } from "../../Repositories/MovieProvider"
import { MovieCard } from "../MovieCard"
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

export const PopularMovieListP5 = () => {
  const { movies, popularMovies5 } = useContext(MovieContext)


  //useEffect - reach out to the world for something
  useEffect(() => {
    popularMovies5()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div>
        <h1>Most Popular Horror Movies</h1>
        <h4>Page 5</h4>
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
          <PaginationLink previous href="/movies/popular/4" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/movies/popular">
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
        <PaginationItem active>
          <PaginationLink href="/movies/popular/5">
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem disabled>
          <PaginationLink next href="/movies/popular/5" />
        </PaginationItem>
      </Pagination>
    </>
  )
}