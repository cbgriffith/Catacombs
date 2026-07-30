import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import {
    faClapperboard,
    faEye,
    faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import {
    confirmMarkAsWatched,
    confirmRemoveMovie,
    showMarkedAsWatched,
    showMovieActionError,
    showRemovedMovie
} from "./movieAlerts";
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

    const handleDeleteMovie = async () => {
        if (!await confirmRemoveMovie(movie.title, "your watchlist")) {
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

    const handleSeenIt = async () => {
        if (!await confirmMarkAsWatched(movie.title)) {
            return
        }

        try {
            await seenIt(movie.id)
            await showMarkedAsWatched(movie.title)
        } catch (error) {
            await showMovieActionError(
                "Unable to mark movie as watched",
                error
            )
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
                                icon={faEye}
                                label={`Mark ${movie.title} as watched`}
                                onClick={handleSeenIt}
                            />
                            <MovieActionButton
                                icon={faTrashCan}
                                label={`Remove ${movie.title} from your watchlist`}
                                onClick={handleDeleteMovie}
                                variant="danger"
                            />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
