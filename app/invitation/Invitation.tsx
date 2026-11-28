"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { COPY, en, type Copy, type EventCopy, type Lang } from "./copy";
import { toDevanagari } from "./translit";

const CopyCtx = createContext<Copy>(en);
const useT = () => useContext(CopyCtx);

/* ═══════════════ Configuration ═══════════════ */

/**
 * WhatsApp number (country code + number, digits only, e.g. "919876543210")
 * that RSVPs are sent to. Leave empty to let the guest pick a contact.
 */
const RSVP_WHATSAPP = "919431258394";
/** Shown for calls / queries */
const CONTACT_PHONE = "+91 94312 58394";


type Flora = "rose" | "mixed";
type Ribbon = "blush" | "maroon";

type EventBase = {
  id: "nikah" | "reception";
  /** UTC start (IST = UTC+5:30) */
  startUtc: string;
  hours: number;
  /** Google Maps link */
  map: string;
  flora: Flora;
  ribbon: Ribbon;
};
type InvEvent = EventBase & EventCopy;

/** Nikah venue — Deewan E Khas Marriage Hall, Phulwari Sharif */
const MAP_VENUE = "https://maps.app.goo.gl/9ipW48q5oGVD2ZiU9";
/** Groom's home — Ward No. 14, Maheshua (reception) */
const MAP_HOME = "https://maps.app.goo.gl/DReaLDiK4ABrCxHHA";

const NIKAH_START = "2027-03-15T13:30:00Z";

const EVENT_BASE: EventBase[] = [
  { id: "nikah", startUtc: NIKAH_START, hours: 3, map: MAP_VENUE, flora: "rose", ribbon: "blush" },
  { id: "reception", startUtc: "2027-03-18T13:30:00Z", hours: 3, map: MAP_HOME, flora: "mixed", ribbon: "maroon" },
];

function useEvents(): InvEvent[] {
  const t = useT();
  return EVENT_BASE.map((b) => ({ ...b, ...t.events.items[b.id] }));
}

const SCENE_COUNT = 6;

