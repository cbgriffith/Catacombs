import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { PaginatedMovieList } from "./PaginatedMovieList";

export const ComingSoonList = () => {
  const { comingSoon } = useContext(MovieContext);

  return (
    <PaginatedMovieList
      title="Coming Soon"
      description={
        "Upcoming horror movies waiting just beyond the darkness."
      }
      basePath="/movies/comingsoon"
      loadMovies={comingSoon}
    />
  );
};
