import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Swal from "../../sweetAlert";
import "./Movie.css"
import {
    faClapperboard,
    faEye,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";


export const MovieWatchListCard = ({ movie, reloadProp }) => {
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


    const handleSimilarMovies = () => {
        Swal.fire({
            title: `View a list of similar movies to ${movie.title}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/movies/similar/${movie.movieId}`)
            }
        })
    }


    return (
        <div className="movie-grid-item">
                <Card color="dark" inverse className="movie-card">
                    <MovieCardContent movie={movie} />
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
                                onClick={handleSimilarMovies}
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
    )
}
