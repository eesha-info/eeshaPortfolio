import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SectionHeading from "@/app/components/SectionHeading";
import TechStackGrid from "@/app/components/TechStackGrid";
import { techStack } from "@/app/lib/techStack";

export const metadata: Metadata = {
  title: "Guides | Mohammad Eesha",
  description:
    "12 in-depth guides covering every language, database, and cloud tool in my stack — each with diagrams, real implementation steps, and links to the official docs.",
};

const titleWords = ["Everything", "I", "Use", "—"];

export default function GuidesPage() {
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
            📚 Guides
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold mb-5"
            style={{ lineHeight: 1.15 }}
          >
            {titleWords.map((word, i) => (
              <span
                key={word + i}
                className="inline-block animate-fade-in-up"
                style={{
                  opacity: 0,
                  animationFillMode: "forwards",
                  animationDelay: `${0.1 + i * 0.09}s`,
                  marginRight: "0.28em",
                }}
              >
                {word}
              </span>
            ))}
            <span
              className="inline-block animate-fade-in-up"
              style={{
                opacity: 0,
                animationFillMode: "forwards",
                animationDelay: "0.58s",
              }}
            >
              <span className="gradient-text">Explained Properly</span>
            </span>
          </h1>
          <p
            className="text-base md:text-lg animate-fade-in-up"
            style={{
              opacity: 0,
              animationFillMode: "forwards",
              animationDelay: "0.85s",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            12 in-depth guides covering every language, database, and cloud
            tool in my stack — each with diagrams, real implementation
            steps, and a link to the official docs. Not a skills list —
            the documentation I wish I'd had.
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

      <div className="section-divider" />

      <section className="section">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Official Documentation"
            subtitle="Every technology on this page, linked straight to its official docs"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech) => (
              <a
                key={tech.slug}
                href={tech.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card flex items-start gap-3"
                style={{ padding: "16px 20px", textDecoration: "none" }}
              >
                <span style={{ fontSize: "1.1rem" }}>{tech.icon}</span>
                <span className="flex flex-col" style={{ minWidth: 0 }}>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tech.name}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--accent-cyan)",
                      wordBreak: "break-all",
                      marginTop: 2,
                    }}
                  >
                    {tech.docsUrl.replace(/^https?:\/\//, "")}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
