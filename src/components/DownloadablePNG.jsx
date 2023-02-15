import { Col, Container, Row, Button } from "react-bootstrap";

const DownloadablePNG = (props) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = props.imageDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto">
          {props.imageDataURL !== null && <img src={props.imageDataURL} />}
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Button onClick={handleDownload} style={{ margin: "1em" }}>
            download
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default DownloadablePNG;
