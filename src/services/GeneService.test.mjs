import nacl from "tweetnacl";
import { appendHash } from "../utils/GeneUtil.mjs";

import GeneService from "./GeneService.mjs";
import {
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
  addMetadataFromBase64DataURL,
} from "../utils/ImageUtil.mjs";
import ValidatorService from "./ValidatorService.mjs";
import { METADATA } from "../utils/constants.mjs";

describe("GeneService", () => {
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

  describe("generateSignedMarriageHashFromApproval", () => {
    test("should return a hash that can be opened with public key", () => {
      const encoder = new TextEncoder();

      const encodedMessage = encoder.encode("seed");
      const mockApprovalHash = nacl.hash(encodedMessage);
      const keyPair = nacl.sign.keyPair();

      const actualResult = GeneService.generateSignedMarriageHashFromApproval(
        mockApprovalHash,
        keyPair.publicKey,
        keyPair.secretKey
      );
      const expectedResult = nacl.hash(
        appendHash([mockApprovalHash, keyPair.publicKey])
      );

      expect(nacl.sign.open(actualResult, keyPair.publicKey)).toStrictEqual(
        expectedResult
      );
    });
  });

  describe("generateMarriageHashFromParents", () => {
    test("should return deterministic hash based on marriage id and parent information", () => {
      const encoder = new TextEncoder();

      const date = new Date("05 Feb 2023 00:00:00 GMT");
      const marriageId = encoder.encode(date.valueOf);
      const publicKey1 = new Uint8Array([
        26, 129, 98, 68, 16, 203, 8, 246, 79, 22, 179, 15, 50, 217, 227, 115,
        166, 5, 100, 135, 201, 75, 163, 220, 151, 255, 213, 92, 68, 242, 16,
        168,
      ]);
      const publicKey2 = new Uint8Array([
        [
          121, 56, 13, 2, 72, 13, 34, 100, 245, 205, 120, 203, 241, 9, 108, 120,
          28, 201, 187, 85, 254, 176, 137, 38, 169, 120, 47, 134, 65, 171, 20,
          151,
        ],
      ]);

      const actualResult = GeneService.generateMarriageHashFromParents(
        marriageId,
        publicKey1,
        publicKey2
      );
      const expectedResult = new Uint8Array([
        167, 129, 242, 88, 68, 110, 73, 18, 19, 175, 65, 164, 22, 39, 237, 236,
        225, 82, 88, 129, 214, 171, 116, 132, 39, 28, 161, 206, 27, 80, 182, 28,
        249, 11, 247, 113, 200, 28, 188, 40, 134, 195, 186, 137, 255, 0, 97, 19,
        43, 167, 253, 182, 110, 177, 136, 159, 54, 246, 115, 174, 73, 10, 233,
        218,
      ]);

      expect(actualResult).toStrictEqual(expectedResult);
    });
  });

  describe("generateDogHashFromParents", () => {
    test("should return deterministic hash based on marriage id and parent hash", () => {
      const marriageHash = new Uint8Array([
        167, 129, 242, 88, 68, 110, 73, 18, 19, 175, 65, 164, 22, 39, 237, 236,
        225, 82, 88, 129, 214, 171, 116, 132, 39, 28, 161, 206, 27, 80, 182, 28,
        249, 11, 247, 113, 200, 28, 188, 40, 134, 195, 186, 137, 255, 0, 97, 19,
        43, 167, 253, 182, 110, 177, 136, 159, 54, 246, 115, 174, 73, 10, 233,
        218,
      ]);
      const hash1 = new Uint8Array([1, 2, 3]);
      const hash2 = new Uint8Array([4, 5, 6]);

      const actualResult = GeneService.generateDogHashFromParents(
        marriageHash,
        hash1,
        hash2
      );
      const expectedResult = new Uint8Array([
        207, 131, 225, 53, 126, 239, 184, 189, 241, 84, 40, 80, 214, 109, 128,
        7, 214, 32, 228, 5, 11, 87, 21, 220, 131, 244, 169, 33, 211, 108, 233,
        206, 71, 208, 209, 60, 93, 133, 242, 176, 255, 131, 24, 210, 135, 126,
        236, 47, 99, 185, 49, 189, 71, 65, 122, 129, 165, 56, 50, 122, 249, 39,
        218, 62,
      ]);

      expect(actualResult).toStrictEqual(expectedResult);
    });
  });

  describe("buildAdoptedDog", () => {
    test("should return a valid dog", async () => {
      const adoptedDogWithKey = await GeneService.buildAdoptedDog();

      ValidatorService.validateDogAuthenticity(adoptedDogWithKey[0]);
    });

    test("should return a PNG with secret key in its metadata", async () => {
      const adoptedDogWithKey = await GeneService.buildAdoptedDog();

      const pngUint8Array = convertPNGDataURLToUint8Array(adoptedDogWithKey[1]);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_secretKey")
      ).toBeDefined();
    });
  });
});
