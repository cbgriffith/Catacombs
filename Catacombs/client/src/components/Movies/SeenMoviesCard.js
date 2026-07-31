import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import {
    faArrowRotateLeft,
    faPen,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import {
    CollectionMovieStatus,
    getMovieCollectionStatus
} from "./CollectionMovieStatus";
import { DiscoveryMovieTile } from "./DiscoveryMovieTile";
import { MovieActionButton } from "./MovieActionButton";
import {
    chooseUpdatedMovieRating,
    confirmMoveToWatchlist,
    confirmRemoveMovie,
    showMovedToWatchlist,
    showMovieActionError,
    showRemovedMovie,
    showUpdatedMovieRating
} from "./movieAlerts";

export const SeenMoviesCard = ({ movie, reloadProp }) => {
    const { deleteMovie, setMovieStatus } = useContext(MovieContext)

    const handleDeleteMovie = async () => {
        if (!await confirmRemoveMovie(movie.title, "your movie history")) {
            return
        }

        try {
            await deleteMovie(movie.id)
            reloadProp(currentValue => !currentValue)
            await showRemovedMovie(movie.title)
        } catch (error) {
            await showMovieActionError("Unable to remove movie", error)
        }
    }

    const handleRating = async () => {
        const rating = await chooseUpdatedMovieRating(
            movie.title,
            movie.rating
        )

        if (rating === null) {
            return
        }

        try {
            await setMovieStatus(movie, true, rating)
            await showUpdatedMovieRating(movie.title, rating)
            reloadProp(currentValue => !currentValue)
        } catch (error) {
            await showMovieActionError("Unable to rate movie", error)
        }
    }

    const handleMoveToWatchlist = async () => {
        if (!await confirmMoveToWatchlist(movie.title)) {
            return
        }

        try {
            await setMovieStatus(movie, false, 0)
            await showMovedToWatchlist(movie.title)
            reloadProp(currentValue => !currentValue)
        } catch (error) {
            await showMovieActionError(
                "Unable to move movie",
                error
            )
        }
    }

    return (
        <DiscoveryMovieTile
            movie={movie}
            badge={(
                <CollectionMovieStatus
                    status={getMovieCollectionStatus(movie.rating)}
                />
            )}
            actionsLabel={`Viewing log actions for ${movie.title}`}
            actions={(
                <>
                    <MovieActionButton
                        icon={faPen}
                        label={`Change the rating for ${movie.title}`}
                        onClick={handleRating}
                    />
                    <MovieActionButton
                        icon={faArrowRotateLeft}
                        label={`Move ${movie.title} back to your watchlist`}
                        onClick={handleMoveToWatchlist}
                    />
                    <MovieActionButton
                        icon={faTrashCan}
                        label={`Remove ${movie.title} from your movie history`}
                        onClick={handleDeleteMovie}
                        variant="danger"
                    />
                </>
            )}
        />
    )
}
