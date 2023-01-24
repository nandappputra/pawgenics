import React, { useEffect } from "react";
import { fabric } from "fabric";

const DogPicture = ({ dog }) => {
  const CANVAS_WITDH = 300;
  const CANVAS_HEIGHT = 300;
  const centerX = 150;
  const centerY = 150;
  let canvas;

  const position = {
    ear: { top: centerY - 70, left: centerX },
    head: { top: centerY, left: centerX },
    muzzle: { top: centerY + 40, left: centerX },
    rightEye: { top: centerY - 10, left: centerX - 35 },
    leftEye: {
      top: centerY - 10,
      left: centerX + 35,
    },
    mouth: { top: centerY + 40, left: centerX },
    nose: { top: centerY + 20, left: centerX },
  };

  const zIndex = {
    ear: 0,
    head: 1,
    muzzle: 2,
    rightEye: 3,
    leftEye: 4,
    mouth: 5,
    nose: 6,
  };
  let canvasRendered = false;

  useEffect(() => {
    if (!canvasRendered) {
      initCanvas();
      canvasRendered = true;
    }
  }, []);

  const initCanvas = async () => {
    const options = {
      width: CANVAS_WITDH,
      height: CANVAS_HEIGHT,
      backgroundColor: "deepskyblue",
    };

    canvas = new fabric.Canvas("main-canvas", options);
    canvas.hoverCursor = "default";
    canvas.selection = false;

    renderDog();

    return canvas;
  };

  const renderDog = () => {
    for (const part in dog.gene) {
      buildPart(part, dog.gene[part]);
    }
    canvas.renderAll();
  };

  const buildPart = (part, partConfig) => {
    const partName = `${partConfig.variant}`;
    fabric.loadSVGFromURL(generateVariantUrl(partName), async (results) => {
      const groupSVG = fabric.util.groupSVGElements(results);

      await applyPartColor(partName, partConfig, groupSVG);
      disableControlAndSelection(groupSVG);
      applyPartPosition(part, groupSVG);

      canvas.add(groupSVG);

      applyZIndex(part, groupSVG);
    });
  };

  const applyPartColor = async (partName, partConfig, groupSVG) => {
    if (!partConfig.color) {
      return;
    }

    const response = await fetch(generateVariantConfigUrl(partName));
    const variantConfig = await response.json();

    variantConfig.colorable.forEach((element) => {
      groupSVG._objects[element].set("fill", partConfig.color);
    });
  };

  const applyPartPosition = (part, groupSVG) => {
    groupSVG.set({ originX: "center", originY: "center" });
    groupSVG.set(position[part]);
  };

  const applyZIndex = (part, groupSVG) => {
    groupSVG.moveTo(zIndex[part]);
  };

  const disableControlAndSelection = (groupSVG) => {
    groupSVG.set({ selectable: false, hasControl: false });
  };

  const generateVariantUrl = (variant) => {
    return new URL(`../assets/${variant}.svg`, import.meta.url).href;
  };

  const generateVariantConfigUrl = (variant) => {
    return new URL(`../assets/${variant}.json`, import.meta.url).href;
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

export default DogPicture;
