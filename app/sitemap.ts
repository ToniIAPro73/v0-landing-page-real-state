import type { MetadataRoute } from "next";

const baseUrl = "https://playaviva-uniestate.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/?lang=en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
