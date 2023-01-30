import base64 from "binary-base64";

export const convertPNGDataURLToUint8Array = (dataURL) => {
  const header = "data:image/png;base64,";
  const base64PNG = dataURL.substring(header.length);

  return base64.decode(base64PNG);
};
