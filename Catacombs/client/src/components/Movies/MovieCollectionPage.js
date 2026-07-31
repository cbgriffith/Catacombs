import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Spinner } from "reactstrap";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieCollectionHeading } from "./MovieCollectionHeading";
import "./Movie.css";

export const MovieCollectionPage = ({
    loadMovies,
    CardComponent,
    eyebrow,
    title,
    description,
    loadingText,
    emptyEyebrow,
    emptyTitle,
    emptyDescription,
    emptyActionText,
    emptyActionPath
}) => {
    const { movies } = useContext(MovieContext);
    const [reload, setReload] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let isActive = true;

        setIsLoading(true);
        setLoadError(false);

        Promise.resolve()
            .then(loadMovies)
            .catch(() => {
                if (isActive) {
                    setLoadError(true);
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
        // loadMovies comes from MovieProvider and is intentionally omitted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reload]);

    return (
        <Container>
            <MovieCollectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
            />

            {isLoading ? (
                <div
                    className="movie-loading"
                    role="status"
                    aria-live="polite"
                >
                    <Spinner size="sm" aria-hidden="true" />
                    <span>{loadingText}</span>
                </div>
            ) : loadError ? (
                <section className="movie-empty-state" role="alert">
                    <p className="movie-empty-state-eyebrow">
                        The doors are sealed
                    </p>
                    <h2>This part of the archive would not open</h2>
                    <p>
                        Something went wrong while loading your movies.
                        Try opening the page again.
                    </p>
                    <Button
                        type="button"
                        className="movie-return-action"
                        onClick={() => setReload((value) => !value)}
                    >
                        Try again
                    </Button>
                </section>
            ) : movies.length === 0 ? (
                <section className="movie-empty-state">
                    <p className="movie-empty-state-eyebrow">
                        {emptyEyebrow}
                    </p>
                    <h2>{emptyTitle}</h2>
                    <p>{emptyDescription}</p>
                    <Link
                        className="btn movie-return-action"
                        to={emptyActionPath}
                    >
                        {emptyActionText}
                    </Link>
                </section>
            ) : (
                <div className="discovery-movie-grid">
                    {movies.map((movie) => (
                        <CardComponent
                            key={movie.id}
                            movie={movie}
                            reloadProp={setReload}
                        />
                    ))}
                </div>
            )}
        </Container>
    );
};
