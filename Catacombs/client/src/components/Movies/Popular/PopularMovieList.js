import React, { useContext } from "react";
import { MovieContext } from "../../Repositories/MovieProvider";
import { PaginatedMovieList } from "../PaginatedMovieList";

export const PopularMovieList = () => {
    const { popularMovies } = useContext(MovieContext);

    return (
        <PaginatedMovieList
            title="Most Popular Horror Movies"
            basePath="/movies/popular"
            loadMovies={popularMovies}
        />
    );
};
