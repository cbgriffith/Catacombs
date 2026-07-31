import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import {
    faEye,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import { CollectionMovieStatus } from "./CollectionMovieStatus";
import { DiscoveryMovieTile } from "./DiscoveryMovieTile";
import { MovieActionButton } from "./MovieActionButton";
import {
    chooseInitialMovieRating,
    confirmRemoveMovie,
    showMovieActionError,
    showRemovedMovie,
    showViewingStatusSaved
} from "./movieAlerts";


export const MovieWatchListCard = ({ movie, reloadProp }) => {
    const { deleteMovie, setMovieStatus } = useContext(MovieContext)

    const handleDeleteMovie = async () => {
        if (!await confirmRemoveMovie(movie.title, "your watchlist")) {
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

    const handleSeenIt = async () => {
        const rating = await chooseInitialMovieRating(movie.title)

        if (rating === null) {
            return
        }

        try {
            await setMovieStatus(movie, true, rating)
            await showViewingStatusSaved(movie.title, rating)
            reloadProp(currentValue => !currentValue)
        } catch (error) {
            await showMovieActionError(
                "Unable to mark movie as watched",
                error
            )
        }
    }


    return (
        <DiscoveryMovieTile
            movie={movie}
            badge={(
                <CollectionMovieStatus status="watchlist" />
            )}
            actionsLabel={`Watchlist actions for ${movie.title}`}
            actions={(
                <>
                    <MovieActionButton
                        icon={faEye}
                        label={`Mark ${movie.title} as watched`}
                        onClick={handleSeenIt}
                    />
                    <MovieActionButton
                        icon={faTrashCan}
                        label={`Remove ${movie.title} from your watchlist`}
                        onClick={handleDeleteMovie}
                        variant="danger"
                    />
                </>
            )}
        />
    )
}
