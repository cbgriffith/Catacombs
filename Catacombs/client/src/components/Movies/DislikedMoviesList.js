import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard"
import { MovieCollectionHeading } from "./MovieCollectionHeading"
import { Container } from "reactstrap";
import "./Movie.css"

export const DislikedMoviesList = () => {
    const { movies, getAllDislikedMovies } = useContext(MovieContext)
    const [reload, setReload] = useState(false)


    //useEffect - reach out to the world for something
    useEffect(() => {
        getAllDislikedMovies()
        // eslint-disable-next-line
    }, [reload])

    return (
        <>
            <Container>
                <MovieCollectionHeading
                    eyebrow="The Reject Pile"
                    title="Movies You Didn't Like"
                    description="The movies that failed to haunt you."
                />
                <div className="discovery-movie-grid">
                    {movies.map((movie) => (
                        <LikedDislikedMovieCard
                            key={movie.id}
                            movie={movie}
                            reloadProp={setReload}
                        />
                    ))}
                </div>
            </Container>
        </>
    )
}
