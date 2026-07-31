import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { LikedDislikedMovieCard } from "./LikedDislikedMovieCard";
import { MovieCollectionPage } from "./MovieCollectionPage";

export const DislikedMoviesList = () => {
    const { getAllDislikedMovies } = useContext(MovieContext);

    return (
        <MovieCollectionPage
            loadMovies={getAllDislikedMovies}
            CardComponent={LikedDislikedMovieCard}
            eyebrow="The Reject Pile"
            title="Movies You Didn't Like"
            description="The movies that failed to haunt you."
            loadingText="Checking the reject pile..."
            emptyEyebrow="Nothing cast aside"
            emptyTitle="The reject pile is empty"
            emptyDescription={
                "Movies you rate as not for you will collect here."
            }
            emptyActionText="Browse movies"
            emptyActionPath="/movies/popular"
        />
    );
};
