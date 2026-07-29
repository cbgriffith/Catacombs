import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, Container, Spinner } from "reactstrap";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieCard } from "./MovieCard";
import { MoviePagination } from "./MoviePagination";
import "./Movie.css";

export const PaginatedMovieList = ({
    title,
    description,
    basePath,
    loadMovies
}) => {
    const {
        movies,
        moviePage,
        isLoadingMovies,
        movieLoadError
    } = useContext(MovieContext);
    const { page: pageParameter } = useParams();
    const parsedPage = Number(pageParameter || "1");
    const requestedPage =
        Number.isInteger(parsedPage) &&
        parsedPage >= 1 &&
        parsedPage <= 500
            ? parsedPage
            : 1;

    useEffect(() => {
        loadMovies(requestedPage);
        // loadMovies is supplied by MovieProvider and intentionally omitted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestedPage]);

    const totalPages = moviePage.totalPages;
    const currentPage = Math.min(
        moviePage.page || requestedPage,
        Math.max(totalPages, 1),
        500
    );
    const pagination = (
        <MoviePagination
            basePath={basePath}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );

    return (
        <Container>
            <header className="movie-list-heading">
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </header>
            {pagination}

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
                    <span>Loading movies...</span>
                </div>
            ) : (
                <div id="movielist">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}

            {pagination}
        </Container>
    );
};
