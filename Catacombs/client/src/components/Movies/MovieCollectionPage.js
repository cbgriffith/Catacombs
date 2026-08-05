import React, {
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { Link } from "react-router-dom";
import { Button, Container, Spinner } from "reactstrap";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieCollectionHeading } from "./MovieCollectionHeading";
import "./Movie.css";

const compareTitles = (firstMovie, secondMovie) => (
    (firstMovie.title || "").localeCompare(
        secondMovie.title || "",
        undefined,
        { sensitivity: "base" }
    )
);

const getReleaseTimestamp = (movie) => {
    const timestamp = Date.parse(movie.release_date);

    if (!Number.isFinite(timestamp)) {
        return null;
    }

    const releaseDate = new Date(timestamp);
    return releaseDate.getUTCFullYear() > 1 ? timestamp : null;
};

const compareReleaseDates = (firstMovie, secondMovie, direction) => {
    const firstRelease = getReleaseTimestamp(firstMovie);
    const secondRelease = getReleaseTimestamp(secondMovie);

    if (firstRelease === null && secondRelease === null) {
        return compareTitles(firstMovie, secondMovie);
    }
    if (firstRelease === null) {
        return 1;
    }
    if (secondRelease === null) {
        return -1;
    }

    return ((firstRelease - secondRelease) * direction) ||
        compareTitles(firstMovie, secondMovie);
};

const sortMovies = (movies, sortOrder) => (
    [...movies].sort((firstMovie, secondMovie) => {
        switch (sortOrder) {
            case "newest":
                return compareReleaseDates(firstMovie, secondMovie, -1);
            case "oldest":
                return compareReleaseDates(firstMovie, secondMovie, 1);
            case "rating": {
                const ratingDifference =
                    Number(secondMovie.vote_average || 0) -
                    Number(firstMovie.vote_average || 0);

                return ratingDifference ||
                    compareTitles(firstMovie, secondMovie);
            }
            default:
                return compareTitles(firstMovie, secondMovie);
        }
    })
);

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
    const [titleFilter, setTitleFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("title");

    const visibleMovies = useMemo(() => {
        const normalizedFilter = titleFilter.trim().toLocaleLowerCase();
        const filteredMovies = normalizedFilter
            ? movies.filter((movie) =>
                (movie.title || "")
                    .toLocaleLowerCase()
                    .includes(normalizedFilter))
            : movies;

        return sortMovies(filteredMovies, sortOrder);
    }, [movies, sortOrder, titleFilter]);

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
                <>
                    <section
                        className="movie-collection-tools"
                        aria-label={`Filter and sort ${title}`}
                    >
                        <div className="movie-collection-tool-fields">
                            <label className="movie-collection-tool">
                                <span>Find in this list</span>
                                <input
                                    type="search"
                                    value={titleFilter}
                                    placeholder="Filter by movie title"
                                    onChange={(event) =>
                                        setTitleFilter(event.target.value)}
                                />
                            </label>
                            <label className="movie-collection-tool">
                                <span>Sort movies</span>
                                <select
                                    value={sortOrder}
                                    onChange={(event) =>
                                        setSortOrder(event.target.value)}
                                >
                                    <option value="title">Title A–Z</option>
                                    <option value="newest">
                                        Newest release
                                    </option>
                                    <option value="oldest">
                                        Oldest release
                                    </option>
                                    <option value="rating">
                                        Highest TMDB rating
                                    </option>
                                </select>
                            </label>
                        </div>
                        <p
                            className="movie-collection-result-count"
                            aria-live="polite"
                        >
                            Showing {visibleMovies.length} of {movies.length}{" "}
                            {movies.length === 1 ? "movie" : "movies"}
                        </p>
                    </section>

                    {visibleMovies.length === 0 ? (
                        <section className="movie-empty-state">
                            <p className="movie-empty-state-eyebrow">
                                Nothing answers the search
                            </p>
                            <h2>No matching movies</h2>
                            <p>
                                Nothing in this collection matches
                                &ldquo;{titleFilter.trim()}&rdquo;.
                            </p>
                            <Button
                                type="button"
                                className="movie-return-action"
                                onClick={() => setTitleFilter("")}
                            >
                                Clear filter
                            </Button>
                        </section>
                    ) : (
                        <div className="discovery-movie-grid">
                            {visibleMovies.map((movie) => (
                                <CardComponent
                                    key={movie.id}
                                    movie={movie}
                                    reloadProp={setReload}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};
