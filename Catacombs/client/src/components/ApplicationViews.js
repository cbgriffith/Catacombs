import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { UserContext } from "./Repositories/UserProvider"
import Login from "./auth/Login";
import Register from "./auth/Register";
import { TopRatedMovieList } from "./Movies/TopRated/TopRatedMovieList";
import { TopRatedMovieListP2 } from "./Movies/TopRated/TopRatedMovieListP2";
import { TopRatedMovieListP3 } from "./Movies/TopRated/TopRatedMovieListP3";
import { TopRatedMovieListP4 } from "./Movies/TopRated/TopRatedMovieListP4";
import { TopRatedMovieListP5 } from "./Movies/TopRated/TopRatedMovieListP5";
import { PopularMovieList } from "./Movies/Popular/PopularMovieList";
import { PopularMovieListP2 } from "./Movies/Popular/PopularMovieListP2";
import { PopularMovieListP3 } from "./Movies/Popular/PopularMovieListP3";
import { PopularMovieListP4 } from "./Movies/Popular/PopularMovieListP4";
import { PopularMovieListP5 } from "./Movies/Popular/PopularMovieListP5";
import { MovieWatchList } from "./Movies/MovieWatchList";
import { SearchMovies } from "./Movies/SearchMovies";
import { ComingSoonList } from "./Movies/ComingSoonList";
import { NowPlayingList } from "./Movies/NowPlayingList";
import { SeenMoviesList } from "./Movies/SeenMoviesList";
import { LikedMoviesList } from "./Movies/LikedMoviesList";
import { DislikedMoviesList } from "./Movies/DislikedMoviesList";
import { RecommendedMovieList } from "./Movies/RecommendedMoviesList";
import { Home } from "./Home";


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
            {/* External API Routes */}
            {/*Top Rated Horror Movies*/}
            <Route path="/movies/rating" element={<TopRatedMovieList />} />
            <Route path="/movies/rating/2" element={<TopRatedMovieListP2 />} />
            <Route path="/movies/rating/3" element={<TopRatedMovieListP3 />} />
            <Route path="/movies/rating/4" element={<TopRatedMovieListP4 />} />
            <Route path="/movies/rating/5" element={<TopRatedMovieListP5 />} />

            {/*Most Popular Horror Movies*/}
            <Route path="/movies/popular" element={<PopularMovieList />} />
            <Route path="/movies/popular/2" element={<PopularMovieListP2 />} />
            <Route path="/movies/popular/3" element={<PopularMovieListP3 />} />
            <Route path="/movies/popular/4" element={<PopularMovieListP4 />} />
            <Route path="/movies/popular/5" element={<PopularMovieListP5 />} />

            <Route path="/movies/search" element={<SearchMovies />} />
            <Route path="/movies/comingsoon" element={<ComingSoonList />} />
            <Route path="/movies/nowplaying" element={<NowPlayingList />} />
            <Route path="/movies/recommended/:id" element={<RecommendedMovieList />} />


            {/* My API Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/movies/watchlist" element={<MovieWatchList />} />
            <Route path="/movies/seen" element={<SeenMoviesList />} />
            <Route path="/movies/liked" element={<LikedMoviesList />} />
            <Route path="/movies/disliked" element={<DislikedMoviesList />} />
         </Routes>
      );
   }
}