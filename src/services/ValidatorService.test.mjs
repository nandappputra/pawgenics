import * as metaPNG from "meta-png";

import ValidatorService from "./ValidatorService.mjs";
import Dog from "../models/Dog.mjs";
import nacl from "tweetnacl";
import { appendHash } from "../utils/GeneUtil.mjs";

describe("ValidatorService", () => {
  const BLANK = null;

  describe("validateMetadataPresence", () => {
    test("should not throw error when there is no missing key", async () => {
      let dataURL = generateDataURLWithoutMetadata();

      const gene = { test: "hi" };
      const signedHash = new Uint8Array([1, 2, 3]);
      const publicKey = new Uint8Array([4, 5]);
      const parent1Gene = { parent1: "hi" };
      const parent2Gene = { parent2: "hi" };
      const parent2PublicKey = new Uint8Array([6, 7]);
      const parent1SignedHash = new Uint8Array([8, 9]);
      const parent2SignedHash = new Uint8Array([10, 11]);
      const parentMarriageHash = new Uint8Array([12, 13]);

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(gene)
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_signedHash",
        signedHash
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_publicKey",
        publicKey
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent1Gene",
        JSON.stringify(parent1Gene)
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent2Gene",
        JSON.stringify(parent2Gene)
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent2PublicKey",
        parent2PublicKey
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent1SignedHash",
        parent1SignedHash
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent2SignedHash",
        parent2SignedHash
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parentMarriageHash",
        parentMarriageHash
      );

      ValidatorService.validateMetadataPresence(dataURL);
    });

    test("should throw an error when there is a missing key", async () => {
      let dataURL = generateDataURLWithoutMetadata();

      const gene = { test: "hi" };

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(gene)
      );

      expect(() => {
        ValidatorService.validateMetadataPresence(dataURL);
      }).toThrow();
    });
  });

  describe("validateDogAuthenticity", () => {
    test("should throw an error when one of the parent hashes cannot be verified", async () => {
      const keyPair1 = nacl.sign.keyPair();
      const keyPair2 = nacl.sign.keyPair();

      const textEncoder = new TextEncoder();

      const message = textEncoder.encode("test dna");
      const mockParent1Hash = nacl.sign(message, keyPair1.secretKey);
      const mockParent2Hash = nacl.sign(message, keyPair2.secretKey);
      const faultyPublicKey = keyPair1.publicKey;

      const dog = new Dog(
        BLANK,
        BLANK,
        keyPair1.publicKey,
        BLANK,
        BLANK,
        faultyPublicKey,
        mockParent1Hash,
        mockParent2Hash,
        BLANK
      );

      expect(() => {
        ValidatorService.validateDogAuthenticity(dog);
      }).toThrow("invalid parent hash");
    });

    test("should throw an error when the marriage id cannot be opened with parent 2 public key", async () => {
      const keyPair1 = nacl.sign.keyPair();
      const keyPair2 = nacl.sign.keyPair();

      const textEncoder = new TextEncoder();

      const message = textEncoder.encode("test dna");
      const mockParent1Hash = nacl.sign(message, keyPair1.secretKey);
      const mockParent2Hash = nacl.sign(message, keyPair2.secretKey);

      const faultyMarriageId = nacl.sign(message, keyPair1.secretKey);

      const dog = new Dog(
        BLANK,
        BLANK,
        keyPair1.publicKey,
        BLANK,
        BLANK,
        keyPair2.publicKey,
        mockParent1Hash,
        mockParent2Hash,
        faultyMarriageId
      );

      expect(() => {
        ValidatorService.validateDogAuthenticity(dog);
      }).toThrow("invalid marriage id");
    });

    test("should throw an error when the dog hash cannot be opened with dog's public key", async () => {
      const keyPair1 = nacl.sign.keyPair();
      const keyPair2 = nacl.sign.keyPair();

      const textEncoder = new TextEncoder();

      const message = textEncoder.encode("test dna");
      const mockParent1Hash = nacl.sign(message, keyPair1.secretKey);
      const mockParent2Hash = nacl.sign(message, keyPair2.secretKey);
      const mockMarriageHash = nacl.sign(message, keyPair2.secretKey);

      const faultyHash = appendHash([
        nacl.sign(message, keyPair1.secretKey),
        new Uint8Array([1, 3]),
      ]);

      const dog = new Dog(
        BLANK,
        faultyHash,
        keyPair1.publicKey,
        BLANK,
        BLANK,
        keyPair2.publicKey,
        mockParent1Hash,
        mockParent2Hash,
        mockMarriageHash
      );

      expect(() => {
        ValidatorService.validateDogAuthenticity(dog);
      }).toThrow("invalid hash");
    });
  });

  const generateDataURLWithoutMetadata = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=";
  };
});
