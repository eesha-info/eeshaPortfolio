import { Amiri, Amita, Cinzel, Cormorant_Garamond, Great_Vibes, Tiro_Devanagari_Hindi } from "next/font/google";

/* Latin + Arabic faces shared by every language of the invitation. */
export const script = Great_Vibes({
  variable: "--inv-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const serif = Cormorant_Garamond({
  variable: "--inv-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const caps = Cinzel({
  variable: "--inv-caps",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const arabic = Amiri({
  variable: "--inv-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

/* Devanagari faces for the Hindi page. */
export const hiScript = Amita({
  variable: "--inv-hi-script",
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
});

export const hiSerif = Tiro_Devanagari_Hindi({
  variable: "--inv-hi-serif",
  subsets: ["devanagari"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const baseFontVars = [script, serif, caps, arabic].map((f) => f.variable).join(" ");
export const hindiFontVars = [hiScript, hiSerif].map((f) => f.variable).join(" ");
