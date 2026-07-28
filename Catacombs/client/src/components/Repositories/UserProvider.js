import React, { useState, createContext } from "react";

export const UserContext = createContext();

export function UserProvider(props) {
  //user state holds list of users from API
  const [userProfiles, setUserProfiles] = useState([])
  const apiUrl = "https://localhost:44377";
  const userProfile = sessionStorage.getItem("userProfile");
  const [isLoggedIn, setIsLoggedIn] = useState(userProfile != null);


  const login = (userObject) => {
    return fetch(`${apiUrl}/api/users/getbyemail?email=${userObject.email}`)
      .then((r) => r.json())
      .then((userProfile) => {
        if (userProfile.id) {
          sessionStorage.setItem("userProfile", JSON.stringify(userProfile));
          setIsLoggedIn(true);
          return userProfile
        }
        else {
          return undefined
        }
      });
  };

  const logout = () => {
    sessionStorage.clear()
    setIsLoggedIn(false);
  };

  const register = (userObject) => {
    return fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userObject),
    })
      .then(async (response) => {
        const responseBody = await response.json();

        if (!response.ok) {
          throw new Error(
            responseBody.title ?? "Unable to create the account."
          );
        }

        return responseBody;
      });
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, login, logout, register, setUserProfiles, userProfiles }}>
      {props.children}
    </UserContext.Provider>
  );
}
