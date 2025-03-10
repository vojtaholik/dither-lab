"use client";

import { DitheringAlgorithm } from "./utils/shader-loader";

type DitherControlsProps = {
  algorithm: DitheringAlgorithm;
  threshold: number;
  onAlgorithmChange: (algorithm: DitheringAlgorithm) => void;
  onThresholdChange: (threshold: number) => void;
  onSaveImage: () => void;
  onExportSVG: () => void;
};

const DitherControls = ({
  algorithm,
  threshold,
  onAlgorithmChange,
  onThresholdChange,
  onSaveImage,
  onExportSVG,
}: DitherControlsProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg">
      <div>
        <label className="block mb-2 font-medium">Dithering Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) =>
            onAlgorithmChange(e.target.value as DitheringAlgorithm)
          }
          className="w-full p-2 border rounded"
        >
          <option value="bayer">Bayer Ordered</option>
          <option value="random">Random Noise</option>
          <option value="blue-noise">Blue Noise</option>
          <option value="halftone">Halftone</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Threshold: {threshold.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={onSaveImage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Image
      </button>
      <button
        onClick={onExportSVG}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export SVG
      </button>
    </div>
  );
};

export default DitherControls;
