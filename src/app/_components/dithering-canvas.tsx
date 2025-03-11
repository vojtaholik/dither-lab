"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import * as THREE from "three";
import { DitheringAlgorithm } from "./utils/shader-loader";

type DitheringCanvasProps = {
  image: HTMLImageElement | null;
  algorithm: DitheringAlgorithm;
  threshold: number;
  backgroundColor: string;
  foregroundColor: string;
  shaders: {
    vertex: string;
    bayer: string;
    random: string;
    "blue-noise": string;
    halftone: string;
  };
};

// Maximum width for the rendered image
const MAX_WIDTH = 1000;

// Helper function to parse hex color to RGB
const parseHexColor = (hexColor: string) => {
  // Remove # if present
  const hex = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return new THREE.Color(r, g, b);
};

const DitheringCanvas = forwardRef(
  (
    {
      image,
      algorithm,
      threshold,
      backgroundColor,
      foregroundColor,
      shaders,
    }: DitheringCanvasProps,
    ref
  ) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);
    const scene = useRef<THREE.Scene | null>(null);
    const camera = useRef<THREE.OrthographicCamera | null>(null);
    const material = useRef<THREE.ShaderMaterial | null>(null);
    const mesh = useRef<THREE.Mesh | null>(null);
    const texture = useRef<THREE.Texture | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSvgExporting, setIsSvgExporting] = useState(false);

    // Get current shader based on algorithm
    const getCurrentShader = () => {
      switch (algorithm) {
        case "bayer":
          return shaders.bayer;
        case "random":
          return shaders.random;
        case "blue-noise":
          return shaders["blue-noise"];
        case "halftone":
          return shaders.halftone;
        default:
          return shaders.bayer;
      }
    };

    // Initialize Three.js scene - only once
    useEffect(() => {
      if (!canvasRef.current) return;

      // Clean up any existing renderer
      if (renderer.current) {
        canvasRef.current.innerHTML = "";
        renderer.current.dispose();
        renderer.current = null;
      }

      const init = () => {
        try {
          // Initialize Three.js scene
          renderer.current = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            antialias: false,
            alpha: true, // Enable alpha channel for transparent background
          });

          // Set initial size - will be updated when image is loaded
          const initialWidth = image ? Math.min(image.width, MAX_WIDTH) : 512;
          const initialHeight = image
            ? image.width > MAX_WIDTH
              ? Math.round(MAX_WIDTH / (image.width / image.height))
              : image.height
            : 512;

          renderer.current.setSize(initialWidth, initialHeight);

          // Set clear color to transparent
          renderer.current.setClearColor(0x000000, 0);

          if (canvasRef.current) {
            canvasRef.current.innerHTML = ""; // Clear any existing content
            canvasRef.current.appendChild(renderer.current.domElement);
          }

          scene.current = new THREE.Scene();
          camera.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
          camera.current.position.z = 1;

          // Create geometry
          const geometry = new THREE.PlaneGeometry(2, 2);

          // Create shader material with pre-loaded shaders
          // Ensure the background color is properly converted from hex to RGB
          const bgColor = parseHexColor(backgroundColor);
          const fgColor = parseHexColor(foregroundColor);
          console.log(
            "Initial background color:",
            backgroundColor,
            "RGB:",
            bgColor.r,
            bgColor.g,
            bgColor.b
          );
          console.log(
            "Initial foreground color:",
            foregroundColor,
            "RGB:",
            fgColor.r,
            fgColor.g,
            fgColor.b
          );

          material.current = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: { value: null },
              uThreshold: { value: threshold },
              uBackgroundColor: { value: bgColor },
              uForegroundColor: { value: fgColor },
            },
            vertexShader: shaders.vertex,
            fragmentShader: getCurrentShader(),
          });

          mesh.current = new THREE.Mesh(geometry, material.current);
          scene.current.add(mesh.current);

          setIsInitialized(true);

          // Initial render
          if (renderer.current && scene.current && camera.current) {
            renderer.current.render(scene.current, camera.current);
          }
        } catch (error) {
          console.error("Error initializing Three.js scene:", error);
        }
      };

      init();

      return () => {
        if (renderer.current) {
          renderer.current.dispose();
          renderer.current = null;
        }
        if (texture.current) {
          texture.current.dispose();
          texture.current = null;
        }
        if (material.current) {
          material.current.dispose();
          material.current = null;
        }
        if (mesh.current) {
          mesh.current.geometry.dispose();
        }
      };
    }, [image]); // Include image in dependencies to reinitialize when image changes

    // Update image texture
    useEffect(() => {
      if (!image || !material.current || !isInitialized) return;

      try {
        console.log("Updating image texture", image.width, image.height);

        // Calculate dimensions while preserving aspect ratio
        let width = image.width;
        let height = image.height;

        // Limit width to MAX_WIDTH while preserving aspect ratio
        if (width > MAX_WIDTH) {
          const aspectRatio = width / height;
          width = MAX_WIDTH;
          height = Math.round(width / aspectRatio);
        }

        // Update renderer size to match image dimensions
        if (renderer.current && canvasRef.current) {
          renderer.current.setSize(width, height);
        }

        // Dispose of previous texture if it exists
        if (texture.current) {
          texture.current.dispose();
          texture.current = null;
        }

        // Create new texture with proper settings
        texture.current = new THREE.Texture(image);
        texture.current.minFilter = THREE.LinearFilter;
        texture.current.magFilter = THREE.LinearFilter;
        texture.current.generateMipmaps = false;
        texture.current.needsUpdate = true;

        // Update the uniform
        if (material.current && material.current.uniforms) {
          material.current.uniforms.uTexture.value = texture.current;

          // Force material update
          material.current.needsUpdate = true;
        }
      } catch (error) {
        console.error("Error updating texture:", error);
      }
    }, [image, isInitialized]);

    // Update threshold
    useEffect(() => {
      if (material.current && isInitialized) {
        material.current.uniforms.uThreshold.value = threshold;
      }
    }, [threshold, isInitialized]);

    // Update background color
    useEffect(() => {
      if (material.current && isInitialized) {
        try {
          // Ensure the color is properly converted from hex to RGB
          const color = parseHexColor(backgroundColor);
          console.log(
            "Updated background color:",
            backgroundColor,
            "RGB:",
            color.r,
            color.g,
            color.b
          );

          material.current.uniforms.uBackgroundColor.value = color;
          material.current.needsUpdate = true;

          // Trigger a render to update the scene with the new background color
          if (renderer.current && scene.current && camera.current) {
            renderer.current.render(scene.current, camera.current);
          }
        } catch (error) {
          console.error("Error updating background color:", error);
        }
      }
    }, [backgroundColor, isInitialized]);

    // Update shader when algorithm changes
    useEffect(() => {
      if (!material.current || !isInitialized) return;

      try {
        console.log("Updating shader for algorithm:", algorithm);

        // Save the current texture
        const currentTexture = material.current?.uniforms.uTexture.value;

        // Update fragment shader
        material.current.fragmentShader = getCurrentShader();

        // Ensure uniforms are preserved
        if (currentTexture) {
          material.current.uniforms.uTexture.value = currentTexture;
        }

        // Force material update
        material.current.needsUpdate = true;
      } catch (error) {
        console.error("Error updating shader:", error);
      }
    }, [algorithm, isInitialized, shaders]);

    // Ensure image is reapplied after algorithm change
    useEffect(() => {
      if (!image || !material.current || !isInitialized) return;

      // Small delay to ensure shader has been updated
      const timer = setTimeout(() => {
        if (material.current && image) {
          console.log("Reapplying image after algorithm change");

          // Calculate dimensions while preserving aspect ratio
          let width = image.width;
          let height = image.height;

          // Limit width to MAX_WIDTH while preserving aspect ratio
          if (width > MAX_WIDTH) {
            const aspectRatio = width / height;
            width = MAX_WIDTH;
            height = Math.round(width / aspectRatio);
          }

          // Update renderer size to match image dimensions
          if (renderer.current && canvasRef.current) {
            renderer.current.setSize(width, height);
          }

          // Ensure texture is still valid
          if (!texture.current || texture.current.image !== image) {
            // Create new texture if needed
            if (texture.current) {
              texture.current.dispose();
            }

            texture.current = new THREE.Texture(image);
            texture.current.minFilter = THREE.LinearFilter;
            texture.current.magFilter = THREE.LinearFilter;
            texture.current.generateMipmaps = false;
            texture.current.needsUpdate = true;
          }

          // Update the uniform
          material.current.uniforms.uTexture.value = texture.current;
          material.current.needsUpdate = true;
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [algorithm, isInitialized, image]);

    // Add an effect to update the foreground color
    useEffect(() => {
      if (material.current && isInitialized) {
        try {
          // Ensure the color is properly converted from hex to RGB
          const color = parseHexColor(foregroundColor);
          console.log(
            "Updated foreground color:",
            foregroundColor,
            "RGB:",
            color.r,
            color.g,
            color.b
          );

          material.current.uniforms.uForegroundColor.value = color;
          material.current.needsUpdate = true;

          // Trigger a render to update the scene with the new foreground color
          if (renderer.current && scene.current && camera.current) {
            renderer.current.render(scene.current, camera.current);
          }
        } catch (error) {
          console.error("Error updating foreground color:", error);
        }
      }
    }, [foregroundColor, isInitialized]);

    // Render loop
    useEffect(() => {
      if (
        !renderer.current ||
        !scene.current ||
        !camera.current ||
        !isInitialized
      )
        return;

      let animationFrameId: number;
      let isRendering = true;

      const render = () => {
        if (!isRendering) return;

        animationFrameId = requestAnimationFrame(render);

        if (renderer.current && scene.current && camera.current) {
          try {
            renderer.current.render(scene.current, camera.current);
          } catch (error) {
            console.error("Error rendering scene:", error);
            isRendering = false;
          }
        }
      };

      render();

      return () => {
        isRendering = false;
        cancelAnimationFrame(animationFrameId);
      };
    }, [isInitialized]);

    // Save canvas as PNG
    const saveImage = () => {
      if (!renderer.current) return;

      const canvas = renderer.current.domElement;
      const link = document.createElement("a");
      link.download = "dithered-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const exportSVG = () => {
      if (!renderer.current || !scene.current || !camera.current) {
        console.error(
          "Cannot export SVG: renderer, scene, or camera is not initialized"
        );
        return;
      }

      // Set loading state
      setIsSvgExporting(true);
      console.log("Starting SVG export...");

      // Force a render to ensure the canvas is up to date
      renderer.current.render(scene.current, camera.current);

      // Use setTimeout to ensure the rendering is complete before reading pixels
      setTimeout(() => {
        try {
          const canvas = renderer.current!.domElement;
          const width = canvas.width;
          const height = canvas.height;

          console.log(`Canvas dimensions: ${width}x${height}`);

          // Create a temporary canvas to read pixel data
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext("2d");

          if (!tempCtx) {
            console.error("Failed to get 2D context for temporary canvas");
            setIsSvgExporting(false);
            return;
          }

          // Draw the WebGL canvas to the temporary canvas
          tempCtx.drawImage(canvas, 0, 0);

          // Read the pixel data
          const imageData = tempCtx.getImageData(0, 0, width, height);
          const pixels = imageData.data;

          console.log(
            `Background color: ${backgroundColor}, Foreground color: ${foregroundColor}`
          );

          // Parse background color for comparison
          const bgColor = parseHexColor(backgroundColor);
          const bgR = Math.round(bgColor.r * 255);
          const bgG = Math.round(bgColor.g * 255);
          const bgB = Math.round(bgColor.b * 255);

          console.log(`Background RGB: ${bgR}, ${bgG}, ${bgB}`);

          // Start building the SVG
          let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

          // Add background rectangle
          svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"/>`;

          // For large images, use a simplified approach with downsampling
          const MAX_DIMENSION = 300; // Maximum dimension for detailed SVG

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            console.log("Large image detected, using simplified SVG export");

            // Calculate downsampling factor
            const downsampleFactor = Math.max(
              Math.ceil(width / MAX_DIMENSION),
              Math.ceil(height / MAX_DIMENSION)
            );

            console.log(`Downsampling by factor of ${downsampleFactor}`);

            // Create downsampled grid
            const gridWidth = Math.ceil(width / downsampleFactor);
            const gridHeight = Math.ceil(height / downsampleFactor);
            const grid: boolean[][] = Array(gridHeight)
              .fill(0)
              .map(() => Array(gridWidth).fill(false));

            // Fill the grid by sampling pixels
            for (let y = 0; y < gridHeight; y++) {
              for (let x = 0; x < gridWidth; x++) {
                // Sample the center of each grid cell
                const centerX = Math.min(
                  x * downsampleFactor + Math.floor(downsampleFactor / 2),
                  width - 1
                );
                const centerY = Math.min(
                  y * downsampleFactor + Math.floor(downsampleFactor / 2),
                  height - 1
                );

                const i = (centerY * width + centerX) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // Determine if this pixel is significantly different from the background
                const isDifferent =
                  Math.abs(r - bgR) > 15 ||
                  Math.abs(g - bgG) > 15 ||
                  Math.abs(b - bgB) > 15;

                grid[y][x] = isDifferent;
              }
            }

            // Create rectangles from the grid
            for (let y = 0; y < gridHeight; y++) {
              for (let x = 0; x < gridWidth; x++) {
                if (grid[y][x]) {
                  const rectX = x * downsampleFactor;
                  const rectY = y * downsampleFactor;
                  const rectWidth = Math.min(downsampleFactor, width - rectX);
                  const rectHeight = Math.min(downsampleFactor, height - rectY);

                  svgContent += `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${foregroundColor}"/>`;
                }
              }
            }
          } else {
            // For smaller images, use the original detailed approach
            // Create a binary representation of the image (true = foreground pixel)
            const pixelMap: boolean[][] = [];
            for (let y = 0; y < height; y++) {
              pixelMap[y] = [];
              for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // Determine if this pixel is significantly different from the background
                const isDifferent =
                  Math.abs(r - bgR) > 15 ||
                  Math.abs(g - bgG) > 15 ||
                  Math.abs(b - bgB) > 15;

                pixelMap[y][x] = isDifferent;
              }
            }

            // Find and merge horizontal runs of foreground pixels
            const rects = [];

            for (let y = 0; y < height; y++) {
              let runStart = -1;

              for (let x = 0; x <= width; x++) {
                // Check if we're at a foreground pixel or at the end of the row
                const isForegound = x < width && pixelMap[y][x];

                if (isForegound && runStart === -1) {
                  // Start of a new run
                  runStart = x;
                } else if (!isForegound && runStart !== -1) {
                  // End of a run, create a rectangle
                  rects.push({
                    x: runStart,
                    y: y,
                    width: x - runStart,
                    height: 1,
                  });
                  runStart = -1;
                }
              }
            }

            console.log(`Found ${rects.length} horizontal runs`);

            // If there are too many rectangles, use a simplified approach
            const MAX_RECTS = 10000;

            if (rects.length > MAX_RECTS) {
              console.log(
                `Too many rectangles (${rects.length}), using simplified merging`
              );

              // Sort rectangles by y-coordinate for more efficient processing
              rects.sort((a, b) => a.y - b.y || a.x - b.x);

              // Take a sample of rectangles (every nth rectangle)
              const samplingRate = Math.ceil(rects.length / MAX_RECTS);
              const sampledRects = [];

              for (let i = 0; i < rects.length; i += samplingRate) {
                sampledRects.push(rects[i]);
              }

              console.log(`Sampled down to ${sampledRects.length} rectangles`);

              // Add all sampled rectangles to the SVG
              for (const rect of sampledRects) {
                svgContent += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${foregroundColor}"/>`;
              }
            } else {
              // For a reasonable number of rectangles, perform merging
              if (rects.length === 0) {
                console.warn(
                  "No foreground pixels detected. SVG may be empty except for background."
                );
              } else {
                // Use a more efficient merging algorithm
                // Group rectangles by y-coordinate
                const rectsByY = new Map();

                for (const rect of rects) {
                  if (!rectsByY.has(rect.y)) {
                    rectsByY.set(rect.y, []);
                  }
                  rectsByY.get(rect.y).push(rect);
                }

                // Merge vertically adjacent rectangles with the same x and width
                const mergedRects = [];
                const processed = new Set();

                // Process each y-coordinate group
                const yValues = Array.from(rectsByY.keys()).sort(
                  (a, b) => a - b
                );

                for (let i = 0; i < yValues.length; i++) {
                  const y = yValues[i];
                  const rectsAtY = rectsByY.get(y);

                  for (const rect of rectsAtY) {
                    if (processed.has(rect)) continue;

                    let currentRect = { ...rect };
                    processed.add(rect);

                    // Look for rectangles below with the same x and width
                    let currentY = y;
                    let foundMatch = true;

                    while (foundMatch && currentY < height - 1) {
                      foundMatch = false;
                      const nextY = currentY + 1;

                      if (rectsByY.has(nextY)) {
                        const candidates = rectsByY.get(nextY);

                        for (const candidate of candidates) {
                          if (
                            !processed.has(candidate) &&
                            candidate.x === currentRect.x &&
                            candidate.width === currentRect.width
                          ) {
                            // Merge this rectangle
                            currentRect.height += candidate.height;
                            processed.add(candidate);
                            currentY = nextY;
                            foundMatch = true;
                            break;
                          }
                        }
                      }
                    }

                    mergedRects.push(currentRect);
                  }
                }

                console.log(`Merged into ${mergedRects.length} rectangles`);

                // Add all rectangles to the SVG
                for (const rect of mergedRects) {
                  svgContent += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${foregroundColor}"/>`;
                }
              }
            }
          }

          // Close the SVG
          svgContent += "</svg>";

          // Create a download link
          const blob = new Blob([svgContent], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "dithered-image.svg";
          link.click();

          // Clean up
          URL.revokeObjectURL(url);
          console.log("SVG export completed successfully");
        } catch (error) {
          console.error("Error exporting SVG:", error);
        } finally {
          // Reset loading state
          setIsSvgExporting(false);
        }
      }, 100); // Small delay to ensure rendering is complete
    };

    // Expose the saveImage function to the parent via ref
    useImperativeHandle(ref, () => ({
      saveImage,
      exportSVG,
      isSvgExporting,
    }));

    return <div ref={canvasRef} className="" />;
  }
);

export default DitheringCanvas;
