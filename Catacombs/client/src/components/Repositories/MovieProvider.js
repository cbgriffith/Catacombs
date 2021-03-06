import React, { useState, createContext } from "react"

export const MovieContext = createContext()

export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])
    const apiUrl = "https://localhost:44377";

    //each fetch call to themoviedb api limits every page to just 20 results, I'm going to need way more
    //I'm going to do at least 5 pages for each list from the tmdb api (by popularity and rating at least)


    //fetch horror movies by rating, page 1
    const getMoviesByRating = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&with_genres=27&with_original_language=en&page=1`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies by rating, page 2
    const getMoviesByRating2 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&with_genres=27&with_original_language=en&page=2`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies by rating, page 3
    const getMoviesByRating3 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&with_genres=27&with_original_language=en&page=3`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies by rating, page 4
    const getMoviesByRating4 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&with_genres=27&with_original_language=en&page=4`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies by rating, page 5
    const getMoviesByRating5 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&with_genres=27&with_original_language=en&page=5`)
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
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&query=${query}&page=1&include_adult=false`)
            .then((res) => res.json())
            .then(setMovies);
    };

    //fetch horror movies that are coming soon
    const comingSoon = () => {
        return fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&region=US&page=1`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //horror movies currently playing
    const nowPlaying = () => {
        return fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&with_genres=27&language=en-US&page=1`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //fetch horror movies and rank them by popularity score, page 1
    const popularMovies = () => {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&region=US&page=1`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies and rank them by popularity score, page 2
    const popularMovies2 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&region=US&page=2`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies and rank them by popularity score, page 3
    const popularMovies3 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&region=US&page=3`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies and rank them by popularity score, page 4
    const popularMovies4 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&region=US&page=4`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }
    //fetch horror movies and rank them by popularity score, page 5
    const popularMovies5 = () => {
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=b90c6e98b6940ecc7131589bc7ed9067&with_genres=27&language=en-US&region=US&page=5`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //get movie recommendations based on movie id
    const recommendedMovies = (movieId) => {
        return fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&region=US&page=1`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    //list all seen movies
    const getAllSeenMovies = () => {
        return fetch(`${apiUrl}/api/Movies/seen`)
            .then((res) => res.json())
            .then(setMovies);
    };

    //delete a movie from the watchlist
    const deleteMovie = movieId => {
        return fetch(`${apiUrl}/api/Movies/${movieId}`, {
            method: "DELETE"
        })
    }

    //list all liked movies
    const getAllLikedMovies = () => {
        return fetch(`${apiUrl}/api/Movies/liked`)
            .then((res) => res.json())
            .then(setMovies);
    };

    //list all disliked movies
    const getAllDislikedMovies = () => {
        return fetch(`${apiUrl}/api/Movies/disliked`)
            .then((res) => res.json())
            .then(setMovies);
    };

    //change watched to true
    const seenIt = (id) => {
        return fetch(`${apiUrl}/api/Movies/seenit/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
        }).then(getAllMovies)
    }

    //change rating to 1
    const likedIt = (id) => {
        return fetch(`${apiUrl}/api/Movies/likedit/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
        }).then(getAllSeenMovies)
    }

    //change rating to -1
    const dislikedIt = (id) => {
        return fetch(`${apiUrl}/api/Movies/dislikedit/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
        }).then(getAllSeenMovies)
    }

    //get socials
    const getSocials = (movieId) => {
        return fetch(`https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=b90c6e98b6940ecc7131589bc7ed9067`)
            .then(res => res.json())
    }

    return (
        <MovieContext.Provider value={{
            movies, getMoviesByRating, getMoviesByRating2, getMoviesByRating3, getMoviesByRating4, getMoviesByRating5,
            addMovie, getAllMovies, searchMovies, comingSoon, nowPlaying, popularMovies, popularMovies2, popularMovies3,
            popularMovies4, popularMovies5, recommendedMovies, getAllSeenMovies, deleteMovie, getAllLikedMovies,
            getAllDislikedMovies, seenIt, likedIt, dislikedIt, getSocials
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}