import chroma from "chroma-js";

import partProperties from "../assets/partConfiguration";
import { PARTS } from "../utils/constants.mjs";

class Dog {
  constructor(gene) {
    this.gene = gene;
  }

  static buildDogFromHash(hash) {
    const gene = {};

    gene["leftEar"] = this.constructPartFromHash(PARTS.EAR, hash.slice(0, 4));
    gene["rightEar"] = { ...gene["leftEar"] };
    gene["head"] = this.constructPartFromHash(PARTS.HEAD, hash.slice(4, 8));
    gene["leftEye"] = this.constructPartFromHash(PARTS.EYE, hash.slice(8, 12));
    gene["rightEye"] = { ...gene["leftEye"] };
    gene["muzzle"] = this.constructPartFromHash(
      PARTS.MUZZLE,
      hash.slice(12, 16)
    );
    gene["mouth"] = this.constructPartFromHash(PARTS.MOUTH, hash.slice(16, 20));
    gene["nose"] = this.constructPartFromHash(PARTS.NOSE, hash.slice(20, 24));

    return new Dog(gene);
  }

  static constructPartFromHash(part, hashUint8Array) {
    return {
      variant: this.pickVariant(part, hashUint8Array[0]),
      color: this.pickColor(
        hashUint8Array[1],
        hashUint8Array[2],
        hashUint8Array[3]
      ),
    };
  }

  static pickVariant(part, num) {
    const partVariant = (num % partProperties.metadata[part].variations) + 1;

    return `${part}${partVariant}`;
  }

  static pickColor(r, g, b) {
    return `rgb(${r},${g},${b})`;
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
