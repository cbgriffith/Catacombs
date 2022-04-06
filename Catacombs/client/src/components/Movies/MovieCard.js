import React from "react"

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')

    return (
    
        <div>
            <h3>{movie.original_title}</h3>
            <p>{movie.overview}</p>
            <p>Release Date: {formattedDate}</p>
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.original_title}/>
            <p>{movie.vote_average}</p>
            <p>{movie.popularity}</p>
            <hr/>
        </div>
      
    )
  }