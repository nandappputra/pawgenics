import { useState } from "react";
import { Container } from "react-bootstrap";
import { FileUploader } from "react-drag-drop-files";
import { v4 as uuidv4 } from "uuid";
import { Button } from "react-bootstrap";

import ImageService from "../services/ImageService.mjs";
import { METADATA } from "../utils/constants.mjs";
import {
  convertPNGDataURLToUint8Array,
  convertMetadataStringToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import DownloadalbePNG from "./DownloadablePNG.jsx";

const GenerateProposal = () => {
  const [dog, setDog] = useState(null);
  const [key, setKey] = useState(null);
  const [proposal, setProposal] = useState(null);

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
      setKey(fileReader.result);
    };
    fileReader.readAsDataURL(image);
  };

  const generateProposalImage = async () => {
    const keyUint8Array = convertPNGDataURLToUint8Array(key);
    const secretKeyString = getMetadataFromUint8Array(
      keyUint8Array,
      METADATA.SECRET_KEY
    );

    const secretKey = convertMetadataStringToUint8Array(secretKeyString);
    const encoder = new TextEncoder();
    const uuid = encoder.encode(uuidv4());
    setProposal(await ImageService.generateProposalPNG(dog, secretKey, uuid));
  };

  const style = { padding: "0.75em" };

  return (
    <Container className="text-center">
      {proposal === null ? (
        <div>
          <div style={style}>
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

          <div style={style}>
            {dog && (
              <div>
                <h4>Place your key here</h4>
                {key ? (
                  <div>
                    <img src={key} />
                  </div>
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

          {dog && key && (
            <div>
              <Button onClick={generateProposalImage}>Generate Proposal</Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Your proposal is ready!</h3>
          <p>Save and share them with the world!</p>
          <DownloadalbePNG imageDataURL={proposal} />
        </div>
      )}
    </Container>
  );
};

export default GenerateProposal;
