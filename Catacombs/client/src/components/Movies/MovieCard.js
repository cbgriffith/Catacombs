import React, { useContext, useEffect, useState } from "react"
import { MovieContext } from "../Repositories/MovieProvider";
import { Button, Card, CardBody, CardTitle, CardSubtitle, CardText, CardFooter } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Movie.css"

export const MovieCard = ({ movie }) => {
    let date = new Date(movie.release_date);
    let formattedDate = date.toLocaleDateString('en-US')
    const { addMovie, getSocials } = useContext(MovieContext)
    const [socials, setSocials] = useState({});
    const user = JSON.parse(sessionStorage.getItem("userProfile"))
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


    useEffect(() => {
        getSocials(movie.id)
        .then(setSocials)
        //eslint-disable-next-line
    }, [])

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
            release_date: movie.release_date,
            movieId: movie.id
        }
        addMovie(newMovie)
    }

    const handleRecommendedMovies = () => {
        navigate(`/movies/recommended/${movie.id}`)
    }

    // const goToIMDB = () => {
    //     navigate(`https://www.imdb.com/title/${movie.imdb_id}/`)
    // }

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
                    <CardFooter>
                        {socials.imdb_id ? <Button className="mt-1" color="danger" href={`https://www.imdb.com/title/${socials.imdb_id}`} target="_blank">IMDB</Button> : ""}
                        {socials.facebook_id ? <Button className="mt-1" color="danger" href={`https://www.facebook.com/${socials.facebook_id}`} target="_blank">Facebook</Button> : ""}
                        {socials.twitter_id ? <Button className="mt-1" color="danger" href={`https://www.twitter.com/${socials.twitter_id}`} target="_blank">Twitter</Button> : ""}
                        {socials.instagram_id ? <Button className="mt-1" color="danger" href={`https://www.instagram.com/${socials.instagram_id}`} target="_blank">Instagram</Button> : ""}
                        <Button className="mt-1" color="danger" onClick={handleSaveMovie}>Add to Watch List</Button> <Button className="mt-1" color="danger" onClick={handleRecommendedMovies}>Recommended Movies</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}