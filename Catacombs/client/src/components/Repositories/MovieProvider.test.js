import React, { useContext } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MovieContext, MovieProvider } from "./MovieProvider";

const moviePage = (id, page = 1) => ({
    results: [{ id, title: `Movie ${id}` }],
    page,
    total_pages: 10,
    total_results: 200
});

const jsonResponse = (body) => ({
    ok: true,
    status: 200,
    json: async () => body
});

let context;
let root;
let container;
let requests;
let deferCollection;
const originalFetch = global.fetch;
const originalActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;

function Consumer() {
    context = useContext(MovieContext);
    return null;
}

beforeEach(() => {
    requests = [];
    deferCollection = false;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    global.fetch = jest.fn((url) => {
        const path = new URL(url).pathname;
        if (path === "/api/Movies/collection" && !deferCollection) {
            return Promise.resolve(jsonResponse([]));
        }
        if (path === "/api/auth/antiforgery-token") {
            return Promise.resolve(jsonResponse({ token: "test-token" }));
        }

        return new Promise((resolve, reject) => {
            requests.push({
                path,
                resolve: (body) => resolve(jsonResponse(body)),
                reject
            });
        });
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
        root.render(<MovieProvider><Consumer /></MovieProvider>);
    });
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.fetch = originalFetch;
    global.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
});

function start(load) {
    let pending;
    act(() => { pending = load(); });
    return pending;
}

async function finish(pending, respond) {
    await act(async () => {
        respond();
        await pending;
    });
}

test("a slower search cannot replace newer results or pagination", async () => {
    const older = start(() => context.searchMovies("Alien", 1));
    const newer = start(() => context.searchMovies("Halloween", 3));

    await finish(newer, () => requests[1].resolve(moviePage(2, 3)));
    await finish(older, () => requests[0].resolve(moviePage(1)));

    expect(context.movies).toEqual(moviePage(2).results);
    expect(context.moviePage).toEqual({
        page: 3, totalPages: 10, totalResults: 200
    });
    expect(context.movieLoadError).toBe("");
    expect(context.isLoadingMovies).toBe(false);
});

test.each(["success", "failure"])(
    "an older %s cannot stop a newer request's loading state",
    async (outcome) => {
        const older = start(() => context.popularMovies());
        const newer = start(() => context.getMoviesByRating());

        await finish(older, () => {
            if (outcome === "success") requests[0].resolve(moviePage(1));
            else requests[0].reject(new Error("Old request failed"));
        });

        expect(context.movies).toEqual([]);
        expect(context.isLoadingMovies).toBe(true);
        expect(context.movieLoadError).toBe("");

        await finish(newer, () => requests[1].resolve(moviePage(2)));
        expect(context.movies).toEqual(moviePage(2).results);
        expect(context.isLoadingMovies).toBe(false);
    }
);

test("an older failure cannot erase newer successful results", async () => {
    const older = start(() => context.popularMovies());
    const newer = start(() => context.hiddenGems());
    await finish(newer, () => requests[1].resolve(moviePage(2, 2)));
    await finish(older, () => requests[0].reject(new Error("Old failure")));

    expect(context.movies).toEqual(moviePage(2).results);
    expect(context.moviePage.page).toBe(2);
    expect(context.movieLoadError).toBe("");
});

test.each(["success", "failure"])(
    "clearing results invalidates an in-flight %s",
    async (outcome) => {
        const pending = start(() => context.searchMovies("Alien"));
        act(() => context.clearMovieResults());
        await finish(pending, () => {
            if (outcome === "success") requests[0].resolve(moviePage(1));
            else requests[0].reject(new Error("Old failure"));
        });

        expect(context.movies).toEqual([]);
        expect(context.moviePage).toEqual({
            page: 1, totalPages: 1, totalResults: 0
        });
        expect(context.movieLoadError).toBe("");
        expect(context.isLoadingMovies).toBe(false);
    }
);

const collectionLoaders = [
    "getAllMovies", "getAllSeenMovies",
    "getAllLikedMovies", "getAllDislikedMovies"
];