/* ═══════════════ Helpers ═══════════════ */

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function downloadIcs(ev: InvEvent, t: Copy) {
  const start = new Date(ev.startUtc);
  const end = new Date(start.getTime() + ev.hours * 3600_000);
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//mdeesha.in//Nikah Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${ev.id}-eesha-shabistan@mdeesha.in`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${ev.title} — ${t.groom} & ${t.bride}`,
    `LOCATION:${`${ev.venueName}, ${ev.venueArea}`.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ═══════════════ Ornaments (original SVG art) ═══════════════ */

function Rose({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`inv-rose ${className}`} style={style} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M4 34 C9 26 17 26 20 31 C15 36 9 37 4 34 Z" fill="#86a886" />
      <path d="M44 34 C39 26 31 26 28 31 C33 36 39 37 44 34 Z" fill="#6f9474" />
      <path d="M24 44 C20 38 21 32 24 30 C27 32 28 38 24 44 Z" fill="#7a9f7c" />
      <circle cx="24" cy="22" r="14" fill="#eab0bc" />
      <circle cx="24" cy="22" r="14" fill="none" stroke="#d48a9c" strokeWidth="1" />
      <path d="M12 20 C14 13 21 10 27 12 C32 14 35 19 34 25" fill="#f5d0d7" />
      <path d="M15 27 C15 20 19 16 24 16 C29 16 32 20 31 24" fill="none" stroke="#c86f86" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 24 C19 21 21 19.5 24 19.5 C27 19.5 28 22 27 24 C26 26 23 26.5 22 25" fill="none" stroke="#c86f86" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Bow() {
  return (
    <svg className="inv-bow" viewBox="0 0 120 90" aria-hidden="true">
      <defs>
        <linearGradient id="bowG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7cdd6" />
          <stop offset="1" stopColor="#d98fa1" />
        </linearGradient>
      </defs>
      <path d="M58 44 L40 86 L48 82 L54 88 L62 48 Z" fill="#dc96a7" />
      <path d="M62 44 L80 86 L72 82 L66 88 L58 48 Z" fill="#d68a9c" />
      <path d="M60 42 C44 20 10 14 12 34 C14 54 44 52 60 42 Z" fill="url(#bowG)" stroke="#c97b8f" strokeWidth="1.2" />
      <path d="M60 42 C76 20 110 14 108 34 C106 54 76 52 60 42 Z" fill="url(#bowG)" stroke="#c97b8f" strokeWidth="1.2" />
      <path d="M58 40 C42 30 26 28 22 34" fill="none" stroke="#c97b8f" strokeWidth="1" opacity=".6" />
      <path d="M62 40 C78 30 94 28 98 34" fill="none" stroke="#c97b8f" strokeWidth="1" opacity=".6" />
      <rect x="52" y="34" width="16" height="16" rx="5" fill="#e7a6b5" stroke="#c97b8f" strokeWidth="1.2" />
    </svg>
  );
}

function Divider() {
  return (
    <div className="inv-divider" aria-hidden="true">
      <span className="inv-divider-line" />
      <svg viewBox="0 0 80 16" width="80" height="16">
        <circle cx="8" cy="8" r="1.6" fill="currentColor" />
        <ellipse cx="24" cy="8" rx="7" ry="3.2" fill="currentColor" opacity="0.6" />
        <path d="M40 1 L47 8 L40 15 L33 8 Z" fill="currentColor" />
        <ellipse cx="56" cy="8" rx="7" ry="3.2" fill="currentColor" opacity="0.6" />
        <circle cx="72" cy="8" r="1.6" fill="currentColor" />
      </svg>
      <span className="inv-divider-line" />
    </div>
  );
}

function SceneNo({ n }: { n: number }) {
  return (
    <p className="inv-scene-no" aria-hidden="true">
      {String(n).padStart(2, "0")}
      <small> / {String(SCENE_COUNT).padStart(2, "0")}</small>
    </p>
  );
}

/** Deterministic layouts (no Math.random → no hydration mismatch). */
const PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: (i * 1.7) % 14,
  duration: 12 + ((i * 5) % 9),
  size: 10 + ((i * 7) % 10),
  drift: (i % 2 === 0 ? 1 : -1) * (30 + ((i * 13) % 60)),
  hue: i % 3,
}));

const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  top: (i * 29 + 3) % 62,
  size: 1 + (i % 3),
  delay: (i * 0.37) % 4,
}));

function Petals() {
  return (
    <div className="inv-petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={`inv-petal inv-petal-${p.hue}`}
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ═══════════════ Countdown ═══════════════ */

function Countdown() {
  const t = useT();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  const diff = now === null ? null : Math.max(0, new Date(NIKAH_START).getTime() - now);
  if (diff === 0) {
    return <p className="inv-countdown-done">{t.date.done}</p>;
  }
  const units: [string, number | undefined][] = [
    [t.date.units[0], diff === null ? undefined : Math.floor(diff / 86_400_000)],
    [t.date.units[1], diff === null ? undefined : Math.floor(diff / 3_600_000) % 24],
    [t.date.units[2], diff === null ? undefined : Math.floor(diff / 60_000) % 60],
    [t.date.units[3], diff === null ? undefined : Math.floor(diff / 1000) % 60],
  ];
  return (
    <div className="inv-countdown" role="timer" aria-label={t.date.timerAria}>
      {units.map(([label, v]) => (
        <div className="inv-count-cell" key={label}>
          <span className="inv-count-num" key={v}>
            {v === undefined ? "--" : String(v).padStart(2, "0")}
          </span>
          <span className="inv-count-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════ Scenes ═══════════════ */

function Gate({ stage, onOpen }: { stage: string; onOpen: () => void }) {
  const t = useT();
  return (
    <div className="inv-gate" aria-hidden={stage !== "sealed"}>
      <div className="inv-gate-bg" />
      <button type="button" className="inv-gate-arch" onClick={onOpen} aria-label={t.gate.aria}>
        <span className="inv-gate-light">
          <span className="inv-gate-light-names">
            {t.gate.nameA}
            <br />&amp;<br />
            {t.gate.nameB}
          </span>
        </span>
        <span className="inv-door inv-door-l">
          <span className="inv-door-panel" />
          <span className="inv-ribbon inv-ribbon-l" />
        </span>
        <span className="inv-door inv-door-r">
          <span className="inv-door-panel" />
          <span className="inv-ribbon inv-ribbon-r" />
        </span>
        <Bow />
      </button>
      <Rose className="inv-gate-rose g1" />
      <Rose className="inv-gate-rose g2" />
      <Rose className="inv-gate-rose g3" />
      <Rose className="inv-gate-rose g4" />
      <p className="inv-gate-hint">
        <span className="inv-gate-hint-ar" lang="ar">بِسْمِ ٱللَّٰهِ</span>
        {t.gate.hint}
      </p>
    </div>
  );
}

function NamesScene() {
  const t = useT();
  return (
    <section className="inv-scene inv-scene-names" id="scene-1">
      <SceneNo n={1} />
      <div className="inv-arch-frame">
        <svg className="inv-arch-svg" viewBox="0 0 300 160" aria-hidden="true">
          <path className="inv-arch-fill" d="M14 160 V150 C14 90 92 46 150 8 C208 46 286 90 286 150 V160 Z" />
          <path
            className="inv-arch-path"
            d="M14 160 V150 C14 90 92 46 150 8 C208 46 286 90 286 150 V160"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            className="inv-arch-path inner"
            d="M26 160 V152 C26 98 100 60 150 24 C200 60 274 98 274 152 V160"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
        </svg>
        <span className="inv-arch-side" aria-hidden="true" />
        <Rose className="inv-arch-rose apex anim-2" />
        <Rose className="inv-arch-rose sl anim-3" />
        <Rose className="inv-arch-rose sr anim-3" />
        <Rose className="inv-arch-rose bl anim-4" />
        <Rose className="inv-arch-rose br anim-4" />

        <div className="inv-arch-content">
          <p className="inv-bismillah anim-1" lang="ar" dir="rtl">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="inv-bismillah-en anim-2">{t.names.bismillahTr}</p>
          <p className="inv-ayah anim-3" lang="ar" dir="rtl">
            وَخَلَقْنَاكُمْ أَزْوَاجًا
          </p>
          <p className="inv-ayah-en anim-3">{t.names.ayahTr}</p>

          <p className="inv-lead anim-4">{t.names.lead}</p>

          <h1 className="inv-names">
            <span className="inv-name inv-name-1">{t.groom}</span>
            <span className="inv-origin anim-6">
              <span>{t.names.groomOrigin[0]}</span> <span>{t.names.groomOrigin[1]}</span>
            </span>
            <span className="inv-with anim-7">
              <span className="inv-with-line" />
              <span className="inv-with-word">{t.names.with}</span>
              <span className="inv-with-line" />
            </span>
            <span className="inv-name inv-name-2">{t.bride}</span>
            <span className="inv-origin anim-9">
              <span>{t.names.brideOrigin[0]}</span> <span>{t.names.brideOrigin[1]}</span>
            </span>
          </h1>

          <p className="inv-inshallah anim-10">
            <span className="inv-star">✦</span> {t.names.inshallah} <span className="inv-star">✦</span>
          </p>
        </div>
      </div>
      <a className="inv-scroll-cue anim-10" href="#scene-2" aria-label={t.names.scrollAria}>
        <span>{t.names.scroll}</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </a>
    </section>
  );
}

function LetterScene({ guest }: { guest: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [dearBefore, dearAfter] = t.letter.dear(guest);
  return (
    <section className="inv-scene inv-scene-letter" id="scene-2">
      <SceneNo n={2} />
      <div className="inv-letter-head" data-reveal>
        <p className="inv-kicker">{t.letter.kicker}</p>
        <h2 className="inv-guest">
          <span className="inv-guest-ink">
            <span className="inv-foil inv-guest-text">{guest}</span>
            <svg className="inv-pen" viewBox="0 0 40 80" aria-hidden="true">
              <defs>
                <linearGradient id="penBody" x1="0" x2="1">
                  <stop offset="0" stopColor="#5b1426" />
                  <stop offset=".5" stopColor="#9b3550" />
                  <stop offset="1" stopColor="#5b1426" />
                </linearGradient>
                <linearGradient id="penNib" x1="0" x2="1">
                  <stop offset="0" stopColor="#a8762a" />
                  <stop offset=".5" stopColor="#f6e3a1" />
                  <stop offset="1" stopColor="#a8762a" />
                </linearGradient>
              </defs>
              <rect x="12" y="0" width="16" height="44" rx="5" fill="url(#penBody)" />
              <rect x="11" y="40" width="18" height="6" rx="2" fill="#d4a53c" />
              <path d="M12 46 H28 L22 74 Q20 80 18 74 Z" fill="url(#penNib)" />
              <path d="M20 54 V72" stroke="#7a5418" strokeWidth="1" />
              <circle cx="20" cy="54" r="1.6" fill="#7a5418" />
            </svg>
          </span>
        </h2>
      </div>

      <div data-reveal>
      <div className={`inv-envelope-wrap ${open ? "is-open" : ""}`}>
        <button
          type="button"
          className="inv-envelope"
          onClick={() => setOpen(true)}
          aria-label={t.letter.openAria}
          aria-expanded={open}
          disabled={open}
        >
          <span className="inv-env-back" />
          <span className="inv-env-letter">
            <span className="inv-env-letter-text" lang="ar" dir="rtl">
              بِسْمِ ٱللَّٰهِ
            </span>
          </span>
          <span className="inv-env-front" />
          <span className="inv-env-flap" />
          <span className="inv-seal">
            <span className="inv-seal-text">E&nbsp;S</span>
          </span>
        </button>
        {!open && <p className="inv-tap-hint">{t.letter.tapSeal}</p>}

        <div className="inv-letter-paper" aria-hidden={!open}>
          <span className="inv-letter-seal" aria-hidden="true">E&nbsp;S</span>
          <p className="inv-letter-salam" lang="ar" dir="rtl">
            ٱلسَّلَامُ عَلَيْكُمْ
          </p>
          <p className="inv-letter-dear">
            {dearBefore}
            <span className="inv-foil">{guest}</span>
            {dearAfter}
          </p>
          <p>
            {t.letter.body1[0]}
            <strong>{t.groom}</strong>
            {t.letter.body1[1]}
            <strong>{t.bride}</strong>
            {t.letter.body1[2]}
          </p>
          <p>{t.letter.body2}</p>
          <p className="inv-letter-sign">
            {t.letter.signOff}
            <span>{t.letter.family}</span>
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

function DateScene() {
  const t = useT();
  const nikah = useEvents().find((e) => e.id === "nikah")!;
  return (
    <section className="inv-scene inv-scene-date" id="scene-3">
      <SceneNo n={3} />
      <p className="inv-kicker" data-reveal>{t.date.kicker}</p>
      <div className="inv-bigdate" data-reveal>
        <span className="inv-bigdate-day">{t.date.day}</span>
        <span className="inv-bigdate-row">
          <span>15</span>
          <i />
          <span>03</span>
          <i />
          <span>2027</span>
        </span>
        <span className="inv-bigdate-time">{t.date.time}</span>
      </div>
      <div data-reveal>
        <p className="inv-countdown-title">{t.date.countdownTitle}</p>
        <Countdown />
      </div>
      <button type="button" className="inv-btn inv-btn-solid" data-reveal onClick={() => downloadIcs(nikah, t)}>
        <CalendarIcon /> {t.date.addToCalendar}
      </button>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm-2 8h14v10H5V10z"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
      />
    </svg>
  );
}

function EventsScene() {
  const t = useT();
  const EVENTS = useEvents();
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const go = (i: number) => {
    const t = trackRef.current;
    if (!t) return;
    const next = Math.max(0, Math.min(EVENTS.length - 1, i));
    t.scrollTo({ left: next * t.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const t = trackRef.current;
    if (t) setIdx(Math.round(t.scrollLeft / t.clientWidth));
  };

  return (
    <section className="inv-scene inv-scene-events" id="scene-4">
      <SceneNo n={4} />
      <p className="inv-kicker" data-reveal>{t.events.kicker}</p>
      <h2 className="inv-scene-title" data-reveal>{t.events.title}</h2>

      <div className="tags" data-reveal>
        <div
          className="tags-track"
          ref={trackRef}
          onScroll={onScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label={t.events.carouselAria}
        >
          {EVENTS.map((ev, i) => (
            <EventTag key={ev.id} ev={ev} seed={i + 1} label={t.events.slideLabel(i + 1, EVENTS.length)} />
          ))}
        </div>

        <div className="tags-nav">
          <button type="button" className="tags-arrow" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label={t.events.prevAria}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <div className="tags-status" aria-live="polite">
            <span className="tags-status-name">{EVENTS[idx]?.title}</span>
            <span className="tags-dots" aria-hidden="true">
              {EVENTS.map((ev, i) => (
                <i key={ev.id} className={i === idx ? "is-on" : ""} />
              ))}
            </span>
          </div>
          <button
            type="button"
            className="tags-arrow"
            onClick={() => go(idx + 1)}
            disabled={idx === EVENTS.length - 1}
            aria-label={t.events.nextAria}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
        <p className="tags-hint">{t.events.hint}</p>
      </div>
    </section>
  );
}

/* ─── Gift-tag pieces ─── */

/** Deterministic LCG → identical on server and client. */
function rng(seed: number) {
  let x = seed * 9301 + 49297;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

/** Torn, hand-made paper outline with a chamfered top (CSS polygon). */
function deckle(seed: number) {
  const r = rng(seed);
  const j = (amt: number) => ((r() - 0.5) * 2 * amt).toFixed(2);
  const pts: string[] = [];
  const C = 11; // chamfer depth in % of height
  // top edge
  for (let x = 24; x <= 76; x += 4) pts.push(`${x}% ${Math.abs(+j(0.35))}%`);
  // chamfer right
  for (let k = 1; k <= 6; k++) pts.push(`${(76 + (24 * k) / 6 - +Math.abs(+j(0.8))).toFixed(2)}% ${((C * k) / 6).toFixed(2)}%`);
  // right edge
  for (let y = C + 3; y <= 100; y += 3) pts.push(`${(100 - Math.abs(+j(1.4))).toFixed(2)}% ${y}%`);
  // bottom edge
  for (let x = 96; x >= 4; x -= 4) pts.push(`${x}% ${(100 - Math.abs(+j(0.5))).toFixed(2)}%`);
  // left edge
  for (let y = 98; y >= C + 3; y -= 3) pts.push(`${Math.abs(+j(1.4)).toFixed(2)}% ${y}%`);
  // chamfer left
  for (let k = 0; k < 6; k++) pts.push(`${((24 * k) / 6 + Math.abs(+j(0.8))).toFixed(2)}% ${(C - (C * k) / 6).toFixed(2)}%`);
  return `polygon(${pts.join(",")})`;
}

function Bloom({
  x,
  y,
  r,
  petals = 12,
  fill,
  inner,
  center,
  round = false,
}: {
  x: number;
  y: number;
  r: number;
  petals?: number;
  fill: string;
  inner?: string;
  center: string;
  round?: boolean;
}) {
  const ring = (n: number, rad: number, color: string, off: number) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse
        key={`${rad}-${i}`}
        cx={0}
        cy={-rad * 0.55}
        rx={rad * (round ? 0.42 : 0.26)}
        ry={rad * 0.55}
        fill={color}
        transform={`rotate(${(i * 360) / n + off})`}
      />
    ));
  return (
    <g transform={`translate(${x} ${y})`}>
      {ring(petals, r, fill, 0)}
      {inner && ring(Math.max(5, petals - 3), r * 0.68, inner, 360 / petals / 2)}
      <circle r={r * (round ? 0.3 : 0.22)} fill={center} />
    </g>
  );
}

function Sprig({ x, y, rot, len = 46, color = "#6f9474" }: { x: number; y: number; rot: number; len?: number; color?: string }) {
  const leaves = [0.25, 0.45, 0.65, 0.85];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 Q4 ${-len / 2} 0 ${-len}`} stroke={color} strokeWidth="1.4" fill="none" />
      {leaves.map((t, i) => (
        <ellipse
          key={t}
          cx={i % 2 ? 5 : -5}
          cy={-len * t}
          rx="3.4"
          ry="7.5"
          fill={color}
          transform={`rotate(${i % 2 ? 40 : -40} ${i % 2 ? 5 : -5} ${-len * t})`}
        />
      ))}
      <ellipse cx="0" cy={-len - 4} rx="3" ry="6.5" fill={color} />
    </g>
  );
}

