import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieCollectionPage } from "./MovieCollectionPage";
import { MovieWatchListCard } from "./MovieWatchListCard";

export const MovieWatchList = () => {
    const { getAllMovies } = useContext(MovieContext);

    return (
        <MovieCollectionPage
            loadMovies={getAllMovies}
            CardComponent={MovieWatchListCard}
            eyebrow="Up Next"
            title="Your Watchlist"
            description="Movies waiting in the dark for their turn."
            loadingText="Opening your watchlist..."
            emptyEyebrow="Nothing waiting in the dark"
            emptyTitle="Your watchlist is empty"
            emptyDescription={
                "Unearth a few horror movies and save them for later."
            }
            emptyActionText="Explore popular horror"
            emptyActionPath="/movies/popular"
        />
    );
};
