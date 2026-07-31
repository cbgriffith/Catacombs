import { useContext, useEffect, useState } from "react";
import { MovieContext } from "../Repositories/MovieProvider";

const emptyMetadata = {
    external_ids: {},
    videos: {
        results: []
    }
};

export const selectTrailer = (videos) => {
    return (videos?.results || [])
        .filter(video =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.key
        )
        .sort((first, second) => {
            const officialDifference =
                Number(second.official) - Number(first.official);

            if (officialDifference !== 0) {
                return officialDifference;
            }

            return new Date(second.published_at || 0) -
                new Date(first.published_at || 0);
        })[0] || null;
};

export const useMovieMetadata = (movieId) => {
    const { getMovieMetadata } = useContext(MovieContext);
    const [metadata, setMetadata] = useState(emptyMetadata);

    useEffect(() => {
        let isCurrentMovie = true;

        setMetadata(emptyMetadata);
        getMovieMetadata(movieId).then(result => {
            if (isCurrentMovie) {
                setMetadata(result);
            }
        });

        return () => {
            isCurrentMovie = false;
        };
        // getMovieMetadata is supplied by MovieProvider.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId]);

    return {
        socials: metadata.external_ids || {},
        trailer: selectTrailer(metadata.videos)
    };
};
