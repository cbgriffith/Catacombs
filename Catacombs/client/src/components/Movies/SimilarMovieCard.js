import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Card, CardFooter } from "reactstrap";
import "./Movie.css"
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import Swal from "../../sweetAlert";
import { MovieActionButton } from "./MovieActionButton";
import { MovieCardContent } from "./MovieCardContent";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const SimilarMovieCard = ({ movie }) => {
    const { addMovie } = useContext(MovieContext)
    const { socials, trailer } = useMovieMetadata(movie.id);

    const handleSaveMovie = (e) => {
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
        Swal.fire({
            title: `Add <strong>${movie.title}</strong> to your Watch List?`,
            icon: 'question',
            showCancelButton: true,
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
                                label={`Add ${movie.title} to your Watch List`}
                                onClick={handleSaveMovie}
                            />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
