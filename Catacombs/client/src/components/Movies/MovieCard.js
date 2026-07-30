import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import { faBookmark, faClapperboard } from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import {
    confirmAddToWatchlist,
    showAddedToWatchlist,
    showMovieActionError
} from "./movieAlerts";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const MovieCard = ({ movie }) => {
    const { addMovie } = useContext(MovieContext)
    const { socials, trailer } = useMovieMetadata(movie.id);
    const navigate = useNavigate();

    const handleSaveMovie = async (e) => {
        e.preventDefault();
        const newMovie = {
            title: movie.title,
            poster_path: movie.poster_path,
            overview: movie.overview,
            popularity: movie.popularity,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            movieId: movie.id
        }

        if (!await confirmAddToWatchlist(movie.title)) {
            return
        }

        try {
            await addMovie(newMovie)
            await showAddedToWatchlist(movie.title)
        } catch (error) {
            await showMovieActionError("Unable to add movie", error)
        }
    }

    const handleSimilarMovies = () => {
        navigate(`/movies/similar/${movie.id}`)
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
                                icon={faBookmark}
                                label={`Add ${movie.title} to your watchlist`}
                                onClick={handleSaveMovie}
                            />
                            <MovieActionButton
                                icon={faClapperboard}
                                label={`View movies similar to ${movie.title}`}
                                onClick={handleSimilarMovies}
                            />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
