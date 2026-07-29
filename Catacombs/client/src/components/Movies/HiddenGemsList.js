import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { PaginatedMovieList } from "./PaginatedMovieList";

export const HiddenGemsList = () => {
    const { hiddenGems } = useContext(MovieContext);

    return (
        <PaginatedMovieList
            title="Hidden Horror Gems"
            description="Highly rated horror movies that deserve a little more attention."
            basePath="/movies/hidden-gems"
            loadMovies={hiddenGems}
        />
    );
};
