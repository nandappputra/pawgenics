import {
  convertPNGDataURLToUint8Array,
  convertMetadataStringToUint8Array,
} from "./ImageUtils.mjs";

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
});
