import type { Skill } from "@/app/lib/data";

export default function SkillBadge({ name, icon }: Skill) {
  return (
    <div className="skill-card">
      <span className="skill-icon">{icon}</span>
      <span className="skill-name">{name}</span>
    </div>
  );
}
