import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahad Raza — Full Stack Developer",
  description:
    "Full Stack Developer specialising in React, Node.js and cloud. Building fast, secure, user-focused products.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#05070f] text-slate-200 antialiased selection:bg-fuchsia-500/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
