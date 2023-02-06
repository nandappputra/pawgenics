import React from "react";
import Adopt from "./components/Adopt.jsx";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./components/Home.jsx";
import Breed from "./components/Breed.jsx";

const App = () => {
  const nav = () => {
    return (
      <div>
        <Link style={{ padding: "1em" }} to="/">
          Home
        </Link>
        <Link style={{ padding: "1em" }} to="/adopt">
          Adopt
        </Link>
        <Link style={{ padding: "1em" }} to="/breed">
          Breed
        </Link>
      </div>
    );
  };

  return (
    <div>
      Pawgenics
      {nav()}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/adopt" element={<Adopt />} />
        <Route path="/breed" element={<Breed />} />
      </Routes>
    </div>
  );
};

export default App;
