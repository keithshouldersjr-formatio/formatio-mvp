import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formatío",
  description: "Intelligent Formatíon design for the local church.",
  openGraph: {
    title: "Formatío",
    description: "Intelligent Formatíon design for the local church.",
    url: "https://Formatio.church",
    siteName: "Formatío",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Formatío – Architecting Discipleship",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formatío",
    description: "Intelligent Formatíon design for the local church.",
    images: ["/og-image.png"],
  },
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
