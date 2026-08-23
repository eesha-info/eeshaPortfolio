"use client";

import { useState } from "react";
import Link from "next/link";
import {
  techStack,
  techCategories,
  type TechCategoryKey,
} from "@/app/lib/techStack";

export default function TechStackGrid() {
  const [activeCategory, setActiveCategory] = useState<
    TechCategoryKey | "all"
  >("all");

  const filtered =
    activeCategory === "all"
      ? techStack
      : techStack.filter((t) => t.category === activeCategory);

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          className={`category-pill ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          🚀 All
        </button>
        {techCategories.map((cat) => (
          <button
            key={cat.key}
            className={`category-pill ${activeCategory === cat.key ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Tech cards */}
      <div
        key={activeCategory}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((tech) => (
          <div key={tech.slug} className="tech-stack-card">
            <div className="flex items-start justify-between">
              <div className="tech-icon-badge">{tech.icon}</div>
              {tech.comingSoon && (
                <span className="badge-coming-soon">Coming Soon</span>
              )}
              {!tech.comingSoon && tech.notesUrl && (
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                  title="Includes a personal learning roadmap"
                >
                  📖 Roadmap
                </span>
              )}
            </div>

            <h3
              className="text-lg font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {tech.name}
            </h3>
            <p
              className="text-xs font-medium mb-3"
              style={{ color: "var(--accent-cyan)" }}
            >
              {tech.tagline}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tech.description}
            </p>

            <Link href={`/tech-stack/${tech.slug}`} className="read-docs-link">
              Read More →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
