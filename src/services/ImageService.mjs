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
    parent1PublicKey = null,
    parent2PublicKey = null,
    parent1SignedHash = null,
    parent2SignedHash = null,
    parentMarriageHash = null,
    signedMarriageId = null,
    signedApprovalHash = null;

  const geneMeta = getMetadataFromUint8Array(pngArray, METADATA.GENE);
  if (geneMeta) {
    gene = JSON.parse(geneMeta);
  }

  const signedHashMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.SIGNED_HASH
  );
  if (signedHashMeta) {
    signedHash = convertMetadataStringToUint8Array(signedHashMeta);
  }

  const publicKeyMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PUBLIC_KEY
  );
  if (publicKeyMeta) {
    publicKey = convertMetadataStringToUint8Array(publicKeyMeta);
  }

  const parent1GeneMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_1_GENE
  );
  if (parent1GeneMeta) {
    parent1Gene = JSON.parse(parent1GeneMeta);
  }

  const parent2GeneMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_2_GENE
  );
  if (parent2GeneMeta) {
    parent2Gene = JSON.parse(parent2GeneMeta);
  }

  const parent1PulicKeyMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_1_PUBLIC_KEY
  );
  if (parent1PulicKeyMeta) {
    parent1PublicKey = convertMetadataStringToUint8Array(parent1PulicKeyMeta);
  }

  const parent2PulicKeyMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_2_PUBLIC_KEY
  );
  if (parent2PulicKeyMeta) {
    parent2PublicKey = convertMetadataStringToUint8Array(parent2PulicKeyMeta);
  }

  const parent1SignedHashMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_1_SIGNED_HASH
  );
  if (parent1SignedHashMeta) {
    parent1SignedHash = convertMetadataStringToUint8Array(
      parent1SignedHashMeta
    );
  }

  const parent2SignedHashMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_2_SIGNED_HASH
  );
  if (parent2SignedHashMeta) {
    parent2SignedHash = convertMetadataStringToUint8Array(
      parent2SignedHashMeta
    );
  }

  const parentMarriageHashMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.PARENT_MARRIAGE_HASH
  );
  if (parentMarriageHashMeta) {
    parentMarriageHash = convertMetadataStringToUint8Array(
      parentMarriageHashMeta
    );
  }

  const signedMarriageIdMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.SIGNED_MARRIAGE_ID
  );
  if (signedMarriageIdMeta) {
    signedMarriageId = convertMetadataStringToUint8Array(signedMarriageIdMeta);
  }

  const signedApprovalHashMeta = getMetadataFromUint8Array(
    pngArray,
    METADATA.SIGNED_APPROVAL_HASH
  );
  if (signedApprovalHashMeta) {
    signedApprovalHash = convertMetadataStringToUint8Array(
      signedApprovalHashMeta
    );
  }

  return new Dog(
    gene,
    signedHash,
    publicKey,
    parent1Gene,
    parent2Gene,
    parent1PublicKey,
    parent2PublicKey,
    parent1SignedHash,
    parent2SignedHash,
    parentMarriageHash,
    signedMarriageId,
    signedApprovalHash
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
    METADATA.PARENT_1_PUBLIC_KEY,
    dog.parent1PublicKey
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
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.SIGNED_MARRIAGE_ID,
    dog.signedMarriageId
  );
  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.SIGNED_APPROVAL_HASH,
    dog.signedApprovalHash
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

const generateProposalPNG = async (dataURL, secretKey, marriageId) => {
  const signedMarriageId = nacl.sign(marriageId, secretKey);

  dataURL = addMetadataFromBase64DataURL(
    dataURL,
    METADATA.SIGNED_MARRIAGE_ID,
    signedMarriageId
  );

  const proposalSymbol = new URL("../assets/proposal.svg", import.meta.url)
    .href;

  return await applySymbolToPNG(dataURL, proposalSymbol);
};

const generateApprovalPNG = async (
  proposalDataURL,
  approverDataURL,
  approverSecretKeyDataURL
) => {
  const proposalUint8Array = convertPNGDataURLToUint8Array(proposalDataURL);
  const approverUint8Array = convertPNGDataURLToUint8Array(approverDataURL);
  const approverSecretUint8Array = convertPNGDataURLToUint8Array(
    approverSecretKeyDataURL
  );

  const proposerPublicKey = convertMetadataStringToUint8Array(
    getMetadataFromUint8Array(proposalUint8Array, METADATA.PUBLIC_KEY)
  );
  const approverPublicKey = convertMetadataStringToUint8Array(
    getMetadataFromUint8Array(approverUint8Array, METADATA.PUBLIC_KEY)
  );
  const approverSecretKey = convertMetadataStringToUint8Array(
    getMetadataFromUint8Array(approverSecretUint8Array, METADATA.SECRET_KEY)
  );

  const signedMarriageId = convertMetadataToUInt8Array(
    getMetadataFromUint8Array(proposalUint8Array, METADATA.SIGNED_MARRIAGE_ID)
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
    METADATA.SIGNED_APPROVAL_HASH,
    signedApprovalHash
  );

  const approvalSymbol = new URL("../assets/approval.svg", import.meta.url)
    .href;

  return await applySymbolToPNG(dataURL, approvalSymbol);
};

const generatePrivateKeyDataPNG = async (secretKey) => {
  const keyUrl = new URL("../assets/key.svg", import.meta.url).href;
  const keyImage = await constructKeyDataUrl(keyUrl);

  return addMetadataFromBase64DataURL(keyImage, METADATA.SECRET_KEY, secretKey);
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

const applySymbolToPNG = async (dogDataURL, symbolDataURL) => {
  const canvas = new fabric.Canvas();
  canvas.width = 300;
  canvas.height = 300;
  await loadImageToCanvas(canvas, dogDataURL);
  await loadSymbolToCanvas(canvas, symbolDataURL);

  const dog = buildDogFromDataURL(dogDataURL);

  return generateDogPNGWithMetadata(dog, canvas);
};

const loadImageToCanvas = async (canvas, imageURL) => {
  return new Promise((resolve) => {
    fabric.Image.fromURL(imageURL, (image) => {
      canvas.add(image);
      image.center();
      resolve(canvas);
    });
  });
};

const loadSymbolToCanvas = async (canvas, symbolURL) => {
  return new Promise((resolve) => {
    fabric.loadSVGFromURL(symbolURL, (results, options) => {
      const groupSVG = fabric.util.groupSVGElements(results, options);
      groupSVG.set({ originX: "center", originY: "center" });
      groupSVG.set({ top: 265, left: 150 });
      canvas.add(groupSVG);
      canvas.renderAll();

      resolve(groupSVG);
    });
  });
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
