"use client";

import { useState, useEffect } from "react";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="text-xl font-bold tracking-tight"
          style={{ textDecoration: "none", color: "var(--text-primary)" }}
        >
          <span className="gradient-text">&lt;</span>
          MD
          <span className="gradient-text">/&gt;</span>
        </a>

        {/* Desktop nav */}
        <div
          className={`nav-links flex items-center gap-8 ${menuOpen ? "open" : ""}`}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://drive.google.com/file/d/1Dej3Z5nv7dOQwxk7Wb5VgfaRVookjQqU/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "8px 20px", fontSize: "0.85rem" }}
          >
            Resume ↗
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}
