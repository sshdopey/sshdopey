import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://sshdopey.com/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://sshdopey.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://sshdopey.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
  ];
}
