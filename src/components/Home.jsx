import { Col, Row, Container } from "react-bootstrap";

const Home = () => {
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <img
            src="/logo.svg"
            width="100"
            height="100"
            className="text-center"
            style={{ margin: "1em" }}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <h1 style={{ padding: "0.5em 0 0.5em 0" }} className="text-center">
            Pawgenics
          </h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <p className="text-center">Adopt & breed adorable digital puppies!</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
