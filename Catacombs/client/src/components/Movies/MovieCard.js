import React, { useContext } from "react"
import { MovieContext } from "./MovieProvider";
import { Button } from "reactstrap";

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { addMovie } = useContext(MovieContext)
    const user = JSON.parse(sessionStorage.getItem("userProfile"))

    const handleSaveMovie = () => {
        addMovie({
        userId: user.id,
        title: movie.title,
        rating: 0,
        watched: 0,
        poster_path: movie.poster_path,
        overview: movie.overview,
        popularity: movie.popularity,
        vote_average: movie.vote_average
        })
    }

    const seenIt = () => {
        addMovie({
        userId: user.id,
        title: movie.title,
        rating: 0,
        watched: 1,
        poster_path: movie.poster_path,
        overview: movie.overview,
        popularity: movie.popularity,
        vote_average: movie.vote_average
        })
    }

    return (

        <div>
            <h3>{movie.original_title}</h3>
            <p>{movie.overview}</p>
            <p>Release Date: {formattedDate}</p>
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.original_title} />
            <p>Score: {movie.vote_average}</p>
            {/* <p>Page: {movie.total_pages}</p> */}
            {/* <p>{movie.popularity}</p> */}
            <Button color="danger" onClick={handleSaveMovie}>Add to Watch List</Button>
            <br /> <br />
            <Button color="danger" onClick={seenIt}>Seen It</Button>
            <hr />
        </div>

    )
}