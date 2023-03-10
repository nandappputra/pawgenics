import base64 from "binary-base64";
import * as metaPNG from "meta-png";

export const convertPNGDataURLToUint8Array = (dataURL) => {
  const header = "data:image/png;base64,";
  const base64PNG = dataURL.substring(header.length);

  return base64.decode(base64PNG);
};

export const convertMetadataStringToUint8Array = (metadata) => {
  const array = metadata.split(",").map((element) => parseInt(element));

  return new Uint8Array(array);
};

export const getMetadataFromUint8Array = (pngUint8Array, key) => {
  if (metaPNG.default) {
    return metaPNG.default.getMetadata(pngUint8Array, key);
  }

  return metaPNG.getMetadata(pngUint8Array, key);
};

export const addMetadataFromBase64DataURL = (dataURL, key, value) => {
  if (metaPNG.default) {
    return metaPNG.default.addMetadataFromBase64DataURI(dataURL, key, value);
  }

  return metaPNG.addMetadataFromBase64DataURI(dataURL, key, value);
};
