import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DotMatch - AI Job Agent",
  description: "Remote software engineering jobs aggregated from multiple sources",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
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
        {children}
      </body>
    </html>
  );
}
