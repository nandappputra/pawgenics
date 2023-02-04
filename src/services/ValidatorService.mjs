import {
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
} from "../utils/ImageUtils.mjs";
import { METADATA } from "../utils/constants.mjs";

const validateMetadataPresence = (dataURL) => {
  const pngUint8Array = convertPNGDataURLToUint8Array(dataURL);

  Object.values(METADATA).every((key) => {
    if (getMetadataFromUint8Array(pngUint8Array, key) === undefined) {
      throw `missing ${key}`;
    }
    return true;
  });
};

const ValidatorService = { validateMetadataPresence };

export default ValidatorService;
