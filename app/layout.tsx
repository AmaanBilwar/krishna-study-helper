import type { Metadata } from "next";

import { sfPro } from "@/lib/fonts/sf-pro";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Helper",
  description: "Upload PDFs and generate study materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sfPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}
