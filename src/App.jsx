import React from "react";
import Dog from "./models/Dog.mjs";
import DogPicture from "./components/DogPicture";

const App = () => {
  const dogGenes = {
    ear: {
      variant: "ear1",
    },
    head: {
      variant: "head1",
    },
    leftEye: {
      variant: "eye1",
      color: "violet",
    },
    rightEye: {
      variant: "eye1",
    },
    muzzle: {
      variant: "muzzle1",
    },
    mouth: {
      variant: "mouth1",
    },
    nose: {
      variant: "nose1",
    },
  };

  const dog = new Dog(dogGenes);

  return (
    <div>
      Pawgenics
      <DogPicture dog={dog} />
    </div>
  );
};

export default App;
