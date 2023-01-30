import { fabric } from "fabric";
import Dog from "../models/Dog.mjs";
import * as metaPNG from "meta-png";

import { convertPNGDataURLToUint8Array } from "../utils/ImageUtils.mjs";
import ImageService from "./ImageService.mjs";

describe("ImageService", () => {
  describe("generateDogPNGWithMetadata", () => {
    test("should return a Dog PNG with gene, signed hash, and public key in its metadata", async () => {
      const dogWithKey = await Dog.buildDog("test", "random");
      const dog = dogWithKey[0];
      const canvas = new fabric.Canvas();

      const response = ImageService.generateDogPNGWithMetadata(dog, canvas);
      const pngUint8Array = convertPNGDataURLToUint8Array(response);

      expect(
        metaPNG.default.getMetadata(pngUint8Array, "pawgenics_gene")
      ).toBeDefined();
      expect(
        metaPNG.default.getMetadata(pngUint8Array, "pawgenics_signedHash")
      ).toBeDefined();
      expect(
        metaPNG.default.getMetadata(pngUint8Array, "pawgenics_publicKey")
      ).toBeDefined();
    });
  });
});
