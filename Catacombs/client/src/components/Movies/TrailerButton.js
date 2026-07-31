import React, { useState } from "react";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import {
    Modal,
    ModalBody,
    ModalHeader
} from "reactstrap";
import { MovieActionButton } from "./MovieActionButton";

export const TrailerButton = ({
    trailer,
    title,
    showLabel = false
}) => {
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
            <MovieActionButton
                icon={faPlay}
                label={`Watch the trailer for ${title}`}
                onClick={toggle}
                variant="trailer"
                text={showLabel ? "Watch trailer" : undefined}
            />
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
