import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard"
import { MovieCollectionHeading } from "./MovieCollectionHeading"
import { Container } from "reactstrap";
import "./Movie.css"

export const DislikedMoviesList = () => {
    const { movies, getAllDislikedMovies } = useContext(MovieContext)


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllDislikedMovies()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <Container>
                <MovieCollectionHeading
                    eyebrow="The Reject Pile"
                    title="Movies You Didn't Like"
                    description="The movies that failed to haunt you."
                />
                <div id="movielist">
                    {movies.map((movie) => (
                        <LikedDislikedMovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </Container>
        </>
    )
}