function Petal({ x, y, rot, color }: { x: number; y: number; rot: number; color: string }) {
  return <path d="M0 0 C5 -6 5 -14 0 -20 C-5 -14 -5 -6 0 0 Z" fill={color} transform={`translate(${x} ${y}) rotate(${rot})`} opacity=".9" />;
}

function Florals({ kind }: { kind: Flora }) {
  return (
    <svg className="tag-florals" viewBox="0 0 200 150" aria-hidden="true">
      {kind === "rose" && (
        <>
          <Sprig x={58} y={124} rot={-55} len={58} />
          <Sprig x={146} y={124} rot={55} len={58} />
          <Sprig x={100} y={140} rot={4} len={36} color="#86a886" />
          <Bloom x={100} y={72} r={32} petals={9} fill="#e9a5b4" inner="#f4c6cf" center="#d17f95" round />
          <Bloom x={62} y={96} r={20} petals={8} fill="#f1bfca" inner="#f8dbe1" center="#d891a4" round />
          <Bloom x={140} y={98} r={20} petals={8} fill="#eeb2bf" inner="#f6d2da" center="#d4889c" round />
          <Petal x={36} y={50} rot={-60} color="#f1bfca" />
          <Petal x={166} y={56} rot={60} color="#e9a5b4" />
          <Petal x={150} y={30} rot={10} color="#f4c6cf" />
        </>
      )}
      {kind === "mixed" && (
        <>
          <Sprig x={54} y={126} rot={-52} len={58} />
          <Sprig x={148} y={126} rot={52} len={58} />
          <Sprig x={100} y={142} rot={0} len={40} color="#86a886" />
          <Bloom x={76} y={70} r={26} petals={9} fill="#c96b82" inner="#e299ab" center="#9e3f58" round />
          <Bloom x={128} y={74} r={24} petals={15} fill="#f2b232" inner="#f7c95a" center="#c98a1c" />
          <Bloom x={102} y={110} r={16} petals={6} fill="#fffdf6" inner="#f4efe2" center="#f0d27a" round />
          <Petal x={36} y={40} rot={-40} color="#e299ab" />
          <Petal x={166} y={44} rot={40} color="#f2b232" />
          <Petal x={160} y={116} rot={150} color="#c96b82" />
        </>
      )}
    </svg>
  );
}

