import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import ApplicationViews from "./components/ApplicationViews";
import { MovieProvider } from './components/Movies/MovieProvider';
import { UserProvider } from './components/Users/UserProvider';

function App() {
  return (
    <Router>
      <MovieProvider>
        <UserProvider>
          <ApplicationViews />
        </UserProvider>
      </MovieProvider>
    </Router >
  );
}

export default App;