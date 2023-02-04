import { fabric } from "fabric";
import * as metaPNG from "meta-png";
import { v4 as uuidv4, parse as uuidParse } from "uuid";
import nacl from "tweetnacl";

import Dog from "../models/Dog.mjs";
import {
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtils.mjs";
import ImageService from "./ImageService.mjs";

describe("ImageService", () => {
  describe("generateDogPNGWithMetadata", () => {
    test("should return a Dog PNG with gene, signed hash, and public key in its metadata", async () => {
      const dogWithKey = await Dog.buildDog("test", "random");
      const dog = dogWithKey[0];
      const canvas = new fabric.Canvas();

      const response = ImageService.generateDogPNGWithMetadata(dog, canvas);
      const pngUint8Array = convertPNGDataURLToUint8Array(response);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_gene")
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_signedHash")
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_publicKey")
      ).toBeDefined();
    });
  });

  describe("isValidDogPNG", () => {
    test("should return false when there is no gene in metadata", () => {
      const dataURL = generateDataURLWithoutMetadata();
      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(false);
    });

    test("should return false when there is no public key in metadata", async () => {
      const dogWithKey = await Dog.buildDog("hehe", "test");
      const dog = dogWithKey[0];

      let dataURL = generateDataURLWithoutMetadata();
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(dog.gene)
      );

      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(false);
    });

    test("should return false when there is no signed hash in metadata", async () => {
      const dogWithKey = await Dog.buildDog("hehe", "test");
      const dog = dogWithKey[0];

      let dataURL = generateDataURLWithoutMetadata();
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(dog.gene)
      );
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_publicKey",
        dog.publicKey
      );

      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(false);
    });

    test("should return false when there is an exception during parsing", async () => {
      let dataURL = generateDataURLWithoutMetadata();
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify("{invalid")
      );

      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(false);
    });

    test("should return true for dogs generated by buildDog ", async () => {
      const dogWithKey = await Dog.buildDog("hehe", "test");
      const dog = dogWithKey[0];

      let dataURL = generateDataURLWithoutMetadata();
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(dog.gene)
      );
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_publicKey",
        dog.publicKey
      );
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_signedHash",
        dog.signedHash
      );

      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(true);
    });
  });

  describe("generateProposalPNG", () => {
    test("should return a PNG with hashed marriage ID", async () => {
      const [dog, key] = await Dog.buildDog("test", "random");

      const keyArray = convertPNGDataURLToUint8Array(key);
      const secretKeyString = metaPNG.default.getMetadata(
        keyArray,
        "pawgenics_secretKey"
      );
      const secretKey = convertMetadataStringToUint8Array(secretKeyString);
      const canvas = new fabric.Canvas();
      const randomUuid = uuidParse(uuidv4());

      const response = ImageService.generateApprovalPNG(
        dog,
        canvas,
        secretKey,
        randomUuid
      );
      const pngUint8Array = convertPNGDataURLToUint8Array(response);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_signedApprovalHash")
      ).toBeDefined();
    });
  });

  describe("generateApprovalPNG", () => {
    test("should return a PNG with hashed approval", () => {
      const canvas = new fabric.Canvas();
      const randomUuid = uuidParse(uuidv4());
      const keyPair = nacl.sign.keyPair();

      const response = ImageService.generateProposalPNG(
        canvas,
        keyPair.secretKey,
        randomUuid
      );
      const pngUint8Array = convertPNGDataURLToUint8Array(response);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_signedMarriageId")
      ).toBeDefined();
    });
  });

  describe("buildDogFromDataURL", () => {
    test("should return a Dog instance with correct metadata", () => {
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

      const actualDog = ImageService.buildDogFromDataURL(dataURL);
      const expectedDog = new Dog(
        gene,
        signedHash,
        publicKey,
        parent1Gene,
        parent2Gene,
        parent2PublicKey,
        parent1SignedHash,
        parent2SignedHash,
        parentMarriageHash
      );

      expect(actualDog).toStrictEqual(expectedDog);
    });
  });

  describe("generatePrivateKeyDataPNG", () => {
    test("should return a data url with private key in its metadata", async () => {
      const keyPair = nacl.sign.keyPair();

      const response = await ImageService.generatePrivateKeyDataPNG(
        keyPair.secretKey
      );
      const pngUint8Array = convertPNGDataURLToUint8Array(response);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_secretKey")
      ).toBeDefined();
    });
  });

  const generateDataURLWithoutMetadata = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=";
  };
});
