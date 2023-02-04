import * as metaPNG from "meta-png";
import nacl from "tweetnacl";
import { convertPNGDataURLToUint8Array } from "../utils/ImageUtils.mjs";
import Dog from "../models/Dog.mjs";

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
      JSON.stringify(dog.gene)
    );
    dataURL = metaPNG.default.addMetadataFromBase64DataURI(
      dataURL,
      "pawgenics_signedHash",
      dog.signedHash
    );

    return dataURL;
  }

  static isValidDogPNG(dataURL) {
    const dogPNG = convertPNGDataURLToUint8Array(dataURL);
    try {
      const geneMeta = metaPNG.default.getMetadata(dogPNG, "pawgenics_gene");
      if (geneMeta === undefined) {
        return false;
      }

      const publicKeyMeta = metaPNG.default.getMetadata(
        dogPNG,
        "pawgenics_publicKey"
      );
      if (publicKeyMeta === undefined) {
        return false;
      }
      const publicKey = this.convertMetadataToUInt8Array(publicKeyMeta);

      const signedHashMeta = metaPNG.default.getMetadata(
        dogPNG,
        "pawgenics_signedHash"
      );
      if (signedHashMeta === undefined) {
        return false;
      }
      const signedHash = this.convertMetadataToUInt8Array(signedHashMeta);

      const hash = nacl.sign.open(signedHash, publicKey);
      const reproducedSeed = Dog.combineHashAndPublicKey(hash, publicKey);
      const reproducedGene = Dog.buildDogGeneFromHash(reproducedSeed);

      return geneMeta === JSON.stringify(reproducedGene);
    } catch (error) {
      return false;
    }
  }

  static generateProposalPNG(canvas, secretKey, marriageId) {
    let dataURL = canvas.toDataURL("png");
    const signedMarriageId = nacl.sign(marriageId, secretKey);

    dataURL = metaPNG.default.addMetadataFromBase64DataURI(
      dataURL,
      "pawgenics_signedMarriageId",
      signedMarriageId
    );

    return dataURL;
  }

  static generateApprovalPNG(dogApprover, canvas, secretKey, marriageId) {
    let dataURL = canvas.toDataURL("png");

    const hash = nacl.sign.open(dogApprover.signedHash, dogApprover.publicKey);
    const appendedHash = this.appendHash(
      hash,
      dogApprover.publicKey,
      marriageId
    );
    const signedApprovalHash = nacl.sign(appendedHash, secretKey);

    dataURL = metaPNG.default.addMetadataFromBase64DataURI(
      dataURL,
      "pawgenics_signedApprovalHash",
      signedApprovalHash
    );

    return dataURL;
  }

  static appendHash(hash, publicKey, marriageId) {
    const seed = new Uint8Array(
      hash.length + publicKey.length + marriageId.length
    );
    seed.set(hash);
    seed.set(publicKey, hash.length);
    seed.set(marriageId, hash.length + publicKey.length);
    return nacl.hash(seed);
  }

  static convertMetadataToUInt8Array(metadata) {
    const array = metadata.split(",").map((element) => parseInt(element));
    return new Uint8Array(array);
  }
}

export default ImageService;
