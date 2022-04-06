import React, { useState, createContext } from "react"

export const MovieContext = createContext()

export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])

    const getMovies = () => {
        return fetch("https://api.themoviedb.org/3/movie/top_rated?api_key=b90c6e98b6940ecc7131589bc7ed9067&language=en-US&with_genres=27&with_original_language=en&page=1")
            .then(res => res.json())
            .then(movieObject => setMovies(movieObject.results))
    }

    return (
        <MovieContext.Provider value={{
            movies, getMovies
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}