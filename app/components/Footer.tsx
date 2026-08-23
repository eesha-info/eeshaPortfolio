import Link from "next/link";
import { socialLinks } from "@/app/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="gradient-text" style={{ fontWeight: 600 }}>
              Mohammad Eesha
            </span>
            . Crafted with precision.
          </p>
          <div className="flex gap-6">
            <Link href="/guides">Guides</Link>
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={`mailto:${socialLinks.email}`}>Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
