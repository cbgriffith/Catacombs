import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard";
import { MoviePagination } from "./MoviePagination";
import { Alert, Container, Button, Spinner } from "reactstrap";
import "./Movie.css"

export const SearchMovies = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const submittedSearchTerm =
        (searchParams.get("query") || "").trim()
    const parsedPage = Number(searchParams.get("page") || "1")
    const requestedPage =
        Number.isInteger(parsedPage) &&
        parsedPage >= 1 &&
        parsedPage <= 500
            ? parsedPage
            : 1
    const searchKey = submittedSearchTerm
        ? `${submittedSearchTerm}:${requestedPage}`
        : ""
    const [searchTerm, setSearchTerm] = useState(submittedSearchTerm)
    const [completedSearchKey, setCompletedSearchKey] = useState("")
    const {
        movies,
        moviePage,
        searchMovies,
        clearMovieResults,
        isLoadingMovies,
        movieLoadError
    } = useContext(MovieContext);

    useEffect(() => {
        let isActive = true

        setSearchTerm(submittedSearchTerm)
        setCompletedSearchKey("")

        if (!submittedSearchTerm) {
            clearMovieResults()
            return () => {
                isActive = false
            }
        }

        searchMovies(submittedSearchTerm, requestedPage)
            .finally(() => {
                if (isActive) {
                    setCompletedSearchKey(searchKey)
                }
            })

        return () => {
            isActive = false
        }
        // searchMovies is supplied by MovieProvider and intentionally omitted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        clearMovieResults,
        requestedPage,
        searchKey,
        submittedSearchTerm
    ])

    const handleSearch = (event) => {
        event?.preventDefault()
        const query = searchTerm.trim()
        if (!query) {
            return
        }

        setSearchParams({ query })
    }

    const clearSearch = () => {
        setSearchTerm("")
        setSearchParams({})
    }

    const hasSearched = Boolean(submittedSearchTerm)
    const isCurrentSearchComplete =
        completedSearchKey === searchKey
    const noResults =
        hasSearched &&
        isCurrentSearchComplete &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length === 0;
    const hasResults =
        hasSearched &&
        isCurrentSearchComplete &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length > 0;
    const totalPages = moviePage.totalPages
    const currentPage = Math.min(
        moviePage.page || requestedPage,
        Math.max(totalPages, 1),
        500
    )
    const resultCount = moviePage.totalResults || movies.length
    const pagePath = (page) => {
        const parameters = new URLSearchParams({
            query: submittedSearchTerm
        })

        if (page > 1) {
            parameters.set("page", String(page))
        }

        return `/movies/search?${parameters.toString()}`
    }
    const pagination = hasResults ? (
        <MoviePagination
            getPagePath={pagePath}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    ) : null

    return (
        <>
            <div>
                <Container className="search-page">
                    <section
                        className="movie-search-panel"
                        aria-labelledby="movie-search-heading"
                    >
                        <p className="movie-search-eyebrow">
                            Find your next scare
                        </p>
                        <h1
                            id="movie-search-heading"
                            className="movie-search-heading"
                        >
                            Search horror movies
                        </h1>
                        <form
                            className="movie-search-form"
                            onSubmit={handleSearch}
                        >
                            <label
                                className="visually-hidden"
                                htmlFor="movie-search"
                            >
                                Movie title
                            </label>
                            <input
                                className="movie-search-input"
                                type="search"
                                id="movie-search"
                                autoFocus
                                placeholder="Enter a movie title"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                            <Button
                                className="movie-search-button"
                                type="submit"
                                disabled={
                                    isLoadingMovies ||
                                    !searchTerm.trim()
                                }
                            >
                                {isLoadingMovies
                                    ? "Searching..."
                                    : "Search"}
                            </Button>
                        </form>
                    </section>
                </Container>
                <Container>
                    {movieLoadError && (
                        <Alert color="danger" role="alert">
                            {movieLoadError}
                        </Alert>
                    )}
                    {!hasSearched && (
                        <section
                            className="movie-search-idle-state"
                            aria-labelledby="movie-search-idle-heading"
                        >
                            <p className="movie-search-state-eyebrow">
                                The archive awaits
                            </p>
                            <h2 id="movie-search-idle-heading">
                                Unearth a movie
                            </h2>
                            <p>
                                Enter a title above to search the horror
                                archives.
                            </p>
                        </section>
                    )}
                    {noResults && (
                        <section
                            className="movie-empty-state"
                            aria-labelledby="movie-search-empty-heading"
                        >
                            <p className="movie-empty-state-eyebrow">
                                The trail goes cold
                            </p>
                            <h2 id="movie-search-empty-heading">
                                No movies found
                            </h2>
                            <p>
                                We couldn&apos;t find a movie matching
                                &ldquo;{submittedSearchTerm}&rdquo;. Check the
                                spelling or try another title.
                            </p>
                            <Button
                                type="button"
                                className="movie-search-clear-button"
                                onClick={clearSearch}
                            >
                                Clear search
                            </Button>
                        </section>
                    )}
                    {isLoadingMovies && (
                        <div
                            className="movie-loading"
                            role="status"
                            aria-live="polite"
                        >
                            <Spinner size="sm" aria-hidden="true" />
                            <span>Searching movies...</span>
                        </div>
                    )}
                    {hasResults && (
                        <>
                            <header className="movie-search-results-heading">
                                <p className="movie-search-state-eyebrow">
                                    Titles unearthed
                                </p>
                                <h2>
                                    Results for &ldquo;
                                    {submittedSearchTerm}
                                    &rdquo;
                                </h2>
                                <p className="movie-search-result-count">
                                    {resultCount.toLocaleString()}{" "}
                                    {resultCount === 1 ? "title" : "titles"}{" "}
                                    found
                                </p>
                                <Button
                                    type="button"
                                    className="movie-search-clear-button"
                                    onClick={clearSearch}
                                >
                                    Clear search
                                </Button>
                            </header>
                            {pagination}
                            <div className="discovery-movie-grid">
                                {movies.map(movie => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                    />
                                ))}
                            </div>
                            {pagination}
                        </>
                    )}
                </Container>
            </div>
        </>)
}
