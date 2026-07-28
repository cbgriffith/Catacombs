import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import {
    Button,
    Modal,
    ModalBody,
    ModalHeader
} from "reactstrap";

export const TrailerButton = ({ trailer, title }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!trailer) {
        return null;
    }

    const toggle = () => setIsOpen(current => !current);
    const trailerUrl =
        `https://www.youtube-nocookie.com/embed/` +
        `${encodeURIComponent(trailer.key)}?rel=0`;

    return (
        <>
            <Button
                size="sm"
                className="movie-action-button"
                onClick={toggle}
                aria-label={`Watch the trailer for ${title}`}
                title="Watch trailer"
            >
                <FontAwesomeIcon icon={faPlay} size="2x" />
            </Button>
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                centered
                size="lg"
                contentClassName="bg-dark text-white"
            >
                <ModalHeader toggle={toggle}>
                    {title} Trailer
                </ModalHeader>
                <ModalBody className="p-0">
                    <div className="ratio ratio-16x9">
                        <iframe
                            src={trailerUrl}
                            title={`${title} trailer`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};
