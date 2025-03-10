"use client";

import { useState, useRef } from "react";
import ImageUploader from "./image-uploader";
import DitherControls from "./dither-controls";
import DitheringCanvas from "./dithering-canvas";
import { DitheringAlgorithm } from "./utils/shader-loader";

type Shaders = {
  vertex: string;
  bayer: string;
  random: string;
  "blue-noise": string;
  halftone: string;
};

type DitheringAppProps = {
  shaders: Shaders;
};

const DitheringApp = ({ shaders }: DitheringAppProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [algorithm, setAlgorithm] = useState<DitheringAlgorithm>("bayer");
  const [threshold, setThreshold] = useState(0.5);
  const canvasRef = useRef<{
    saveImage: () => void;
    exportSVG: () => void;
  } | null>(null);

  const handleImageLoad = (img: HTMLImageElement) => {
    setImage(img);
  };

  const handleAlgorithmChange = (alg: DitheringAlgorithm) => {
    setAlgorithm(alg);
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
  };

  const handleSaveImage = () => {
    canvasRef.current?.saveImage();
  };

  const handleExportSVG = () => {
    canvasRef.current?.exportSVG();
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <ImageUploader onImageLoad={handleImageLoad} />
          <DitherControls
            algorithm={algorithm}
            threshold={threshold}
            onAlgorithmChange={handleAlgorithmChange}
            onThresholdChange={handleThresholdChange}
            onSaveImage={handleSaveImage}
            onExportSVG={handleExportSVG}
          />
        </div>

        <div className="w-full md:w-2/3">
          {image ? (
            <DitheringCanvas
              ref={canvasRef}
              image={image}
              algorithm={algorithm}
              threshold={threshold}
              shaders={shaders}
            />
          ) : (
            <div className="flex items-center justify-center h-64  rounded-lg">
              <p className="text-gray-500">
                Upload an image to start dithering
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DitheringApp;
