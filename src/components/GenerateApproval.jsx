import { useState } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { FileUploader } from "react-drag-drop-files";

import ImageService from "../services/ImageService.mjs";
import ValidatorService from "../services/ValidatorService.mjs";
import DownloadalbePNG from "./DownloadablePNG.jsx";

const GenerateApproval = () => {
  const [proposal, setProposal] = useState(null);
  const [dog, setDog] = useState(null);
  const [key, setKey] = useState(null);
  const [alert, setAlert] = useState(null);
  const [approval, setApproval] = useState(null);

  const receiveProposal = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        ValidatorService.validateProposalAuthenticity(fileReader.result);
        setProposal(fileReader.result);
      } catch (error) {
        setAlert("Invalid proposal!");
        setTimeout(() => setAlert(null), 5000);
      }
    };
    fileReader.readAsDataURL(image);
  };

  const receiveDog = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setDog(fileReader.result);
    };
    fileReader.readAsDataURL(image);
  };

  const receiveKey = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        ValidatorService.validateKeyAuthenticity(dog, fileReader.result);
        setKey(fileReader.result);
      } catch (error) {
        setAlert("Invalid key!");
        setTimeout(() => setAlert(null), 5000);
      }
    };
    fileReader.readAsDataURL(image);
  };

  const generateApprovalImage = async () => {
    setApproval(await ImageService.generateApprovalPNG(proposal, dog, key));
  };

  const style = { padding: "0.75em" };

  return (
    <Container className="text-center">
      {approval === null ? (
        <div>
          {alert && <Alert variant="danger">{alert}</Alert>}
          <div style={style}>
            <h4>Place the proposal here</h4>
            {proposal ? (
              <img src={proposal} style={{ borderRadius: "10%" }} />
            ) : (
              <FileUploader
                handleChange={receiveProposal}
                name="file"
                types={["PNG"]}
              />
            )}
          </div>

          <div style={style}>
            {proposal && (
              <div>
                <h4>Place your dog here</h4>
                {dog ? (
                  <img src={dog} style={{ borderRadius: "10%" }} />
                ) : (
                  <FileUploader
                    handleChange={receiveDog}
                    name="file"
                    types={["PNG"]}
                  />
                )}
              </div>
            )}
          </div>

          <div style={style}>
            {dog && (
              <div>
                <h4>Place your key here</h4>
                {key ? (
                  <img src={key} />
                ) : (
                  <FileUploader
                    handleChange={receiveKey}
                    name="file"
                    types={["PNG"]}
                  />
                )}
              </div>
            )}
          </div>

          {proposal && dog && key && (
            <div>
              <Button onClick={generateApprovalImage}>Approve!</Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Your approval is ready!</h3>
          <p>Save and share your approval to the original proposer!</p>
          <DownloadalbePNG imageDataURL={approval} />
        </div>
      )}
    </Container>
  );
};

export default GenerateApproval;
