import {
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import nacl from "tweetnacl";
import GeneService from "./GeneService.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";

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

  const generatedHash = GeneService.generateDogHashFromParents(
    marriageHash,
    dog.parent1SignedHash,
    dog.parent2SignedHash
  );

  const finalHash = nacl.hash(appendHash([generatedHash, dog.publicKey]));

  if (!equalArrays(finalHash, dogHash)) {
    throw "hash doesn't match";
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

const ValidatorService = { validateMetadataPresence, validateDogAuthenticity };

export default ValidatorService;
