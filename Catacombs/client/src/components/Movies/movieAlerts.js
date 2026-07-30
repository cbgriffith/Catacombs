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

export const confirmMarkAsWatched = async (title) => {
    const result = await Swal.fire({
        titleText: `Mark ${title} as watched?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Mark as watched",
        cancelButtonText: "Not yet"
    })

    return result.isConfirmed
}

export const showMarkedAsWatched = (title) => (
    Swal.fire({
        title: "Added to Movies You've Seen",
        text: `${title} is now part of your viewing log.`,
        icon: "success",
        confirmButtonText: "Done"
    })
)

export const askMovieRating = (title) => (
    Swal.fire({
        titleText: `What did you think of ${title}?`,
        icon: "question",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "I liked it",
        denyButtonText: "Not for me",
        cancelButtonText: "Decide later"
    })
)

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

export const showMovieActionError = (title, error) => (
    Swal.fire({
        title,
        text: error?.message || "Please try again.",
        icon: "error",
        confirmButtonText: "Close"
    })
)
