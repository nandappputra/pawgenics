import GenerateApproval from "./GenerateApproval";
import GenerateProposal from "./GenerateProposal";
import GeneratePuppy from "./GeneratePuppy";

const Breed = () => {
  return (
    <div>
      <h1>Breed</h1>
      <GenerateProposal />
      <GenerateApproval />
      <GeneratePuppy />
    </div>
  );
};

export default Breed;
