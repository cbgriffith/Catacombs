import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { MovieCollectionPage } from "./MovieCollectionPage";
import { SeenMoviesCard } from "./SeenMoviesCard";

export const SeenMoviesList = () => {
    const { getAllSeenMovies } = useContext(MovieContext);

    return (
        <MovieCollectionPage
            loadMovies={getAllSeenMovies}
            CardComponent={SeenMoviesCard}
            eyebrow="The Viewing Log"
            title="Movies You've Seen"
            description="Every horror movie you've survived so far."
            loadingText="Opening your viewing log..."
            emptyEyebrow="No survivors recorded yet"
            emptyTitle="Your viewing log is empty"
            emptyDescription={
                "Mark a movie as watched to begin recording your descent."
            }
            emptyActionText="Find a movie"
            emptyActionPath="/movies/search"
        />
    );
};
