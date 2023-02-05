import nacl from "tweetnacl";
import partProperties from "../assets/partConfiguration";
import { PARTS } from "../utils/constants.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";

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

const generateMarriageHashFromParents = (
  marriageId,
  parent1PublicKey,
  parent2PublicKey
) => {
  const parent1Hashed = nacl.hash(appendHash(marriageId, parent1PublicKey));

  return nacl.hash(appendHash([parent1Hashed, parent2PublicKey]));
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

const GeneService = {
  buildDogGeneFromHash,
  generateSignedMarriageHashFromApproval,
  generateMarriageHashFromParents,
};

export default GeneService;
