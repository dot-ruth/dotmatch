import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DotMatch - AI Job Agent",
  description: "Remote software engineering jobs aggregated from multiple sources",
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
