import React, { useEffect } from "react";
import { fabric } from "fabric";
import partProperties from "../assets/partConfiguration";

const DogPicture = ({ dog, id }) => {
  const CANVAS_WITDH = 300;
  const CANVAS_HEIGHT = 300;
  const centerX = 150;
  const centerY = 150;

  let canvas;

  const position = {
    leftEar: { top: centerY - 70, left: centerX - 50 },
    rightEar: { top: centerY - 70, left: centerX + 50, flipX: true },
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
    leftEar: 0,
    rightEar: 1,
    head: 2,
    muzzle: 3,
    rightEye: 4,
    leftEye: 5,
    mouth: 6,
    nose: 7,
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

    canvas = new fabric.Canvas(id, options);
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

      applyPartColor(partName, partConfig, groupSVG);
      disableControlAndSelection(groupSVG);
      applyPartPosition(part, groupSVG);

      canvas.add(groupSVG);
      groupSVG.moveTo(zIndex[part]);
    });
  };

  const applyPartColor = (partName, partConfig, groupSVG) => {
    if (!partConfig.color) {
      return;
    }

    const variantConfig = partProperties[partName];

    variantConfig.colorable.forEach((element) => {
      if (groupSVG._objects) {
        groupSVG._objects[element].set("fill", partConfig.color);
      } else {
        groupSVG.set("fill", partConfig.color);
      }
    });
  };

  const applyPartPosition = (part, groupSVG) => {
    groupSVG.set({ originX: "center", originY: "center" });
    groupSVG.set(position[part]);
  };

  const disableControlAndSelection = (groupSVG) => {
    groupSVG.set({ selectable: false, hasControl: false });
  };

  const generateVariantUrl = (variant) => {
    return new URL(`../assets/${variant}.svg`, import.meta.url).href;
  };

  return (
    <div>
      <canvas
        width="300"
        height="300"
        id={id}
        style={{ borderRadius: "1em", border: "3px solid black" }}
      />
    </div>
  );
};

export default DogPicture;
