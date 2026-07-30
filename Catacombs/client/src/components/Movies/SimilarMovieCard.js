import React from "react"
import { Card, CardFooter } from "reactstrap";
import "./Movie.css"
import { MovieCardContent } from "./MovieCardContent";
import { MovieCollectionActions } from "./MovieCollectionActions";
import { SocialLinks } from "./SocialLinks";
import { TrailerButton } from "./TrailerButton";
import { useMovieMetadata } from "./useMovieMetadata";

export const SimilarMovieCard = ({ movie }) => {
    const { socials, trailer } = useMovieMetadata(movie.id);

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
                            <MovieCollectionActions movie={movie} />
                        </div>
                    </CardFooter>
                </Card>
        </div>
    )
}
