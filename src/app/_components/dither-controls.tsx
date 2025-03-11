"use client";

import { DitheringAlgorithm } from "./utils/shader-loader";

type DitherControlsProps = {
  algorithm: DitheringAlgorithm;
  threshold: number;
  backgroundColor: string;
  foregroundColor: string;
  onAlgorithmChange: (algorithm: DitheringAlgorithm) => void;
  onThresholdChange: (threshold: number) => void;
  onBackgroundColorChange: (color: string) => void;
  onForegroundColorChange: (color: string) => void;
  onSaveImage: () => void;
  onExportSVG: () => void;
  isSvgExporting: boolean;
};

const DitherControls = ({
  algorithm,
  threshold,
  backgroundColor,
  foregroundColor,
  onAlgorithmChange,
  onThresholdChange,
  onBackgroundColorChange,
  onForegroundColorChange,
  onSaveImage,
  onExportSVG,
  isSvgExporting,
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

      <div>
        <label className="block mb-2 font-medium">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => {
              console.log("Color picker changed to:", e.target.value);
              onBackgroundColorChange(e.target.value);
            }}
            className="w-10 h-10 border rounded cursor-pointer"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => {
              console.log("Text input changed to:", e.target.value);
              onBackgroundColorChange(e.target.value);
            }}
            className="flex-1 p-2 border rounded"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Foreground Color (SVG)</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => {
              console.log(
                "Foreground color picker changed to:",
                e.target.value
              );
              onForegroundColorChange(e.target.value);
            }}
            className="w-10 h-10 border rounded cursor-pointer"
          />
          <input
            type="text"
            value={foregroundColor}
            onChange={(e) => {
              console.log("Foreground text input changed to:", e.target.value);
              onForegroundColorChange(e.target.value);
            }}
            className="flex-1 p-2 border rounded"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <button
        onClick={onSaveImage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Image
      </button>
      <button
        onClick={onExportSVG}
        disabled={isSvgExporting}
        className={`px-4 py-2 bg-blue-500 text-white rounded ${
          isSvgExporting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
      >
        {isSvgExporting ? "Exporting SVG..." : "Export SVG"}
      </button>
    </div>
  );
};

export default DitherControls;
