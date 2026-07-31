import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import { UserContext } from "./Repositories/UserProvider"
import Login from "./auth/Login";
import Register from "./auth/Register";
import ChangePassword from "./auth/ChangePassword";
import { TopRatedMovieList } from "./Movies/TopRated/TopRatedMovieList";
import { PopularMovieList } from "./Movies/Popular/PopularMovieList";
import { HiddenGemsList } from "./Movies/HiddenGemsList";
import { MovieWatchList } from "./Movies/MovieWatchList";
import { SearchMovies } from "./Movies/SearchMovies";
import { ComingSoonList } from "./Movies/ComingSoonList";
import { NowPlayingList } from "./Movies/NowPlayingList";
import { SeenMoviesList } from "./Movies/SeenMoviesList";
import { LikedMoviesList } from "./Movies/LikedMoviesList";
import { DislikedMoviesList } from "./Movies/DislikedMoviesList";
import { SimilarMovieList } from "./Movies/SimilarMoviesList";
import { MovieDetails } from "./Movies/MovieDetails";
import { Home } from "./Home";
import "./auth/Auth.css";


export default function ApplicationViews() {
   const { isLoadingUser, isLoggedIn } = useContext(UserContext);

   if (isLoadingUser) {
      return (
         <div className="session-loading" role="status" aria-live="polite">
            <Spinner size="sm" aria-hidden="true" />
            <span>Restoring your session...</span>
         </div>
      );
   }

   if (!isLoggedIn) {
      return (
         <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
         </Routes>
      );
   }
   else {
      return (
         <Routes>
            {/* External API Routes */}
            {/*Top Rated Horror Movies*/}
            <Route path="/movies/rating" element={<TopRatedMovieList />} />
            <Route path="/movies/rating/:page" element={<TopRatedMovieList />} />

            {/*Most Popular Horror Movies*/}
            <Route path="/movies/popular" element={<PopularMovieList />} />
            <Route path="/movies/popular/:page" element={<PopularMovieList />} />

            <Route path="/movies/hidden-gems" element={<HiddenGemsList />} />
            <Route path="/movies/hidden-gems/:page" element={<HiddenGemsList />} />

            <Route path="/movies/search" element={<SearchMovies />} />
            <Route path="/movies/comingsoon" element={<ComingSoonList />} />
            <Route path="/movies/nowplaying" element={<NowPlayingList />} />
            <Route path="/movies/similar/:id" element={<SimilarMovieList />} />
            <Route path="/movies/details/:id" element={<MovieDetails />} />


            {/* My API Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/movies/watchlist" element={<MovieWatchList />} />
            <Route path="/movies/seen" element={<SeenMoviesList />} />
            <Route path="/movies/liked" element={<LikedMoviesList />} />
            <Route path="/movies/disliked" element={<DislikedMoviesList />} />
            <Route
              path="/account/password"
              element={<ChangePassword />}
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      );
   }
}
