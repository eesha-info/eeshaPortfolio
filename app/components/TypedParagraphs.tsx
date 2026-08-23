"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  paragraphs: string[];
};

const MS_PER_CHAR = 12;

export default function TypedParagraphs({ paragraphs }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);
  const [counts, setCounts] = useState(() => paragraphs.map(() => 0));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const activeIndex = counts.findIndex((c, i) => c < paragraphs[i].length);
    if (activeIndex === -1) return;
    const t = setTimeout(() => {
      setCounts((prev) => {
        const next = [...prev];
        next[activeIndex] = next[activeIndex] + 1;
        return next;
      });
    }, MS_PER_CHAR);
    return () => clearTimeout(t);
  }, [started, counts, paragraphs]);

  const activeIndex = counts.findIndex((c, i) => c < paragraphs[i].length);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {started ? p.slice(0, counts[i]) : ""}
          {i === activeIndex && (
            <span className="typing-caret" aria-hidden="true" />
          )}
        </p>
      ))}
    </div>
  );
}
