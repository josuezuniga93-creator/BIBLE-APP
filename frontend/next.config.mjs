/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Rebuttal Your Church — Next.js config */
  eslint: {
    // ESLint runs separately in CI; skip during Vercel builds to avoid lint-as-errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
