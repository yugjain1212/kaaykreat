import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaay Kreat — We Make Cool Stuff",
  description:
    "Creative technology studio working across web, AI, digital products, and motion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
