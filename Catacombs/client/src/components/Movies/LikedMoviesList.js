import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard"
import { MovieCollectionHeading } from "./MovieCollectionHeading"
import { Container } from "reactstrap";
import "./Movie.css"

export const LikedMoviesList = () => {
    const { movies, getAllLikedMovies } = useContext(MovieContext)


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllLikedMovies()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <Container>
                <MovieCollectionHeading
                    eyebrow="The Favorites"
                    title="Movies You Loved"
                    description={
                        "The scares and stories worth revisiting."
                    }
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
