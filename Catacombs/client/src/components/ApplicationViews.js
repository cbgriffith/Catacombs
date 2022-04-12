import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { MovieList } from "./Movies/MovieList";
import { UserContext } from "./Users/UserProvider";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { MovieWatchList } from "./Movies/MovieWatchList";
import { SearchMovies } from "./Movies/SearchMovies";
import { ComingSoonList } from "./Movies/ComingSoonList";
import { NowPlayingList } from "./Movies/NowPlayingList";
import { PopularMovieList } from "./Movies/PopularMovieList";


export default function ApplicationViews() {
   const { isLoggedIn, userProfile } = useContext(UserContext);

   if (!isLoggedIn) {
      return (
         <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
         </Routes>
      );
   }
   else {
      return (
         <Routes>
            <Route path="/movies/rating" element={<MovieList />} />
            <Route path="/movies/watchlist" element={<MovieWatchList />} />
            <Route path="/movies/search" element={<SearchMovies />} />
            <Route path="/movies/comingsoon" element={<ComingSoonList />} />
            <Route path="/movies/nowplaying" element={<NowPlayingList />} />
            <Route path="/movies/popular" element={<PopularMovieList />} />
         </Routes>
      );
   }
}