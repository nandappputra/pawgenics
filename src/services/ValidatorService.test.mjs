import * as metaPNG from "meta-png";

import ValidatorService from "./ValidatorService.mjs";

describe("ValidatorService", () => {
  describe("validateMetadataPresence", () => {
    test("should not throw error when there is no missing key", async () => {
      let dataURL = generateDataURLWithoutMetadata();

      const gene = { test: "hi" };
      const signedHash = new Uint8Array([1, 2, 3]);
      const publicKey = new Uint8Array([4, 5]);
      const parent1Gene = { parent1: "hi" };
      const parent2Gene = { parent2: "hi" };
      const parent2PublicKey = new Uint8Array([6, 7]);
      const parent1SignedHash = new Uint8Array([8, 9]);
      const parent2SignedHash = new Uint8Array([10, 11]);
      const parentMarriageHash = new Uint8Array([12, 13]);

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(gene)
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_signedHash",
        signedHash
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_publicKey",
        publicKey
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent1Gene",
        JSON.stringify(parent1Gene)
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent2Gene",
        JSON.stringify(parent2Gene)
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent2PublicKey",
        parent2PublicKey
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent1SignedHash",
        parent1SignedHash
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parent2SignedHash",
        parent2SignedHash
      );

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_parentMarriageHash",
        parentMarriageHash
      );

      ValidatorService.validateMetadataPresence(dataURL);
    });

    test("should throw the error when there is a missing key", async () => {
      let dataURL = generateDataURLWithoutMetadata();

      const gene = { test: "hi" };

      dataURL = metaPNG.default.addMetadataFromBase64DataURI(
        dataURL,
        "pawgenics_gene",
        JSON.stringify(gene)
      );

      expect(() => {
        ValidatorService.validateMetadataPresence(dataURL);
      }).toThrow();
    });
  });

  const generateDataURLWithoutMetadata = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=";
  };
});
