import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export const MovieActionButton = ({
    icon,
    label,
    onClick,
    variant
}) => {
    const className = [
        "movie-icon-button",
        variant ? `movie-icon-button--${variant}` : ""
    ].filter(Boolean).join(" ");

    return (
        <Button
            type="button"
            className={className}
            onClick={onClick}
            aria-label={label}
            data-tooltip={label}
        >
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </Button>
    );
};
