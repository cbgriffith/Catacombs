import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faEye,
    faHeart,
    faThumbsDown
} from "@fortawesome/free-solid-svg-icons";
import "./CollectionMovieStatus.css";

const statuses = {
    watchlist: {
        icon: faBookmark,
        label: "Watchlist"
    },
    loved: {
        icon: faHeart,
        label: "Loved"
    },
    disliked: {
        icon: faThumbsDown,
        label: "Not for me"
    },
    seen: {
        icon: faEye,
        label: "Seen"
    }
};

export const getMovieCollectionStatus = (rating) => {
    const numericRating = Number(rating);

    if (numericRating === 1) {
        return "loved";
    }

    if (numericRating === -1) {
        return "disliked";
    }

    return "seen";
};

export const CollectionMovieStatus = ({ status }) => {
    const selectedStatus = statuses[status] || statuses.seen;

    return (
        <span
            className={
                "discovery-movie-rating collection-movie-status " +
                `collection-movie-status--${status}`
            }
        >
            <FontAwesomeIcon
                icon={selectedStatus.icon}
                aria-hidden="true"
            />
            {selectedStatus.label}
        </span>
    );
};
