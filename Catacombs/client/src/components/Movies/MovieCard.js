import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImdb, faFacebookSquare, faTwitterSquare, faInstagramSquare } from "@fortawesome/free-brands-svg-icons";
import { faClapperboard, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { addMovie, getSocials } = useContext(MovieContext)
    const [socials, setSocials] = useState({});
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


    useEffect(() => {
        getSocials(movie.id)
            .then(setSocials)
        //eslint-disable-next-line
    }, [])

    const handleSaveMovie = (e) => {
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
            release_date: movie.release_date,
            movieId: movie.id
        }
        Swal.fire({
            title: `Add <strong>${movie.title}</strong> to your Watch List?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0D6EFD',
            cancelButtonColor: '#0D6EFD',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                addMovie(newMovie)
                Swal.fire(
                    'Added!',
                    `${movie.title} has been added to your Watch List.`,
                    'success'
                )
            }
        })
    }

    const handleRecommendedMovies = () => {
        Swal.fire({
            title: `View a list of similar movies to <strong>${movie.title}</strong>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0D6EFD',
            cancelButtonColor: '#0D6EFD',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/movies/recommended/${movie.id}`)
            }
        })
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
                        <Button size="sm" style={{ backgroundColor: "#0D6EFD" }} onClick={handleSaveMovie}><FontAwesomeIcon icon={faSquarePlus} style={{ backgroundColor: "#0D6EFD", color: "#202428" }} size="2x" /></Button> <Button size="sm" style={{ backgroundColor: "#0D6EFD" }} onClick={handleRecommendedMovies}><FontAwesomeIcon icon={faClapperboard} style={{ backgroundColor: "#0D6EFD", color: "#202428" }} size="2x" /></Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}