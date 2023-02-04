export const appendHash = (uint8Arrays) => {
  const totalLength = uint8Arrays.reduce((sum, array) => sum + array.length, 0);
  const appendedHash = new Uint8Array(totalLength);

  let currentLength = 0;
  uint8Arrays.map((array) => {
    appendedHash.set(array, currentLength);
    currentLength += array.length;
  });

  return appendedHash;
};
