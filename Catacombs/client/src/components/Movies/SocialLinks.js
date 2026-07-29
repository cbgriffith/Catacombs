import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookSquare,
    faImdb,
    faInstagramSquare,
    faTwitterSquare
} from "@fortawesome/free-brands-svg-icons";

export const SocialLinks = ({ socials }) => (
    <>
        {socials.imdb_id && (
            <a
                href={`https://www.imdb.com/title/${socials.imdb_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on IMDb"
            >
                <FontAwesomeIcon icon={faImdb} size="3x" />
            </a>
        )}
        {socials.facebook_id && (
            <a
                href={`https://www.facebook.com/${socials.facebook_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on Facebook"
            >
                <FontAwesomeIcon
                    className="ms-1"
                    icon={faFacebookSquare}
                    size="3x"
                />
            </a>
        )}
        {socials.twitter_id && (
            <a
                href={`https://www.twitter.com/${socials.twitter_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on Twitter"
            >
                <FontAwesomeIcon
                    className="ms-1"
                    icon={faTwitterSquare}
                    size="3x"
                />
            </a>
        )}
        {socials.instagram_id && (
            <a
                href={`https://www.instagram.com/${socials.instagram_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on Instagram"
            >
                <FontAwesomeIcon
                    className="ms-1"
                    icon={faInstagramSquare}
                    size="3x"
                />
            </a>
        )}
    </>
);
