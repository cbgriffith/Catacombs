import React, { useContext } from "react"
import { MovieContext } from "./MovieProvider";
import { Button } from "reactstrap";

export const SeenMoviesCard = ({ movie, reloadProp }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { deleteMovie, likedIt, dislikedIt } = useContext(MovieContext)

    const handleDeleteMovie = () => {
        deleteMovie(movie.id).then(reloadProp)
    }

    const handleLikedIt = () => {
        likedIt(movie.id)
    }

    const handleDislikedIt = () => {
        dislikedIt(movie.id)
    }

    let link = "https://image.tmdb.org/t/p/w200";
    const imgNotFound = require('./images/broken-1.png');
    let poster = "";

    if (movie.poster_path === null || movie.poster_path === "" || movie.poster_path === "string"){
        link = "";
        poster = imgNotFound;
    } else {
        link = "https://image.tmdb.org/t/p/w200";
        poster = movie.poster_path;
    }

    return (

        <div>
            <h3>{movie.title}</h3>
            <p>{movie.overview}</p>
            <p>Release Date: {formattedDate}</p>
            <img src={`${link}${poster}`} alt={movie.original_title} />
            <p>Score: {movie.vote_average}</p>
            {/* <p>Page: {movie.total_pages}</p> */}
            <p>Popularity: {movie.popularity}</p>
            <Button color="danger" onClick={handleDeleteMovie}>Delete</Button>
            <br /> <br />
            <Button color="danger" onClick={handleLikedIt}>Liked It</Button>
            <Button color="danger" onClick={handleDislikedIt}>Disliked it</Button>
            <hr />
        </div>

    )
}