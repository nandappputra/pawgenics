import nacl from "tweetnacl";
import Dog from "./Dog.mjs";
import * as metaPNG from "meta-png";
import { convertPNGDataURLToUint8Array } from "../utils/ImageUtils.mjs";

describe("Dog", () => {
  describe("buildDog", () => {
    test("should return a Dog with gene, signed hash, and public key", async () => {
      const name = "testDog";
      const uuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

      const response = await Dog.buildDog(name, uuid);

      const dog = response[0];

      expect(dog.gene).toBeDefined();
      expect(dog.signedHash).toBeDefined();
      expect(dog.publicKey).toBeDefined();
    });

    test("should return a key png with private key in its metadata with the key pawgenics_secretKey", async () => {
      const name = "testDog";
      const uuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

      const response = await Dog.buildDog(name, uuid);

      const privateKeyDataURI = response[1];

      expect(
        metaPNG.default.getMetadata(
          convertPNGDataURLToUint8Array(privateKeyDataURI),
          "pawgenics_secretKey"
        )
      ).toBeDefined();
    });
  });

  describe("buildDogGeneFromHash", () => {
    test("should return a properly formatted gene", () => {
      const encoder = new TextEncoder();

      const name = "testDog";
      const uuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
      const encodedMessage = encoder.encode(`${name}-${uuid}`);
      const hash = nacl.hash(encodedMessage);

      const actualGene = Dog.buildDogGeneFromHash(hash);
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
});
