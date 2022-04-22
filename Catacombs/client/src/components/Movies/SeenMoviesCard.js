import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Movie.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImdb, faFacebookSquare, faTwitterSquare, faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import { faClapperboard, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

export const SeenMoviesCard = ({ movie, reloadProp }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { deleteMovie, likedIt, dislikedIt, getSocials } = useContext(MovieContext)
    const [socials, setSocials] = useState({});
    const navigate = useNavigate();

    const handleDeleteMovie = () => {
        Swal.fire({
            title: `Delete ${movie.title}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0D6EFD',
            cancelButtonColor: '#0D6EFD',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
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

    const handleRating = () => {
        Swal.fire({
            title: `Did you like ${movie.title}?`,
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonColor: '#0D6EFD',
            denyButtonColor: '#0D6EFD',
            cancelButtonColor: '#0D6EFD',
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                likedIt(movie.id)
                Swal.fire('Movie liked!', '', 'success')
            } else if (result.isDenied) {
                dislikedIt(movie.id)
                Swal.fire('Movie disliked', '', 'success')
            }
        })
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
        Swal.fire({
            title: `View a list of similar movies to ${movie.title}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0D6EFD',
            cancelButtonColor: '#0D6EFD',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/movies/recommended/${movie.movieId}`)
            }
        })
    }

    useEffect(() => {
        getSocials(movie.movieId)
            .then(setSocials)
        //eslint-disable-next-line
    }, [])

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
                        <CardText>
                            {movie.overview}
                        </CardText>
                    </CardBody>
                    <CardFooter>
                        {socials.imdb_id ? <a href={`https://www.imdb.com/title/${socials.imdb_id}`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faImdb} size="3x" /></a> : ""}
                        {socials.facebook_id ? <a href={`https://www.facebook.com/${socials.facebook_id}`} target="_blank" rel="noreferrer"><FontAwesomeIcon className="ms-1" icon={faFacebookSquare} size="3x" /></a> : ""}
                        {socials.twitter_id ? <a href={`https://www.twitter.com/${socials.twitter_id}`} target="_blank" rel="noreferrer"><FontAwesomeIcon className="ms-1" icon={faTwitterSquare} size="3x" /></a> : ""}
                        {socials.instagram_id ? <a href={`https://www.instagram.com/${socials.instagram_id}`} target="_blank" rel="noreferrer"><FontAwesomeIcon className="ms-1" icon={faInstagramSquare} size="3x" /></a> : ""}
                        <br />
                        <Button size="sm" style={{ backgroundColor: "#0D6EFD" }} onClick={handleRecommendedMovies}><FontAwesomeIcon icon={faClapperboard} style={{ backgroundColor: "#0D6EFD", color: "#202428" }} size="2x" /></Button> <Button size="sm" style={{ backgroundColor: "#0D6EFD" }} onClick={handleRating}><FontAwesomeIcon icon={faQuestionCircle} style={{ backgroundColor: "#0D6EFD", color: "#202428" }} size="2x" /></Button> <Button size="sm" style={{ backgroundColor: "#0D6EFD" }} onClick={handleDeleteMovie}><FontAwesomeIcon icon={faTrashCan} style={{ backgroundColor: "#0D6EFD", color: "#202428" }} size="2x" /></Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}