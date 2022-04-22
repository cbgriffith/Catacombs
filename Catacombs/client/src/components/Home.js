import React from "react";
import { Container } from "reactstrap";

export const Home = () => {
    const user = JSON.parse(sessionStorage.getItem("userProfile"))


    return (
        <div id="background">
            <Container>
                <div className="Home mt-5">
                    {/* <h2>Hello, {user.username}</h2> */}
                    <h2 className="pt-5">Welcome to The Catacombs!</h2>
                    <p>Create a watchlist of horror movies and give your rating on movies you've seen.</p>
                </div>
            </Container>
        </div>
    )
}