import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Swal from "../../sweetAlert";
import "./Movie.css"
import {
    faClapperboard,
    faEye,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";


export const MovieWatchListCard = ({ movie, reloadProp }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { deleteMovie, seenIt } = useContext(MovieContext)
    const { socials, trailer } = useMovieMetadata(movie.movieId);
    const navigate = useNavigate();

    // const handleDeleteMovie = () => {
    //     deleteMovie(movie.id).then(reloadProp)
    // }

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

    const handleSeenIt = () => {
        Swal.fire({
            title: `You've seen ${movie.title}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0D6EFD',
            cancelButtonColor: '#0D6EFD',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                seenIt(movie.id)
                Swal.fire(
                    'Moved!',
                    `${movie.title} has been moved to the Seen It list.`,
                    'success'
                )
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
                    <CardFooter className="movie-card-footer">
                        <SocialLinks socials={socials} />
                        <div
                            className="movie-card-actions"
                            role="group"
                            aria-label={`Actions for ${movie.title}`}
                        >
                            <TrailerButton
                                trailer={trailer}
                                title={movie.title}
                            />
                            <MovieActionButton
                                icon={faClapperboard}
                                label={`View movies similar to ${movie.title}`}
                                onClick={handleRecommendedMovies}
                            />
                            <MovieActionButton
                                icon={faEye}
                                label={`Mark ${movie.title} as watched`}
                                onClick={handleSeenIt}
                            />
                            <MovieActionButton
                                icon={faTrashCan}
                                label={`Remove ${movie.title} from your Watch List`}
                                onClick={handleDeleteMovie}
                                variant="danger"
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
