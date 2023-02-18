import nacl from "tweetnacl";

import ValidatorService from "./ValidatorService.mjs";
import Dog from "../models/Dog.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";
import { addMetadataFromBase64DataURL } from "../utils/ImageUtil.mjs";

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
      const parent1PublicKey = new Uint8Array([7, 6]);
      const parent2PublicKey = new Uint8Array([6, 7]);
      const parent1SignedHash = new Uint8Array([8, 9]);
      const parent2SignedHash = new Uint8Array([10, 11]);
      const parentMarriageHash = new Uint8Array([12, 13]);

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(gene)
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_signedHash",
        signedHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_publicKey",
        publicKey
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parent1Gene",
        JSON.stringify(parent1Gene)
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parent2Gene",
        JSON.stringify(parent2Gene)
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parent1PublicKey",
        parent1PublicKey
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parent2PublicKey",
        parent2PublicKey
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parent1SignedHash",
        parent1SignedHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parent2SignedHash",
        parent2SignedHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_parentMarriageHash",
        parentMarriageHash
      );

      ValidatorService.validateMetadataPresence(dataURL);
    });

    test("should throw an error when there is a missing key", async () => {
      let dataURL = generateDataURLWithoutMetadata();

      const gene = { test: "hi" };

      dataURL = addMetadataFromBase64DataURL(
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
        keyPair1.publicKey,
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
        keyPair1.publicKey,
        keyPair2.publicKey,
        mockParent1Hash,
        mockParent2Hash,
        mockMarriageHash
      );

      expect(() => {
        ValidatorService.validateDogAuthenticity(dog);
      }).toThrow("invalid hash");
    });

    test("should throw an error when the dog hash doesn't match the generated hash", async () => {
      const keyPair1 = nacl.sign.keyPair();
      const keyPair2 = nacl.sign.keyPair();

      const textEncoder = new TextEncoder();

      const message = textEncoder.encode("test dna");
      const mockParent1Hash = nacl.sign(message, keyPair1.secretKey);
      const mockParent2Hash = nacl.sign(message, keyPair2.secretKey);
      const mockMarriageHash = nacl.sign(message, keyPair2.secretKey);

      const faultyHash = nacl.sign(message, keyPair1.secretKey);

      const dog = new Dog(
        BLANK,
        faultyHash,
        keyPair1.publicKey,
        BLANK,
        BLANK,
        keyPair1.publicKey,
        keyPair2.publicKey,
        mockParent1Hash,
        mockParent2Hash,
        mockMarriageHash
      );

      expect(() => {
        ValidatorService.validateDogAuthenticity(dog);
      }).toThrow("hash doesn't match");
    });
  });

  const generateDataURLWithoutMetadata = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=";
  };
});
