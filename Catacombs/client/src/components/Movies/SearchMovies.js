import React, { useContext, useState } from "react";
import { MovieContext } from "./MovieProvider";
import { MovieCard } from "./MovieCard";

export const SearchMovies = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const { movies, searchMovies } = useContext(MovieContext);
    const handleSearch = () => {
        searchMovies(searchTerm)
    }
    return (<>
            <div className="container pt-4">
                <input type="text" id="search" autoFocus placeholder="Enter movie title" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setSearchTerm(e.target.value)} />
                <button onClick={handleSearch}>Search</button>
            </div>
        <div>
            <h1>Search Results</h1>
            <div>
                {
                    movies.results?.map(movie => {
                        return <MovieCard key={movie.id} movie={movie} />
                    })
                }
            </div>
        </div></>)
}