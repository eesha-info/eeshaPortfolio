"use client";

import { useEffect, useState } from "react";

const PREFIX = "Hi, I'm ";
const MS_PER_CHAR_HEADING = 45;
const MS_PER_CHAR_TITLE = 30;
const MS_PER_CHAR_TAGLINE = 12;

type Props = {
  name: string;
  title: string;
  tagline: string;
};

export default function TypedHeroIntro({ name, title, tagline }: Props) {
  const full = PREFIX + name;
  const [headingCount, setHeadingCount] = useState(0);
  const [titleCount, setTitleCount] = useState(0);
  const [taglineCount, setTaglineCount] = useState(0);
  const headingDone = headingCount >= full.length;
  const titleDone = titleCount >= title.length;
  const taglineDone = taglineCount >= tagline.length;

  useEffect(() => {
    if (headingDone) return;
    const delay = headingCount === 0 ? 650 : MS_PER_CHAR_HEADING;
    const t = setTimeout(() => setHeadingCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [headingCount, headingDone]);

  useEffect(() => {
    if (!headingDone || titleDone) return;
    const delay = titleCount === 0 ? 200 : MS_PER_CHAR_TITLE;
    const t = setTimeout(() => setTitleCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [headingDone, titleCount, titleDone]);

  useEffect(() => {
    if (!titleDone || taglineDone) return;
    const delay = taglineCount === 0 ? 250 : MS_PER_CHAR_TAGLINE;
    const t = setTimeout(() => setTaglineCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [titleDone, taglineCount, taglineDone]);

  const typedPrefix = full.slice(0, Math.min(headingCount, PREFIX.length));
  const typedName = headingCount > PREFIX.length ? full.slice(PREFIX.length, headingCount) : "";

  return (
    <>
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
        {!headingDone && <span className="typing-caret" aria-hidden="true" />}
      </h1>

      <p
        className="text-xl md:text-2xl mb-4 font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {headingDone ? title.slice(0, titleCount) : ""}
        {headingDone && !titleDone && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </p>

      <p
        className="text-base md:text-lg max-w-2xl mx-auto mb-10"
        style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}
      >
        {titleDone ? tagline.slice(0, taglineCount) : ""}
        {titleDone && !taglineDone && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </p>
    </>
  );
}
