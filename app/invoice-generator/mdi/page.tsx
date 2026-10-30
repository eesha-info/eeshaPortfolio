import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import MdiInvoice from "./MdiInvoice";

/* Display face for the institute name on the printed sheet. */
const cinzel = Cinzel({
  variable: "--font-mdi-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fee Invoice | Modern Delhi Infotech",
  description:
    "Student fee invoice generator for Modern Delhi Infotech (Branch-2, Madhepura). Course fee, GST and installment tracking with A4 PDF export.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MdiInvoicePage() {
  return (
    <div className={cinzel.variable}>
      <MdiInvoice />
    </div>
  );
}
