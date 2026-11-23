import type { Metadata } from "next";
import {
  Amiri,
  Cinzel,
  Cormorant_Garamond,
  Great_Vibes,
} from "next/font/google";
import Invitation from "./Invitation";
import "./invitation.css";

const script = Great_Vibes({
  variable: "--inv-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const serif = Cormorant_Garamond({
  variable: "--inv-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const caps = Cinzel({
  variable: "--inv-caps",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const arabic = Amiri({
  variable: "--inv-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nikah Invitation | Mohammad Eesha & Shabistan Shahin",
  description:
    "You are cordially invited to the Nikah ceremony of Mohammad Eesha with Shabistan Shahin — Monday, 15th March 2027, Phulwari Sharif, Patna.",
  openGraph: {
    title: "Nikah Invitation — Mohammad Eesha & Shabistan Shahin",
    description:
      "Monday, 15th March 2027 · Deewan E Khas Marriage Hall, Phulwari Sharif, Patna. Your presence and duas will make our joy complete.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function InvitationPage() {
  return (
    <div
      className={`${script.variable} ${serif.variable} ${caps.variable} ${arabic.variable} inv-root`}
    >
      <Invitation />
    </div>
  );
}
