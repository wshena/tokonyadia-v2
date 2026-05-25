import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tokonyadia",
  description: "Tokonyadia is an e-commerce website built with Next.js, Tailwind CSS, and TypeScript. It offers a seamless shopping experience with a wide range of products, secure payment options, and fast delivery. Explore our collection and enjoy hassle-free online shopping!",
  keywords: [
    "e-commerce",
    "online shopping",
    "Next.js",
    "Tailwind CSS",
    "TypeScript",
    "products",
    "secure payment",
    "fast delivery",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