function TagRibbon() {
  return (
    <svg className="tag-ribbon" viewBox="0 0 120 120" aria-hidden="true">
      {/* hanging loop */}
      <path d="M52 92 C44 50 46 8 60 4 C74 8 76 50 68 92" fill="none" stroke="var(--rb)" strokeWidth="7" strokeLinecap="round" />
      <path d="M52 92 C44 50 46 8 60 4 C74 8 76 50 68 92" fill="none" stroke="var(--rb-hi)" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      {/* tails */}
      <path d="M58 70 L40 112 L47 108 L52 116 L62 74 Z" fill="var(--rb-dk)" />
      <path d="M62 70 L80 112 L73 108 L68 116 L58 74 Z" fill="var(--rb)" />
      {/* loops */}
      <path d="M60 68 C46 48 16 46 18 62 C20 78 46 76 60 68 Z" fill="var(--rb)" stroke="var(--rb-dk)" strokeWidth="1" />
      <path d="M60 68 C74 48 104 46 102 62 C100 78 74 76 60 68 Z" fill="var(--rb)" stroke="var(--rb-dk)" strokeWidth="1" />
      <path d="M58 66 C46 58 30 56 26 61" fill="none" stroke="var(--rb-hi)" strokeWidth="2" opacity=".7" />
      <path d="M62 66 C74 58 90 56 94 61" fill="none" stroke="var(--rb-hi)" strokeWidth="2" opacity=".7" />
      <rect x="53" y="61" width="14" height="14" rx="5" fill="var(--rb-dk)" />
      <rect x="55" y="62" width="10" height="5" rx="2.5" fill="var(--rb-hi)" opacity=".6" />
    </svg>
  );
}

