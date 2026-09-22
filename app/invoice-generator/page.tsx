import type { Metadata } from "next";
import InvoiceGenerator from "./InvoiceGenerator";

export const metadata: Metadata = {
  title: "GST Invoice Generator | Mohammad Eesha",
  description:
    "Free India GST-compliant tax invoice generator. Add your logo, items, HSN/SAC codes and GST rates, then export a high-quality A4 PDF. Runs entirely in the browser.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGenerator />;
}
