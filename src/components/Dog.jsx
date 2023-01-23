import React, { useEffect, useState } from "react";
import { fabric } from "fabric";

const Dog = () => {
  const [canvas, setCanvas] = useState(null);
  let canvasRendered = false;

  useEffect(() => {
    if (!canvasRendered) {
      setCanvas(initCanvas());
      canvasRendered = true;
    }
  }, []);

  const initCanvas = () => {
    const options = { width: "300", height: "300", backgroundColor: "pink" };

    return new fabric.Canvas("main-canvas", options);
  };

  const createDog = () => {
    const earUrl = getURL("ear1");
    const headUrl = getURL("head1");
    const muzzleUrl = getURL("muzzle1");
    const rightEyeUrl = getURL("eye1");
    const leftEyeUrl = getURL("eye1");
    const mouthUrl = getURL("mouth1");
    const noseUrl = getURL("nose1");

    const height = canvas.getHeight();
    const width = canvas.getWidth();

    const centerY = height / 2;
    const centerX = width / 2;

    loadSVG(earUrl, { top: centerY - 70, left: centerX, normalize: true }, 0);
    loadSVG(headUrl, { top: centerY, left: centerX, normalize: true }, 1);
    loadSVG(
      muzzleUrl,
      { top: centerY + 40, left: centerX, normalize: true },
      2
    );
    loadSVG(
      rightEyeUrl,
      { top: centerY - 10, left: centerX - 35, normalize: true },
      3
    );
    loadSVG(
      leftEyeUrl,
      { top: centerY - 10, left: centerX + 35, normalize: true },
      4
    );
    loadSVG(mouthUrl, { top: centerY + 40, left: centerX, normalize: true }, 5);
    loadSVG(noseUrl, { top: centerY + 20, left: centerX, normalize: true }, 6);

    canvas.renderAll();
  };

  const loadSVG = (url, properties, zIndex) => {
    fabric.loadSVGFromURL(url, (result, options) => {
      const vectorGroup = fabric.util.groupSVGElements(result, options);
      canvas.add(vectorGroup);

      if (properties.normalize) {
        const height = vectorGroup.getScaledHeight();
        const width = vectorGroup.getScaledWidth();

        properties.top -= height / 2;
        properties.left -= width / 2;
      }

      vectorGroup.set(properties);
      vectorGroup.moveTo(zIndex);
    });
  };

  const getURL = (name) => {
    return new URL(`../assets/${name}.svg`, import.meta.url).href;
  };

  return (
    <div>
      <canvas width="300" height="300" id="main-canvas" />
      <button onClick={createDog}>add dogss</button>
    </div>
  );
};

export default Dog;
