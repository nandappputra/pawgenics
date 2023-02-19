import {
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import nacl from "tweetnacl";
import GeneService from "./GeneService.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";
import ImageService from "./ImageService.mjs";
import { METADATA } from "../utils/constants.mjs";

const validateMetadataPresence = (dataURL) => {
  const pngUint8Array = convertPNGDataURLToUint8Array(dataURL);

  const keysToCheck = [
    "pawgenics_gene",
    "pawgenics_signedHash",
    "pawgenics_publicKey",
    "pawgenics_parent1Gene",
    "pawgenics_parent2Gene",
    "pawgenics_parent1PublicKey",
    "pawgenics_parent2PublicKey",
    "pawgenics_parent1SignedHash",
    "pawgenics_parent2SignedHash",
    "pawgenics_parentMarriageHash",
  ];

  keysToCheck.every((key) => {
    if (getMetadataFromUint8Array(pngUint8Array, key) === undefined) {
      throw `missing ${key}`;
    }

    return true;
  });
};

const validateDogAuthenticity = (dog) => {
  const marriageHash = nacl.sign.open(
    dog.parentMarriageHash,
    dog.parent2PublicKey
  );
  if (marriageHash === null) {
    throw "invalid marriage id";
  }

  const dogHash = nacl.sign.open(dog.signedHash, dog.parent1PublicKey);
  if (dogHash === null) {
    throw "invalid hash";
  }
  const geneSeed = nacl.hash(appendHash([dogHash, dog.publicKey]));

  const generatedHash = GeneService.generateDogHashFromParents(
    marriageHash,
    dog.parent1SignedHash,
    dog.parent2SignedHash
  );

  const finalHash = nacl.hash(appendHash([generatedHash, dog.publicKey]));

  if (!equalArrays(finalHash, geneSeed)) {
    throw "hash doesn't match";
  }
};

const validateProposalAuthenticity = (dataURL) => {
  const dogPNGUint8Array = convertPNGDataURLToUint8Array(dataURL);

  const signedMarriageIdString = getMetadataFromUint8Array(
    dogPNGUint8Array,
    METADATA.SIGNED_MARRIAGE_ID
  );
  const marriageId = convertMetadataStringToUint8Array(signedMarriageIdString);

  const publicKeyString = getMetadataFromUint8Array(
    dogPNGUint8Array,
    METADATA.PUBLIC_KEY
  );
  const publicKey = convertMetadataStringToUint8Array(publicKeyString);

  const actualDogHashString = getMetadataFromUint8Array(
    dogPNGUint8Array,
    METADATA.SIGNED_HASH
  );
  const actualSignedDogHash =
    convertMetadataStringToUint8Array(actualDogHashString);

  const signedDogHash = nacl.sign.open(marriageId, publicKey);

  if (!equalArrays(actualSignedDogHash, signedDogHash)) {
    throw "signed dog hash doesn't match";
  }

  const parent1PublicKeyString = getMetadataFromUint8Array(
    dogPNGUint8Array,
    METADATA.PARENT_1_PUBLIC_KEY
  );
  const parent1PublicKey = convertMetadataStringToUint8Array(
    parent1PublicKeyString
  );

  const dogHash = nacl.sign.open(signedDogHash, parent1PublicKey);
  const geneSeed = nacl.hash(appendHash([dogHash, publicKey]));
  const gene = GeneService.buildDogGeneFromHash(geneSeed);
  const geneString = JSON.stringify(gene);

  const actualGeneString = getMetadataFromUint8Array(
    dogPNGUint8Array,
    METADATA.GENE
  );

  if (geneString !== actualGeneString) {
    throw "gene doesn't match";
  }
};

const equalArrays = (array1, array2) => {
  return (
    array1.length === array2.length &&
    array1.every((value, index) => {
      return value === array2[index];
    })
  );
};

const ValidatorService = {
  validateMetadataPresence,
  validateDogAuthenticity,
  validateProposalAuthenticity,
};

export default ValidatorService;
