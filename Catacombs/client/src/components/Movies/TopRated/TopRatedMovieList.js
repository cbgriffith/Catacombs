import React, { useContext } from "react";
import { MovieContext } from "../../Repositories/MovieProvider";
import { PaginatedMovieList } from "../PaginatedMovieList";

export const TopRatedMovieList = () => {
    const { getMoviesByRating } = useContext(MovieContext);

    return (
        <PaginatedMovieList
            title="Top Rated Horror Movies"
            basePath="/movies/rating"
            loadMovies={getMoviesByRating}
        />
    );
};
