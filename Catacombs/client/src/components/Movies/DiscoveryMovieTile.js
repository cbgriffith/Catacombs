import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faStar
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { getMoviePosterUrl } from "./MovieCardContent";
import { MovieCollectionActions } from "./MovieCollectionActions";
import "./DiscoveryMovieTile.css";

const getReleaseYear = (releaseDate) => {
    const year = Number(releaseDate?.slice(0, 4));

    return Number.isInteger(year) && year > 1800
        ? year
        : "Date unknown";
};

const getRating = (rating) => {
    const numericRating = Number(rating);

    return Number.isFinite(numericRating) && numericRating > 0
        ? numericRating.toFixed(1)
        : null;
};

export const DiscoveryMovieTile = ({
    movie,
    badge,
    actions,
    actionsLabel
}) => {
    const movieId = movie.movieId ?? movie.id;
    const detailsPath = `/movies/details/${movieId}`;
    const rating = getRating(movie.vote_average);
    const collectionActions = actions === undefined
        ? <MovieCollectionActions movie={movie} />
        : actions;

    return (
        <article className="discovery-movie-tile">
            <div className="discovery-movie-poster-frame">
                <Link
                    className="discovery-movie-poster-link"
                    to={detailsPath}
                    aria-label={`Unearth details for ${movie.title}`}
                >
                    <img
                        src={getMoviePosterUrl(movie.poster_path)}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                    />
                    <span className="discovery-movie-details-cue">
                        Unearth details
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            aria-hidden="true"
                        />
                    </span>
                </Link>

                {badge || (rating && (
                    <span
                        className="discovery-movie-rating"
                        aria-label={`${rating} out of 10 on TMDB`}
                    >
                        <FontAwesomeIcon
                            icon={faStar}
                            aria-hidden="true"
                        />
                        {rating}
                    </span>
                ))}
            </div>

            <div className="discovery-movie-caption">
                <div className="discovery-movie-title-block">
                    <span className="discovery-movie-year">
                        {getReleaseYear(movie.release_date)}
                    </span>
                    <h2>
                        <Link to={detailsPath}>{movie.title}</Link>
                    </h2>
                </div>

                {collectionActions && (
                    <div
                        className="discovery-movie-actions"
                        role="group"
                        aria-label={
                            actionsLabel ||
                            `Collection actions for ${movie.title}`
                        }
                    >
                        {collectionActions}
                    </div>
                )}
            </div>
        </article>
    );
};
