import React from "react";
import {
    CardBody,
    CardSubtitle,
    CardText,
    CardTitle
} from "reactstrap";
import { Link } from "react-router-dom";

const posterBaseUrl = "https://image.tmdb.org/t/p/w342";
const missingPoster = require("./images/broken-1.png");

export const getMoviePosterUrl = (posterPath) => {
    if (
        !posterPath ||
        posterPath === "string"
    ) {
        return missingPoster;
    }

    return `${posterBaseUrl}${posterPath}`;
};

const formatReleaseDate = (releaseDate) => {
    const parts = releaseDate?.split("-").map(Number);

    if (
        !parts ||
        parts.length !== 3 ||
        parts.some(part => !Number.isInteger(part))
    ) {
        return "Not available";
    }

    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    ).toLocaleDateString("en-US");
};

const formatRating = (rating) => {
    const numericRating = Number(rating);

    if (
        !Number.isFinite(numericRating) ||
        numericRating <= 0
    ) {
        return "Not rated yet";
    }

    return `${numericRating.toFixed(1)} / 10`;
};

export const MovieCardContent = ({ movie }) => {
    const tmdbMovieId = movie.movieId ?? movie.id;
    const detailsPath = `/movies/details/${tmdbMovieId}`;

    return (
        <CardBody className="movie-card-body">
        <Link
            className="movie-card-poster-link"
            to={detailsPath}
            aria-label={`View details for ${movie.title}`}
        >
            <img
                className="movie-card-poster"
                src={getMoviePosterUrl(movie.poster_path)}
                alt={`${movie.title} poster`}
                loading="lazy"
            />
        </Link>
        <div className="movie-card-details">
            <CardTitle className="movie-card-title" tag="h2">
                <Link to={detailsPath}>{movie.title}</Link>
            </CardTitle>
            <div className="movie-card-meta">
                <CardSubtitle
                    className="movie-card-meta-item"
                    tag="p"
                >
                    <span className="movie-card-meta-label">
                        Release date
                    </span>
                    <span>
                        {formatReleaseDate(movie.release_date)}
                    </span>
                </CardSubtitle>
                <CardSubtitle
                    className="movie-card-meta-item"
                    tag="p"
                >
                    <span className="movie-card-meta-label">
                        TMDB rating
                    </span>
                    <span>{formatRating(movie.vote_average)}</span>
                </CardSubtitle>
            </div>
            <CardText className="movie-card-overview">
                {movie.overview || "No overview is available for this movie."}
            </CardText>
        </div>
    </CardBody>
    );
};
