import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { SimilarMovieCard } from "./SimilarMovieCard"
import { Container, Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import "./Movie.css"

export const SimilarMovieList = () => {
    let { movies, similarMovies } = useContext(MovieContext)
    const navigate = useNavigate();


    //useEffect - reach out to the world for something
    const { id } = useParams();
    useEffect(() => {
        similarMovies(id)
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <div id="main">
                <Container>
                    <Button onClick={() => navigate(-1)}>Go back</Button>
                    <h1 style={{ textAlign: "center" }}>Similar Movies</h1>
                    <div id="movielist">
                        {
                            movies?.map(movie => {
                                return <SimilarMovieCard key={movie.id} movie={movie} />
                            })
                        }
                    </div>
                    <Button onClick={() => navigate(-1)}>Go back</Button>
                </Container>
            </div>
        </>
    )
}
