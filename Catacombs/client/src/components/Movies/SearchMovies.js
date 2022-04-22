import React, { useContext, useState } from "react";
import { MovieContext } from "../Repositories/MovieProvider"
import { MovieCard } from "./MovieCard";
import { Container, Button } from "reactstrap";
import "./Movie.css"

export const SearchMovies = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const { movies, searchMovies } = useContext(MovieContext);
    const handleSearch = () => {
        searchMovies(searchTerm)
    }
    let noResults;
    if (movies.total_pages === 0) {
        noResults = "Nothing Found";
    }
    return (
        <>
            <div>
                <Container className="pt-4">
                    <input type="text" id="search" autoFocus placeholder="Enter movie title" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button style={{backgroundColor:"#0D6EFD"}} onClick={handleSearch}>Search</Button>
                </Container>
                <Container>
                    <h1 style={{ textAlign: "center" }}>Search Results</h1>
                    <h4>{noResults}</h4>
                    <div id="movielist">
                        {
                            movies.results?.map(movie => {
                                return <MovieCard key={movie.id} movie={movie} />
                            })
                        }
                    </div>
                </Container>
            </div>
        </>)
}