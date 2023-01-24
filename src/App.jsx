import React from "react";
import Dog from "./components/Dog";

const App = () => {
  const dog = {
    ear: {
      variant: "ear1",
    },
    head: {
      variant: "head1",
    },
    leftEye: {
      variant: "eye1",
      color: "blue",
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

  return (
    <div>
      Pawgenics
      <Dog dog={dog} />
    </div>
  );
};

export default App;
