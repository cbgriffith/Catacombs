import React, { useContext } from "react";
import { MovieContext } from "../Repositories/MovieProvider";
import { PaginatedMovieList } from "./PaginatedMovieList";

export const NowPlayingList = () => {
  const { nowPlaying } = useContext(MovieContext);

  return (
    <PaginatedMovieList
      title="Now Playing"
      description={
        "Horror movies currently haunting theaters."
      }
      basePath="/movies/nowplaying"
      loadMovies={nowPlaying}
    />
  );
};
