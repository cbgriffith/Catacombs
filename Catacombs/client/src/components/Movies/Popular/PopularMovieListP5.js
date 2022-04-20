import React, { useContext, useEffect } from "react"
import { MovieContext } from "../../Repositories/MovieProvider"
import { MovieCard } from "../MovieCard"
import { Container, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import "../Movie.css"

export const PopularMovieListP5 = () => {
    const { movies, popularMovies5 } = useContext(MovieContext)


    //useEffect - reach out to the world for something
    useEffect(() => {
        popularMovies5()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <Container>
                <h1 style={{ textAlign: "center" }}>Most Popular Horror Movies</h1>
                <Container>
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
                </Container>
                <div id="movielist">
                    {
                        movies?.map(movie => {
                            return <MovieCard key={movie.id} movie={movie} />
                        })
                    }
                </div>
            </Container>
            <Container>
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
            </Container>
        </>
    )
}