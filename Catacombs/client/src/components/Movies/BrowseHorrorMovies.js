import React, {
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, Container, Spinner } from "reactstrap";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieCard } from "./MovieCard";
import { MoviePagination } from "./MoviePagination";
import { MovieSearchModeTabs } from "./MovieSearchModeTabs";
import "./Movie.css";

const ratingOptions = ["0", "5", "6", "7", "8"];
const voteOptions = ["50", "100", "250", "500", "1000"];
const sortOptions = [
    "Popular",
    "HighestRated",
    "Newest",
    "Oldest"
];
const sortLabels = {
    Popular: "Most popular",
    HighestRated: "Highest rated",
    Newest: "Newest first",
    Oldest: "Oldest first"
};
const currentDecade =
    Math.floor(new Date().getFullYear() / 10) * 10;
const decadeOptions = Array.from(
    { length: Math.floor((currentDecade - 1890) / 10) + 1 },
    (_, index) => currentDecade - (index * 10)
);

const allowedValue = (value, options, fallback) => (
    options.includes(value) ? value : fallback
);

export const BrowseHorrorMovies = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const parsedPage = Number(searchParams.get("page") || "1");
    const requestedPage =
        Number.isInteger(parsedPage) &&
        parsedPage >= 1 &&
        parsedPage <= 500
            ? parsedPage
            : 1;
    const decadeParameter = searchParams.get("decade") || "";
    const parsedDecade = Number(decadeParameter);
    const submittedDecade =
        Number.isInteger(parsedDecade) &&
        parsedDecade >= 1890 &&
        parsedDecade <= currentDecade &&
        parsedDecade % 10 === 0
            ? String(parsedDecade)
            : "";
    const submittedRating = allowedValue(
        searchParams.get("rating") || "0",
        ratingOptions,
        "0"
    );
    const submittedVotes = allowedValue(
        searchParams.get("votes") || "100",
        voteOptions,
        "100"
    );
    const submittedSort = allowedValue(
        searchParams.get("sort") || "Popular",
        sortOptions,
        "Popular"
    );
    const browseKey = [
        submittedDecade,
        submittedRating,
        submittedVotes,
        submittedSort,
        requestedPage
    ].join(":");
    const [filters, setFilters] = useState({
        decade: submittedDecade,
        rating: submittedRating,
        votes: submittedVotes,
        sort: submittedSort
    });
    const [completedBrowseKey, setCompletedBrowseKey] = useState("");
    const resultsHeadingRef = useRef(null);
    const previousPageRef = useRef(requestedPage);
    const {
        movies,
        moviePage,
        browseHorrorMovies,
        isLoadingMovies,
        movieLoadError
    } = useContext(MovieContext);

    useEffect(() => {
        let isActive = true;

        setFilters({
            decade: submittedDecade,
            rating: submittedRating,
            votes: submittedVotes,
            sort: submittedSort
        });
        setCompletedBrowseKey("");

        browseHorrorMovies({
            decade: submittedDecade,
            minimumRating: submittedRating,
            minimumVotes: submittedVotes,
            sort: submittedSort
        }, requestedPage).finally(() => {
            if (isActive) {
                setCompletedBrowseKey(browseKey);
            }
        });

        return () => {
            isActive = false;
        };
        // browseHorrorMovies comes from MovieProvider.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        browseKey,
        requestedPage,
        submittedDecade,
        submittedRating,
        submittedSort,
        submittedVotes
    ]);

    const updateFilter = (event) => {
        const { name, value } = event.target;
        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        const parameters = {};

        if (filters.decade) {
            parameters.decade = filters.decade;
        }
        if (filters.rating !== "0") {
            parameters.rating = filters.rating;
        }
        if (filters.votes !== "100") {
            parameters.votes = filters.votes;
        }
        if (filters.sort !== "Popular") {
            parameters.sort = filters.sort;
        }

        setSearchParams(parameters);
    };

    const resetFilters = () => {
        setSearchParams({});
    };

    const isCurrentBrowseComplete =
        completedBrowseKey === browseKey;
    const hasResults =
        isCurrentBrowseComplete &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length > 0;
    const noResults =
        isCurrentBrowseComplete &&
        !isLoadingMovies &&
        !movieLoadError &&
        movies.length === 0;
    const totalPages = moviePage.totalPages;
    const currentPage = Math.min(
        moviePage.page || requestedPage,
        Math.max(totalPages, 1),
        500
    );
    const resultCount = moviePage.totalResults || movies.length;
    const pagePath = (page) => {
        const parameters = new URLSearchParams();

        if (submittedDecade) {
            parameters.set("decade", submittedDecade);
        }
        if (submittedRating !== "0") {
            parameters.set("rating", submittedRating);
        }
        if (submittedVotes !== "100") {
            parameters.set("votes", submittedVotes);
        }
        if (submittedSort !== "Popular") {
            parameters.set("sort", submittedSort);
        }
        if (page > 1) {
            parameters.set("page", String(page));
        }

        const query = parameters.toString();
        return query
            ? `/movies/browse?${query}`
            : "/movies/browse";
    };
    const pagination = hasResults ? (
        <MoviePagination
            getPagePath={pagePath}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    ) : null;

    useEffect(() => {
        if (!hasResults) {
            return;
        }

        const pageChanged = previousPageRef.current !== requestedPage;
        previousPageRef.current = requestedPage;

        if (!pageChanged) {
            return;
        }

        const reduceMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        resultsHeadingRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
        });
    }, [hasResults, requestedPage]);

    return (
        <>
            <Container className="search-page">
                <section
                    className="movie-search-panel movie-browse-panel"
                    aria-labelledby="movie-browse-heading"
                >
                    <MovieSearchModeTabs />
                    <p className="movie-search-eyebrow">
                        Shape your descent
                    </p>
                    <h1
                        id="movie-browse-heading"
                        className="movie-search-heading"
                    >
                        Browse horror
                    </h1>
                    <p className="movie-browse-intro">
                        Explore the archive by era, rating, and popularity
                        without needing a title in mind.
                    </p>
                    <form
                        className="movie-browse-form"
                        onSubmit={applyFilters}
                    >
                        <div className="movie-browse-filter-grid">
                            <label>
                                <span>Release decade</span>
                                <select
                                    name="decade"
                                    value={filters.decade}
                                    onChange={updateFilter}
                                >
                                    <option value="">All decades</option>
                                    {decadeOptions.map((decade) => (
                                        <option
                                            value={decade}
                                            key={decade}
                                        >
                                            {decade}s
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Minimum rating</span>
                                <select
                                    name="rating"
                                    value={filters.rating}
                                    onChange={updateFilter}
                                >
                                    <option value="0">Any rating</option>
                                    <option value="5">5 or higher</option>
                                    <option value="6">6 or higher</option>
                                    <option value="7">7 or higher</option>
                                    <option value="8">8 or higher</option>
                                </select>
                            </label>
                            <label>
                                <span>Minimum votes</span>
                                <select
                                    name="votes"
                                    value={filters.votes}
                                    onChange={updateFilter}
                                >
                                    <option value="50">50 votes</option>
                                    <option value="100">100 votes</option>
                                    <option value="250">250 votes</option>
                                    <option value="500">500 votes</option>
                                    <option value="1000">1,000 votes</option>
                                </select>
                            </label>
                            <label>
                                <span>Sort results</span>
                                <select
                                    name="sort"
                                    value={filters.sort}
                                    onChange={updateFilter}
                                >
                                    <option value="Popular">
                                        Most popular
                                    </option>
                                    <option value="HighestRated">
                                        Highest rated
                                    </option>
                                    <option value="Newest">
                                        Newest first
                                    </option>
                                    <option value="Oldest">
                                        Oldest first
                                    </option>
                                </select>
                            </label>
                        </div>
                        <div className="movie-browse-actions">
                            <Button
                                className="movie-search-button"
                                type="submit"
                                disabled={isLoadingMovies}
                            >
                                Apply filters
                            </Button>
                            <Button
                                className="movie-search-clear-button"
                                type="button"
                                onClick={resetFilters}
                            >
                                Reset filters
                            </Button>
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
                {isLoadingMovies && (
                    <div
                        className="movie-loading"
                        role="status"
                        aria-live="polite"
                    >
                        <Spinner size="sm" aria-hidden="true" />
                        <span>Unearthing horror movies...</span>
                    </div>
                )}
                {noResults && (
                    <section className="movie-empty-state">
                        <p className="movie-empty-state-eyebrow">
                            Nothing answers the call
                        </p>
                        <h2>No movies match these filters</h2>
                        <p>
                            Try widening the decade, rating, or vote
                            requirements.
                        </p>
                        <Button
                            className="movie-return-action"
                            type="button"
                            onClick={resetFilters}
                        >
                            Reset filters
                        </Button>
                    </section>
                )}
                {hasResults && (
                    <>
                        <header
                            className="movie-search-results-heading"
                            ref={resultsHeadingRef}
                        >
                            <p className="movie-search-state-eyebrow">
                                Horror unearthed
                            </p>
                            <h2>Browse results</h2>
                            <p className="movie-search-result-count">
                                {resultCount.toLocaleString()}{" "}
                                {resultCount === 1 ? "title" : "titles"}{" "}
                                found
                            </p>
                            <div
                                className="movie-browse-summary"
                                aria-label="Active browse filters"
                            >
                                <span>
                                    {submittedDecade
                                        ? `${submittedDecade}s`
                                        : "All decades"}
                                </span>
                                <span>
                                    {submittedRating === "0"
                                        ? "Any rating"
                                        : `${submittedRating}+ rating`}
                                </span>
                                <span>{submittedVotes}+ votes</span>
                                <span>{sortLabels[submittedSort]}</span>
                            </div>
                        </header>
                        {pagination}
                        <div className="discovery-movie-grid">
                            {movies.map((movie) => (
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
        </>
    );
};
