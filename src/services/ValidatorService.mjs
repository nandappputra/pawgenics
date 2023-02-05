import {
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtil.mjs";
import { METADATA } from "../utils/constants.mjs";
import nacl from "tweetnacl";

const validateMetadataPresence = (dataURL) => {
  const pngUint8Array = convertPNGDataURLToUint8Array(dataURL);

  Object.values(METADATA).every((key) => {
    if (getMetadataFromUint8Array(pngUint8Array, key) === undefined) {
      throw `missing ${key}`;
    }

    return true;
  });
};

const validateDogAuthenticity = (dog) => {
  const parent1Hash = nacl.sign.open(dog.parent1SignedHash, dog.publicKey);
  const parent2Hash = nacl.sign.open(
    dog.parent2SignedHash,
    dog.parent2PublicKey
  );
  if (parent1Hash === null || parent2Hash == null) {
    throw `invalid parent hash`;
  }
};

const ValidatorService = { validateMetadataPresence, validateDogAuthenticity };

export default ValidatorService;
