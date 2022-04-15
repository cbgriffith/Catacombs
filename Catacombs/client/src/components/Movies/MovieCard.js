import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { addMovie } = useContext(MovieContext)
    const user = JSON.parse(sessionStorage.getItem("userProfile"))
    const navigate = useNavigate();
    let link = "https://image.tmdb.org/t/p/w200";
    const imgNotFound = require('./images/broken-1.png');
    let poster = "";

    if (movie.poster_path === null || movie.poster_path === "" || movie.poster_path === "string") {
        link = "";
        poster = imgNotFound;
    } else {
        link = "https://image.tmdb.org/t/p/w200";
        poster = movie.poster_path;
    }


    const handleSaveMovie = (e) => {
        // const newMovie = {...movie}
        e.preventDefault();
        const newMovie = {
            userId: user.id,
            title: movie.title,
            rating: 0,
            watched: false,
            poster_path: movie.poster_path,
            overview: movie.overview,
            popularity: movie.popularity,
            vote_average: movie.vote_average,
            release_date: movie.release_date
        }
        addMovie(newMovie)
    }

    const handleRecommendedMovies = () => {
        // recommendedMovies(movie.id)
        navigate(`/movies/recommended/${movie.id}`)
    }

    return (
        <>
            <div className="container" id="movie">
                <Card color="dark" inverse className="mb-3 mt-3">
                    <CardBody>
                        <img className="m-2" style={{ float: "left" }} src={`${link}${poster}`} alt={movie.original_title} />
                        <CardTitle tag="h4">
                            {movie.title}
                        </CardTitle>
                        <CardSubtitle
                            className="text-muted"
                            tag="h6">
                            Release date: {formattedDate}
                        </CardSubtitle>
                        <CardSubtitle className="text-muted" tag="h6">Vote score: {movie.vote_average}</CardSubtitle>
                        <CardSubtitle className="text-muted" tag="h6">Popularity score: {movie.popularity}</CardSubtitle>
                        <CardText>
                            {movie.overview}
                        </CardText>
                    </CardBody>
                    <CardFooter>
                        <Button className="mt-1" color="danger" onClick={handleSaveMovie}>Add to Watch List</Button> <Button className="mt-1" color="danger" onClick={handleRecommendedMovies}>Recommended Movies</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}