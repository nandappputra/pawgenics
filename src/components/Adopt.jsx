import React, { useState } from "react";
import DogPicture from "./DogPicture.jsx";
import GeneService from "../services/GeneService.mjs";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import DisplayInModal from "./DisplayInModal.jsx";

const Adopt = () => {
  const [adoptedDog, setAdoptedDog] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [showNearbyDog, setShowNearbyDog] = useState(false);

  const generateDog = async () => {
    const [dog, key] = await GeneService.buildAdoptedDog();
    setAdoptedDog(dog);
    setPrivateKey(key);
    setShowNearbyDog(true);
  };

  const getImageUrl = (name) => {
    return new URL(`../assets/${name}.png`, import.meta.url).href;
  };

  return (
    <Container>
      <DisplayInModal
        show={showNearbyDog}
        onHide={() => setShowNearbyDog(false)}
        title="Dog found!"
        content={
          <div>
            {adoptedDog && <DogPicture dog={adoptedDog} id="dogNew" />}
            {privateKey && <img id="key" src={privateKey} />}
          </div>
        }
      />
      <h1 style={{ padding: "0.5em 0 0.5em 0" }} className="text-center">
        Adopt
      </h1>
      <p className="text-center">Adopt a new dog!</p>
      <Row className="justify-content-md-center text-center">
        <Col md="auto">
          <Card
            style={{ width: "18rem", cursor: "pointer" }}
            onClick={generateDog}
          >
            <Card.Body className="justify-content-md-center">
              <Card.Title className="text-center">Look Around</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Find nearby puppies
              </Card.Subtitle>
              <Card.Text className="text-center">
                There might be a good dog waiting for you!
              </Card.Text>
              <img src={getImageUrl("map")} style={{ width: "15rem" }} />

              <Button onClick={generateDog} style={{ margin: "1em" }}>
                Adopt a dog!
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Adopt;
