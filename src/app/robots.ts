import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

// Crawling preferences are not access control: admin routes still require login.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
