import React from "react";
import { Route, Routes } from "react-router-dom";
import { MovieList } from "./Movies/MovieList";


export default function ApplicationViews() {
  
   return(
      <Routes>
        <Route path="/" element={<MovieList />} />
      </Routes>
   );
}