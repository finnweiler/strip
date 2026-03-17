import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://strip.finnweiler.com";

export const metadata: Metadata = {
  title: "JSON Strip — Remove Fields from JSON Online",
  description:
    "Free online tool to strip unnecessary fields from JSON. Paste JSON, select fields to remove, copy minified or formatted output. Runs entirely in your browser.",
  keywords: [
    "JSON strip",
    "JSON field remover",
    "remove JSON fields",
    "strip JSON online",
    "JSON minifier",
    "JSON cleaner",
    "JSON tool",
    "LLM context optimization",
    "reduce JSON size",
    "JSON editor online",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JSON Strip — Remove Fields from JSON Online",
    description:
      "Paste JSON, select fields to remove, copy the result. Free, fast, and fully client-side.",
    url: siteUrl,
    siteName: "JSON Strip",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "JSON Strip — Remove Fields from JSON Online",
    description:
      "Paste JSON, select fields to remove, copy the result. Free, fast, and fully client-side.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "JSON Strip",
              url: siteUrl,
              description:
                "Free online tool to strip unnecessary fields from JSON. Paste JSON, select which fields to remove, and copy the result as minified or formatted JSON.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              browserRequirements: "Requires JavaScript",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
