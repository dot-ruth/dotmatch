import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DotMatch — Remote Software Engineering Jobs",
    template: "%s | DotMatch",
  },
  description:
    "Discover remote software engineering jobs aggregated from 9+ sources. Search, filter, and apply to the best dev jobs — all in one place.",
  keywords: [
    "remote jobs",
    "software engineering",
    "developer jobs",
    "remote work",
    "programming",
    "tech jobs",
    "work from home",
    "job aggregator",
  ],
  authors: [{ name: "DotMatch" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DotMatch",
    title: "DotMatch — Remote Software Engineering Jobs",
    description:
      "Discover remote software engineering jobs aggregated from 9+ sources. Search, filter, and apply to the best dev jobs.",
    url: "https://dot-match.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "DotMatch — Remote Software Engineering Jobs",
    description:
      "Discover remote software engineering jobs aggregated from 9+ sources.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <svg className="hidden" aria-hidden="true">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
