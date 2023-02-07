import { appendHash } from "./GeneUtil.mjs";

describe("GeneUtil", () => {
  describe("appendHash", () => {
    test("should combine all given array into one", () => {
      const array1 = new Uint8Array([1, 2, 3]);
      const array2 = new Uint8Array([4, 5]);

      const actualResponse = appendHash([array1, array2]);
      const expectedResponse = new Uint8Array([1, 2, 3, 4, 5]);

      expect(actualResponse).toEqual(expectedResponse);
    });

    test("should throw error given an invalid input", () => {
      const array1 = new Uint8Array([1, 2, 3]);
      const array2 = new Uint8Array([4, 5]);

      expect(() => {
        appendHash(array1, array2);
      }).toThrow("invalid input");
    });
  });
});
