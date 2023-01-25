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

  let canvasRendered = false;

  useEffect(() => {
    if (!canvasRendered) {
      initCanvas();
      canvasRendered = true;
    }
  }, []);

  const initCanvas = () => {
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

  const renderDog = async () => {
    for (const part in dog.gene) {
      await buildPart(part, dog.gene[part]);
    }
  };

  const buildPart = (part, partConfig) => {
    const partName = `${partConfig.variant}`;

    return new Promise((resolve) => {
      fabric.loadSVGFromURL(
        generateVariantUrl(partName),
        (results, options) => {
          const groupSVG = fabric.util.groupSVGElements(results, options);

          applyPartColor(partName, partConfig, groupSVG);
          applyPartPosition(part, groupSVG);
          disableControlAndSelection(groupSVG);

          canvas.add(groupSVG);
          canvas.renderAll();

          resolve(groupSVG);
        }
      );
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

  const handleDownload = () => {
    const dataURL = canvas.toDataURL("png");
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <canvas
        width="300"
        height="300"
        id={id}
        style={{
          borderRadius: "1em",
          border: "3px solid black",
        }}
      />
      <button onClick={handleDownload}>download</button>
    </div>
  );
};

export default DogPicture;
