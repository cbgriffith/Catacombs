import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import ApplicationViews from "./components/ApplicationViews";
import { MovieProvider } from './components/Movies/MovieProvider';

function App() {
  return (
    <Router>
      <MovieProvider>
        <ApplicationViews />
      </MovieProvider>
    </Router >
  );
}

export default App;