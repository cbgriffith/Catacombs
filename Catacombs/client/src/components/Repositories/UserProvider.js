import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

const apiUrl = "https://localhost:44377";

async function getErrorMessage(response, fallbackMessage) {
  try {
    const responseBody = await response.json();
    const validationMessage = Object.values(responseBody.errors ?? {})
      .flat()
      .find(Boolean);
    return validationMessage ?? responseBody.title ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function getAntiforgeryToken() {
  const response = await fetch(`${apiUrl}/api/auth/antiforgery-token`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to prepare the secure request.");
  }

  const responseBody = await response.json();
  return responseBody.token;
}

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const isLoggedIn = userProfile !== null;

  const saveUserProfile = (profile) => {
    setUserProfile(profile);
  };

  const clearUserProfile = () => {
    setUserProfile(null);
  };

  useEffect(() => {
    let isCancelled = false;

    fetch(`${apiUrl}/api/auth/me`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (response.status === 401) {
          return null;
        }

        if (!response.ok) {
          throw new Error("Unable to restore the login session.");
        }

        return response.json();
      })
      .then((profile) => {
        if (isCancelled) {
          return;
        }

        if (profile) {
          saveUserProfile(profile);
        } else {
          clearUserProfile();
        }
      })
      .catch(() => {
        if (!isCancelled) {
          clearUserProfile();
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingUser(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    const antiforgeryToken = await getAntiforgeryToken();
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": antiforgeryToken,
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const fallbackMessage = response.status === 429
        ? "Too many login attempts. Please wait a minute and try again."
        : "Invalid email or password.";
      throw new Error(await getErrorMessage(response, fallbackMessage));
    }

    const profile = await response.json();
    saveUserProfile(profile);
    return profile;
  };

  const logout = async () => {
    const antiforgeryToken = await getAntiforgeryToken();
    const response = await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-XSRF-TOKEN": antiforgeryToken,
      },
    });

    if (!response.ok && response.status !== 401) {
      throw new Error(
        await getErrorMessage(response, "Unable to log out.")
      );
    }

    clearUserProfile();
  };

  const register = async (user) => {
    const antiforgeryToken = await getAntiforgeryToken();
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": antiforgeryToken,
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Unable to create the account.")
      );
    }

    return response.json();
  };

  return (
    <UserContext.Provider
      value={{
        isLoadingUser,
        isLoggedIn,
        login,
        logout,
        register,
        userProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
