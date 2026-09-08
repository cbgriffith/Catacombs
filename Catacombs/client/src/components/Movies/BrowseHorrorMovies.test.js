import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import {
    Link, MemoryRouter, Route, Routes, useLocation
} from "react-router-dom";
import { MovieContext } from "../Repositories/MovieProvider";
import { BrowseHorrorMovies } from "./BrowseHorrorMovies";

jest.mock("./MovieCard", () => ({ MovieCard: () => null }));

let root;
let container;
let suggestions;
let getHorrorMovieSuggestion;
const originalActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;

function Location() {
    const location = useLocation();
    return <output data-testid="location">{location.pathname}{location.search}</output>;
}

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    suggestions = [];
    getHorrorMovieSuggestion = jest.fn(() => new Promise((resolve, reject) => {
        suggestions.push({ resolve, reject });
    }));
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
});

async function openBrowse(path = "/movies/browse?decade=1980&runtime=Short") {
    const movies = {
        movies: [{ id: 1, title: "A horror movie" }],
        moviePage: { page: 1, totalPages: 1, totalResults: 1 },
        browseHorrorMovies: jest.fn().mockResolvedValue({}),
        getHorrorMovieSuggestion,
        isLoadingMovies: false,
        movieLoadError: ""
    };
    await act(async () => {
        root.render(
            <MemoryRouter initialEntries={[path]}>
                <MovieContext.Provider value={movies}>
                    <Location />
                    <Routes>
                        <Route path="/movies/browse" element={<BrowseHorrorMovies />} />
                        <Route path="/movies/search" element={
                            <Link to="/movies/browse?decade=1980&runtime=Short">
                                Return to browse
                            </Link>
                        } />
                        <Route path="/movies/details/:id" element={<p>Movie details</p>} />
                    </Routes>
                </MovieContext.Provider>
            </MemoryRouter>
        );
    });
}

async function clickButton(name) {
    await act(async () => { fireEvent.click(screen.getByRole("button", { name })); });
}

async function clickLink(name) {
    await act(async () => { fireEvent.click(screen.getByRole("link", { name })); });
}

async function applyNewDecade() {
    act(() => {
        fireEvent.change(screen.getByLabelText("Release decade"), {
            target: { value: "1990" }
        });
    });
    await clickButton("Apply filters");
}

test("a current suggestion opens movie details using the applied filters", async () => {
    await openBrowse();
    await clickButton("Surprise me");
    expect(getHorrorMovieSuggestion).toHaveBeenCalledWith({
        decade: "1980", minimumRating: "0", minimumVotes: "0",
        minimumRuntime: "", maximumRuntime: "89", sort: "Popular"
    }, 1);
    expect(screen.getByRole("button", { name: "Choosing your fate..." })).toBeDisabled();

    await act(async () => { suggestions[0].resolve({ id: 42 }); });
    expect(screen.getByTestId("location")).toHaveTextContent("/movies/details/42");
});

test("leaving Browse Horror prevents a late suggestion from navigating", async () => {
    await openBrowse();
    await clickButton("Surprise me");
    await clickLink("Search by title");
    await act(async () => { suggestions[0].resolve({ id: 42 }); });

    expect(screen.getByTestId("location")).toHaveTextContent("/movies/search");
});

test("returning to the same filters does not revive a previous visit's suggestion", async () => {
    await openBrowse();
    await clickButton("Surprise me");
    await clickLink("Search by title");
    await clickLink("Return to browse");
    await act(async () => { suggestions[0].resolve({ id: 42 }); });

    expect(screen.getByTestId("location")).toHaveTextContent(
        "/movies/browse?decade=1980&runtime=Short"
    );
    expect(screen.getByRole("button", { name: "Surprise me" })).toBeEnabled();
});

test.each(["apply", "reset"])(
    "%s filters discards an old suggestion and allows a fresh choice",
    async (action) => {
        await openBrowse();
        await clickButton("Surprise me");
        if (action === "apply") await applyNewDecade();
        else await clickButton("Reset filters");

        expect(screen.getByRole("button", { name: "Surprise me" })).toBeEnabled();
        await act(async () => { suggestions[0].resolve({ id: 42 }); });

        expect(screen.getByTestId("location").textContent).toBe(
            action === "apply"
                ? "/movies/browse?decade=1990&runtime=Short"
                : "/movies/browse"
        );
    }
);

test("late suggestion errors are ignored after the applied filters change", async () => {
    await openBrowse();
    await clickButton("Surprise me");
    await applyNewDecade();
    await act(async () => { suggestions[0].reject(new Error("Old failure")); });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Surprise me" })).toBeEnabled();
});

test.each(["success", "failure"])(
    "an old %s cannot navigate or finish the loading state of a newer choice",
    async (outcome) => {
        await openBrowse();
        await clickButton("Surprise me");
        await applyNewDecade();
        await clickButton("Surprise me");
        expect(getHorrorMovieSuggestion).toHaveBeenLastCalledWith(
            expect.objectContaining({ decade: "1990" }), 1
        );

        await act(async () => {
            if (outcome === "success") suggestions[0].resolve({ id: 42 });
            else suggestions[0].reject(new Error("Old failure"));
        });

        expect(screen.getByTestId("location")).toHaveTextContent("/movies/browse");
        expect(screen.getByRole("button", { name: "Choosing your fate..." })).toBeDisabled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        await act(async () => { suggestions[1].resolve({ id: 99 }); });
        expect(screen.getByTestId("location")).toHaveTextContent("/movies/details/99");
    }
);

test("a current failure displays its message and allows a successful retry", async () => {
    await openBrowse();
    await clickButton("Surprise me");
    await act(async () => { suggestions[0].reject(new Error("Please try again")); });
    expect(screen.getByRole("alert")).toHaveTextContent("Please try again");
    expect(screen.getByRole("button", { name: "Surprise me" })).toBeEnabled();

    await clickButton("Surprise me");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => { suggestions[1].resolve({ id: 99 }); });
    expect(screen.getByTestId("location")).toHaveTextContent("/movies/details/99");
});

test("editing unapplied filters leaves the current suggestion valid", async () => {
    await openBrowse();
    await clickButton("Surprise me");
    act(() => {
        fireEvent.change(screen.getByLabelText("Release decade"), {
            target: { value: "1990" }
        });
    });
    await act(async () => { suggestions[0].resolve({ id: 42 }); });

    expect(screen.getByTestId("location")).toHaveTextContent("/movies/details/42");
});
