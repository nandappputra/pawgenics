import nacl from "tweetnacl";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import ValidatorService from "./ValidatorService.mjs";
import Dog from "../models/Dog.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";
import {
  addMetadataFromBase64DataURL,
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import { METADATA } from "../utils/constants.mjs";
import GeneService from "./GeneService.mjs";
import ImageService from "./ImageService.mjs";

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

  describe("validateProposalAuthenticity", () => {
    test("should throw an error when the dog is not valid", async () => {
      const canvas = new fabric.Canvas();
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

      const dataURL = await ImageService.generateDogPNGWithMetadata(
        dog,
        canvas
      );

      expect(() => {
        ValidatorService.validateProposalAuthenticity(dataURL);
      }).toThrow("invalid marriage id");
    });

    test("should throw an error when the signed dog hash doesn't match the actual one", async () => {
      const dog = await GeneService.buildAdoptedDog();
      const canvas = new fabric.Canvas();

      let dataURL = ImageService.generateDogPNGWithMetadata(dog[0], canvas);
      const parent1KeyPair = nacl.sign.keyPair();
      const dogKeyPair = nacl.sign.keyPair();

      const hash = nacl.randomBytes(64);
      const signedDogHash = nacl.sign(hash, parent1KeyPair.secretKey);
      const signedMarriageId = nacl.sign(signedDogHash, dogKeyPair.secretKey);

      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.SIGNED_MARRIAGE_ID,
        signedMarriageId
      );
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        METADATA.PUBLIC_KEY,
        dogKeyPair.publicKey
      );

      expect(() => {
        ValidatorService.validateProposalAuthenticity(dataURL);
      }).toThrow("signed dog hash doesn't match");
    });
  });

  describe("validateApprovalAuthenticity", () => {
    test("should throw an error the proposer dog is not a valid dog", async () => {
      let [proposal, approval] = await buildProposalAndApproval();

      const keyPair = nacl.sign.keyPair();

      proposal = addMetadataFromBase64DataURL(
        proposal,
        METADATA.PARENT_1_PUBLIC_KEY,
        keyPair.publicKey
      );

      expect(() => {
        ValidatorService.validateApprovalAuthenticity(proposal, approval);
      }).toThrow("invalid hash");
    });

    test("should throw an error the approver dog is not a valid dog", async () => {
      let [proposal, approval] = await buildProposalAndApproval();

      const keyPair = nacl.sign.keyPair();

      approval = addMetadataFromBase64DataURL(
        approval,
        METADATA.PARENT_1_PUBLIC_KEY,
        keyPair.publicKey
      );

      expect(() => {
        ValidatorService.validateApprovalAuthenticity(proposal, approval);
      }).toThrow("invalid hash");
    });

    test("should throw an error when the marriage hash doesn't match the actual one", async () => {
      let [proposal, approval] = await buildProposalAndApproval();

      const keyPair = nacl.sign.keyPair();
      const faultyMarriageHash = nacl.sign(
        nacl.randomBytes(64),
        keyPair.secretKey
      );

      approval = addMetadataFromBase64DataURL(
        approval,
        METADATA.SIGNED_APPROVAL_HASH,
        faultyMarriageHash
      );
      approval = addMetadataFromBase64DataURL(
        approval,
        METADATA.PUBLIC_KEY,
        keyPair.publicKey
      );

      expect(() => {
        ValidatorService.validateApprovalAuthenticity(proposal, approval);
      }).toThrow("marriage hash doesn't match");
    });
  });

  describe("validateKeyAuthenticity", () => {
    test("should throw an error when the key doesn't fit", async () => {
      const dog1 = await GeneService.buildAdoptedDog();
      const dog2 = await GeneService.buildAdoptedDog();
      const canvas = new fabric.Canvas();

      expect(() => {
        ValidatorService.validateKeyAuthenticity(
          ImageService.generateDogPNGWithMetadata(dog1[0], canvas),
          dog2[1]
        );
      }).toThrow("invalid key");
    });
  });

  const generateDataURLWithoutMetadata = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=";
  };

  const buildProposalAndApproval = async () => {
    const canvas = new fabric.Canvas();
    const proposer = await GeneService.buildAdoptedDog();
    const approver = await GeneService.buildAdoptedDog();

    const keyUint8Array = convertPNGDataURLToUint8Array(proposer[1]);
    const secretKeyString = getMetadataFromUint8Array(
      keyUint8Array,
      METADATA.SECRET_KEY
    );
    const secretKey = convertMetadataStringToUint8Array(secretKeyString);
    const encoder = new TextEncoder();
    const uuid = encoder.encode(uuidv4());

    const proposerDataURL = ImageService.generateDogPNGWithMetadata(
      proposer[0],
      canvas
    );
    const proposal = await ImageService.generateProposalPNG(
      proposerDataURL,
      secretKey,
      uuid
    );

    const approverDataURL = ImageService.generateDogPNGWithMetadata(
      approver[0],
      canvas
    );
    const approval = await ImageService.generateApprovalPNG(
      proposal,
      approverDataURL,
      approver[1]
    );

    return [proposal, approval];
  };
});
