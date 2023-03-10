import { fabric } from "fabric";
import nacl from "tweetnacl";

import Dog from "../models/Dog.mjs";
import {
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
  addMetadataFromBase64DataURL,
} from "../utils/ImageUtil.mjs";
import ImageService from "./ImageService.mjs";
import { METADATA } from "../utils/constants.mjs";
import GeneService from "./GeneService.mjs";
import ValidatorService from "./ValidatorService.mjs";

describe("ImageService", () => {
  describe("generateDogPNGWithMetadata", () => {
    test("should return a Dog PNG with complete metadata", async () => {
      const dog = await GeneService.buildAdoptedDog();
      const canvas = new fabric.Canvas();

      const response = ImageService.generateDogPNGWithMetadata(dog[0], canvas);
      const pngUint8Array = convertPNGDataURLToUint8Array(response);

      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.GENE)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PUBLIC_KEY)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.SIGNED_HASH)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_1_GENE)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_2_GENE)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_2_PUBLIC_KEY)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_2_SIGNED_HASH)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_1_SIGNED_HASH)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_2_SIGNED_HASH)
      ).toBeDefined();
      expect(
        getMetadataFromUint8Array(pngUint8Array, METADATA.PARENT_MARRIAGE_HASH)
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
      dataURL = addMetadataFromBase64DataURL(
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
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(dog.gene)
      );
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_publicKey",
        dog.publicKey
      );

      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(false);
    });

    test("should return false when there is an exception during parsing", async () => {
      let dataURL = generateDataURLWithoutMetadata();
      dataURL = addMetadataFromBase64DataURL(
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
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(dog.gene)
      );
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_publicKey",
        dog.publicKey
      );
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_signedHash",
        dog.signedHash
      );

      const response = ImageService.isValidDogPNG(dataURL);

      expect(response).toBe(true);
    });
  });

  describe("generateProposalPNG", () => {
    test("should return a valid proposal", async () => {
      const [dog, key] = await GeneService.buildAdoptedDog();
      const canvas = new fabric.Canvas();
      const dogDataURL = ImageService.generateDogPNGWithMetadata(dog, canvas);

      const keyUint8Array = convertPNGDataURLToUint8Array(key);
      const secretKeyString = getMetadataFromUint8Array(
        keyUint8Array,
        METADATA.SECRET_KEY
      );
      const secretKey = convertMetadataStringToUint8Array(secretKeyString);

      const response = await ImageService.generateProposalPNG(
        dogDataURL,
        secretKey,
        dog.signedHash
      );

      ValidatorService.validateProposalAuthenticity(response);
    });
  });

  describe("generateApprovalPNG", () => {
    test("should return a PNG with hashed marriage ID", async () => {
      const canvas = new fabric.Canvas();
      const [parent1, key1] = await GeneService.buildAdoptedDog();
      const [parent2, key2] = await GeneService.buildAdoptedDog();

      let parent1DataURL = ImageService.generateDogPNGWithMetadata(
        parent1,
        canvas
      );
      const parent2DataURL = ImageService.generateDogPNGWithMetadata(
        parent2,
        canvas
      );

      const parent1KeyUint8Array = convertPNGDataURLToUint8Array(key1);
      const parent1KeyString = getMetadataFromUint8Array(
        parent1KeyUint8Array,
        METADATA.SECRET_KEY
      );
      const parent1Key = convertMetadataStringToUint8Array(parent1KeyString);

      const proposal = await ImageService.generateProposalPNG(
        parent1DataURL,
        parent1Key,
        parent1.signedHash
      );

      const response = await ImageService.generateApprovalPNG(
        proposal,
        parent2DataURL,
        key2
      );

      ValidatorService.validateApprovalAuthenticity(proposal, response);
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
      const parent1PublicKey = new Uint8Array([7, 6]);
      const parent2PublicKey = new Uint8Array([6, 7]);
      const parent1SignedHash = new Uint8Array([8, 9]);
      const parent2SignedHash = new Uint8Array([10, 11]);
      const parentMarriageHash = new Uint8Array([12, 13]);
      const signedMarriageId = new Uint8Array([13, 14]);
      const signedApprovalHash = new Uint8Array([15, 16]);

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.GENE,
        JSON.stringify(gene)
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.SIGNED_HASH,
        signedHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PUBLIC_KEY,
        publicKey
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_1_GENE,
        JSON.stringify(parent1Gene)
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_2_GENE,
        JSON.stringify(parent2Gene)
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_1_PUBLIC_KEY,
        parent1PublicKey
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_2_PUBLIC_KEY,
        parent2PublicKey
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_1_SIGNED_HASH,
        parent1SignedHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_2_SIGNED_HASH,
        parent2SignedHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PARENT_MARRIAGE_HASH,
        parentMarriageHash
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.SIGNED_MARRIAGE_ID,
        signedMarriageId
      );

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.SIGNED_APPROVAL_HASH,
        signedApprovalHash
      );

      const actualDog = ImageService.buildDogFromDataURL(dataURL);
      const expectedDog = new Dog(
        gene,
        signedHash,
        publicKey,
        parent1Gene,
        parent2Gene,
        parent1PublicKey,
        parent2PublicKey,
        parent1SignedHash,
        parent2SignedHash,
        parentMarriageHash,
        signedMarriageId,
        signedApprovalHash
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
