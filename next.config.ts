import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For GitHub Pages static export:
  // output: 'export',
  // distDir: 'dist',
  
  // For Vercel (default):
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
