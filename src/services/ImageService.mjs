import * as metaPNG from "meta-png";
import nacl from "tweetnacl";
import { fabric } from "fabric";

import {
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
  convertMetadataStringToUint8Array,
} from "../utils/ImageUtils.mjs";
import Dog from "../models/Dog.mjs";
import GeneService from "./GeneService.mjs";

const buildDogFromDataURL = (dataURL) => {
  const pngArray = convertPNGDataURLToUint8Array(dataURL);
  let gene = null,
    signedHash = null,
    publicKey = null,
    parent1Gene = null,
    parent2Gene = null,
    parent2PublicKey = null,
    parent1SignedHash = null,
    parent2SignedHash = null,
    parentMarriageHash = null;

  const geneMeta = getMetadataFromUint8Array(pngArray, "pawgenics_gene");
  if (geneMeta) {
    gene = JSON.parse(geneMeta);
  }

  const signedHashMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_signedHash"
  );
  if (signedHashMeta) {
    signedHash = convertMetadataStringToUint8Array(signedHashMeta);
  }

  const publicKeyMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_publicKey"
  );
  if (publicKeyMeta) {
    publicKey = convertMetadataStringToUint8Array(publicKeyMeta);
  }

  const parent1GeneMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_parent1Gene"
  );
  if (parent1GeneMeta) {
    parent1Gene = JSON.parse(parent1GeneMeta);
  }

  const parent2GeneMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_parent2Gene"
  );
  if (parent2GeneMeta) {
    parent2Gene = JSON.parse(parent2GeneMeta);
  }

  const parent2PulicKeyMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_parent2PublicKey"
  );
  if (parent2PulicKeyMeta) {
    parent2PublicKey = convertMetadataStringToUint8Array(parent2PulicKeyMeta);
  }

  const parent1SignedHashMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_parent1SignedHash"
  );
  if (parent1SignedHashMeta) {
    parent1SignedHash = convertMetadataStringToUint8Array(
      parent1SignedHashMeta
    );
  }

  const parent2SignedHashMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_parent2SignedHash"
  );
  if (parent2SignedHashMeta) {
    parent2SignedHash = convertMetadataStringToUint8Array(
      parent2SignedHashMeta
    );
  }

  const parentMarriageHashMeta = getMetadataFromUint8Array(
    pngArray,
    "pawgenics_parentMarriageHash"
  );
  if (parentMarriageHashMeta) {
    parentMarriageHash = convertMetadataStringToUint8Array(
      parentMarriageHashMeta
    );
  }

  return new Dog(
    gene,
    signedHash,
    publicKey,
    parent1Gene,
    parent2Gene,
    parent2PublicKey,
    parent1SignedHash,
    parent2SignedHash,
    parentMarriageHash
  );
};

const generateDogPNGWithMetadata = (dog, canvas) => {
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
};

const isValidDogPNG = (dataURL) => {
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
    const publicKey = convertMetadataToUInt8Array(publicKeyMeta);

    const signedHashMeta = metaPNG.default.getMetadata(
      dogPNG,
      "pawgenics_signedHash"
    );
    if (signedHashMeta === undefined) {
      return false;
    }
    const signedHash = convertMetadataToUInt8Array(signedHashMeta);

    const hash = nacl.sign.open(signedHash, publicKey);
    const reproducedSeed = Dog.combineHashAndPublicKey(hash, publicKey);
    const reproducedGene = GeneService.buildDogGeneFromHash(reproducedSeed);

    return geneMeta === JSON.stringify(reproducedGene);
  } catch (error) {
    return false;
  }
};

const generateProposalPNG = (canvas, secretKey, marriageId) => {
  let dataURL = canvas.toDataURL("png");
  const signedMarriageId = nacl.sign(marriageId, secretKey);

  dataURL = metaPNG.default.addMetadataFromBase64DataURI(
    dataURL,
    "pawgenics_signedMarriageId",
    signedMarriageId
  );

  return dataURL;
};

const generateApprovalPNG = (dogApprover, canvas, secretKey, marriageId) => {
  let dataURL = canvas.toDataURL("png");

  const hash = nacl.sign.open(dogApprover.signedHash, dogApprover.publicKey);
  const appendedHash = appendHash(hash, dogApprover.publicKey, marriageId);
  const signedApprovalHash = nacl.sign(appendedHash, secretKey);

  dataURL = metaPNG.default.addMetadataFromBase64DataURI(
    dataURL,
    "pawgenics_signedApprovalHash",
    signedApprovalHash
  );

  return dataURL;
};

const generatePrivateKeyDataPNG = async (secretKey) => {
  const keyUrl = new URL("../assets/key.svg", import.meta.url).href;
  const keyImage = await constructKeyDataUrl(keyUrl);

  return metaPNG.default.addMetadataFromBase64DataURI(
    keyImage,
    "pawgenics_secretKey",
    secretKey
  );
};

const constructKeyDataUrl = (url) => {
  const canvas = new fabric.Canvas(null, { height: 150, width: 150 });

  return new Promise((resolve) => {
    fabric.loadSVGFromURL(url, (results, options) => {
      const key = fabric.util.groupSVGElements(results, options);

      canvas.add(key);
      canvas.renderAll();

      resolve(canvas.toDataURL("png"));
    });
  });
};

const appendHash = (hash, publicKey, marriageId) => {
  const seed = new Uint8Array(
    hash.length + publicKey.length + marriageId.length
  );
  seed.set(hash);
  seed.set(publicKey, hash.length);
  seed.set(marriageId, hash.length + publicKey.length);
  return nacl.hash(seed);
};

const convertMetadataToUInt8Array = (metadata) => {
  const array = metadata.split(",").map((element) => parseInt(element));
  return new Uint8Array(array);
};

const ImageService = {
  buildDogFromDataURL,
  generateDogPNGWithMetadata,
  isValidDogPNG,
  generateProposalPNG,
  generateApprovalPNG,
  generatePrivateKeyDataPNG,
};

export default ImageService;
