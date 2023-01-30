import * as metaPNG from "meta-png";

class ImageService {
  static generateDogPNGWithMetadata(dog, canvas) {
    let dataURL = canvas.toDataURL("png");

    dataURL = metaPNG.default.addMetadataFromBase64DataURI(
      dataURL,
      "pawgenics_publicKey",
      dog.publicKey
    );
    dataURL = metaPNG.default.addMetadataFromBase64DataURI(
      dataURL,
      "pawgenics_gene",
      dog.gene
    );
    dataURL = metaPNG.default.addMetadataFromBase64DataURI(
      dataURL,
      "pawgenics_signedHash",
      dog.signedHash
    );

    return dataURL;
  }
}

export default ImageService;
