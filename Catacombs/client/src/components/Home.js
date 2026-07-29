import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faFire,
    faMagnifyingGlass,
    faStar
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { UserContext } from "./Repositories/UserProvider";
import "./Home.css";

export const Home = () => {
    const { userProfile } = useContext(UserContext);

    const destinations = [
        {
            title: "Most Popular",
            description: "See which horror movies everyone is watching.",
            icon: faFire,
            path: "/movies/popular"
        },
        {
            title: "Top Rated",
            description: "Start with horror movies that earned their reputation.",
            icon: faStar,
            path: "/movies/rating"
        },
        {
            title: "Search",
            description: "Find a specific movie, old favorite, or hidden gem.",
            icon: faMagnifyingGlass,
            path: "/movies/search"
        },
        {
            title: "My Watch List",
            description: "Return to the movies you saved for later.",
            icon: faBookmark,
            path: "/movies/watchlist"
        }
    ];

    return (
        <main className="home-page">
            <Container>
                <section
                    className="home-hero"
                    aria-labelledby="home-heading"
                >
                    <div className="home-hero-copy">
                        <p className="home-eyebrow">
                            Welcome back
                            {userProfile?.username
                                ? `, ${userProfile.username}`
                                : ""}
                        </p>
                        <h1 id="home-heading">
                            Descend into your next favorite horror movie.
                        </h1>
                        <p className="home-intro">
                            Explore horror films, watch trailers without
                            leaving the Catacombs, and keep track of what
                            you want to see, what you have survived, and
                            what deserves another watch.
                        </p>
                        <div className="home-hero-actions">
                            <Link
                                className="home-primary-action"
                                to="/movies/popular"
                            >
                                Explore popular horror
                            </Link>
                            <Link
                                className="home-secondary-action"
                                to="/movies/search"
                            >
                                Search movies
                            </Link>
                        </div>
                    </div>

                    <div className="home-hero-mark" aria-hidden="true">
                        <div className="home-arch">
                            <span>The</span>
                            <strong>Catacombs</strong>
                            <small>Horror movie archive</small>
                        </div>
                    </div>
                </section>

                <section
                    className="home-destinations"
                    aria-labelledby="home-destinations-heading"
                >
                    <div className="home-section-heading">
                        <p className="home-eyebrow">Choose your path</p>
                        <h2 id="home-destinations-heading">
                            Where do you want to start?
                        </h2>
                    </div>

                    <div className="home-destination-grid">
                        {destinations.map(destination => (
                            <Link
                                className="home-destination-card"
                                to={destination.path}
                                key={destination.path}
                            >
                                <span className="home-destination-icon">
                                    <FontAwesomeIcon
                                        icon={destination.icon}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="home-destination-copy">
                                    <strong>{destination.title}</strong>
                                    <span>{destination.description}</span>
                                </span>
                                <span
                                    className="home-destination-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </Container>
        </main>
    );
};
