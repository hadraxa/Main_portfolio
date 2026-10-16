import type { MetadataRoute } from "next";

// Crawling preferences are not access control: admin routes still require login.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
  };
}
