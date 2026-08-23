import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { techStack, getTechBySlug } from "@/app/lib/techStack";
import { basePath } from "@/app/lib/basePath";

export function generateStaticParams() {
  return techStack.map((tech) => ({ slug: tech.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tech = getTechBySlug(slug);
  if (!tech) return {};
  return {
    title: `${tech.name} | Tech Stack | Mohammad Eesha`,
    description: tech.description,
  };
}

export default async function TechDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tech = getTechBySlug(slug);

  if (!tech) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <section
        className="section relative overflow-hidden"
        style={{ minHeight: "40vh", background: "var(--gradient-hero)" }}
      >
        <div
          className="hero-orb animate-float"
          style={{
            width: 350,
            height: 350,
            top: "-5%",
            right: "-8%",
            background: "var(--accent-secondary)",
          }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/tech-stack" className="back-link mb-8 inline-flex">
            ← Back to Tech Stack
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in-up">
            <div className="tech-detail-icon">{tech.icon}</div>
            <div>
              {tech.comingSoon && (
                <span className="badge-coming-soon mb-3 inline-block">
                  Coming Soon
                </span>
              )}
              <h1
                className="text-3xl md:text-5xl font-bold mb-2"
                style={{ lineHeight: 1.15 }}
              >
                <span className="gradient-text">{tech.name}</span>
              </h1>
              <p
                className="text-base md:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                {tech.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section">
        <div className="max-w-4xl mx-auto px-6">
          {tech.comingSoon ? (
            <div className="glass-card text-center" style={{ padding: 48 }}>
              <div className="text-4xl mb-4">🚧</div>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Full write-up coming soon
              </h2>
              <p
                className="text-sm max-w-md mx-auto mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                {tech.description}
              </p>
              <a
                href={tech.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Visit Official Docs ↗
              </a>
            </div>
          ) : (
            <>
              <p
                className="text-base leading-relaxed mb-10 animate-fade-in-up"
                style={{ color: "var(--text-secondary)" }}
              >
                {tech.description}
              </p>

              <h2
                className="text-xl font-bold mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Key concepts
              </h2>
              <div className="flex flex-col gap-3 mb-12">
                {tech.keyConcepts.map((concept) => (
                  <div key={concept} className="concept-item">
                    <span style={{ color: "var(--accent-cyan)" }}>▸</span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {concept}
                    </span>
                  </div>
                ))}
              </div>

              {tech.notesUrl && (
                <div className="flex justify-center">
                  <a
                    href={`${basePath}${tech.notesUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    📖 View Learning Roadmap ↗
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