function EventTag({ ev, seed, label }: { ev: InvEvent; seed: number; label: string }) {
  const t = useT();
  const [flipped, setFlipped] = useState(false);
  const clip = deckle(seed * 7);
  const clipBack = deckle(seed * 13);
  return (
    <div className="tag-slide" aria-roledescription="slide" aria-label={`${ev.title}, ${label}`}>
      <div className={`tag-hanger rb-${ev.ribbon}`}>
        <TagRibbon />
        <div className={`tag-flip ${flipped ? "is-flipped" : ""}`}>
          {/* front */}
          <div className="tag-face tag-front" inert={flipped}>
            <button
              type="button"
              className="tag-paper"
              style={{ clipPath: clip }}
              onClick={() => setFlipped(true)}
              aria-label={`${ev.title} — ${ev.day}, ${ev.date}, ${ev.time}. ${t.events.showDetails}`}
            >
              <span className="tag-eyelet" />
              <Florals kind={ev.flora} />
              <span className={`tag-title ${ev.title.length > 10 ? "long" : ""}`}>{ev.title}</span>
              <span className="tag-rule" />
              <span className="tag-day">{ev.day}</span>
              <span className="tag-date">{ev.date}</span>
              <span className="tag-time">{ev.time}</span>
              <span className="tag-more">{t.events.tapForDetails}</span>
            </button>
          </div>

          {/* back */}
          <div className="tag-face tag-back" inert={!flipped}>
            <div className="tag-paper" style={{ clipPath: clipBack }}>
              <span className="tag-eyelet" />
              <button type="button" className="tag-close" onClick={() => setFlipped(false)} aria-label={t.events.closeAria}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
              <h3 className="tag-title sm">{ev.title}</h3>
              <p className="tag-when">
                {ev.day} {ev.date}
              </p>
              <p className="tag-when-time">{t.events.onwards(ev.time)}</p>
              <span className="tag-rule" />
              <p className="tag-about">{ev.about}</p>
              <p className="tag-label">{ev.venueLabel}</p>
              <p className="tag-venue">{ev.venueName}</p>
              <p className="tag-area">{ev.venueArea}</p>
              <div className="tag-actions">
                <a className="tag-btn" href={ev.map} target="_blank" rel="noopener noreferrer">
                  <PinIcon /> {t.events.directions}
                </a>
                <button type="button" className="tag-btn" onClick={() => downloadIcs(ev, t)}>
                  <CalendarIcon /> {t.events.addToCalendar}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RsvpScene({ guest }: { guest: string }) {
  const t = useT();
  /** null until the guest edits it — falls back to the name from the link */
  const [nameInput, setName] = useState<string | null>(null);
  const name = nameInput ?? guest;
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = t.rsvp.message({ name: name.trim(), yes: attending === "yes", count, note: note.trim() });
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${RSVP_WHATSAPP}?text=${text}`, "_blank", "noopener");
    setSent(true);
  };

  return (
    <section className="inv-scene inv-scene-rsvp" id="scene-5">
      <SceneNo n={5} />
      <p className="inv-kicker" data-reveal>{t.rsvp.kicker}</p>
      <h2 className="inv-scene-title" data-reveal>{t.rsvp.title}</h2>

      <div className="inv-rsvp-card" data-reveal>
        {sent ? (
          <div className="inv-rsvp-thanks">
            <p className="inv-rsvp-thanks-ar" lang="ar">جَزَاكَ ٱللَّٰهُ خَيْرًا</p>
            <p className="inv-rsvp-thanks-title">{t.rsvp.thanks(name.trim() || t.rsvp.thanksFallback)}</p>
            <p>{t.rsvp.thanksBody}</p>
            <button type="button" className="inv-btn" onClick={() => setSent(false)}>
              {t.rsvp.edit}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="inv-rsvp-form">
            <label className="inv-field">
              <span>{t.rsvp.nameLabel}</span>
              <input
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.rsvp.namePlaceholder}
                autoComplete="name"
              />
            </label>

            <fieldset className="inv-choice">
              <legend>{t.rsvp.attendLegend}</legend>
              <label className={attending === "yes" ? "is-on" : ""}>
                <input type="radio" name="att" checked={attending === "yes"} onChange={() => setAttending("yes")} />
                {t.rsvp.yes}
              </label>
              <label className={attending === "no" ? "is-on" : ""}>
                <input type="radio" name="att" checked={attending === "no"} onChange={() => setAttending("no")} />
                {t.rsvp.no}
              </label>
            </fieldset>

            {attending === "yes" && (
              <div className="inv-field">
                <span>{t.rsvp.guests}</span>
                <div className="inv-stepper">
                  <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label={t.rsvp.fewerAria}>
                    −
                  </button>
                  <output aria-live="polite">{count}</output>
                  <button type="button" onClick={() => setCount((c) => Math.min(20, c + 1))} aria-label={t.rsvp.moreAria}>
                    +
                  </button>
                </div>
              </div>
            )}

            <label className="inv-field">
              <span>{t.rsvp.noteLabel}</span>
              <textarea
                rows={3}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.rsvp.notePlaceholder}
              />
            </label>

            <button type="submit" className="inv-btn inv-btn-solid inv-btn-wide">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.7-.2 1.3z"
                />
              </svg>
              {t.rsvp.send}
            </button>
          </form>
        )}
      </div>

      <div className="inv-contact" data-reveal>
        <p className="inv-contact-label">{t.rsvp.contactLabel}</p>
        <p className="inv-contact-number">{CONTACT_PHONE}</p>
        <div className="inv-event-actions">
          <a className="inv-btn" href={`tel:+${RSVP_WHATSAPP}`}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"
              />
            </svg>
            {t.rsvp.call}
          </a>
          <a
            className="inv-btn"
            href={`https://wa.me/${RSVP_WHATSAPP}?text=${encodeURIComponent(t.rsvp.contactMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.7-.2 1.3z"
              />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Personalised sharing ─── */

const pageUrl = () => window.location.origin + window.location.pathname;

/** For display only: drop the scheme and show encoded names (e.g. Hindi) as text. */
function readableLink(link: string) {
  const bare = link.replace(/^https?:\/\//, "");
  try {
    return decodeURIComponent(bare);
  } catch {
    return bare;
  }
}

function inviteLink(base: string, name: string) {
  const n = name.replace(/\s+/g, " ").trim();
  return n ? `${base}?to=${encodeURIComponent(n)}` : base;
}

function SharePanel() {
  const t = useT();
  const base = useSyncExternalStore(noopSubscribe, pageUrl, () => t.siteUrl);
  const [name, setName] = useState("");
  /** Hindi page: the host's correction of the auto-converted Devanagari spelling */
  const [hiEdit, setHiEdit] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const isHi = t.lang === "hi";
  const hiName = hiEdit ?? toDevanagari(name);
  const linkName = (isHi ? hiName : name).trim();
  const link = inviteLink(base, linkName);
  const text = t.share.text(linkName);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      flash(t.share.copied);
    } catch {
      flash(t.share.copyFailed);
    }
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: t.share.sheetTitle, text, url: link });
    } catch {
      /* share sheet dismissed */
    }
  };

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`;

  return (
    <div className="inv-share" data-reveal>
      <p className="inv-share-title">{t.share.title}</p>
      <p className="inv-share-sub">{t.share.sub}</p>

      <label className="inv-share-field">
        <span className="sr-only">{t.share.label}</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setHiEdit(null);
          }}
          maxLength={40}
          placeholder={t.share.placeholder}
          autoComplete="off"
          enterKeyHint="done"
        />
        {name && (
          <button
            type="button"
            className="inv-share-clear"
            onClick={() => {
              setName("");
              setHiEdit(null);
            }}
            aria-label={t.share.clearAria}
          >
            ×
          </button>
        )}
      </label>

      {isHi && name.trim() && (
        <label className="inv-share-field inv-share-hi">
          <span className="inv-share-hi-label">{t.share.hiNameLabel}</span>
          <input value={hiName} onChange={(e) => setHiEdit(e.target.value)} maxLength={40} lang="hi" autoComplete="off" />
        </label>
      )}

      <p className="inv-share-link" title={link}>
        <span>{readableLink(link)}</span>
      </p>

      <div className="inv-share-actions">
        <button type="button" className="inv-btn inv-btn-gold" onClick={share}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M14 5l7 7-7 7v-4c-6 0-9 2-11 6 1-6 4-11 11-12V5z" />
          </svg>
          {t.share.share}
        </button>
        <a className="inv-btn inv-btn-ghost" href={whatsapp} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.7-.2 1.3z"
            />
          </svg>
          WhatsApp
        </a>
        <button type="button" className="inv-btn inv-btn-ghost" onClick={copy}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3zm2 0h3a2 2 0 0 1 2 2v5h3V4h-8v3zM5 9v10h8V9H5z"
            />
          </svg>
          {t.share.copy}
        </button>
      </div>
      <p className="inv-share-msg" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

/** `showShare` is false on personalised links — guests shouldn’t see the host’s share tools. */
function DuaScene({ showShare }: { showShare: boolean }) {
  const t = useT();
  return (
    <section className="inv-scene inv-scene-dua" id="scene-6">
      <div className="inv-sky" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="inv-sky-star"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
          />
        ))}
        <span className="inv-moon" />
        <svg className="inv-skyline" viewBox="0 0 400 90" preserveAspectRatio="xMidYMax slice">
          <path
            fill="currentColor"
            d="M0 90 V70 H30 V52 h4 V40 l3-6 3 6 V52 h4 V70 H120 C120 50 140 38 160 34 C162 28 168 24 170 20 C172 24 178 28 180 34 C200 38 220 50 220 70 H252 V48 h4 V36 l3-6 3 6 V48 h4 V70 H300 C300 60 312 54 322 52 C324 48 326 46 328 44 C330 46 332 48 334 52 C344 54 356 60 356 70 H400 V90 Z"
          />
        </svg>
      </div>

      <div className="inv-dua-content">
        <SceneNo n={6} />
        <p className="inv-kicker light" data-reveal>{t.dua.kicker}</p>
        <h2 className="inv-shukriya" data-reveal>{t.dua.shukriya}</h2>
        <p className="inv-dua-ar" lang="ar" dir="rtl" data-reveal>
          بَارَكَ ٱللَّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
        </p>
        <p className="inv-dua-en" data-reveal>{t.dua.translation}</p>
        <Divider />
        <p className="inv-dua-note" data-reveal>{t.dua.note}</p>
        <p className="inv-dua-from" data-reveal>
          {t.dua.from}
          <span>{t.dua.family}</span>
        </p>
        {showShare && <SharePanel />}
      </div>
    </section>
  );
}

/* ═══════════════ Page ═══════════════ */

/** Personalised guest name from the link: /invitation?to=Shaheen%20Khala */
function guestFromUrl() {
  // also accept params placed after the hash, e.g. /invitation#scene-2?to=Name
  const hashQuery = window.location.hash.split("?")[1] ?? "";
  const read = (q: string) => {
    const p = new URLSearchParams(q);
    return p.get("to") ?? p.get("guest") ?? p.get("name");
  };
  const raw = read(window.location.search) ?? read(hashQuery) ?? "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 40);
}
const noopSubscribe = () => () => {};

export default function Invitation({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [stage, setStage] = useState<"sealed" | "opening" | "open">("sealed");
  /** "" when the link carries no guest name */
  const linkGuest = useSyncExternalStore(noopSubscribe, guestFromUrl, () => "");
  /** On the Hindi page, a name typed in English is shown in Devanagari. */
  const shownGuest = lang === "hi" ? toDevanagari(linkGuest) : linkGuest;
  const guest = shownGuest || t.defaultGuest;
  const [active, setActive] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (stage !== "open") document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  // Reveal-on-scroll + active-scene tracking.
  useEffect(() => {
    if (stage === "sealed") return;
    const root = rootRef.current;
    if (!root) return;
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            reveal.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const scenes = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number(e.target.id.replace("scene-", "")));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    root.querySelectorAll(".inv-scene").forEach((el) => scenes.observe(el));
    return () => {
      reveal.disconnect();
      scenes.disconnect();
    };
  }, [stage]);

  const openGate = () => {
    if (stage !== "sealed") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStage("opening");
    setTimeout(() => setStage("open"), reduce ? 50 : 2600);
  };

  return (
    <CopyCtx.Provider value={t}>
    <div ref={rootRef} className={`inv-page stage-${stage}`}>
      {stage !== "open" && <Gate stage={stage} onOpen={openGate} />}
      <Petals />

      <nav className="inv-dots" aria-label={t.scenes.join(" · ")}>
        {t.scenes.map((label, i) => (
          <a
            key={label}
            href={`#scene-${i + 1}`}
            className={active === i + 1 ? "is-active" : ""}
            aria-label={label}
            aria-current={active === i + 1 ? "true" : undefined}
          />
        ))}
      </nav>

      <main className="inv-main">
        <NamesScene />
        <LetterScene guest={guest} />
        <DateScene />
        <EventsScene />
        <RsvpScene guest={shownGuest} />
        <DuaScene showShare={!linkGuest} />
      </main>
    </div>
    </CopyCtx.Provider>
  );
}
