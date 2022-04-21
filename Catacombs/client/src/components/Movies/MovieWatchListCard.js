import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Movie.css"

export const MovieWatchListCard = ({ movie, reloadProp }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { deleteMovie, seenIt } = useContext(MovieContext)
    const navigate = useNavigate();

    // const handleDeleteMovie = () => {
    //     deleteMovie(movie.id).then(reloadProp)
    // }

    const handleDeleteMovie = () => {
        Swal.fire({
            title: `Are you sure you want to delete ${movie.title}?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMovie(movie.id).then(reloadProp)
                Swal.fire(
                    'Deleted!',
                    `${movie.title} has been deleted.`,
                    'success'
                )
            }
        })

    }

    // const handleDeleteMovie = () => {
    //     var confirmDelete = window.confirm("Are you sure you want to delete this?")
    //     if (confirmDelete) {
    //         deleteMovie(movie.id).then(reloadProp)
    //     }
    // }

    const handleSeenIt = () => {
        seenIt(movie.id)
    }

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

    const handleRecommendedMovies = () => {
        navigate(`/movies/recommended/${movie.movieId}`)
    }

    return (
        <>
            <div className="container d-flex align-items-stretch" id="movie">
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
                        <CardSubtitle className="text-muted" tag="h6">Movie Id: {movie.movieId}</CardSubtitle>
                        <CardText>
                            {movie.overview}
                        </CardText>
                    </CardBody>
                    <CardFooter>
                        <Button color="danger" onClick={handleRecommendedMovies}>Recommended Movies</Button> <br /> <br />
                        <Button color="danger" onClick={handleDeleteMovie}>Delete</Button> <Button color="danger" onClick={handleSeenIt}>Seen It</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}