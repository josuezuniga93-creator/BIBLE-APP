/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Rebuttal Your Church — Next.js config */
  eslint: {
    // ESLint runs separately in CI; skip during Vercel builds to avoid lint-as-errors
    ignoreDuringBuilds: true,
  },
  outputFileTracingIncludes: {
    "/api/books/[slug]": ["./public/books/**/*.json"],
    "/api/books/[slug]/chapter/[chapter]": ["./public/books/**/*.json"],
  },
};

export default nextConfig;
