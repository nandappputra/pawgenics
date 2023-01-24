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
      backgroundColor: "deepskyblue",
    };

    const canvas = new fabric.Canvas("main-canvas", options);
    canvas.hoverCursor = "default";
    canvas.selection = false;
    createDog(canvas, props.dog);

    return canvas;
  };

  const createDog = (canvas, dog) => {
    const earUrl = getVectorURL(dog.ear.variant);
    const headUrl = getVectorURL(dog.head.variant);
    const muzzleUrl = getVectorURL(dog.muzzle.variant);
    const rightEyeUrl = getVectorURL(dog.rightEye.variant);
    const leftEyeUrl = getVectorURL(dog.leftEye.variant);
    const mouthUrl = getVectorURL(dog.mouth.variant);
    const noseUrl = getVectorURL(dog.nose.variant);

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
      {
        top: centerY - 10,
        left: centerX + 35,
        normalize: true,
        color: dog.leftEye.color,
      },
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
    fabric.loadSVGFromURL(url, async (result, options) => {
      const vectorGroup = fabric.util.groupSVGElements(result, options);

      if (properties.normalize) {
        const height = vectorGroup.getScaledHeight();
        const width = vectorGroup.getScaledWidth();

        properties.top -= height / 2;
        properties.left -= width / 2;
      }

      if (properties.color) {
        const response = await fetch(getConfigURL("eye1"));
        const config = await response.json();
        config.colorable.forEach((num) => {
          result[num].set({ fill: properties.color });
        });
      }

      vectorGroup.set({
        ...properties,
        selectable: false,
        hasControls: false,
      });
      canvas.add(vectorGroup);
      vectorGroup.moveTo(zIndex);
    });
  };

  const getVectorURL = (name) => {
    return new URL(`../assets/${name}.svg`, import.meta.url).href;
  };

  const getConfigURL = (name) => {
    return new URL(`../assets/${name}.json`, import.meta.url).href;
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
