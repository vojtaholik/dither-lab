import fs from "fs";
import path from "path";

export type DitheringAlgorithm = "bayer" | "random" | "blue-noise" | "halftone";

// Cache for loaded shaders
const shaderCache: Record<string, string> = {};

// Load shader from file
export const loadShader = async (path: string): Promise<string> => {
  if (shaderCache[path]) {
    return shaderCache[path];
  }

  // In Node.js environment (server-side), use fs
  if (typeof window === "undefined") {
    try {
      // Use Node.js fs to read the file from the file system
      const filePath = `${process.cwd()}/public/${path}`;
      const shader = fs.readFileSync(filePath, "utf8");

      shaderCache[path] = shader;
      return shader;
    } catch (error) {
      console.error(`Error loading shader from ${path} on server:`, error);
      throw error;
    }
  }

  // In browser environment (client-side), use fetch
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load shader: ${response.statusText}`);
  }

  const shader = await response.text();
  shaderCache[path] = shader;
  return shader;
};

// Get fragment shader by algorithm name
export const getFragmentShader = async (
  algorithm: DitheringAlgorithm
): Promise<string> => {
  const shaderPath = `/shaders/${algorithm}-dither.frag`;
  return loadShader(shaderPath);
};

// Get vertex shader
export const getVertexShader = async (): Promise<string> => {
  return loadShader("/shaders/basic.vert");
};

// Load all shaders at once
export const loadAllShaders = async (): Promise<{
  vertex: string;
  bayer: string;
  random: string;
  "blue-noise": string;
  halftone: string;
}> => {
  const [vertex, bayer, random, blueNoise, halftone] = await Promise.all([
    getVertexShader(),
    getFragmentShader("bayer"),
    getFragmentShader("random"),
    getFragmentShader("blue-noise"),
    getFragmentShader("halftone"),
  ]);

  return {
    vertex,
    bayer,
    random,
    "blue-noise": blueNoise,
    halftone,
  };
};
