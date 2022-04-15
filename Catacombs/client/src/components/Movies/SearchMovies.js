import React, { useContext, useState } from "react";
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard";
import { Container } from "reactstrap";
import "./Movie.css"

export const SearchMovies = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const { movies, searchMovies } = useContext(MovieContext);
    const handleSearch = () => {
        searchMovies(searchTerm)
    }
    return (<>
        <Container className="pt-4">
            <input type="text" id="search" autoFocus placeholder="Enter movie title" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
        </Container>
        <Container>
            <h1 style={{ textAlign: "center" }}>Search Results</h1>
            <div id="movielist">
                {
                    movies.results?.map(movie => {
                        return <MovieCard key={movie.id} movie={movie} />
                    })
                }
            </div>
        </Container></>)
}