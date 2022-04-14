import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard"
import { Button } from "reactstrap";

export const DislikedMoviesList = () => {
    const { movies, getAllDislikedMovies } = useContext(MovieContext)
    const user = JSON.parse(sessionStorage.getItem("userProfile"))


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllDislikedMovies()
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <div>
                <h1>Movies I Disliked</h1>
                <div>
                    {movies.filter(m => m.userId === user.id).map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </div>
        </>
    )
}