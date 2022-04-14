import React, { useContext } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Button } from "reactstrap";
// import imgNotFound from './images/Broken-1.jpg';

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { addMovie } = useContext(MovieContext)
    const user = JSON.parse(sessionStorage.getItem("userProfile"))
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
    

    const handleSaveMovie = (e) => {
        // const newMovie = {...movie}
        e.preventDefault();
        const newMovie = {
            userId: user.id,
            title: movie.title,
            rating: 0,
            watched: false,
            poster_path: movie.poster_path,
            overview: movie.overview,
            popularity: movie.popularity,
            vote_average: movie.vote_average,
            release_date: movie.release_date
        }
        addMovie(newMovie)
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
            <Button color="danger" onClick={handleSaveMovie}>Add to Watch List</Button>
            <br /> <br />
            <hr />
        </div>

    )
}