import Dog from "../models/Dog.mjs";
import DogPicture from "../components/DogPicture";

const Home = () => {
  const dogGenes1 = {
    leftEar: {
      variant: "ear2",
      color: "blue",
      dominance: 0.5,
    },
    rightEar: {
      variant: "ear2",
      color: "blue",
      dominance: 0.5,
    },
    head: {
      variant: "head1",
      color: "lightblue",
      dominance: 0.5,
    },
    leftEye: {
      variant: "eye1",
      color: "red",
      dominance: 0.5,
    },
    rightEye: {
      variant: "eye1",
      color: "red",
      dominance: 0.5,
    },
    muzzle: {
      variant: "muzzle1",
      dominance: 0.5,
      color: "white",
    },
    mouth: {
      variant: "mouth1",
      dominance: 0.5,
      color: "red",
    },
    nose: {
      variant: "nose1",
      dominance: 0.5,
      color: "pink",
    },
  };

  const dogGenes2 = {
    leftEar: {
      variant: "ear1",
      color: "pink",
      dominance: 0.5,
    },
    rightEar: {
      variant: "ear1",
      color: "pink",
      dominance: 0.5,
    },
    head: {
      variant: "head1",
      color: "pink",
      dominance: 0.5,
    },
    leftEye: {
      variant: "eye1",
      color: "violet",
      dominance: 0.5,
    },
    rightEye: {
      variant: "eye1",
      color: "violet",
      dominance: 0.5,
    },
    muzzle: {
      variant: "muzzle1",
      dominance: 0.5,
      color: "white",
    },
    mouth: {
      variant: "mouth1",
      dominance: 0.5,
      color: "red",
    },
    nose: {
      variant: "nose1",
      dominance: 0.5,
      color: "pink",
    },
  };

  const dog1 = new Dog(dogGenes1);
  const dog2 = new Dog(dogGenes2);
  const dog3 = dog1.combine(dog2);

  return (
    <div>
      <DogPicture dog={dog1} id="dog1" />
      <DogPicture dog={dog2} id="dog2" />
      <DogPicture dog={dog3} id="dog3" />
    </div>
  );
};

export default Home;
