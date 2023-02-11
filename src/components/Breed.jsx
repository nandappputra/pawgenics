import { Col, Container, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { useState } from "react";

import DisplayInModal from "./DisplayInModal";
import GenerateProposal from "./GenerateProposal";
import GenerateApproval from "./GenerateApproval";
import GeneratePuppy from "./GeneratePuppy";

const Breed = () => {
  const [shownModal, setShownModal] = useState("");

  return (
    <div>
      <DisplayInModal
        show={shownModal === "proposal"}
        onHide={() => setShownModal("")}
        title="Generate Proposal"
        content={<GenerateProposal />}
      />

      <DisplayInModal
        show={shownModal === "approval"}
        onHide={() => setShownModal("")}
        title="Generate Approval"
        content={<GenerateApproval />}
      />

      <DisplayInModal
        show={shownModal === "puppy"}
        onHide={() => setShownModal("")}
        title="Generate Puppies!"
        content={<GeneratePuppy />}
      />

      <h1 style={{ padding: "0.5em 0 0.5em 0" }} className="text-center">
        Breeding
      </h1>
      <p className="text-center">
        Combine your dog with other&apos;s and bring new pup!
      </p>
      <Container>
        <Row>
          <Col>
            <Card
              style={{ width: "18rem", cursor: "pointer" }}
              onClick={() => setShownModal("proposal")}
            >
              <Card.Body>
                <Card.Title className="text-center">Step 1</Card.Title>
                <Card.Subtitle className="mb-2 text-muted text-center">
                  Generate Proposal
                </Card.Subtitle>
                <Card.Text className="text-center">
                  Let the world know that your dog is looking for a partner!
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card
              style={{ width: "18rem", cursor: "pointer" }}
              onClick={() => setShownModal("approval")}
            >
              <Card.Body>
                <Card.Title className="text-center">Step 2</Card.Title>
                <Card.Subtitle className="mb-2 text-muted text-center">
                  Approve The Proposal
                </Card.Subtitle>
                <Card.Text className="text-center">
                  Interested with another dog&apos;s offer? Approve the
                  proposal!
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card
              style={{ width: "18rem", cursor: "pointer" }}
              onClick={() => setShownModal("puppy")}
            >
              <Card.Body>
                <Card.Title className="text-center">Step 3</Card.Title>
                <Card.Subtitle className="mb-2 text-muted text-center">
                  Make Puppies!
                </Card.Subtitle>
                <Card.Text className="text-center">
                  Bring new puppies to the world after you receive their
                  approval!
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Breed;
