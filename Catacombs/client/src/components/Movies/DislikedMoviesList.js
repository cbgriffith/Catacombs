import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard"
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
                <h1 style={{ textAlign: "center" }}>Movies I Didn't Like</h1>
                <div id="movielist">
                    {movies.map((movie) => (
                        <LikedDislikedMovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </Container>
        </>
    )
}
