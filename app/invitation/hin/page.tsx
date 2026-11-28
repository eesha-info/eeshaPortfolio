import type { Metadata } from "next";
import Invitation from "../Invitation";
import "../invitation.css";
import { baseFontVars, hindiFontVars } from "../fonts";

export const metadata: Metadata = {
  title: "निकाह निमंत्रण | मोहम्मद ईशा और शबिस्तां शाहीन",
  description:
    "मोहम्मद ईशा और शबिस्तां शाहीन के निकाह समारोह में आप सादर आमंत्रित हैं — सोमवार, 15 मार्च 2027, फुलवारी शरीफ़, पटना।",
  openGraph: {
    title: "निकाह निमंत्रण — मोहम्मद ईशा और शबिस्तां शाहीन",
    description:
      "सोमवार, 15 मार्च 2027 · दीवान-ए-ख़ास मैरिज हॉल, फुलवारी शरीफ़, पटना। आपकी मौजूदगी और दुआएँ हमारी ख़ुशी को मुकम्मल करेंगी।",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function InvitationHindiPage() {
  return (
    <div className={`${baseFontVars} ${hindiFontVars} inv-root is-hi`} lang="hi">
      <Invitation lang="hi" />
    </div>
  );
}
