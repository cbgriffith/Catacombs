import React, { useState, createContext } from "react"

export const MovieContext = createContext()

export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])
    let pageNumber = 1;
    let movieId;
    const apiUrl = "https://localhost:44377";

    //each fetch call to themoviedb api limits every page to just 20 results, I'm going to need way more
    //I'm going to do at least 5 pages for each list from the tmdb api (by popularity and rating at least)


    //fetch horror movies by rating, page 1
    const getMoviesByRating = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&with_genres=27&with_original_language=en&page=${pageNumber}`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //add a movie to watch list
    const addMovie = (movie) => {
        return fetch(`${apiUrl}/api/Movies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(movie),
        });
    };

    //list all movies in watch list
    const getAllMovies = () => {
        return fetch(`${apiUrl}/api/Movies`)
            .then((res) => res.json())
            .then(setMovies);
    };

    //search movies based on title only
    const searchMovies = (query) => {
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&query=${query}&page=${pageNumber}&include_adult=false`)
            .then((res) => res.json())
            .then(setMovies);
    };

    //fetch horror movies that are coming soon
    const comingSoon = () => {
        return fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&page=${pageNumber}`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //horror movies currently playing
    const nowPlaying = () => {
        return fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&page=${pageNumber}`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //fetch horror movies and rank them by popularity score
    const popularMovies = () => {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&page=${pageNumber}`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //get movie recommendations based on movie id
    const recommendedMovies = () => {
        return fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&page=${pageNumber}`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    return (
        <MovieContext.Provider value={{
            movies, getMoviesByRating, pageNumber, addMovie, getAllMovies, searchMovies, comingSoon, nowPlaying, popularMovies, recommendedMovies, movieId
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}