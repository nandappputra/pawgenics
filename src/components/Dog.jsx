import React, { useEffect } from "react";
import { fabric } from "fabric";

const Dog = (props) => {
  let canvasRendered = false;

  useEffect(() => {
    if (!canvasRendered) {
      initCanvas();
      canvasRendered = true;
    }
  }, []);

  const initCanvas = () => {
    const options = {
      width: "300",
      height: "300",
      backgroundColor: "pink",
    };

    const canvas = new fabric.Canvas("main-canvas", options);
    createDog(canvas, props.dog);

    return canvas;
  };

  const createDog = (canvas, dog) => {
    console.log(dog);
    const earUrl = getURL(dog.ear.variant);
    const headUrl = getURL(dog.head.variant);
    const muzzleUrl = getURL(dog.muzzle.variant);
    const rightEyeUrl = getURL(dog.rightEye.variant);
    const leftEyeUrl = getURL(dog.leftEye.variant);
    const mouthUrl = getURL(dog.mouth.variant);
    const noseUrl = getURL(dog.nose.variant);

    const height = canvas.getHeight();
    const width = canvas.getWidth();

    const centerY = height / 2;
    const centerX = width / 2;

    loadPartSVG(
      canvas,
      earUrl,
      { top: centerY - 70, left: centerX, normalize: true },
      0
    );
    loadPartSVG(
      canvas,
      headUrl,
      { top: centerY, left: centerX, normalize: true },
      1
    );
    loadPartSVG(
      canvas,
      muzzleUrl,
      { top: centerY + 40, left: centerX, normalize: true },
      2
    );
    loadPartSVG(
      canvas,
      rightEyeUrl,
      { top: centerY - 10, left: centerX - 35, normalize: true },
      3
    );
    loadPartSVG(
      canvas,
      leftEyeUrl,
      { top: centerY - 10, left: centerX + 35, normalize: true },
      4
    );
    loadPartSVG(
      canvas,
      mouthUrl,
      { top: centerY + 40, left: centerX, normalize: true },
      5
    );
    loadPartSVG(
      canvas,
      noseUrl,
      { top: centerY + 20, left: centerX, normalize: true },
      6
    );
    canvas.renderAll();
  };

  const loadPartSVG = (canvas, url, properties, zIndex) => {
    fabric.loadSVGFromURL(url, (result, options) => {
      const vectorGroup = fabric.util.groupSVGElements(result, options);

      if (properties.normalize) {
        const height = vectorGroup.getScaledHeight();
        const width = vectorGroup.getScaledWidth();

        properties.top -= height / 2;
        properties.left -= width / 2;
      }

      vectorGroup.set(properties);
      canvas.add(vectorGroup);
      vectorGroup.moveTo(zIndex);
    });
  };

  const getURL = (name) => {
    return new URL(`../assets/${name}.svg`, import.meta.url).href;
  };

  return (
    <div>
      <canvas
        width="300"
        height="300"
        id="main-canvas"
        style={{ borderRadius: "1em", border: "3px solid black" }}
      />
    </div>
  );
};

export default Dog;
