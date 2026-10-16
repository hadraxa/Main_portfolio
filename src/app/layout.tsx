import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();
const description = `Explore the portfolio of ${site.name}, a ${site.role} based in ${site.location}, building web applications with React, Next.js, Node.js, and cloud technologies.`;
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: siteUrl.toString(),
  email: `mailto:${site.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Karachi",
    addressCountry: "PK",
  },
  sameAs: [
    site.socials.github,
    site.socials.linkedin,
    site.socials.instagram,
    site.socials.portfolio,
  ],
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${site.name} | ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: `${site.name} Portfolio`,
    title: `${site.name} | ${site.role}`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${site.name} | ${site.role}`,
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#05070f] text-slate-200 antialiased selection:bg-fuchsia-500/40 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
