import nacl from "tweetnacl";
import { fabric } from "fabric";

import {
  convertPNGDataURLToUint8Array,
  getMetadataFromUint8Array,
  convertMetadataStringToUint8Array,
  addMetadataFromBase64DataURL,
} from "../utils/ImageUtil.mjs";
import Dog from "../models/Dog.mjs";
import GeneService from "./GeneService.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";
import { METADATA } from "../utils/constants.mjs";

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

  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.GENE,
    JSON.stringify(dog.gene)
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.SIGNED_HASH,
    dog.signedHash
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PUBLIC_KEY,
    dog.publicKey
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PARENT_1_GENE,
    JSON.stringify(dog.parent1Gene)
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PARENT_2_GENE,
    JSON.stringify(dog.parent2Gene)
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PARENT_2_PUBLIC_KEY,
    dog.parent2PublicKey
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PARENT_1_SIGNED_HASH,
    dog.parent1SignedHash
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PARENT_2_SIGNED_HASH,
    dog.parent2SignedHash
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.PARENT_MARRIAGE_HASH,
    dog.parentMarriageHash
  );

  return dataURL;
};

const isValidDogPNG = (dataURL) => {
  const dogPNG = convertPNGDataURLToUint8Array(dataURL);
  try {
    const geneMeta = getMetadataFromUint8Array(dogPNG, "pawgenics_gene");
    if (geneMeta === undefined) {
      return false;
    }

    const publicKeyMeta = getMetadataFromUint8Array(
      dogPNG,
      "pawgenics_publicKey"
    );
    if (publicKeyMeta === undefined) {
      return false;
    }

    const publicKey = convertMetadataToUInt8Array(publicKeyMeta);

    const signedHashMeta = getMetadataFromUint8Array(
      dogPNG,
      "pawgenics_signedHash"
    );
    if (signedHashMeta === undefined) {
      return false;
    }
    const signedHash = convertMetadataToUInt8Array(signedHashMeta);

    const hash = nacl.sign.open(signedHash, publicKey);
    const reproducedSeed = nacl.hash(appendHash([hash, publicKey]));
    const reproducedGene = GeneService.buildDogGeneFromHash(reproducedSeed);

    return geneMeta === JSON.stringify(reproducedGene);
  } catch (error) {
    return false;
  }
};

const generateProposalPNG = (dataURL, secretKey, marriageId) => {
  const signedMarriageId = nacl.sign(marriageId, secretKey);

  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    "pawgenics_signedMarriageId",
    signedMarriageId
  );

  return dataURL;
};

const generateApprovalPNG = (
  proposerDataURL,
  approverDataURL,
  approverSecretKeyDataURL
) => {
  const proposerUint8Array = convertPNGDataURLToUint8Array(proposerDataURL);
  const approverUint8Array = convertPNGDataURLToUint8Array(approverDataURL);
  const approverSecretUint8Array = convertPNGDataURLToUint8Array(
    approverSecretKeyDataURL
  );

  const proposerPublicKey = convertMetadataStringToUint8Array(
    getMetadataFromUint8Array(proposerUint8Array, METADATA.PUBLIC_KEY)
  );
  const approverPublicKey = convertMetadataStringToUint8Array(
    getMetadataFromUint8Array(approverUint8Array, METADATA.PUBLIC_KEY)
  );
  const approverSecretKey = convertMetadataStringToUint8Array(
    getMetadataFromUint8Array(approverSecretUint8Array, "pawgenics_secretKey")
  );

  const signedMarriageId = convertMetadataToUInt8Array(
    getMetadataFromUint8Array(proposerUint8Array, "pawgenics_signedMarriageId")
  );
  const marriageId = nacl.sign.open(signedMarriageId, proposerPublicKey);

  const appendedHash = GeneService.generateMarriageHash(
    marriageId,
    proposerPublicKey,
    approverPublicKey
  );
  const signedApprovalHash = nacl.sign(appendedHash, approverSecretKey);

  const dataURL = addMetadataFromBase64DataURL(
    approverDataURL,
    "pawgenics_signedApprovalHash",
    signedApprovalHash
  );

  return dataURL;
};

const generatePrivateKeyDataPNG = async (secretKey) => {
  const keyUrl = new URL("../assets/key.svg", import.meta.url).href;
  const keyImage = await constructKeyDataUrl(keyUrl);

  return addMetadataFromBase64DataURL(
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
