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

const DitheringCanvas = forwardRef(
  ({ image, algorithm, threshold, shaders }: DitheringCanvasProps, ref) => {
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
          }); // Allow saving image

          // Set initial size - will be updated when image is loaded
          const initialWidth = image ? Math.min(image.width, MAX_WIDTH) : 512;
          const initialHeight = image
            ? image.width > MAX_WIDTH
              ? Math.round(MAX_WIDTH / (image.width / image.height))
              : image.height
            : 512;

          renderer.current.setSize(initialWidth, initialHeight);

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
          material.current = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: { value: null },
              uThreshold: { value: threshold },
            },
            vertexShader: shaders.vertex,
            fragmentShader: getCurrentShader(),
          });

          mesh.current = new THREE.Mesh(geometry, material.current);
          scene.current.add(mesh.current);

          setIsInitialized(true);
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
      if (!renderer.current || !scene.current || !camera.current) return;

      const width = renderer.current.domElement.width;
      const height = renderer.current.domElement.height;
      const canvas = renderer.current.domElement;

      // Create a temporary canvas to read pixel data
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) return;

      // Draw the WebGL canvas to the temporary canvas
      tempCtx.drawImage(canvas, 0, 0);

      // Get ImageData from the temporary canvas
      const imageData = tempCtx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Create a binary representation of the image (1 = black, 0 = white/transparent)
      const binaryImage = new Array(height);
      for (let y = 0; y < height; y++) {
        binaryImage[y] = new Array(width);
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          binaryImage[y][x] =
            pixels[index] < 128 &&
            pixels[index + 1] < 128 &&
            pixels[index + 2] < 128 &&
            pixels[index + 3] > 0
              ? 1
              : 0;
        }
      }

      let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

      // First pass: horizontal rectangles
      const horizontalRects = [];
      for (let y = 0; y < height; y++) {
        let xStart = -1;
        for (let x = 0; x < width; x++) {
          if (binaryImage[y][x] === 1) {
            if (xStart === -1) xStart = x; // Start a new rectangle
          } else {
            if (xStart !== -1) {
              horizontalRects.push({
                x: xStart,
                y: y,
                width: x - xStart,
                height: 1,
              });
              xStart = -1; // Reset
            }
          }
        }
        // Close row at the end
        if (xStart !== -1) {
          horizontalRects.push({
            x: xStart,
            y: y,
            width: width - xStart,
            height: 1,
          });
        }
      }

      // Second pass: merge vertically adjacent rectangles with the same width and x position
      const mergedRects = [];
      const usedIndices = new Set();

      for (let i = 0; i < horizontalRects.length; i++) {
        if (usedIndices.has(i)) continue;

        const rect = horizontalRects[i];
        let currentHeight = rect.height;
        let j = i + 1;

        // Look for adjacent rectangles below
        while (j < horizontalRects.length) {
          const nextRect = horizontalRects[j];
          if (
            nextRect.x === rect.x &&
            nextRect.width === rect.width &&
            nextRect.y === rect.y + currentHeight
          ) {
            currentHeight += nextRect.height;
            usedIndices.add(j);
            j++;
          } else {
            break;
          }
        }

        mergedRects.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: currentHeight,
        });
      }

      // Add rectangles to SVG
      for (const rect of mergedRects) {
        svgContent += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="black"/>`;
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
