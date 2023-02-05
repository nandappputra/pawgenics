import nacl from "tweetnacl";
import { appendHash } from "../utils/GeneUtil.mjs";

import GeneService from "./GeneService.mjs";

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
});
