/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['scontent.cdninstagram.com', 'scontent-iad3-1.cdninstagram.com', 'scontent-iad3-2.cdninstagram.com', 'via.placeholder.com'],
  },
};

export default nextConfig;
