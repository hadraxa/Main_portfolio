import type { Metadata } from "next";
import type { ReactNode } from "react";

// Applies to the login screen and every dashboard page.
export const metadata: Metadata = {
  title: "Private Admin — Ahad Raza",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

// Authentication and the dashboard sidebar live in (protected)/layout.tsx.
// Keeping this layout separate allows the login screen to stay accessible.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
