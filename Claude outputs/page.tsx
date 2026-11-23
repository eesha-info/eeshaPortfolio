import type { Metadata } from "next";
import MdiInvoice from "./MdiInvoice";

export const metadata: Metadata = {
  title: "Fee Receipt / Invoice | Modern Delhi Infotech",
  description:
    "Student fee receipt and GST invoice generator for Modern Delhi Infotech, Branch-2, Madhepura. Runs entirely in the browser.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MdiInvoicePage() {
  return <MdiInvoice />;
}
