import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faEye,
    faFire,
    faGem,
    faHeart,
    faMagnifyingGlass,
    faShuffle,
    faStar,
    faThumbsDown
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { getMoviePosterUrl } from "./Movies/MovieCardContent";
import { MovieContext } from "./Repositories/MovieProvider";
import { UserContext } from "./Repositories/UserProvider";
import "./Home.css";

const getReleaseYear = (releaseDate) => {
    const year = Number(releaseDate?.split("-")[0]);
    return Number.isInteger(year) && year > 1800
        ? year
        : "Release date unavailable";
};

export const Home = () => {
    const { userProfile } = useContext(UserContext);
    const { getMovieSummary, getWatchlist } = useContext(MovieContext);
    const [movieSummary, setMovieSummary] = useState(null);
    const [summaryError, setSummaryError] = useState("");
    const [watchlist, setWatchlist] = useState(null);
    const [watchlistError, setWatchlistError] = useState("");
    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        let isCancelled = false;

        getMovieSummary()
            .then((summary) => {
                if (!isCancelled) {
                    setMovieSummary(summary);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    setSummaryError(error.message);
                }
            });

        getWatchlist()
            .then((movies) => {
                if (!isCancelled) {
                    setWatchlist(movies);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    setWatchlistError(error.message);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [getMovieSummary, getWatchlist]);

    const chooseWatchlistMovie = () => {
        if (!watchlist?.length) {
            return;
        }

        const choices = watchlist.length > 1 && selectedMovie
            ? watchlist.filter((movie) => movie.id !== selectedMovie.id)
            : watchlist;
        const selectedIndex = Math.floor(Math.random() * choices.length);
        setSelectedMovie(choices[selectedIndex]);
    };

    const collectionStats = [
        {
            label: "In your watchlist",
            value: movieSummary?.watchlistCount,
            icon: faBookmark,
            path: "/movies/watchlist"
        },
        {
            label: "Movies watched",
            value: movieSummary?.watchedCount,
            icon: faEye,
            path: "/movies/seen"
        },
        {
            label: "Movies you liked",
            value: movieSummary?.likedCount,
            icon: faHeart,
            path: "/movies/liked"
        },
        {
            label: "In the reject pile",
            value: movieSummary?.dislikedCount,
            icon: faThumbsDown,
            path: "/movies/disliked"
        }
    ];

    const destinations = [
        {
            title: "Most Popular",
            description: "See which horror movies everyone is watching.",
            icon: faFire,
            path: "/movies/popular"
        },
        {
            title: "Top Rated",
            description: "Start with horror movies that earned their reputation.",
            icon: faStar,
            path: "/movies/rating"
        },
        {
            title: "Search",
            description: "Find a specific movie, old favorite, or hidden gem.",
            icon: faMagnifyingGlass,
            path: "/movies/search"
        },
        {
            title: "Hidden Gems",
            description: "Dig up overlooked horror movies worth discovering.",
            icon: faGem,
            path: "/movies/hidden-gems"
        }
    ];

    return (
        <main className="home-page">
            <Container>
                <section
                    className="home-hero"
                    aria-labelledby="home-heading"
                >
                    <div className="home-hero-copy">
                        <p className="home-eyebrow">
                            Welcome back
                            {userProfile?.username
                                ? `, ${userProfile.username}`
                                : ""}
                        </p>
                        <h1 id="home-heading">
                            Descend into your next favorite horror movie.
                        </h1>
                        <p className="home-intro">
                            Explore horror films, watch trailers without
                            leaving the Catacombs, and keep track of what
                            you want to see, what you have survived, and
                            what deserves another watch.
                        </p>
                        <div className="home-hero-actions">
                            <Link
                                className="home-primary-action"
                                to="/movies/popular"
                            >
                                Explore popular horror
                            </Link>
                            <Link
                                className="home-secondary-action"
                                to="/movies/search"
                            >
                                Search movies
                            </Link>
                        </div>
                    </div>

                    <div className="home-hero-mark" aria-hidden="true">
                        <div className="home-arch">
                            <span>The</span>
                            <strong>Catacombs</strong>
                            <small>Horror movie archive</small>
                        </div>
                    </div>
                </section>

                <section
                    className="home-summary"
                    aria-labelledby="home-summary-heading"
                    aria-busy={!movieSummary && !summaryError}
                >
                    <div className="home-section-heading">
                        <p className="home-eyebrow">Your collection</p>
                        <h2 id="home-summary-heading">At a glance</h2>
                    </div>

                    {summaryError ? (
                        <p className="home-summary-error" role="alert">
                            Your collection totals could not be loaded.
                            Please refresh the page and try again.
                        </p>
                    ) : (
                        <div className="home-summary-grid">
                            {collectionStats.map((stat) => (
                                <Link
                                    className="home-summary-card"
                                    to={stat.path}
                                    key={stat.path}
                                >
                                    <span className="home-summary-icon">
                                        <FontAwesomeIcon
                                            icon={stat.icon}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="home-summary-value">
                                        {stat.value ?? "—"}
                                    </span>
                                    <span className="home-summary-label">
                                        {stat.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section
                    className="home-watchlist"
                    aria-labelledby="home-watchlist-heading"
                    aria-busy={!watchlist && !watchlistError}
                >
                    <div className="home-watchlist-heading">
                        <div className="home-section-heading">
                            <p className="home-eyebrow">Waiting in the dark</p>
                            <h2 id="home-watchlist-heading">
                                Your watchlist
                            </h2>
                        </div>
                        {watchlist?.length > 0 && (
                            <Link
                                className="home-watchlist-link"
                                to="/movies/watchlist"
                            >
                                View full watchlist
                            </Link>
                        )}
                    </div>

                    {watchlistError ? (
                        <p className="home-summary-error" role="alert">
                            Your watchlist preview could not be loaded.
                            Please refresh the page and try again.
                        </p>
                    ) : watchlist === null ? (
                        <p className="home-watchlist-loading" role="status">
                            Opening your watchlist...
                        </p>
                    ) : watchlist.length === 0 ? (
                        <div className="home-watchlist-empty">
                            <p>
                                Your watchlist is empty. Add a few movies
                                before asking the Catacombs to choose.
                            </p>
                            <Link to="/movies/popular">
                                Find something to watch
                            </Link>
                        </div>
                    ) : (
                        <div className="home-watchlist-layout">
                            <div
                                className="home-watchlist-preview"
                                aria-label="Watchlist preview"
                            >
                                {watchlist.slice(0, 3).map((movie) => (
                                    <article
                                        className="home-watchlist-movie"
                                        key={movie.id}
                                    >
                                        <img
                                            src={getMoviePosterUrl(
                                                movie.poster_path
                                            )}
                                            alt={`${movie.title} poster`}
                                            loading="lazy"
                                        />
                                        <div>
                                            <h3>{movie.title}</h3>
                                            <p>
                                                {getReleaseYear(
                                                    movie.release_date
                                                )}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <aside className="home-picker">
                                <p className="home-eyebrow">
                                    Tonight's descent
                                </p>
                                {selectedMovie ? (
                                    <div
                                        className="home-picker-result"
                                        aria-live="polite"
                                    >
                                        <img
                                            src={getMoviePosterUrl(
                                                selectedMovie.poster_path
                                            )}
                                            alt={
                                                `${selectedMovie.title} poster`
                                            }
                                        />
                                        <div>
                                            <span>The Catacombs chose</span>
                                            <h3>{selectedMovie.title}</h3>
                                            <p>
                                                {selectedMovie.overview ||
                                                    "No overview is available."}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3>Can't decide what to watch?</h3>
                                        <p className="home-picker-intro">
                                            Let the Catacombs choose one
                                            movie from your watchlist.
                                        </p>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="home-picker-button"
                                    onClick={chooseWatchlistMovie}
                                >
                                    <FontAwesomeIcon
                                        icon={faShuffle}
                                        aria-hidden="true"
                                    />
                                    {selectedMovie
                                        ? "Choose another"
                                        : "Choose something for me"}
                                </button>
                            </aside>
                        </div>
                    )}
                </section>

                <section
                    className="home-destinations"
                    aria-labelledby="home-destinations-heading"
                >
                    <div className="home-section-heading">
                        <p className="home-eyebrow">Choose your path</p>
                        <h2 id="home-destinations-heading">
                            Where do you want to start?
                        </h2>
                    </div>

                    <div className="home-destination-grid">
                        {destinations.map(destination => (
                            <Link
                                className="home-destination-card"
                                to={destination.path}
                                key={destination.path}
                            >
                                <span className="home-destination-icon">
                                    <FontAwesomeIcon
                                        icon={destination.icon}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="home-destination-copy">
                                    <strong>{destination.title}</strong>
                                    <span>{destination.description}</span>
                                </span>
                                <span
                                    className="home-destination-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </Container>
        </main>
    );
};
