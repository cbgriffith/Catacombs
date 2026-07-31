import React, { useMemo, useState, createContext } from "react"

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
    const [savedMovies, setSavedMovies] = useState([])
    const [moviePage, setMoviePage] = useState(emptyMoviePage)
    const [isLoadingMovies, setIsLoadingMovies] = useState(false)
    const [movieLoadError, setMovieLoadError] = useState("")
    const savedMovieByTmdbId = useMemo(
        () => new Map(
            savedMovies.map((movie) => [movie.movieId, movie])
        ),
        [savedMovies]
    )

    const rememberSavedMovie = (savedMovie) => {
        setSavedMovies((currentMovies) => {
            const existingIndex = currentMovies.findIndex(
                (movie) => movie.movieId === savedMovie.movieId
            )

            if (existingIndex === -1) {
                return [...currentMovies, savedMovie]
            }

            return currentMovies.map((movie, index) => (
                index === existingIndex ? savedMovie : movie
            ))
        })

        return savedMovie
    }

    const loadMovieCollection = () => {
        return apiFetch("/api/Movies/collection")
            .then((response) => response.json())
            .then((collection) => {
                setSavedMovies(collection)
                return collection
            })
    }

    const loadTmdbMovies = async (path) => {
        setIsLoadingMovies(true)
        setMovieLoadError("")
        setMovies([])

        try {
            const [movieObject] = await Promise.all([
                tmdbApiFetch(path),
                loadMovieCollection()
            ])
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

    const hiddenGems = (page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/hidden-gems?page=${page}`
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

    const similarMovies = (movieId, page = 1) => {
        return loadTmdbMovies(
            `/api/tmdb/movies/${movieId}/similar?page=${page}`
        )
    }

    const getMovieMetadata = (movieId) => {
        return tmdbApiFetch(
            `/api/tmdb/movies/${movieId}/metadata`
        ).catch(() => ({
            external_ids: {},
            videos: { results: [] }
        }))
    }

    const getMovieDetails = (movieId) => {
        return tmdbApiFetch(
            `/api/tmdb/movies/${movieId}/metadata`
        )
    }

    const addMovie = async (movie) => {
        const response = await secureApiFetch("/api/Movies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(movie),
        })
        const savedMovie = await response.json()
        rememberSavedMovie(savedMovie)
        return {
            movie: savedMovie,
            wasAlreadySaved: response.status === 200
        }
    }

    const setMovieStatus = async (movie, watched, rating) => {
        const response = await secureApiFetch("/api/Movies/status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: movie.title,
                poster_path: movie.poster_path,
                overview: movie.overview,
                popularity: movie.popularity,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                movieId: movie.movieId ?? movie.id,
                watched,
                rating
            }),
        })
        const savedMovie = await response.json()
        return rememberSavedMovie(savedMovie)
    }

    const getWatchlist = () => {
        return apiFetch("/api/Movies")
            .then((response) => response.json())
    }

    const getAllMovies = () => {
        return getWatchlist()
            .then(setMovies)
    }

    const getAllSeenMovies = () => {
        return apiFetch("/api/Movies/seen")
            .then((response) => response.json())
            .then(setMovies)
    }

    const deleteMovie = async (movieId) => {
        const response = await secureApiFetch(`/api/Movies/${movieId}`, {
            method: "DELETE"
        })
        setSavedMovies((currentMovies) => (
            currentMovies.filter((movie) => movie.id !== movieId)
        ))
        return response
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

    const getMovieSummary = () => {
        return apiFetch("/api/Movies/summary")
            .then((response) => response.json())
    }

    return (
        <MovieContext.Provider value={{
            movies,
            moviePage,
            isLoadingMovies,
            movieLoadError,
            getSavedMovie: (movieId) => (
                savedMovieByTmdbId.get(movieId) || null
            ),
            getMoviesByRating,
            popularMovies,
            hiddenGems,
            addMovie,
            setMovieStatus,
            getWatchlist,
            getAllMovies,
            searchMovies,
            comingSoon,
            nowPlaying,
            similarMovies,
            getAllSeenMovies,
            deleteMovie,
            getAllLikedMovies,
            getAllDislikedMovies,
            getMovieDetails,
            getMovieSummary,
            getMovieMetadata
        }}>
            {props.children}
        </MovieContext.Provider>
    )
}
