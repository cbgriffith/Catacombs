import React from "react"
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import { faClapperboard } from "@fortawesome/free-solid-svg-icons";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const LikedDislikedMovieCard = ({ movie }) => {
    const { socials, trailer } = useMovieMetadata(movie.movieId);
    const navigate = useNavigate();

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
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
