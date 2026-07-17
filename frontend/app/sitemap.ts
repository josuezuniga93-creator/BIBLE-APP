import type { MetadataRoute } from "next";

const siteUrl = "https://tulip-bible-app.vercel.app";

const routes = [
  "",
  "/lexicon",
  "/family-worship",
  "/library",
  "/learn",
  "/study-tools",
  "/videos",
  "/kids-books",
  "/bible-plans",
  "/bible-tracker",
  "/church-directory",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
