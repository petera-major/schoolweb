import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Effective Learning Preschool & Aftercare Institute",
  description:
    "A warm, safe, and joyful place for your child to learn and grow — PreK3 through Grade 1 aftercare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--cream)]">{children}</body>
    </html>
  );
}
