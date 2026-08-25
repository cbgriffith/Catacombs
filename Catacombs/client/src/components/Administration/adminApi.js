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

export async function getAdminUsers() {
  const response = await fetch(`${apiUrl}/api/admin/users`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to open the account archive."
      )
    );
  }

  return response.json();
}

export async function banAdminUser(userId, reason) {
  const antiforgeryToken = await getAntiforgeryToken();
  const response = await fetch(`${apiUrl}/api/admin/users/${userId}/ban`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": antiforgeryToken,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to ban this account.")
    );
  }

  return response.json();
}

export async function unbanAdminUser(userId) {
  const antiforgeryToken = await getAntiforgeryToken();
  const response = await fetch(`${apiUrl}/api/admin/users/${userId}/ban`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "X-XSRF-TOKEN": antiforgeryToken,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to restore this account.")
    );
  }

  return response.json();
}
