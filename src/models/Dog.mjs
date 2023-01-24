import chroma from "chroma-js";

class Dog {
  constructor(gene) {
    this.gene = gene;
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
