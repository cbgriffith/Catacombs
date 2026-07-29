import React, { useContext, useState } from "react";
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard";
import { Alert, Container, Button, Spinner } from "reactstrap";
import "./Movie.css"

export const SearchMovies = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [hasSearched, setHasSearched] = useState(false)
    const {
        movies,
        searchMovies,
        isLoadingMovies,
        movieLoadError
    } = useContext(MovieContext);

    const handleSearch = async (event) => {
        event?.preventDefault()
        const query = searchTerm.trim()
        if (!query) {
            return
        }

        setHasSearched(true)
        await searchMovies(query)
    }

    const noResults =
        hasSearched &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length === 0;

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
                    <h1 style={{ textAlign: "center" }}>Search Results</h1>
                    {movieLoadError && (
                        <Alert color="danger" role="alert">
                            {movieLoadError}
                        </Alert>
                    )}
                    {noResults && <h4>Nothing Found</h4>}
                    {isLoadingMovies ? (
                        <div
                            className="movie-loading"
                            role="status"
                            aria-live="polite"
                        >
                            <Spinner size="sm" aria-hidden="true" />
                            <span>Searching movies...</span>
                        </div>
                    ) : (
                        <div id="movielist">
                            {movies.map(movie => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                />
                            ))}
                        </div>
                    )}
                </Container>
            </div>
        </>)
}
