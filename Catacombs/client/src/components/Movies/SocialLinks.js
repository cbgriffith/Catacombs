import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookF,
    faImdb,
    faInstagram,
    faTwitter
} from "@fortawesome/free-brands-svg-icons";

export const SocialLinks = ({ socials }) => {
    const hasSocialLinks =
        socials.imdb_id ||
        socials.facebook_id ||
        socials.twitter_id ||
        socials.instagram_id;

    if (!hasSocialLinks) {
        return null;
    }

    return (
        <div
            className="movie-social-links"
            role="group"
            aria-label="Movie social links"
        >
            {socials.imdb_id && (
            <a
                className="movie-icon-button movie-social-link movie-social-link--imdb"
                href={`https://www.imdb.com/title/${socials.imdb_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on IMDb"
                data-tooltip="View on IMDb"
            >
                <FontAwesomeIcon icon={faImdb} aria-hidden="true" />
            </a>
        )}
        {socials.facebook_id && (
            <a
                className="movie-icon-button movie-social-link movie-social-link--facebook"
                href={`https://www.facebook.com/${socials.facebook_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on Facebook"
                data-tooltip="View on Facebook"
            >
                <FontAwesomeIcon
                    icon={faFacebookF}
                    aria-hidden="true"
                />
            </a>
        )}
        {socials.twitter_id && (
            <a
                className="movie-icon-button movie-social-link movie-social-link--twitter"
                href={`https://www.twitter.com/${socials.twitter_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on Twitter"
                data-tooltip="View on Twitter"
            >
                <FontAwesomeIcon
                    icon={faTwitter}
                    aria-hidden="true"
                />
            </a>
        )}
        {socials.instagram_id && (
            <a
                className="movie-icon-button movie-social-link movie-social-link--instagram"
                href={`https://www.instagram.com/${socials.instagram_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="View this movie on Instagram"
                data-tooltip="View on Instagram"
            >
                <FontAwesomeIcon
                    icon={faInstagram}
                    aria-hidden="true"
                />
            </a>
        )}
        </div>
    );
};
