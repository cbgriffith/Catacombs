import Swal from "../../sweetAlert"

export const confirmAddToWatchlist = async (title) => {
    const result = await Swal.fire({
        titleText: `Add ${title} to your watchlist?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Add to watchlist",
        cancelButtonText: "Not now"
    })

    return result.isConfirmed
}

export const showAddedToWatchlist = (title) => (
    Swal.fire({
        title: "Added to your watchlist",
        text: `${title} is waiting in the dark.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const showAlreadySavedMovie = (title, watched) => (
    Swal.fire({
        title: watched
            ? "Already in Movies You've Seen"
            : "Already in your watchlist",
        text: `${title}'s saved status has been refreshed.`,
        icon: "info",
        confirmButtonText: "Done"
    })
)

export const confirmRemoveMovie = async (title, collectionName) => {
    const result = await Swal.fire({
        titleText: `Remove ${title} from ${collectionName}?`,
        text: "This removes it from all of your My Movies lists.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Remove movie",
        cancelButtonText: "Keep it"
    })

    return result.isConfirmed
}

export const showRemovedMovie = (title) => (
    Swal.fire({
        title: "Removed from your collection",
        text: `${title} has left your Catacombs collection.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const chooseInitialMovieRating = async (title) => {
    const result = await Swal.fire({
        titleText: `What did you think of ${title}?`,
        text: "This will add it to Movies You've Seen.",
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "I liked it",
        denyButtonText: "Not for me",
        cancelButtonText: "Rate later"
    })

    if (result.isConfirmed) {
        return 1
    }

    if (result.isDenied) {
        return -1
    }

    if (result.dismiss === Swal.DismissReason.cancel) {
        return 0
    }

    return null
}

export const showMarkedAsWatched = (title) => (
    Swal.fire({
        title: "Added to Movies You've Seen",
        text: `${title} is now part of your viewing log.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const chooseUpdatedMovieRating = async (
    title,
    currentRating = 0
) => {
    const isLiked = currentRating === 1
    const isUnrated = currentRating === 0
    const result = await Swal.fire({
        titleText: `Update your rating for ${title}`,
        text: isUnrated
            ? "Choose how you felt about it."
            : "Choose a new rating or clear the current one.",
        icon: "question",
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: isLiked ? "Not for me" : "I liked it",
        denyButtonText: isUnrated ? "Not for me" : "Clear rating",
        cancelButtonText: "Cancel"
    })

    if (result.isConfirmed) {
        return isLiked ? -1 : 1
    }

    if (result.isDenied) {
        return isUnrated ? -1 : 0
    }

    if (result.dismiss === Swal.DismissReason.cancel) {
        return null
    }

    return null
}

export const showLikedMovie = (title) => (
    Swal.fire({
        title: "Added to your favorites",
        text: `${title} made the cut.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const showDislikedMovie = (title) => (
    Swal.fire({
        title: "Sent to the reject pile",
        text: `${title} won't be haunting your favorites.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const showViewingStatusSaved = (title, rating) => {
    if (rating === 1) {
        return showLikedMovie(title)
    }

    if (rating === -1) {
        return showDislikedMovie(title)
    }

    return showMarkedAsWatched(title)
}

export const showUpdatedMovieRating = (title, rating) => {
    if (rating !== 0) {
        return showViewingStatusSaved(title, rating)
    }

    return Swal.fire({
        title: "Rating cleared",
        text: `${title} is still in Movies You've Seen.`,
        icon: "success",
        confirmButtonText: "Done"
    })
}

export const confirmMoveToWatchlist = async (title) => {
    const result = await Swal.fire({
        titleText: `Move ${title} back to your watchlist?`,
        text: "This clears its rating and removes it from Movies You've Seen.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Move to watchlist",
        cancelButtonText: "Keep it here"
    })

    return result.isConfirmed
}

export const showMovedToWatchlist = (title) => (
    Swal.fire({
        title: "Moved to your watchlist",
        text: `${title} is waiting in the dark again.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const showMovieActionError = (title, error) => (
    Swal.fire({
        title,
        text: error?.message || "Please try again.",
        icon: "error",
        confirmButtonText: "Close"
    })
)