test.each(collectionLoaders)(
    "%s supersedes a pending discovery request",
    async (loadCollection) => {
        const older = start(() => context.popularMovies());
        const newer = start(() => context[loadCollection]());
        const savedMovies = [{ id: 10, movieId: 2, title: "Saved movie" }];
        await finish(newer, () => requests[1].resolve(savedMovies));
        await finish(older, () => requests[0].resolve(moviePage(1)));

        expect(context.movies).toEqual(savedMovies);
        expect(context.moviePage).toEqual({
            page: 1, totalPages: 1, totalResults: 0
        });
        expect(context.isLoadingMovies).toBe(false);
    }
);

test("discovery supersedes a pending personal collection request", async () => {
    const older = start(() => context.getAllMovies());
    const newer = start(() => context.popularMovies(2));
    await finish(newer, () => requests[1].resolve(moviePage(2, 2)));
    await finish(older, () => requests[0].resolve([{ id: 10, movieId: 1 }]));

    expect(context.movies).toEqual(moviePage(2).results);
    expect(context.moviePage.page).toBe(2);
});

test("switching between personal collections keeps the latest list", async () => {
    const older = start(() => context.getAllSeenMovies());
    const newer = start(() => context.getAllLikedMovies());
    const likedMovies = [{ id: 20, movieId: 2, rating: 1 }];
    await finish(newer, () => requests[1].resolve(likedMovies));
    await finish(older, () => requests[0].resolve([{ id: 10, movieId: 1 }]));

    expect(context.movies).toEqual(likedMovies);
});

test("the current discovery request still reports failures", async () => {
    const pending = start(() => context.popularMovies());
    await finish(pending, () => requests[0].reject(new Error("Service unavailable")));

    expect(context.movies).toEqual([]);
    expect(context.movieLoadError).toBe("Service unavailable");
    expect(context.isLoadingMovies).toBe(false);
    expect(context.moviePage.totalResults).toBe(0);
});

test("current collection failures still reach the collection page", async () => {
    const pending = start(() => context.getAllSeenMovies());
    const assertion = expect(pending).rejects.toThrow("Collection unavailable");
    await finish(assertion, () => {
        requests[0].reject(new Error("Collection unavailable"));
    });
});

test("an older collection snapshot cannot replace newer saved statuses", async () => {
    deferCollection = true;
    const older = start(() => context.popularMovies());
    const newer = start(() => context.getMovieDetails(2));
    const savedMovie = { id: 10, movieId: 2, watched: true, rating: 1 };
    await finish(newer, () => {
        requests[2].resolve({ id: 2 });
        requests[3].resolve([savedMovie]);
    });
    await finish(older, () => {
        requests[0].resolve(moviePage(2));
        requests[1].resolve([]);
    });

    expect(context.getSavedMovie(2)).toEqual(savedMovie);
});

test.each(["add", "status", "delete"])(
    "a pending collection snapshot cannot undo a successful %s",
    async (operation) => {
        deferCollection = true;
        const initial = start(() => context.getMovieDetails(2));
        const savedMovie = { id: 10, movieId: 2, watched: false, rating: 0 };
        await finish(initial, () => {
            requests[0].resolve({ id: 2 });
            requests[1].resolve(operation === "add" ? [] : [savedMovie]);
        });

        const pending = start(() => context.getMovieDetails(2));
        const updatedMovie = { ...savedMovie, watched: true, rating: 1 };
        let mutation;
        await act(async () => {
            if (operation === "add") mutation = context.addMovie(savedMovie);
            else if (operation === "status") {
                mutation = context.setMovieStatus(savedMovie, true, 1);
            } else mutation = context.deleteMovie(10);
        });
        await finish(mutation, () => requests[4].resolve(updatedMovie));
        await finish(pending, () => {
            requests[2].resolve({ id: 2 });
            requests[3].resolve(operation === "add" ? [] : [savedMovie]);
        });

        expect(context.getSavedMovie(2)).toEqual(
            operation === "delete" ? null : updatedMovie
        );
    }
);
