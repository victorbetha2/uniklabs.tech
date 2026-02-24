import path from "node:path";
import type { NextConfig } from "next";

const portalRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(portalRoot, ".."),
  },
  webpack: (config) => {
    config.context = portalRoot;
    config.resolve.modules = [
      path.join(portalRoot, "node_modules"),
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ["node_modules"]),
    ];
    config.resolve.alias = {
      ...(config.resolve?.alias || {}),
      tailwindcss: path.join(portalRoot, "node_modules/tailwindcss"),
      "tw-animate-css": path.join(portalRoot, "node_modules/tw-animate-css"),
      shadcn: path.join(portalRoot, "node_modules/shadcn"),
    };
    return config;
  },
};

export default nextConfig;
