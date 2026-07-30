import React, { useContext } from "react";
import {
    faBookmark,
    faEye,
    faPen
} from "@fortawesome/free-solid-svg-icons";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieActionButton } from "./MovieActionButton";
import {
    chooseInitialMovieRating,
    chooseUpdatedMovieRating,
    confirmAddToWatchlist,
    showAddedToWatchlist,
    showAlreadySavedMovie,
    showMovieActionError,
    showUpdatedMovieRating,
    showViewingStatusSaved
} from "./movieAlerts";

export const MovieCollectionActions = ({ movie }) => {
    const {
        addMovie,
        getSavedMovie,
        setMovieStatus
    } = useContext(MovieContext);
    const savedMovie = getSavedMovie(movie.id);
    const isWatched = savedMovie?.watched === true;
    const isOnWatchlist = savedMovie && !savedMovie.watched;

    const handleSaveMovie = async (event) => {
        event.preventDefault();

        if (isOnWatchlist) {
            return;
        }

        if (!await confirmAddToWatchlist(movie.title)) {
            return;
        }

        try {
            const result = await addMovie({
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                popularity: movie.popularity,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                movieId: movie.id
            });

            if (result.wasAlreadySaved) {
                await showAlreadySavedMovie(
                    movie.title,
                    result.movie.watched
                );
            } else {
                await showAddedToWatchlist(movie.title);
            }
        } catch (error) {
            await showMovieActionError("Unable to add movie", error);
        }
    };

    const handleViewingStatus = async (event) => {
        event.preventDefault();
        const rating = isWatched
            ? await chooseUpdatedMovieRating(
                movie.title,
                savedMovie.rating
            )
            : await chooseInitialMovieRating(movie.title);

        if (rating === null) {
            return;
        }

        try {
            await setMovieStatus(movie, true, rating);

            if (isWatched) {
                await showUpdatedMovieRating(movie.title, rating);
            } else {
                await showViewingStatusSaved(movie.title, rating);
            }
        } catch (error) {
            await showMovieActionError(
                "Unable to save movie",
                error
            );
        }
    };

    return (
        <>
            {!isWatched && (
                <MovieActionButton
                    icon={faBookmark}
                    label={
                        isOnWatchlist
                            ? `${movie.title} is already in your watchlist`
                            : `Add ${movie.title} to your watchlist`
                    }
                    onClick={handleSaveMovie}
                    variant={isOnWatchlist ? "selected" : undefined}
                    isDisabled={isOnWatchlist}
                    isSelected={isOnWatchlist}
                />
            )}
            <MovieActionButton
                icon={isWatched ? faPen : faEye}
                label={
                    isWatched
                        ? `Change your rating for ${movie.title}`
                        : `Mark ${movie.title} as watched`
                }
                onClick={handleViewingStatus}
                variant={isWatched ? "selected" : undefined}
                isSelected={isWatched}
            />
        </>
    );
};
