import nacl from "tweetnacl";

import GeneService from "./GeneService.mjs";

describe("buildDogGeneFromHash", () => {
  test("should return a properly formatted gene", () => {
    const encoder = new TextEncoder();

    const name = "testDog";
    const uuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
    const encodedMessage = encoder.encode(`${name}-${uuid}`);
    const hash = nacl.hash(encodedMessage);

    const actualGene = GeneService.buildDogGeneFromHash(hash);
    const expectedGene = {
      leftEar: { variant: "ear2", color: "rgb(242,219,14)" },
      rightEar: { variant: "ear2", color: "rgb(242,219,14)" },
      head: { variant: "head1", color: "rgb(28,134,102)" },
      leftEye: { variant: "eye1", color: "rgb(155,106,206)" },
      rightEye: { variant: "eye1", color: "rgb(155,106,206)" },
      muzzle: { variant: "muzzle1", color: "rgb(161,97,192)" },
      mouth: { variant: "mouth1", color: "rgb(239,242,135)" },
      nose: { variant: "nose1", color: "rgb(65,142,1)" },
    };

    expect(actualGene).toStrictEqual(expectedGene);
  });
});
