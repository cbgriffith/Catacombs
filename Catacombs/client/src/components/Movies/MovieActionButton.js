import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "reactstrap";

export const MovieActionButton = ({
    icon,
    label,
    onClick,
    variant,
    text,
    isDisabled = false,
    isSelected = false
}) => {
    const className = [
        "movie-icon-button",
        text ? "movie-icon-button--labeled" : "",
        variant ? `movie-icon-button--${variant}` : ""
    ].filter(Boolean).join(" ");

    return (
        <Button
            type="button"
            className={className}
            onClick={(event) => {
                if (isDisabled) {
                    event.preventDefault();
                    return;
                }

                onClick?.(event);
            }}
            aria-label={label}
            aria-disabled={isDisabled || undefined}
            aria-pressed={isSelected || undefined}
            data-tooltip={label}
        >
            <FontAwesomeIcon icon={icon} aria-hidden="true" />
            {text && <span>{text}</span>}
        </Button>
    );
};
