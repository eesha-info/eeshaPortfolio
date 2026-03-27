import type { Experience } from "@/app/lib/data";

export default function ExperienceCard({ company, role, period, projects }: Experience) {
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
