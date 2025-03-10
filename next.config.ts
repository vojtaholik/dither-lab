import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      resolveExtensions: [".frag", ".vert", ".glsl", ".tsx", ".ts", ".js"],
      loaders: {
        ".frag": ["text"],
        ".vert": ["text"],
        ".glsl": ["text"],
      },
    },
  },
};

export default nextConfig;
