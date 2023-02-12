import React from "react";
import Adopt from "./components/Adopt.jsx";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./components/Home.jsx";
import Breed from "./components/Breed.jsx";
import { Container, Navbar, Nav } from "react-bootstrap";

const App = () => {
  const linkStyle = { color: "black", textDecoration: "none" };

  const padding = { padding: "0.5em" };
  const nav = () => {
    return (
      <Navbar bg="light" sticky="top">
        <Container>
          <Navbar.Brand>
            <Link to="/" style={linkStyle}>
              Pawgenics
            </Link>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Item style={padding}>
              <Link to="/adopt" style={linkStyle}>
                Adopt
              </Link>
            </Nav.Item>
            <Nav.Item style={padding}>
              <Link to="/breed" style={linkStyle}>
                Breed
              </Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>
    );
  };

  return (
    <div>
      {nav()}
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/breed" element={<Breed />} />
        </Routes>
      </Container>
    </div>
  );
};

export default App;
