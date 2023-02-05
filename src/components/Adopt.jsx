import React, { useState } from "react";
import Dog from "../models/Dog.mjs";
import { v4 as uuidv4 } from "uuid";
import DogPicture from "./DogPicture.jsx";

const Adopt = () => {
  const [adoptedDog, setAdoptedDog] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);

  const generateDog = async () => {
    const [dog, key] = await Dog.buildDog("test", uuidv4());
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
