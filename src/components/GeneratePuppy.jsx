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

const GeneratePuppy = () => {
  const [proposal, setProposal] = useState(null);
  const [approval, setApproval] = useState(null);
  const [key, setKey] = useState(null);
  const [puppy, setPuppy] = useState(null);
  const [puppyKey, setPuppyKey] = useState(null);

  const receiveProposal = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setProposal(fileReader.result);
    };
    fileReader.readAsDataURL(image);
  };

  const receiveApproval = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setApproval(fileReader.result);
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

    const [pup, puppyKey] = await GeneService.buildDogFromMarriage(
      proposerDog,
      approverDog,
      secretKey
    );
    setPuppy(pup);
    setPuppyKey(puppyKey);
  };

  return (
    <div>
      <h2>3. Generate puppies!</h2>
      {proposal ? (
        <img src={proposal} />
      ) : (
        <div>
          <h3>Place the original proposal here</h3>
          <FileUploader
            handleChange={receiveProposal}
            name="file"
            types={["PNG"]}
          />
        </div>
      )}

      {proposal &&
        (approval ? (
          <img src={approval} />
        ) : (
          <div>
            <h3>Place the approval here</h3>
            <FileUploader
              handleChange={receiveApproval}
              name="file"
              types={["PNG"]}
            />
          </div>
        ))}

      {proposal &&
        approval &&
        (key ? (
          <img src={key} />
        ) : (
          <div>
            <h3>Place the proposer key here</h3>
            <FileUploader
              handleChange={receiveKey}
              name="file"
              types={["PNG"]}
            />
          </div>
        ))}

      {proposal && approval && key && (
        <div>
          <h3>Click here to generate puppies!</h3>
          <button onClick={generatePuppy}>Generate Puppies!</button>
        </div>
      )}

      {puppy && (
        <div>
          <DogPicture dog={puppy} id="dogPup" />
          <img src={puppyKey} />
        </div>
      )}
    </div>
  );
};

export default GeneratePuppy;
