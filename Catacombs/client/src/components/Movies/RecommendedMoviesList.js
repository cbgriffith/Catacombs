import React, { useContext, useEffect } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { RecommendedMovieCard } from "./RecommendedMovieCard"
import { Container, Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import "./Movie.css"

export const RecommendedMovieList = () => {
    let { movies, recommendedMovies } = useContext(MovieContext)
    const navigate = useNavigate();


    //useEffect - reach out to the world for something
    const { id } = useParams();
    useEffect(() => {
        recommendedMovies(id)
        // eslint-disable-next-line
    }, [])

    return (
        <>

            <Container>
                <Button onClick={() => navigate(-1)}>Go back</Button>
                <h1 style={{ textAlign: "center" }}>Recommended Movies</h1>
                <div id="movielist">
                    {
                        movies?.map(movie => {
                            return <RecommendedMovieCard key={movie.id} movie={movie} />
                        })
                    }
                </div>
                <Button onClick={() => navigate(-1)}>Go back</Button>
            </Container>

        </>
    )
}