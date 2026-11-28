import type { Metadata } from "next";
import Invitation from "./Invitation";
import "./invitation.css";
import { baseFontVars } from "./fonts";

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
    <div className={`${baseFontVars} inv-root`} lang="en">
      <Invitation lang="en" />
    </div>
  );
}
