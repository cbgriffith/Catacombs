import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { SeenMoviesCard } from "./SeenMoviesCard"
import { Button } from "reactstrap";

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
            <div>
                <h1>Movies I've Seen</h1>
                <div>
                    {movies.filter(m => m.userId === user.id).map((movie) => (
                        <SeenMoviesCard key={movie.id} movie={movie} reloadProp={setReload} />
                    ))}
                </div>
            </div>
        </>
    )
}