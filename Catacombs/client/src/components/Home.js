import React from "react";
import { Container } from "reactstrap";

export const Home = () => {
    const user = JSON.parse(sessionStorage.getItem("userProfile"))


    return (

        <Container>
            <div className="Home mt-5">
                {/* <h2>Hello, {user.username}</h2> */}
                <h2 className="pt-5">Welcome to The Catacombs!</h2>
            </div>
        </Container>
    )
}