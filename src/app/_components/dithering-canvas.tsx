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
      if (!renderer.current) return;

      try {
        // Get the canvas data
        const canvas = renderer.current.domElement;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Read the pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Create SVG content
        let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Add background rectangle with the selected background color
        svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"/>`;

        // Get the background color as RGB values for comparison
        const bgColor = parseHexColor(backgroundColor);
        const bgR = Math.round(bgColor.r * 255);
        const bgG = Math.round(bgColor.g * 255);
        const bgB = Math.round(bgColor.b * 255);

        // Create a binary representation of the image (1 = foreground, 0 = background)
        const binaryImage = new Array(height);
        for (let y = 0; y < height; y++) {
          binaryImage[y] = new Array(width).fill(0);
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            // Check if pixel is significantly different from background color
            const isNotBackground =
              Math.abs(data[index] - bgR) > 30 ||
              Math.abs(data[index + 1] - bgG) > 30 ||
              Math.abs(data[index + 2] - bgB) > 30;

            binaryImage[y][x] = isNotBackground ? 1 : 0;
          }
        }

        // First pass: find horizontal runs
        const horizontalRuns = [];
        for (let y = 0; y < height; y++) {
          let startX = -1;
          for (let x = 0; x < width; x++) {
            if (binaryImage[y][x] === 1) {
              if (startX === -1) startX = x;
            } else if (startX !== -1) {
              horizontalRuns.push({
                x: startX,
                y: y,
                width: x - startX,
                height: 1,
              });
              startX = -1;
            }
          }
          // Don't forget the run that might end at the edge
          if (startX !== -1) {
            horizontalRuns.push({
              x: startX,
              y: y,
              width: width - startX,
              height: 1,
            });
          }
        }

        // Second pass: merge vertically adjacent runs with the same width and x position
        const mergedRuns = [];
        const usedIndices = new Set();

        for (let i = 0; i < horizontalRuns.length; i++) {
          if (usedIndices.has(i)) continue;

          const run = horizontalRuns[i];
          let currentHeight = run.height;
          usedIndices.add(i);

          // Look for adjacent runs below
          let j = i + 1;
          while (j < horizontalRuns.length) {
            const nextRun = horizontalRuns[j];
            if (
              !usedIndices.has(j) &&
              nextRun.x === run.x &&
              nextRun.width === run.width &&
              nextRun.y === run.y + currentHeight
            ) {
              currentHeight += nextRun.height;
              usedIndices.add(j);
              j++;
            } else {
              break;
            }
          }

          mergedRuns.push({
            x: run.x,
            y: run.y,
            width: run.width,
            height: currentHeight,
          });
        }

        // Add rectangles to SVG - use foregroundColor for foreground elements
        for (const rect of mergedRuns) {
          svgContent += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${foregroundColor}"/>`;
        }

        svgContent += `</svg>`;

        // Convert to Blob and trigger download
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "dithered-image.svg";
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error exporting SVG:", error);
      }
    };

    // Expose the saveImage function to the parent via ref
    useImperativeHandle(ref, () => ({
      saveImage,
      exportSVG,
    }));

    return <div ref={canvasRef} className="" />;
  }
);

export default DitheringCanvas;
