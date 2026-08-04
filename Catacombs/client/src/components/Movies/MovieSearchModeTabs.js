import React from "react";
import { NavLink } from "react-router-dom";

export const MovieSearchModeTabs = () => (
    <nav
        className="movie-search-mode-tabs"
        aria-label="Choose how to find movies"
    >
        <NavLink to="/movies/search">
            Search by title
        </NavLink>
        <NavLink to="/movies/browse">
            Browse horror
        </NavLink>
    </nav>
);
