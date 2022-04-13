import React, { useContext } from "react"
import { MovieContext } from "./MovieProvider";
import { Button } from "reactstrap";

export const MovieWatchListCard = ({ movie, reloadProp }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { deleteMovie, seenIt } = useContext(MovieContext)

    const handleDeleteMovie = () => {
        deleteMovie(movie.id).then(reloadProp)
    }

    const handleSeenIt = () => {
        seenIt(movie.id)
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

    // const seenIt = () => {
    //     addMovie({
    //     userId: user.id,
    //     title: movie.title,
    //     rating: 0,
    //     watched: 1,
    //     poster_path: movie.poster_path,
    //     overview: movie.overview,
    //     popularity: movie.popularity,
    //     vote_average: movie.vote_average
    //     })
    // }

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
            <Button color="danger" onClick={handleSeenIt}>Seen It</Button>
            {/* <Button color="danger" onClick={seenIt}>Seen It</Button> */}
            <hr />
        </div>

    )
}