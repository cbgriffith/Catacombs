import React, { useContext, useEffect, useState } from "react";
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard";
import { Alert, Container, Button, Spinner } from "reactstrap";
import "./Movie.css"

export const SearchMovies = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState("")
    const [hasSearched, setHasSearched] = useState(false)
    const {
        movies,
        searchMovies,
        clearMovieResults,
        isLoadingMovies,
        movieLoadError
    } = useContext(MovieContext);

    useEffect(() => {
        clearMovieResults()
    }, [clearMovieResults])

    const handleSearch = async (event) => {
        event?.preventDefault()
        const query = searchTerm.trim()
        if (!query) {
            return
        }

        setHasSearched(true)
        setSubmittedSearchTerm(query)
        await searchMovies(query)
    }

    const noResults =
        hasSearched &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length === 0;
    const hasResults =
        hasSearched &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length > 0;

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
                                <h2>Search Results</h2>
                            </header>
                            <div className="discovery-movie-grid">
                                {movies.map(movie => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </Container>
            </div>
        </>)
}
