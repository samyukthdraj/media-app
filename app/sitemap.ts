import { MetadataRoute } from "next";
import { getPublicGalleryAction } from "@/lib/actions";
import { IProject } from "@/lib/models";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://neha-sreejith.vercel.app";

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // Dynamic project routes
  try {
    const res = await getPublicGalleryAction();
    if (res.success && res.data) {
      const projectRoutes = (res.data.projects as IProject[]).map((project) => ({
        url: `${baseUrl}/work/${project._id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
      return [...routes, ...projectRoutes];
    }
  } catch (error) {
    console.error("Error generating sitemap project routes:", error);
  }

  return routes;
}
