"use client";

import { useEffect, useState } from "react";
import type { Experience } from "@/app/lib/data";

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function parsePeriodDate(token: string): Date | null {
  const trimmed = token.trim();
  if (/^present$/i.test(trimmed)) return new Date();
  const match = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const monthIndex = MONTH_NAMES.indexOf(match[1].toLowerCase().slice(0, 3));
  if (monthIndex === -1) return null;
  return new Date(Number(match[2]), monthIndex, 1);
}

// e.g. "Oct 2022 — Mar 2026" -> "3 yrs 6 mos"; "Mar 2026 — Present" recalculated against today on every load
function formatDuration(period: string): string | null {
  const [startToken, endToken] = period.split("—").map((p) => p.trim());
  if (!startToken || !endToken) return null;
  const start = parsePeriodDate(startToken);
  const end = parsePeriodDate(endToken);
  if (!start || !end) return null;

  const totalMonths = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export default function ExperienceCard({ company, role, period, projects }: Experience) {
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    setDuration(formatDuration(period));
  }, [period]);

  return (
    <div className="experience-card">
      {/* Timeline dot */}
      <div className="timeline-dot" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-1">
        <div>
          <h3
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {company}
          </h3>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--accent-cyan)" }}
          >
            {role}
          </p>
        </div>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full self-start"
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "var(--accent-primary)",
          }}
        >
          {period}
          {duration && <span style={{ opacity: 0.7 }}> · {duration}</span>}
        </span>
      </div>

      {/* Projects at this company */}
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <div
            key={project.name}
            className="glass-card"
            style={{ padding: 20 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <h4
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {project.name}
              </h4>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                  style={{ color: "var(--accent-cyan)" }}
                >
                  ↗
                </a>
              )}
            </div>
            <p
              className="text-xs mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              {project.description}
            </p>

            {/* Contributions */}
            <ul className="flex flex-col gap-1.5 mb-3">
              {project.contributions.map((c) => (
                <li
                  key={c}
                  className="text-xs flex items-start gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span style={{ color: "var(--accent-emerald)", flexShrink: 0 }}>▹</span>
                  {c}
                </li>
              ))}
            </ul>

            {/* Tech */}
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span key={t} className="tech-badge" style={{ fontSize: "0.7rem", padding: "3px 10px" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
