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

    const handleSearch = async () => {
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
                <Container className="pt-4">
                    <input
                        type="search"
                        id="search"
                        autoFocus
                        placeholder="Enter movie title"
                        value={searchTerm}
                        onKeyDown={(event) =>
                            event.key === "Enter" && handleSearch()
                        }
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                    <Button
                        style={{ backgroundColor: "#0D6EFD" }}
                        onClick={handleSearch}
                        disabled={
                            isLoadingMovies || !searchTerm.trim()
                        }
                    >
                        {isLoadingMovies ? "Searching..." : "Search"}
                    </Button>
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
