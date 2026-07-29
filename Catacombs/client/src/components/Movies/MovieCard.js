import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"
import { faBookmark, faClapperboard } from "@fortawesome/free-solid-svg-icons";
import Swal from "../../sweetAlert";
import { MovieActionButton } from "./MovieActionButton";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { addMovie } = useContext(MovieContext)
    const { socials, trailer } = useMovieMetadata(movie.id);
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
                            <MovieActionButton
                                icon={faClapperboard}
                                label={`View movies similar to ${movie.title}`}
                                onClick={handleRecommendedMovies}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
