import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { CookiesProvider } from "react-cookie";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import "primereact/resources/themes/lara-light-teal/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import MovieForm from "./components/MovieForm";
import MemberForm from "./components/MemberForm";
import HomePage from "./components/HomePage";

ReactDOM.render(
  <CookiesProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:mId/crewMembers" element={<MovieForm />} />
        <Route
          path="/movies/:movieId/crewmembers/:cId"
          element={<MemberForm />}
        />
      </Routes>
    </Router>
  </CookiesProvider>,
  document.getElementById("root")
);
