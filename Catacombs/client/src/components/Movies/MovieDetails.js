import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faClock,
    faStar
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Spinner } from "reactstrap";
import { MovieContext } from "../Repositories/MovieProvider";
import { getMoviePosterUrl } from "./MovieCardContent";
import "./MovieDetails.css";

const backdropBaseUrl = "https://image.tmdb.org/t/p/w1280";

const getBackdropUrl = (backdropPath) => (
    backdropPath ? `${backdropBaseUrl}${backdropPath}` : null
);

const formatReleaseDate = (releaseDate) => {
    const parts = releaseDate?.split("-").map(Number);

    if (
        !parts ||
        parts.length !== 3 ||
        parts.some((part) => !Number.isInteger(part))
    ) {
        return "Release date unavailable";
    }

    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    ).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
};

const formatRuntime = (runtime) => {
    if (!Number.isInteger(runtime) || runtime <= 0) {
        return "Runtime unavailable";
    }

    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }

    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

export const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getMovieDetails } = useContext(MovieContext);
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let isCancelled = false;
        const movieId = Number(id);

        if (!Number.isInteger(movieId) || movieId <= 0) {
            setLoadError("That movie could not be found.");
            setIsLoading(false);
            return () => {
                isCancelled = true;
            };
        }

        setIsLoading(true);
        setLoadError("");

        getMovieDetails(movieId)
            .then((movieDetails) => {
                if (!isCancelled) {
                    setMovie(movieDetails);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    setLoadError(error.message);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [getMovieDetails, id]);

    const handleBack = () => {
        navigate(-1);
    };

    const backdropUrl = getBackdropUrl(movie?.backdrop_path);
    const genres = movie?.genres?.map((genre) => genre.name) || [];
    const rating = Number(movie?.vote_average);

    return (
        <main className="movie-details-page">
            <Container>
                <button
                    type="button"
                    className="movie-details-back"
                    onClick={handleBack}
                >
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        aria-hidden="true"
                    />
                    Back to movies
                </button>

                {isLoading ? (
                    <div
                        className="movie-details-loading"
                        role="status"
                        aria-live="polite"
                    >
                        <Spinner size="sm" aria-hidden="true" />
                        <span>Unearthing movie details...</span>
                    </div>
                ) : loadError || !movie ? (
                    <section className="movie-details-error" role="alert">
                        <p className="movie-details-eyebrow">
                            The trail goes cold
                        </p>
                        <h1>Movie details unavailable</h1>
                        <p>
                            {loadError ||
                                "The movie service did not return this title."}
                        </p>
                        <Link to="/movies/popular">
                            Return to popular movies
                        </Link>
                    </section>
                ) : (
                    <article className="movie-details-card">
                        {backdropUrl && (
                            <div
                                className="movie-details-backdrop"
                                style={{
                                    backgroundImage: `url(${backdropUrl})`
                                }}
                                aria-hidden="true"
                            />
                        )}
                        <div className="movie-details-content">
                            <img
                                className="movie-details-poster"
                                src={getMoviePosterUrl(movie.poster_path)}
                                alt={`${movie.title} poster`}
                            />
                            <div className="movie-details-copy">
                                <p className="movie-details-eyebrow">
                                    Movie details
                                </p>
                                <h1>{movie.title}</h1>
                                {movie.tagline && (
                                    <p className="movie-details-tagline">
                                        {movie.tagline}
                                    </p>
                                )}

                                <div
                                    className="movie-details-facts"
                                    aria-label="Movie facts"
                                >
                                    <span>
                                        {formatReleaseDate(
                                            movie.release_date
                                        )}
                                    </span>
                                    <span>
                                        <FontAwesomeIcon
                                            icon={faClock}
                                            aria-hidden="true"
                                        />
                                        {formatRuntime(movie.runtime)}
                                    </span>
                                    {movie.status && (
                                        <span>{movie.status}</span>
                                    )}
                                </div>

                                {genres.length > 0 && (
                                    <div
                                        className="movie-details-genres"
                                        aria-label="Genres"
                                    >
                                        {genres.map((genre) => (
                                            <span key={genre}>{genre}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="movie-details-rating">
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        aria-hidden="true"
                                    />
                                    <strong>
                                        {Number.isFinite(rating) && rating > 0
                                            ? rating.toFixed(1)
                                            : "Not rated"}
                                    </strong>
                                    {Number.isFinite(rating) && rating > 0 && (
                                        <span>/ 10 TMDB rating</span>
                                    )}
                                </div>

                                <section
                                    className="movie-details-overview"
                                    aria-labelledby="movie-overview-heading"
                                >
                                    <h2 id="movie-overview-heading">
                                        Overview
                                    </h2>
                                    <p>
                                        {movie.overview ||
                                            "No overview is available for this movie."}
                                    </p>
                                </section>
                            </div>
                        </div>
                    </article>
                )}
            </Container>
        </main>
    );
};
