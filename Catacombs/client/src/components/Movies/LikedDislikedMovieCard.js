import React from "react"
import { Card, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Swal from "../../sweetAlert";
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
                                onClick={handleRecommendedMovies}
                            />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
