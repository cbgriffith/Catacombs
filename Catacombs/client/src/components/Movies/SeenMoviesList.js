import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { SeenMoviesCard } from "./SeenMoviesCard"
import { MovieCollectionHeading } from "./MovieCollectionHeading"
import { Container } from "reactstrap";
import "./Movie.css"

export const SeenMoviesList = () => {
    const { movies, getAllSeenMovies } = useContext(MovieContext)
    const [reload, setReload] = useState();


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllSeenMovies()
        // eslint-disable-next-line
    }, [reload])

    return (
        <>
            <Container>
                <MovieCollectionHeading
                    eyebrow="The Viewing Log"
                    title="Movies You've Seen"
                    description={
                        "Every horror movie you've survived so far."
                    }
                />
                <div className="discovery-movie-grid">
                    {movies.map((movie) => (
                        <SeenMoviesCard key={movie.id} movie={movie} reloadProp={setReload} />
                    ))}
                </div>
            </Container>
        </>
    )
}
