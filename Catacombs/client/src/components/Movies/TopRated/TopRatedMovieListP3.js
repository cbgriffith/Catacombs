import React, { useContext, useEffect } from "react"
import { MovieContext } from "../../Repositories/MovieProvider"
import { MovieCard } from "../MovieCard"
import { Container, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import "../Movie.css"

export const TopRatedMovieListP3 = () => {
    const { movies, getMoviesByRating3 } = useContext(MovieContext)


    //useEffect - reach out to the world for something
    useEffect(() => {
        getMoviesByRating3()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <Container>
                <h1 style={{ textAlign: "center" }}>Top Rated Horror Movies</h1>
                <Container>
                    <Pagination aria-label="Page navigation example">
                        <PaginationItem>
                            <PaginationLink previous href="/movies/rating/2" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="/movies/rating">
                                1
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="/movies/rating/2">
                                2
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem active>
                            <PaginationLink href="">
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
                            <PaginationLink next href="/movies/rating/4" />
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
                        <PaginationLink previous href="/movies/rating/2" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="/movies/rating">
                            1
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="/movies/rating/2">
                            2
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem active>
                        <PaginationLink href="">
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
                        <PaginationLink next href="/movies/rating/4" />
                    </PaginationItem>
                </Pagination>
            </Container>
        </>
    )
}