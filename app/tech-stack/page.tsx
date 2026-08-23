import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SectionHeading from "@/app/components/SectionHeading";
import TechStackGrid from "@/app/components/TechStackGrid";

export const metadata: Metadata = {
  title: "Tech Stack & Learning Resources | Mohammad Eesha",
  description:
    "A guided tour of the languages, databases, and cloud tools I work with — with quick explainers and links to official documentation.",
};

export default function TechStackPage() {
  return (
    <>
      <Navbar />

      <section
        className="section relative overflow-hidden flex items-center justify-center"
        style={{ minHeight: "50vh", background: "var(--gradient-hero)" }}
      >
        <div
          className="hero-orb animate-float"
          style={{
            width: 400,
            height: 400,
            top: "0%",
            left: "-8%",
            background: "var(--accent-primary)",
          }}
        />
        <div
          className="hero-orb animate-float delay-400"
          style={{
            width: 350,
            height: 350,
            bottom: "-10%",
            right: "-5%",
            background: "var(--accent-cyan)",
          }}
        />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <span
            className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium animate-fade-in-up"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "var(--accent-cyan)",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            📚 Learning Resources
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold mb-5 animate-fade-in-up delay-100"
            style={{ opacity: 0, animationFillMode: "forwards", lineHeight: 1.15 }}
          >
            Explore the <span className="gradient-text">Tech Stack</span>
          </h1>
          <p
            className="text-base md:text-lg animate-fade-in-up delay-200"
            style={{
              opacity: 0,
              animationFillMode: "forwards",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            Every language, database, and cloud tool I use day to day —
            grouped, explained, and linked to official documentation so
            anyone can dig deeper.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Browse by category"
            subtitle="Filter by language, database, or cloud — then jump into the details"
          />
          <TechStackGrid />
        </div>
      </section>

      <Footer />
    </>
  );
}
