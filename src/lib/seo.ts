import { site } from "@/lib/site";

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    site.socials.portfolio;

  return new URL(configuredUrl);
}

export function getMetaDescription(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 160
    ? `${normalized.slice(0, 157).trimEnd()}...`
    : normalized;
}
