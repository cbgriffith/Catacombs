import React from "react"

export const MovieCollectionHeading = ({
    eyebrow,
    title,
    description
}) => (
    <header className="movie-list-heading">
        <p className="movie-list-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
    </header>
)
