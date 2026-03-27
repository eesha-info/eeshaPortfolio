import Navbar from "./components/Navbar";
import SectionHeading from "./components/SectionHeading";
import ProjectCard from "./components/ProjectCard";
import SkillBadge from "./components/SkillBadge";
import ExperienceCard from "./components/ExperienceCard";
import Footer from "./components/Footer";
import {
  projects,
  skills,
  socialLinks,
  personalInfo,
  experiences,
  education,
  achievements,
} from "@/app/lib/data";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section
        id="hero"
        className="section relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: "100vh",
          background: "var(--gradient-hero)",
        }}
      >
        {/* Orbs */}
        <div
          className="hero-orb animate-float"
          style={{
            width: 500,
            height: 500,
            top: "10%",
            left: "-5%",
            background: "var(--accent-primary)",
          }}
        />
        <div
          className="hero-orb animate-float delay-300"
          style={{
            width: 400,
            height: 400,
            bottom: "10%",
            right: "-5%",
            background: "var(--accent-secondary)",
          }}
        />
        <div
          className="hero-orb animate-float delay-600"
          style={{
            width: 250,
            height: 250,
            top: "40%",
            right: "20%",
            background: "var(--accent-cyan)",
            opacity: 0.08,
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div
            className="animate-fade-in-up"
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            <span
              className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "var(--accent-cyan)",
              }}
            >
              ✨ Available for opportunities
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-100"
            style={{
              opacity: 0,
              animationFillMode: "forwards",
              lineHeight: 1.15,
            }}
          >
            Hi, I&apos;m{" "}
            <span className="gradient-text">{personalInfo.name}</span>
          </h1>

          <p
            className="text-xl md:text-2xl mb-4 animate-fade-in-up delay-200 font-semibold"
            style={{
              opacity: 0,
              animationFillMode: "forwards",
              color: "var(--text-primary)",
            }}
          >
            {personalInfo.title}
          </p>

          <p
            className="text-base md:text-lg max-w-2xl mx-auto mb-10 animate-fade-in-up delay-300"
            style={{
              opacity: 0,
              animationFillMode: "forwards",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            {personalInfo.tagline}
          </p>

          <div
            className="flex flex-wrap justify-center gap-4 animate-fade-in-up delay-400"
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            <a href="#projects" className="btn-primary">
              View My Work →
            </a>
            <a href="#contact" className="btn-outline">
              Get In Touch
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex justify-center gap-12 mt-16 animate-fade-in-up delay-500"
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            {[
              { value: personalInfo.experience, label: "Years Exp." },
              { value: personalInfo.projectsCount, label: "Projects" },
              { value: "20+", label: "Technologies" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl font-bold gradient-text"
                  style={{ lineHeight: 1 }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ ABOUT ══════════ */}
      <section id="about" className="section">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeading
            title="About Me"
            subtitle="A bit about my journey and what drives me"
          />

          {/* Photo + Bio row */}
          <div className="flex flex-col md:flex-row gap-10 items-center mb-12">
            {/* Profile photo */}
            <div className="profile-photo-wrapper animate-fade-in-up" style={{ flexShrink: 0 }}>
              <div className="profile-photo-ring">
                <Image
                  src="/profile.jpeg"
                  alt="Mohammad Eesha"
                  className="profile-photo"
                  width={400}
                  height={400}
                  priority
                />
              </div>
            </div>

            {/* Bio text */}
            <div className="flex flex-col gap-4">
              {personalInfo.aboutParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Skill highlight cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🎯",
                title: "Backend & APIs",
                desc: "Expert in building scalable REST APIs with Node.js, Express.js, and Koa.js.",
              },
              {
                icon: "⚛️",
                title: "Frontend",
                desc: "Proficient in React.js, Next.js, Angular, HTML, and CSS for modern web interfaces.",
              },
              {
                icon: "☁️",
                title: "AWS Cloud",
                desc: "EC2, S3, Lambda, CloudFront, API Gateway, and more for production deployments.",
              },
              {
                icon: "🔒",
                title: "Security & Auth",
                desc: "OAuth, JWT (JSON Web Tokens) authentication and authorization.",
              },
              {
                icon: "🗄️",
                title: "Databases",
                desc: "MongoDB, MySQL, PostgreSQL — schema design and query optimization.",
              },
              {
                icon: "🐳",
                title: "Docker & DevOps",
                desc: "Containerization, Dockerfile, build images, and managing containers.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass-card animate-fade-in-up"
                style={{ padding: 20, animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ EXPERIENCE ══════════ */}
      <section id="experience" className="section">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            title="Professional Experience"
            subtitle="My career journey and the companies I've contributed to"
          />

          <div className="experience-timeline">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.company} {...exp} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ SKILLS ══════════ */}
      <section id="skills" className="section">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeading
            title="Tech Stack"
            subtitle="Technologies I work with on a daily basis"
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {skills.map((skill) => (
              <SkillBadge key={skill.name} {...skill} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ PROJECTS ══════════ */}
      <section id="projects" className="section">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            title="Featured Projects"
            subtitle="A selection of projects I've built and contributed to"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={i} {...project} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ EDUCATION ══════════ */}
      <section id="education" className="section">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            title="Education Background"
            subtitle="My academic journey"
          />

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {education.map((edu) => (
              <div key={edu.institution} className="education-card">
                <div
                  className="text-3xl mb-3"
                  style={{ color: "var(--accent-primary)" }}
                >
                  🎓
                </div>
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {edu.degree}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {edu.institution}
                </p>
                <span
                  className="inline-block text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    color: "var(--accent-primary)",
                  }}
                >
                  Completed in {edu.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ ACHIEVEMENTS ══════════ */}
      <section id="achievements" className="section">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            title="Achievements"
            subtitle="Milestones I'm proud of"
          />

          <div className="flex flex-col gap-6">
            {achievements.map((ach, i) => (
              <div key={i} className="achievement-card">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <span
                    className="text-4xl"
                    style={{ flexShrink: 0 }}
                  >
                    🏆
                  </span>
                  <div>
                    <span
                      className="inline-block mb-2 text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      {ach.period}
                    </span>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {ach.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ══════════ CONTACT ══════════ */}
      <section id="contact" className="section">
        <div className="max-w-2xl mx-auto px-6">
          <SectionHeading
            title="Get In Touch"
            subtitle="Have a project in mind or want to collaborate? Let's connect."
          />

          <div className="flex flex-col gap-4">
            <a
              href={`mailto:${socialLinks.email}`}
              className="contact-link"
            >
              <span className="text-2xl">📧</span>
              <div>
                <div className="text-sm font-semibold">Email</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {socialLinks.email}
                </div>
              </div>
            </a>

            <a
              href={`tel:${socialLinks.phone}`}
              className="contact-link"
            >
              <span className="text-2xl">📱</span>
              <div>
                <div className="text-sm font-semibold">Phone</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {socialLinks.phone}
                </div>
              </div>
            </a>

            <div className="contact-link" style={{ cursor: "default" }}>
              <span className="text-2xl">📍</span>
              <div>
                <div className="text-sm font-semibold">Location</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {socialLinks.location}
                </div>
              </div>
            </div>

            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <span className="text-2xl">🐙</span>
              <div>
                <div className="text-sm font-semibold">GitHub</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  View my repositories and contributions
                </div>
              </div>
            </a>

            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <span className="text-2xl">💼</span>
              <div>
                <div className="text-sm font-semibold">LinkedIn</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Connect with me professionally
                </div>
              </div>
            </a>
          </div>

          <div className="text-center mt-12">
            <a
              href={`mailto:${socialLinks.email}`}
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "14px 32px" }}
            >
              Say Hello 👋
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}