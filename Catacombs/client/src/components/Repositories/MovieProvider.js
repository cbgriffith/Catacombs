import React, { useState, createContext } from "react"

export const MovieContext = createContext()

const apiUrl = "https://localhost:44377";
const emptyMoviePage = {
    page: 1,
    totalPages: 1,
    totalResults: 0
};

const authenticatedApiFetch = (path, options = {}) => {
    return fetch(`${apiUrl}${path}`, {
        ...options,
        credentials: "include"
    })
}

const readApiError = async (response, fallbackMessage) => {
    try {
        const problem = await response.json()
        return problem.title || problem.status_message || fallbackMessage
    } catch {
        return fallbackMessage
    }
}

const apiFetch = async (path, options = {}) => {
    const response = await authenticatedApiFetch(path, options)

    if (!response.ok) {
        const message = await readApiError(
            response,
            "The request could not be completed."
        )
        throw new Error(message)
    }

    return response
}

const tmdbApiFetch = async (path) => {
    const response = await apiFetch(path)
    return response.json()
}

const secureApiFetch = async (path, options = {}) => {
    const tokenResponse = await apiFetch("/api/auth/antiforgery-token")
    const { token } = await tokenResponse.json()

    return apiFetch(path, {
        ...options,
        headers: {
            ...options.headers,
            "X-XSRF-TOKEN": token
        }
    })
}

export const MovieProvider = (props) => {
    const [movies, setMovies] = useState([])
    const [moviePage, setMoviePage] = useState(emptyMoviePage)
    const [isLoadingMovies, setIsLoadingMovies] = useState(false)
    const [movieLoadError, setMovieLoadError] = useState("")

    const loadTmdbMovies = async (path) => {
        setIsLoadingMovies(true)
        setMovieLoadError("")
        setMovies([])

        try {
            const movieObject = await tmdbApiFetch(path)
            setMovies(movieObject.results || [])
            setMoviePage({
                page: movieObject.page || 1,
                totalPages: movieObject.total_pages || 0,
                totalResults: movieObject.total_results || 0
            })
            return movieObject
        } catch (error) {
            setMovies([])
            setMoviePage({
                page: 1,
                totalPages: 0,
                totalResults: 0
            })
            setMovieLoadError(error.message)
            return null
        } finally {
            setIsLoadingMovies(false)
        }
    }

    const getMoviesByRating = (page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/top-rated?page=${page}`
        )
    }

    const popularMovies = (page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/popular?page=${page}`
        )
    }

    const searchMovies = (query, page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/search?query=${encodeURIComponent(query)}` +
            `&page=${page}`
        )
    }

    const comingSoon = (page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/upcoming?page=${page}`
        )
    }

    const nowPlaying = (page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/now-playing?page=${page}`
        )
    }

    const recommendedMovies = (movieId, page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/${movieId}/recommendations?page=${page}`
        )
    }

    const getSocials = (movieId) => {
        return tmdbApiFetch(
            `/api/tmdb/movies/${movieId}/external-ids`
        ).catch(() => ({}))
    }

    const getVideos = (movieId) => {
        return tmdbApiFetch(
            `/api/tmdb/movies/${movieId}/videos`
        ).catch(() => ({ results: [] }))
    }

    const addMovie = (movie) => {
        return secureApiFetch("/api/Movies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(movie),
        })
    }

    const getAllMovies = () => {
        return apiFetch("/api/Movies")
            .then((response) => response.json())
            .then(setMovies)
    }

    const getAllSeenMovies = () => {
        return apiFetch("/api/Movies/seen")
            .then((response) => response.json())
            .then(setMovies)
    }

    const deleteMovie = movieId => {
        return secureApiFetch(`/api/Movies/${movieId}`, {
            method: "DELETE"
        })
    }

    const getAllLikedMovies = () => {
        return apiFetch("/api/Movies/liked")
            .then((response) => response.json())
            .then(setMovies)
    }

    const getAllDislikedMovies = () => {
        return apiFetch("/api/Movies/disliked")
            .then((response) => response.json())
            .then(setMovies)
    }

    const seenIt = (id) => {
        return secureApiFetch(`/api/Movies/seenit/${id}`, {
            method: "PATCH"
        }).then(getAllMovies)
    }

    const likedIt = (id) => {
        return secureApiFetch(`/api/Movies/likedit/${id}`, {
            method: "PATCH"
        }).then(getAllSeenMovies)
    }

    const dislikedIt = (id) => {
        return secureApiFetch(`/api/Movies/dislikedit/${id}`, {
            method: "PATCH"
        }).then(getAllSeenMovies)
    }

    return (
        <MovieContext.Provider value={{
            movies,
            moviePage,
            isLoadingMovies,
            movieLoadError,
            getMoviesByRating,
            popularMovies,
            addMovie,
            getAllMovies,
            searchMovies,
            comingSoon,
            nowPlaying,
            recommendedMovies,
            getAllSeenMovies,
            deleteMovie,
            getAllLikedMovies,
            getAllDislikedMovies,
            seenIt,
            likedIt,
            dislikedIt,
            getSocials,
            getVideos
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}
