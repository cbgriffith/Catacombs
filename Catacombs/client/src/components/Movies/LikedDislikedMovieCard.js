import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider"
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import {
    faArrowRotateLeft,
    faClapperboard,
    faPen
} from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import {
    chooseUpdatedMovieRating,
    confirmMoveToWatchlist,
    showMovedToWatchlist,
    showMovieActionError,
    showUpdatedMovieRating
} from "./movieAlerts";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const LikedDislikedMovieCard = ({ movie, reloadProp }) => {
    const { setMovieStatus } = useContext(MovieContext)
    const { socials, trailer } = useMovieMetadata(movie.movieId);
    const navigate = useNavigate();

    const handleSimilarMovies = () => {
        navigate(`/movies/similar/${movie.movieId}`)
    }

    const handleRating = async () => {
        const rating = await chooseUpdatedMovieRating(movie.title)

        if (rating === null) {
            return
        }

        try {
            await setMovieStatus(movie, true, rating)
            await showUpdatedMovieRating(movie.title, rating)
            reloadProp(currentValue => !currentValue)
        } catch (error) {
            await showMovieActionError("Unable to rate movie", error)
        }
    }

    const handleMoveToWatchlist = async () => {
        if (!await confirmMoveToWatchlist(movie.title)) {
            return
        }

        try {
            await setMovieStatus(movie, false, 0)
            await showMovedToWatchlist(movie.title)
            reloadProp(currentValue => !currentValue)
        } catch (error) {
            await showMovieActionError(
                "Unable to move movie",
                error
            )
        }
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
                                icon={faPen}
                                label={`Change the rating for ${movie.title}`}
                                onClick={handleRating}
                            />
                            <MovieActionButton
                                icon={faArrowRotateLeft}
                                label={`Move ${movie.title} back to your watchlist`}
                                onClick={handleMoveToWatchlist}
                            />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
