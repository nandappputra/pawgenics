import React, { useState } from "react";
import DogPicture from "./DogPicture.jsx";
import GeneService from "../services/GeneService.mjs";

const Adopt = () => {
  const [adoptedDog, setAdoptedDog] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  const generateDog = async () => {
    const [dog, key] = await GeneService.buildAdoptedDog();
    setAdoptedDog(dog);
    setPrivateKey(key);
  };

  return (
    <div>
      <h1>Adopt</h1>
      <button onClick={generateDog}>Adopt a dog!</button>
      {adoptedDog && <DogPicture dog={adoptedDog} id="dogNew" />}
      {privateKey && <img id="key" src={privateKey} />}
    </div>
  );
};

export default Adopt;
