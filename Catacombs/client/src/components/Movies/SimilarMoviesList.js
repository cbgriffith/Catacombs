import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { SimilarMovieCard } from "./SimilarMovieCard"
import { Alert, Container, Button, Spinner } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import "./Movie.css"

export const SimilarMovieList = () => {
    const {
        movies,
        similarMovies,
        isLoadingMovies,
        movieLoadError
    } = useContext(MovieContext)
    const [hasLoaded, setHasLoaded] = useState(false)
    const navigate = useNavigate();


    //useEffect - reach out to the world for something
    const { id } = useParams();
    useEffect(() => {
        let isActive = true

        setHasLoaded(false)
        similarMovies(id).finally(() => {
            if (isActive) {
                setHasLoaded(true)
            }
        })

        return () => {
            isActive = false
        }
        // eslint-disable-next-line
    }, [id])

    const noSimilarMovies =
        hasLoaded &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length === 0

    return (
        <>
            <div id="main">
                <Container>
                    <Button onClick={() => navigate(-1)}>Go back</Button>
                    <div className="movie-list-heading">
                        <h1>Similar Movies</h1>
                    </div>
                    {movieLoadError && (
                        <Alert color="danger" role="alert">
                            {movieLoadError}
                        </Alert>
                    )}
                    {isLoadingMovies ? (
                        <div
                            className="movie-loading"
                            role="status"
                            aria-live="polite"
                        >
                            <Spinner size="sm" aria-hidden="true" />
                            <span>Searching for similar movies...</span>
                        </div>
                    ) : noSimilarMovies ? (
                        <section
                            className="movie-empty-state"
                            aria-labelledby="similar-movies-empty-heading"
                        >
                            <p className="movie-empty-state-eyebrow">
                                The trail goes cold
                            </p>
                            <h2 id="similar-movies-empty-heading">
                                No similar movies found
                            </h2>
                            <p>
                                TMDB doesn&apos;t have any similar titles
                                listed for this movie yet. Try heading back
                                and choosing another.
                            </p>
                            <Button onClick={() => navigate(-1)}>
                                Go back
                            </Button>
                        </section>
                    ) : (
                        <div id="movielist">
                            {movies?.map(movie => (
                                <SimilarMovieCard
                                    key={movie.id}
                                    movie={movie}
                                />
                            ))}
                        </div>
                    )}
                    {!isLoadingMovies && movies.length > 0 && (
                        <Button onClick={() => navigate(-1)}>
                            Go back
                        </Button>
                    )}
                </Container>
            </div>
        </>
    )
}
