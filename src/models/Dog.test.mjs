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
});
