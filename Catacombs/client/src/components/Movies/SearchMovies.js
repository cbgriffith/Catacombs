import React, {
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { useSearchParams } from "react-router-dom";
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard";
import { MoviePagination } from "./MoviePagination";
import { MovieSearchModeTabs } from "./MovieSearchModeTabs";
import { Alert, Container, Button, Spinner } from "reactstrap";
import "./Movie.css"

export const SearchMovies = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const submittedSearchTerm =
        (searchParams.get("query") || "").trim()
    const releaseYearParameter =
        (searchParams.get("year") || "").trim()
    const parsedReleaseYear = Number(releaseYearParameter)
    const submittedReleaseYear =
        Number.isInteger(parsedReleaseYear) &&
        parsedReleaseYear >= 1000 &&
        parsedReleaseYear <= 9999
            ? String(parsedReleaseYear)
            : ""
    const parsedPage = Number(searchParams.get("page") || "1")
    const requestedPage =
        Number.isInteger(parsedPage) &&
        parsedPage >= 1 &&
        parsedPage <= 500
            ? parsedPage
            : 1
    const searchKey = submittedSearchTerm
        ? `${submittedSearchTerm}:${submittedReleaseYear}:${requestedPage}`
        : ""
    const [searchTerm, setSearchTerm] = useState(submittedSearchTerm)
    const [releaseYear, setReleaseYear] = useState(
        submittedReleaseYear
    )
    const [completedSearchKey, setCompletedSearchKey] = useState("")
    const resultsHeadingRef = useRef(null)
    const previousPageRef = useRef(requestedPage)
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
        setReleaseYear(submittedReleaseYear)
        setCompletedSearchKey("")

        if (!submittedSearchTerm) {
            clearMovieResults()
            return () => {
                isActive = false
            }
        }

        searchMovies(
            submittedSearchTerm,
            requestedPage,
            submittedReleaseYear
        )
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
        submittedSearchTerm,
        submittedReleaseYear
    ])

    const handleSearch = (event) => {
        event?.preventDefault()
        const query = searchTerm.trim()
        if (!query) {
            return
        }

        const normalizedReleaseYear = releaseYear.trim()
        const parsedYear = Number(normalizedReleaseYear)

        if (
            normalizedReleaseYear &&
            (!Number.isInteger(parsedYear) ||
                parsedYear < 1000 ||
                parsedYear > 9999)
        ) {
            return
        }

        const parameters = { query }

        if (normalizedReleaseYear) {
            parameters.year = normalizedReleaseYear
        }

        setSearchParams(parameters)
    }

    const clearSearch = () => {
        setSearchTerm("")
        setReleaseYear("")
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

        if (submittedReleaseYear) {
            parameters.set("year", submittedReleaseYear)
        }

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

    useEffect(() => {
        if (!hasResults) {
            return
        }

        const pageChanged = previousPageRef.current !== requestedPage
        previousPageRef.current = requestedPage

        if (!pageChanged) {
            return
        }

        const reduceMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches

        resultsHeadingRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        })
    }, [hasResults, requestedPage])

    return (
        <>
            <div>
                <Container className="search-page">
                    <section
                        className="movie-search-panel"
                        aria-labelledby="movie-search-heading"
                    >
                        <MovieSearchModeTabs />
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
                            <div className="movie-search-primary-row">
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
                            </div>
                            <div className="movie-search-filters">
                                <label
                                    className="movie-search-filter"
                                    htmlFor="movie-search-year"
                                >
                                    <span>
                                        Release year
                                        <small>Optional</small>
                                    </span>
                                    <input
                                        className="movie-search-year-input"
                                        type="number"
                                        id="movie-search-year"
                                        min="1000"
                                        max="9999"
                                        step="1"
                                        placeholder="Example: 1979"
                                        value={releaseYear}
                                        onChange={(event) =>
                                            setReleaseYear(
                                                event.target.value
                                            )
                                        }
                                    />
                                </label>
                            </div>
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
                                &ldquo;{submittedSearchTerm}&rdquo;
                                {submittedReleaseYear &&
                                    ` from ${submittedReleaseYear}`}.
                                Check the spelling or try another title.
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
                            <header
                                className="movie-search-results-heading"
                                ref={resultsHeadingRef}
                            >
                                <p className="movie-search-state-eyebrow">
                                    Titles unearthed
                                </p>
                                <h2>
                                    Results for &ldquo;
                                    {submittedSearchTerm}
                                    &rdquo;
                                    {submittedReleaseYear &&
                                        ` from ${submittedReleaseYear}`}
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
