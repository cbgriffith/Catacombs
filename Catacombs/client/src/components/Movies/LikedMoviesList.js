import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard"
import { Container } from "reactstrap";
import "./Movie.css"

export const LikedMoviesList = () => {
    const { movies, getAllLikedMovies } = useContext(MovieContext)
    const user = JSON.parse(sessionStorage.getItem("userProfile"))


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllLikedMovies()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <Container>
                <h1 style={{ textAlign: "center" }}>Movies I Liked</h1>
                <div id="movielist">
                    {movies.filter(m => m.userId === user.id).map((movie) => (
                        <LikedDislikedMovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </Container>
        </>
    )
}