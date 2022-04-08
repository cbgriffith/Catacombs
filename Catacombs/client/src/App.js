import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import ApplicationViews from "./components/ApplicationViews";
import { MovieProvider } from './components/Movies/MovieProvider';
import { UserProvider } from './components/Users/UserProvider';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <MovieProvider>
        <UserProvider>
          <Header />
          <ApplicationViews />
        </UserProvider>
      </MovieProvider>
    </Router >
  );
}

export default App;