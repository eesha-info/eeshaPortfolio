"use client";

import { useEffect, useState } from "react";

const PREFIX = "Hi, I'm ";

type Props = {
  name: string;
};

export default function TypedHeroTitle({ name }: Props) {
  const full = PREFIX + name;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= full.length) return;
    const delay = count === 0 ? 650 : 45;
    const t = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [count, full.length]);

  const typedPrefix = full.slice(0, Math.min(count, PREFIX.length));
  const typedName = count > PREFIX.length ? full.slice(PREFIX.length, count) : "";
  const done = count >= full.length;

  return (
    <h1
      className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-100"
      style={{
        opacity: 0,
        animationFillMode: "forwards",
        lineHeight: 1.15,
      }}
    >
      {typedPrefix}
      <span className="gradient-text">{typedName}</span>
      <span
        className={`typing-caret ${done ? "typing-caret-idle" : ""}`}
        aria-hidden="true"
      />
    </h1>
  );
}
