import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

import {
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import { METADATA } from "../utils/constants.mjs";
import GeneService from "../services/GeneService.mjs";
import ImageService from "../services/ImageService.mjs";
import DogPicture from "../components/DogPicture";
import { Button, Container, Alert } from "react-bootstrap";
import nacl from "tweetnacl";
import ValidatorService from "../services/ValidatorService.mjs";
import DownloadablePNG from "./DownloadablePNG.jsx";

const GeneratePuppy = () => {
  const [proposal, setProposal] = useState(null);
  const [approval, setApproval] = useState(null);
  const [key, setKey] = useState(null);
  const [puppy, setPuppy] = useState(null);
  const [alert, setAlert] = useState(null);
  const [puppyKey, setPuppyKey] = useState(null);

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

  const receiveApproval = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        ValidatorService.validateApprovalAuthenticity(
          proposal,
          fileReader.result
        );
        setApproval(fileReader.result);
      } catch (error) {
        setAlert("Invalid approval!");
        setTimeout(() => setAlert(null), 5000);
      }
    };
    fileReader.readAsDataURL(image);
  };

  const receiveKey = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setKey(fileReader.result);
    };
    fileReader.readAsDataURL(image);
  };

  const generatePuppy = async () => {
    const proposerDog = ImageService.buildDogFromDataURL(proposal);
    const approverDog = ImageService.buildDogFromDataURL(approval);

    const keyUint8Array = convertPNGDataURLToUint8Array(key);
    const secretKeyString = getMetadataFromUint8Array(
      keyUint8Array,
      METADATA.SECRET_KEY
    );
    const secretKey = convertMetadataStringToUint8Array(secretKeyString);

    const childKeyPair = nacl.sign.keyPair();

    const [pup, puppyKey] = await GeneService.buildDogFromMarriage(
      proposerDog,
      approverDog,
      secretKey,
      childKeyPair
    );
    setPuppy(pup);
    setPuppyKey(puppyKey);
  };

  return (
    <Container className="text-center">
      {puppy === null ? (
        <div>
          {alert && <Alert variant="danger">{alert}</Alert>}
          <div>
            <h4>Place the original proposal here</h4>
            {proposal ? (
              <img src={proposal} />
            ) : (
              <div>
                <FileUploader
                  handleChange={receiveProposal}
                  name="file"
                  types={["PNG"]}
                />
              </div>
            )}
          </div>

          <div>
            {proposal && (
              <div>
                <h4>Place the approval here</h4>
                {approval ? (
                  <img src={approval} />
                ) : (
                  <div>
                    <FileUploader
                      handleChange={receiveApproval}
                      name="file"
                      types={["PNG"]}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {proposal && approval && (
              <div>
                <h4>Place the proposer key here</h4>
                {key ? (
                  <img src={key} />
                ) : (
                  <div>
                    <FileUploader
                      handleChange={receiveKey}
                      name="file"
                      types={["PNG"]}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {proposal && approval && key && (
            <div>
              <Button onClick={generatePuppy}>Generate Puppies!</Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <DogPicture dog={puppy} id="dogPup" />
          <DownloadablePNG imageDataURL={puppyKey} />
        </div>
      )}
    </Container>
  );
};

export default GeneratePuppy;
