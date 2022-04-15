import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { SeenMoviesCard } from "./SeenMoviesCard"
import { Container } from "reactstrap";
import "./Movie.css"

export const SeenMoviesList = () => {
    const { movies, getAllSeenMovies } = useContext(MovieContext)
    const [reload, setReload] = useState();
    const user = JSON.parse(sessionStorage.getItem("userProfile"))


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllSeenMovies()
        // eslint-disable-next-line
    }, [reload])

    return (
        <>
            <Container>
                <h1 style={{ textAlign: "center" }}>Movies I've Seen</h1>
                <div id="movielist">
                    {movies.filter(m => m.userId === user.id).map((movie) => (
                        <SeenMoviesCard key={movie.id} movie={movie} reloadProp={setReload} />
                    ))}
                </div>
            </Container>
        </>
    )
}