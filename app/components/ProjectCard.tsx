import type { Project } from "@/app/lib/data";

export default function ProjectCard({
  title,
  description,
  tech,
  github,
  live,
  url,
  client,
  highlights,
}: Project) {
  return (
    <div className="project-card">
      {/* Client badge */}
      {client && (
        <span
          className="inline-block mb-3 text-xs font-medium px-3 py-1 rounded-full"
          style={{
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.2)",
            color: "var(--accent-cyan)",
          }}
        >
          Client: {client}
        </span>
      )}

      {/* Title */}
      <h3
        className="text-xl font-bold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        {description}
      </p>

      {/* Highlights */}
      <ul className="mb-4 flex flex-col gap-1.5">
        {highlights.map((h) => (
          <li
            key={h}
            className="text-xs flex items-start gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <span style={{ color: "var(--accent-emerald)", flexShrink: 0 }}>▹</span>
            {h}
          </li>
        ))}
      </ul>

      {/* Tech badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tech.map((t) => (
          <span key={t} className="tech-badge">
            {t}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ padding: "6px 16px", fontSize: "0.8rem" }}
          >
            GitHub ↗
          </a>
        )}
        {(live || url) && (
          <a
            href={live || url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "6px 16px", fontSize: "0.8rem" }}
          >
            Live Demo ↗
          </a>
        )}
      </div>
    </div>
  );
}