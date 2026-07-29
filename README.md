# Catacombs

Catacombs is a horror movie discovery and tracking website. It started as my
coding bootcamp final project and is now being updated with a modern frontend,
a secure account system, PostgreSQL, and current .NET tooling.

The site uses movie data from [TMDB](https://www.themoviedb.org/) and lets each
user build their own horror movie collection.

## Features

- Browse Top Rated, Most Popular, Hidden Gems, Now Playing, and Coming Soon
  horror movies
- Search for movies
- Watch trailers directly from the site when one is available
- View IMDb and social links when they are available
- Save movies to a personal watch list
- Track watched, liked, and disliked movies
- View similar movies based on genres and keywords
- Create an account, log in securely, and change your password
- Browse paginated movie lists with a responsive card layout

## Built With

- React 18
- React Router
- Reactstrap and Bootstrap
- SweetAlert2
- Font Awesome
- ASP.NET Core on .NET 10
- PostgreSQL with Npgsql
- xUnit
- TMDB API

## Project Layout

```text
Catacombs/
|-- Catacombs/          ASP.NET Core API
|   |-- client/         React application
|   `-- Database/       Automatic PostgreSQL migrations
|-- Catacombs.Tests/    Backend and security tests
`-- Catacombs.sln
```

## Requirements

Install these before running the project:

- [Git](https://git-scm.com/downloads)
- [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
- [Node.js and npm](https://nodejs.org/en/download)
- [PostgreSQL](https://www.postgresql.org/download/) 17 or newer
- A [TMDB account and API Read Access Token](https://developer.themoviedb.org/docs/authentication-application)

Visual Studio Community with the **ASP.NET and web development** workload is
recommended on Windows. VS Code also works well for the React client.

## Local Setup

### 1. Clone the repository

```powershell
git clone https://github.com/cbgriffith/Catacombs.git
cd Catacombs
```

### 2. Create the PostgreSQL database

Connect to PostgreSQL as an administrator in pgAdmin or `psql`, then create a
local application login and database:

```sql
CREATE ROLE catacombs_app
    WITH LOGIN PASSWORD 'CHOOSE_A_LOCAL_PASSWORD';

CREATE DATABASE catacombs
    OWNER catacombs_app;
```

Only run these statements when the role and database do not already exist.
The application creates and updates its tables automatically when the backend
starts.

### 3. Add local secrets

Do not place database passwords or TMDB tokens in `appsettings.json`.

In Visual Studio, right-click the **Catacombs** project and select
**Manage User Secrets**. Use this structure and replace the placeholder values:

```json
{
  "ConnectionStrings:Catacombs": "Host=localhost;Port=5432;Database=catacombs;Username=catacombs_app;Password=YOUR_LOCAL_PASSWORD",
  "Tmdb": {
    "ReadAccessToken": "YOUR_TMDB_READ_ACCESS_TOKEN"
  }
}
```

PostgreSQL normally uses port `5432`. If your installation uses another port,
such as `5433`, update the connection string to match it.

The same values can be added from the repository root with the .NET CLI:

```powershell
dotnet user-secrets set "ConnectionStrings:Catacombs" "Host=localhost;Port=5432;Database=catacombs;Username=catacombs_app;Password=YOUR_LOCAL_PASSWORD" --project .\Catacombs\Catacombs.csproj

dotnet user-secrets set "Tmdb:ReadAccessToken" "YOUR_TMDB_READ_ACCESS_TOKEN" --project .\Catacombs\Catacombs.csproj
```

The application uses the **API Read Access Token**, not the shorter TMDB API
key.

### 4. Restore dependencies

Restore the backend packages from the repository root:

```powershell
dotnet restore .\Catacombs.sln
```

Then install the React packages:

```powershell
cd .\Catacombs\client
npm ci
cd ..\..
```

If PowerShell blocks `npm`, use `npm.cmd` instead.

### 5. Start the backend

The React client currently expects the API at `https://localhost:44377`.
The easiest way to use that address is:

1. Open `Catacombs.sln` in Visual Studio.
2. Make sure **Catacombs** is the startup project.
3. Select **IIS Express**.
4. Press the play button.

Swagger should open at:

```text
https://localhost:44377/swagger
```

The database health check is available at:

```text
https://localhost:44377/health
```

### 6. Start the React client

Keep the backend running. Open a second terminal from the repository root:

```powershell
cd .\Catacombs\client
npm start
```

If PowerShell blocks `npm`, run:

```powershell
npm.cmd start
```

The React site should open at:

```text
http://localhost:3000
```

Create a local account from the registration page, then log in to begin using
the site.

## Testing

The backend tests use the configured PostgreSQL database and remove the test
accounts they create.

Run all backend tests from the repository root:

```powershell
dotnet test .\Catacombs.sln
```

Create a production React build:

```powershell
cd .\Catacombs\client
npm run build
```

Use `npm.cmd run build` if PowerShell blocks the npm script.

## Keeping Secrets Safe

- Keep the PostgreSQL password and TMDB token in .NET User Secrets during local
  development.
- Never commit a real password, API key, access token, or connection string.
- Use separate hosted configuration or environment variables if the project is
  deployed later.
- TMDB requests are sent through the ASP.NET Core backend so the token is not
  exposed in the React application.

## TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie information, artwork, ratings, videos, and related metadata are provided
by [The Movie Database](https://www.themoviedb.org/). See the
[TMDB attribution requirements](https://developer.themoviedb.org/docs/faq) for
more information.

## Project Status

Catacombs is an actively updated personal project. It is intended for local
development and is not currently configured as a public production website.
