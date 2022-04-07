import React, { useState, createContext } from "react"

export const MovieContext = createContext()

export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])
    let pageNumber = 1;

    //each fetch call to themoviedb api limits every page to just 20 results, I'm going to need way more
    //I'm going to do at least 5 pages for each list from the tmdb api (by popularity and rating at least)


    //fetch horror movies by rating, page 1
    const getMoviesByRating = () => {
        return fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&with_genres=27&with_original_language=en&page=${pageNumber}`)
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    return (
        <MovieContext.Provider value={{
            movies, getMoviesByRating, pageNumber
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}