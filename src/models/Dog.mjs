import chroma from "chroma-js";
import nacl from "tweetnacl";

import GeneService from "../services/GeneService.mjs";
import ImageService from "../services/ImageService.mjs";
import { appendHash } from "../utils/GeneUtil.mjs";

class Dog {
  constructor(
    gene,
    signedHash = null,
    publicKey = null,
    parent1Gene = null,
    parent2Gene = null,
    parent2PublicKey = null,
    parent1SignedHash = null,
    parent2SignedHash = null,
    parentMarriageHash = null
  ) {
    this.gene = gene;
    this.signedHash = signedHash;
    this.publicKey = publicKey;
    this.parent1Gene = parent1Gene;
    this.parent2Gene = parent2Gene;
    this.parent2PublicKey = parent2PublicKey;
    this.parent1SignedHash = parent1SignedHash;
    this.parent2SignedHash = parent2SignedHash;
    this.parentMarriageHash = parentMarriageHash;
  }

  static async buildDog(name, uuid) {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(`${name}-${uuid}`);

    const hash = nacl.hash(encodedText);
    const keyPair = nacl.sign.keyPair();

    const geneHash = nacl.hash(appendHash([hash, keyPair.publicKey]));

    const signedHash = nacl.sign(hash, keyPair.secretKey);

    const gene = GeneService.buildDogGeneFromHash(geneHash);
    const privateKeyDataURI = await ImageService.generatePrivateKeyDataPNG(
      keyPair.secretKey
    );

    const dog = new Dog(gene, signedHash, keyPair.publicKey);

    return [dog, privateKeyDataURI];
  }

  combine(dog) {
    const other = dog.gene;
    const child = {};

    child["leftEar"] = this.combinePart("leftEar", other);
    child["rightEar"] = { ...child["leftEar"] };
    child["head"] = this.combinePart("head", other);
    child["leftEye"] = this.combinePart("leftEye", other);
    child["rightEye"] = { ...child["leftEye"] };
    child["muzzle"] = this.combinePart("muzzle", other);
    child["mouth"] = this.combinePart("mouth", other);
    child["nose"] = this.combinePart("nose", other);

    return new Dog(child);
  }

  combinePart(key, other) {
    const result = {};

    const selfDominance = this.gene[key].dominance;
    const otherDominance = other[key].dominance;
    const sum = selfDominance + otherDominance;
    let dominance = 0;

    const inheritedValue = Math.random() * sum;
    if (inheritedValue < selfDominance) {
      result["variant"] = this.gene[key].variant;
      dominance += selfDominance;
    } else {
      result["variant"] = other[key].variant;
      dominance += otherDominance;
    }

    const colorFusionChance = 0.1;

    const inheritedColor = Math.random() * (sum + colorFusionChance * sum);
    if (inheritedColor < selfDominance) {
      result["color"] = this.gene[key].color;
      dominance += selfDominance;
    } else if (inheritedColor < sum) {
      result["color"] = other[key].color;
      dominance += otherDominance;
    } else {
      result["color"] = chroma
        .mix(this.gene[key].color, other[key].color, otherDominance)
        .hex();
      dominance += colorFusionChance;
    }

    result["dominance"] = dominance / 2;

    return result;
  }
}

export default Dog;
