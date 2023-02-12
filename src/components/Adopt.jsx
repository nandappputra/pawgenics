import React, { useState } from "react";
import DogPicture from "./DogPicture.jsx";
import GeneService from "../services/GeneService.mjs";
import { Button, Container, Row, Col, Card } from "react-bootstrap";

const Adopt = () => {
  const [adoptedDog, setAdoptedDog] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  const generateDog = async () => {
    const [dog, key] = await GeneService.buildAdoptedDog();
    setAdoptedDog(dog);
    setPrivateKey(key);
  };

  return (
    <Container>
      <h1 style={{ padding: "0.5em 0 0.5em 0" }} className="text-center">
        Adopt
      </h1>
      <p className="text-center">Adopt a new dog!</p>
      <Row className="justify-content-md-center text-center">
        <Col md="auto">
          <Card style={{ width: "18rem", cursor: "pointer" }}>
            <Card.Body className="justify-content-md-center">
              <Card.Title className="text-center">Look Around</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                There might be a good dog waiting for you!
              </Card.Subtitle>
              <Button onClick={generateDog}>Adopt a dog!</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {adoptedDog && <DogPicture dog={adoptedDog} id="dogNew" />}
      {privateKey && <img id="key" src={privateKey} />}
    </Container>
  );
};

export default Adopt;
