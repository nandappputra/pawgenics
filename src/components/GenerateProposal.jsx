import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { v4 as uuidv4 } from "uuid";

import ImageService from "../services/ImageService.mjs";
import {
  convertPNGDataURLToUint8Array,
  convertMetadataStringToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";

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

  const generateProposalImage = () => {
    const keyUint8Array = convertPNGDataURLToUint8Array(key);
    const secretKeyString = getMetadataFromUint8Array(
      keyUint8Array,
      "pawgenics_secretKey"
    );

    const secretKey = convertMetadataStringToUint8Array(secretKeyString);
    const encoder = new TextEncoder();
    const uuid = encoder.encode(uuidv4());
    setProposal(ImageService.generateProposalPNG(dog, secretKey, uuid));
  };

  return (
    <div>
      <h2>1. Generate proposal</h2>
      <h3>Place your dog here</h3>
      {dog ? (
        <img src={dog} />
      ) : (
        <FileUploader handleChange={receiveDog} name="file" types={["PNG"]} />
      )}
      {dog &&
        (key ? (
          <div>
            <img src={key} />
          </div>
        ) : (
          <div>
            <h3>Place your key here</h3>
            <FileUploader
              handleChange={receiveKey}
              name="file"
              types={["PNG"]}
            />
          </div>
        ))}
      {dog && key && (
        <div>
          <h3>Click here to generate your proposal!</h3>
          <button onClick={generateProposalImage}>Generate Proposal</button>
        </div>
      )}
      {proposal && (
        <div>
          <h3>Your proposal is ready!</h3>
          <img src={proposal} />
        </div>
      )}
    </div>
  );
};

export default GenerateProposal;
