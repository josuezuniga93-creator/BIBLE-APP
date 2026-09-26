/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Rebuttal Your Church — Next.js config */
  outputFileTracingIncludes: {
    "/api/books/[slug]": ["./public/books/**/*.json"],
    "/api/books/[slug]/chapter/[chapter]": ["./public/books/**/*.json"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
