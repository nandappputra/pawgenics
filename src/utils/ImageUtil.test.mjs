import * as metaPNG from "meta-png";

import {
  convertPNGDataURLToUint8Array,
  convertMetadataStringToUint8Array,
  getMetadataFromUint8Array,
  addMetadataFromBase64DataURL,
} from "./ImageUtil.mjs";

describe("ImageUtils", () => {
  describe("convertPNGDataURLToUint8Array", () => {
    test("should convert data URL to Uint8Array", () => {
      const actualResponse = convertPNGDataURLToUint8Array(
        "data:image/png;base64,aGVsbG8gd29ybGQh"
      );
      const expectedResponse = new Uint8Array([
        104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33,
      ]);

      expect(actualResponse).toEqual(expectedResponse);
    });
  });

  describe("convertMetadataStringToUint8Array", () => {
    test("should convert metadata string to Uint8Array", () => {
      const actualResponse = convertMetadataStringToUint8Array("1,2,3");
      const expectedResponse = new Uint8Array([1, 2, 3]);

      expect(actualResponse).toEqual(expectedResponse);
    });
  });

  describe("getMetadataFromUint8Array", () => {
    test("should return metadata from Uint8Array png", async () => {
      let dataURL = generateDataURLWithoutMetadata();
      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        "hello"
      );
      const pngUint8Array = convertPNGDataURLToUint8Array(dataURL);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_gene")
      ).toEqual("hello");
    });
  });

  describe("addMetadataFromBase64DataURL", () => {
    test("should return data url with metadata", async () => {
      let dataURL = generateDataURLWithoutMetadata();
      dataURL = addMetadataFromBase64DataURL(
        dataURL,
        "pawgenics_gene",
        "hello"
      );
      const pngUint8Array = convertPNGDataURLToUint8Array(dataURL);

      expect(
        getMetadataFromUint8Array(pngUint8Array, "pawgenics_gene")
      ).toEqual("hello");
    });
  });

  const generateDataURLWithoutMetadata = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=";
  };
});
