import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    transpilePackages: ["react-leaflet"],
    eslint: {
        ignoreDuringBuilds: true, // Skip ESLint during production builds
    },
    typescript: {
        ignoreBuildErrors: true, // Skip TypeScript errors during production builds
    },
};

export default nextConfig;
