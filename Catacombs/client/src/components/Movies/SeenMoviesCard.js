import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import {
    faClapperboard,
    faThumbsUp,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import {
    askMovieRating,
    confirmRemoveMovie,
    showDislikedMovie,
    showLikedMovie,
    showMovieActionError,
    showRemovedMovie
} from "./movieAlerts";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const SeenMoviesCard = ({ movie, reloadProp }) => {
    const { deleteMovie, likedIt, dislikedIt } = useContext(MovieContext)
    const { socials, trailer } = useMovieMetadata(movie.movieId);
    const navigate = useNavigate();

    const handleDeleteMovie = async () => {
        if (!await confirmRemoveMovie(movie.title, "your movie history")) {
            return
        }

        try {
            await deleteMovie(movie.id)
            reloadProp(currentValue => !currentValue)
            await showRemovedMovie(movie.title)
        } catch (error) {
            await showMovieActionError("Unable to remove movie", error)
        }
    }

    const handleRating = async () => {
        const result = await askMovieRating(movie.title)

        try {
            if (result.isConfirmed) {
                await likedIt(movie.id)
                await showLikedMovie(movie.title)
            } else if (result.isDenied) {
                await dislikedIt(movie.id)
                await showDislikedMovie(movie.title)
            }
        } catch (error) {
            await showMovieActionError("Unable to rate movie", error)
        }
    }

    const handleSimilarMovies = () => {
        navigate(`/movies/similar/${movie.movieId}`)
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
                                icon={faThumbsUp}
                                label={`Rate ${movie.title}`}
                                onClick={handleRating}
                            />
                            <MovieActionButton
                                icon={faTrashCan}
                                label={`Remove ${movie.title} from your movie history`}
                                onClick={handleDeleteMovie}
                                variant="danger"
                            />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
