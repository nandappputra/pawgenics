import nacl from "tweetnacl";

import partProperties from "../assets/partConfiguration";
import { PARTS } from "../utils/constants.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";
import Dog from "../models/Dog.mjs";
import ImageService from "./ImageService.mjs";

const buildDogGeneFromHash = (hash) => {
  const gene = {};

  gene[PARTS.LEFT_EAR.NAME] = constructPartFromHash(
    PARTS.LEFT_EAR.CATEGORY,
    hash.slice(0, 4)
  );
  gene[PARTS.RIGHT_EAR.NAME] = { ...gene[PARTS.LEFT_EAR.NAME] };
  gene[PARTS.HEAD.NAME] = constructPartFromHash(
    PARTS.HEAD.CATEGORY,
    hash.slice(4, 8)
  );
  gene[PARTS.LEFT_EYE.NAME] = constructPartFromHash(
    PARTS.LEFT_EYE.CATEGORY,
    hash.slice(8, 12)
  );
  gene[PARTS.RIGHT_EYE.NAME] = { ...gene[PARTS.LEFT_EYE.NAME] };
  gene[PARTS.MUZZLE.NAME] = constructPartFromHash(
    PARTS.MUZZLE.CATEGORY,
    hash.slice(12, 16)
  );
  gene[PARTS.MOUTH.NAME] = constructPartFromHash(
    PARTS.MOUTH.CATEGORY,
    hash.slice(16, 20)
  );
  gene[PARTS.NOSE.NAME] = constructPartFromHash(
    PARTS.NOSE.CATEGORY,
    hash.slice(20, 24)
  );

  return gene;
};

const generateSignedMarriageHashFromApproval = (
  approvalHash,
  publicKey,
  secretKey
) => {
  const appendedHash = appendHash([approvalHash, publicKey]);
  const marriageHash = nacl.hash(appendedHash);

  return nacl.sign(marriageHash, secretKey);
};

const generateMarriageHash = (
  marriageId,
  parent1PublicKey,
  parent2PublicKey
) => {
  const parent1Hashed = nacl.hash(appendHash([marriageId, parent1PublicKey]));

  return nacl.hash(appendHash([parent1Hashed, parent2PublicKey]));
};

const generateDogHashFromParents = (marriageHash, parent1Hash, parent2Hash) => {
  return nacl.hash(appendHash([marriageHash, parent1Hash, parent2Hash]));
};

const constructPartFromHash = (part, hashUint8Array) => {
  return {
    variant: pickVariant(part, hashUint8Array[0]),
    color: pickColor(hashUint8Array[1], hashUint8Array[2], hashUint8Array[3]),
  };
};

const pickVariant = (part, num) => {
  const partVariant = (num % partProperties.metadata[part].variations) + 1;

  return `${part}${partVariant}`;
};

const pickColor = (r, g, b) => {
  return `rgb(${r},${g},${b})`;
};

const buildAdoptedDog = async () => {
  const parent1Hash = nacl.randomBytes(64);
  const parent2Hash = nacl.randomBytes(64);

  const parent1KeyPair = nacl.sign.keyPair();
  const parent2KeyPair = nacl.sign.keyPair();

  const grandParent1KeyPair = nacl.sign.keyPair();
  const grandParent2KeyPair = nacl.sign.keyPair();

  const dogKeyPair = nacl.sign.keyPair();

  const parent1SignedHash = nacl.sign(
    parent1Hash,
    grandParent1KeyPair.secretKey
  );
  const parent2SignedHash = nacl.sign(
    parent2Hash,
    grandParent2KeyPair.secretKey
  );

  const marriageId = parent1SignedHash;
  const marriageHash = generateMarriageHash(
    marriageId,
    parent1KeyPair.publicKey,
    parent2KeyPair.publicKey
  );

  const signedMarriageHash = nacl.sign(marriageHash, parent2KeyPair.secretKey);

  const hash = generateDogHashFromParents(
    marriageHash,
    parent1Hash,
    parent2Hash
  );
  const finalHash = nacl.hash(appendHash([hash, dogKeyPair.publicKey]));
  const signedHash = nacl.sign(finalHash, parent1KeyPair.secretKey);

  const gene = buildDogGeneFromHash(hash);
  const parent1Gene = buildDogGeneFromHash(parent1SignedHash);
  const parent2Gene = buildDogGeneFromHash(parent2SignedHash);

  const key = await ImageService.generatePrivateKeyDataPNG(
    dogKeyPair.secretKey
  );

  return [
    new Dog(
      gene,
      signedHash,
      dogKeyPair.publicKey,
      parent1Gene,
      parent2Gene,
      parent1KeyPair.publicKey,
      parent2KeyPair.publicKey,
      parent1Hash,
      parent2Hash,
      signedMarriageHash
    ),
    key,
  ];
};

const buildDogFromMarriage = async (
  proposerDog,
  approverDog,
  proposerSecretKey,
  childKeyPair
) => {
  const proposerHash = nacl.sign.open(
    proposerDog.signedHash,
    proposerDog.parent1PublicKey
  );
  const approverHash = nacl.sign.open(
    approverDog.signedHash,
    approverDog.parent1PublicKey
  );
  const marriageHash = nacl.sign.open(
    approverDog.signedApprovalHash,
    approverDog.publicKey
  );

  const hash = generateDogHashFromParents(
    marriageHash,
    proposerHash,
    approverHash
  );
  const finalHash = nacl.hash(appendHash([hash, childKeyPair.publicKey]));
  const signedHash = nacl.sign(finalHash, proposerSecretKey);

  const key = await ImageService.generatePrivateKeyDataPNG(proposerSecretKey);

  return [
    new Dog(
      buildDogGeneFromHash(hash),
      signedHash,
      childKeyPair.publicKey,
      buildDogGeneFromHash(proposerHash),
      buildDogGeneFromHash(approverHash),
      proposerDog.publicKey,
      approverDog.publicKey,
      proposerHash,
      approverHash,
      approverDog.signedApprovalHash
    ),
    key,
  ];
};

const GeneService = {
  buildDogGeneFromHash,
  generateSignedMarriageHashFromApproval,
  generateMarriageHash,
  generateDogHashFromParents,
  buildAdoptedDog,
  buildDogFromMarriage,
};

export default GeneService;
