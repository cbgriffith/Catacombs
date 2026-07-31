import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard";
import { MovieCollectionPage } from "./MovieCollectionPage";

export const LikedMoviesList = () => {
    const { getAllLikedMovies } = useContext(MovieContext);

    return (
        <MovieCollectionPage
            loadMovies={getAllLikedMovies}
            CardComponent={LikedDislikedMovieCard}
            eyebrow="The Favorites"
            title="Movies You Loved"
            description="The scares and stories worth revisiting."
            loadingText="Unearthing your favorites..."
            emptyEyebrow="No favorites unearthed yet"
            emptyTitle="Your favorites are waiting to be found"
            emptyDescription={
                "Rate a movie you enjoyed and it will appear here."
            }
            emptyActionText="Explore top-rated horror"
            emptyActionPath="/movies/rating"
        />
    );
};
