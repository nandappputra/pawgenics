import {
  convertMetadataStringToUint8Array,
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import nacl from "tweetnacl";
import GeneService from "./GeneService.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";
import { METADATA } from "../utils/constants.mjs";
import ImageService from "./ImageService.mjs";

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
  const dog = ImageService.buildDogFromDataURL(dataURL);
  validateDogAuthenticity(dog);

  const dogPNGUint8Array = convertPNGDataURLToUint8Array(dataURL);

  const signedMarriageIdString = getMetadataFromUint8Array(
    dogPNGUint8Array,
    METADATA.SIGNED_MARRIAGE_ID
  );
  const signedMarriageId = convertMetadataStringToUint8Array(
    signedMarriageIdString
  );

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

  const signedDogHash = nacl.sign.open(signedMarriageId, publicKey);

  if (!equalArrays(actualSignedDogHash, signedDogHash)) {
    throw "signed dog hash doesn't match";
  }
};

const validateApprovalAuthenticity = (proposalDataURL, approvalDataURL) => {
  const proposalUint8Array = convertPNGDataURLToUint8Array(proposalDataURL);
  const approvalUint8Array = convertPNGDataURLToUint8Array(approvalDataURL);

  const signedMarriageIdString = getMetadataFromUint8Array(
    proposalUint8Array,
    METADATA.SIGNED_MARRIAGE_ID
  );
  const signedMarriageId = convertMetadataStringToUint8Array(
    signedMarriageIdString
  );
  const proposerPublicKeyString = getMetadataFromUint8Array(
    proposalUint8Array,
    METADATA.PUBLIC_KEY
  );
  const proposerPublicKey = convertMetadataStringToUint8Array(
    proposerPublicKeyString
  );
  const approverPublicKeyString = getMetadataFromUint8Array(
    approvalUint8Array,
    METADATA.PUBLIC_KEY
  );
  const approverPublicKey = convertMetadataStringToUint8Array(
    approverPublicKeyString
  );

  const signedDogHash = nacl.sign.open(signedMarriageId, proposerPublicKey);
  const marriageHash = GeneService.generateMarriageHash(
    signedDogHash,
    proposerPublicKey,
    approverPublicKey
  );

  const actualSignedMarriageHashString = getMetadataFromUint8Array(
    approvalUint8Array,
    METADATA.SIGNED_APPROVAL_HASH
  );
  const actualSignedMarriageHash = convertMetadataStringToUint8Array(
    actualSignedMarriageHashString
  );
  const actualMarriageHash = nacl.sign.open(
    actualSignedMarriageHash,
    approverPublicKey
  );

  if (!equalArrays(marriageHash, actualMarriageHash)) {
    throw "marriage hash doesn't match";
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
  validateApprovalAuthenticity,
};

export default ValidatorService;
