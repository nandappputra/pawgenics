import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import ImageService from "../services/ImageService.mjs";

const GenerateApproval = () => {
  const [proposal, setProposal] = useState(null);
  const [dog, setDog] = useState(null);
  const [key, setKey] = useState(null);
  const [approval, setApproval] = useState(null);

  const receiveProposal = (image) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setProposal(fileReader.result);
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
      setKey(fileReader.result);
    };
    fileReader.readAsDataURL(image);
  };

  const generateApprovalImage = () => {
    setApproval(ImageService.generateApprovalPNG(proposal, dog, key));
  };

  return (
    <div>
      <h2>2. Approve Proposal</h2>
      {proposal ? (
        <div>
          <img src={proposal} />
        </div>
      ) : (
        <div>
          <h3>Place the proposal here</h3>
          <FileUploader
            handleChange={receiveProposal}
            name="file"
            types={["PNG"]}
          />
        </div>
      )}

      {proposal &&
        (dog ? (
          <div>
            <img src={dog} />
          </div>
        ) : (
          <div>
            <h3>Place your dog here</h3>
            <FileUploader
              handleChange={receiveDog}
              name="file"
              types={["PNG"]}
            />
          </div>
        ))}

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

      {proposal && dog && key && (
        <div>
          <h3>Click to approve proposal!</h3>
          <button onClick={generateApprovalImage}>Approve!</button>
        </div>
      )}

      {approval && (
        <div>
          <img src={approval} />
        </div>
      )}
    </div>
  );
};

export default GenerateApproval;
