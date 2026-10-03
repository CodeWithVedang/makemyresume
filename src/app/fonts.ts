import { Geist, Geist_Mono, IBM_Plex_Sans, Inter, Lora, Source_Serif_4 } from "next/font/google";

/** UI font. */
export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });

/* Resume fonts: not preloaded; the browser fetches a face only when a resume uses it. */
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"], preload: false });
export const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});
export const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], preload: false });
export const lora = Lora({ variable: "--font-lora", subsets: ["latin"], preload: false });

export const fontVariables = [geistSans, geistMono, inter, plex, sourceSerif, lora]
  .map((f) => f.variable)
  .join(" ");
