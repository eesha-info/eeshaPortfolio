"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ═══════════════ Configuration ═══════════════ */

/**
 * WhatsApp number (country code + number, digits only, e.g. "919876543210")
 * that RSVPs are sent to. Leave empty to let the guest pick a contact.
 */
const RSVP_WHATSAPP = "919431258394";
/** Shown for calls / queries */
const CONTACT_PHONE = "+91 94312 58394";

const GROOM = "Mohammad Eesha";
const BRIDE = "Shabistan Shahin";
const DEFAULT_GUEST = "Our Dear Guest";

type InvEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  /** UTC start (IST = UTC+5:30) */
  startUtc: string;
  hours: number;
  /** Google Maps link */
  map: string;
  highlight?: boolean;
};

/** Nikah venue — Deewan E Khas Marriage Hall, Phulwari Sharif */
const MAP_VENUE = "https://maps.app.goo.gl/9ipW48q5oGVD2ZiU9";
/** Groom's home — Ward No. 14, Maheshua (reception) */
const MAP_HOME = "https://maps.app.goo.gl/DReaLDiK4ABrCxHHA";

const NIKAH_START = "2027-03-15T13:30:00Z";

const EVENTS: InvEvent[] = [
  {
    id: "baraat-departure",
    title: "Baraat Departure",
    date: "Mon, 15th March 2027",
    time: "10:00 a.m.",
    place: "From Ward No. 14, Maheshua, Madhepura",
    startUtc: "2027-03-15T04:30:00Z",
    hours: 1,
    map: MAP_HOME,
  },
  {
    id: "nikah",
    title: "Nikah Ceremony",
    date: "Monday, 15th March 2027",
    time: "7:00 p.m.",
    place: "Deewan E Khas Marriage Hall, Sadar Colony, Phulwari Sharif, Patna, Bihar 801505",
    startUtc: NIKAH_START,
    hours: 3,
    map: MAP_VENUE,
    highlight: true,
  },
  {
    id: "baraat-return",
    title: "Baraat Return",
    date: "Tue, 16th March 2027",
    time: "6:00 a.m.",
    place: "From Phulwari Sharif, Patna",
    startUtc: "2027-03-16T00:30:00Z",
    hours: 1,
    map: MAP_VENUE,
  },
  {
    id: "reception",
    title: "Reception",
    date: "Thursday, 18th March 2027",
    time: "7:00 p.m.",
    place: "Ward No. 14, Maheshua, District Madhepura, Bihar",
    startUtc: "2027-03-18T13:30:00Z",
    hours: 3,
    map: MAP_HOME,
    highlight: true,
  },
];

const SCENES = ["Names", "Letter", "Date", "Events", "RSVP", "Dua"];

/* ═══════════════ Helpers ═══════════════ */

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function downloadIcs(ev: InvEvent) {
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
    `SUMMARY:${ev.title} — ${GROOM} & ${BRIDE}`,
    `LOCATION:${ev.place.replace(/,/g, "\\,")}`,
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

function OrdinalText({ text }: { text: string }) {
  const parts = text.split(/(\d+)(st|nd|rd|th)/);
  return (
    <>
      {parts.map((p, i) => (i % 3 === 2 ? <sup key={i}>{p}</sup> : <span key={i}>{p}</span>))}
    </>
  );
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
      <small> / {String(SCENES.length).padStart(2, "0")}</small>
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
    return <p className="inv-countdown-done">Alhamdulillah — the blessed day is here!</p>;
  }
  const units: [string, number | undefined][] = [
    ["Days", diff === null ? undefined : Math.floor(diff / 86_400_000)],
    ["Hours", diff === null ? undefined : Math.floor(diff / 3_600_000) % 24],
    ["Minutes", diff === null ? undefined : Math.floor(diff / 60_000) % 60],
    ["Seconds", diff === null ? undefined : Math.floor(diff / 1000) % 60],
  ];
  return (
    <div className="inv-countdown" role="timer" aria-label="Time remaining until the Nikah">
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
  return (
    <div className="inv-gate" aria-hidden={stage !== "sealed"}>
      <div className="inv-gate-bg" />
      <button type="button" className="inv-gate-arch" onClick={onOpen} aria-label="Open the invitation">
        <span className="inv-gate-light">
          <span className="inv-gate-light-names">
            Eesha
            <br />&amp;<br />
            Shabistan
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
        Tap the doors to open
      </p>
    </div>
  );
}

function NamesScene() {
  return (
    <section className="inv-scene inv-scene-names" id="scene-1">
      <SceneNo n={1} />
      <div className="inv-arch-frame">
        <svg className="inv-arch-svg" viewBox="0 0 300 160" aria-hidden="true">
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
          <p className="inv-bismillah-en anim-2">
            In the name of Allah, the Most Beneficent, the Most Merciful
          </p>
          <p className="inv-ayah anim-3" lang="ar" dir="rtl">
            وَخَلَقْنَاكُمْ أَزْوَاجًا
          </p>
          <p className="inv-ayah-en anim-3">“And We created you in pairs.” — Surah An-Naba, 78:8</p>

          <p className="inv-lead anim-4">
            With the blessings of Almighty Allah, we cordially invite you to grace the auspicious
            Nikah ceremony of
          </p>

          <h1 className="inv-names">
            <span className="inv-name inv-name-1">{GROOM}</span>
            <span className="inv-origin anim-6">Ward No. 14, Maheshua · Madhepura, Bihar</span>
            <span className="inv-with anim-7">
              <span className="inv-with-line" />
              <span className="inv-with-word">with</span>
              <span className="inv-with-line" />
            </span>
            <span className="inv-name inv-name-2">{BRIDE}</span>
            <span className="inv-origin anim-9">Phulwari Sharif · Patna, Bihar</span>
          </h1>

          <p className="inv-inshallah anim-10">
            <span className="inv-star">✦</span> Insha Allah <span className="inv-star">✦</span>
          </p>
        </div>
      </div>
      <a className="inv-scroll-cue anim-10" href="#scene-2" aria-label="Continue to your letter">
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </a>
    </section>
  );
}

function LetterScene({ guest }: { guest: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="inv-scene inv-scene-letter" id="scene-2">
      <SceneNo n={2} />
      <div className="inv-letter-head" data-reveal>
        <p className="inv-kicker">A letter for</p>
        <h2 className="inv-guest">{guest}</h2>
      </div>

      <div data-reveal>
      <div className={`inv-envelope-wrap ${open ? "is-open" : ""}`}>
        <button
          type="button"
          className="inv-envelope"
          onClick={() => setOpen(true)}
          aria-label="Open your letter"
          aria-expanded={open}
          disabled={open}
        >
          <span className="inv-env-back" />
          <span className="inv-env-letter">
            <span className="inv-env-letter-text">Bismillah</span>
          </span>
          <span className="inv-env-front" />
          <span className="inv-env-flap" />
          <span className="inv-seal">
            <span className="inv-seal-text">E&nbsp;S</span>
          </span>
        </button>
        {!open && <p className="inv-tap-hint">Tap the seal to open</p>}

        <div className="inv-letter-paper" aria-hidden={!open}>
          <p className="inv-letter-salam" lang="ar" dir="rtl">
            ٱلسَّلَامُ عَلَيْكُمْ
          </p>
          <p className="inv-letter-dear">Dear {guest},</p>
          <p>
            With hearts full of gratitude to Almighty Allah, we joyfully invite you and your
            family to share in a moment we have long prayed for — the Nikah of our beloved{" "}
            <strong>{GROOM}</strong> with <strong>{BRIDE}</strong>.
          </p>
          <p>
            Your presence will bring us joy, and your duas will be the most precious gift as two
            hearts and two families become one.
          </p>
          <p className="inv-letter-sign">
            With love &amp; duas,
            <span>Family &amp; Friends</span>
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

function DateScene() {
  const nikah = EVENTS.find((e) => e.id === "nikah")!;
  return (
    <section className="inv-scene inv-scene-date" id="scene-3">
      <SceneNo n={3} />
      <p className="inv-kicker" data-reveal>Save the date</p>
      <div className="inv-bigdate" data-reveal>
        <span className="inv-bigdate-day">Monday</span>
        <span className="inv-bigdate-row">
          <span>15</span>
          <i />
          <span>03</span>
          <i />
          <span>2027</span>
        </span>
        <span className="inv-bigdate-time">at 7:00 p.m. · Insha Allah</span>
      </div>
      <div data-reveal>
        <p className="inv-countdown-title">Counting the moments until the Nikah</p>
        <Countdown />
      </div>
      <button type="button" className="inv-btn inv-btn-solid" data-reveal onClick={() => downloadIcs(nikah)}>
        <CalendarIcon /> Add to my calendar
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
  return (
    <section className="inv-scene inv-scene-events" id="scene-4">
      <SceneNo n={4} />
      <p className="inv-kicker" data-reveal>Please join us for</p>
      <h2 className="inv-scene-title" data-reveal>The Celebrations</h2>
      <ol className="inv-timeline">
        {EVENTS.map((ev) => (
          <li key={ev.id} className={`inv-tl-item ${ev.highlight ? "is-major" : ""}`} data-reveal>
            <span className="inv-tl-dot" aria-hidden="true" />
            <article className="inv-event">
              <h3 className="inv-event-title">{ev.title}</h3>
              <p className="inv-event-date">
                <OrdinalText text={ev.date} />
              </p>
              <p className="inv-event-time">at {ev.time}</p>
              <p className="inv-event-place">{ev.place}</p>
              <div className="inv-event-actions">
                <a className="inv-btn" href={ev.map} target="_blank" rel="noopener noreferrer">
                  <PinIcon /> Directions
                </a>
                <button className="inv-btn" type="button" onClick={() => downloadIcs(ev)}>
                  <CalendarIcon /> Save date
                </button>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RsvpScene({ guest }: { guest: string }) {
  /** null until the guest edits it — falls back to the name from the link */
  const [nameInput, setName] = useState<string | null>(null);
  const name = nameInput ?? (guest !== DEFAULT_GUEST ? guest : "");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      "Assalamu Alaikum! 🌙",
      `RSVP — Nikah of ${GROOM} & ${BRIDE}`,
      "",
      `Name: ${name.trim()}`,
      `Attending: ${attending === "yes" ? "Joyfully accepts ✅" : "Regretfully declines"}`,
      ...(attending === "yes" ? [`Number of guests: ${count}`] : []),
      ...(note.trim() ? ["", `Dua / message: ${note.trim()}`] : []),
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${RSVP_WHATSAPP}?text=${text}`, "_blank", "noopener");
    setSent(true);
  };

  return (
    <section className="inv-scene inv-scene-rsvp" id="scene-5">
      <SceneNo n={5} />
      <p className="inv-kicker" data-reveal>Kindly reply</p>
      <h2 className="inv-scene-title" data-reveal>Will you join us?</h2>

      <div className="inv-rsvp-card" data-reveal>
        {sent ? (
          <div className="inv-rsvp-thanks">
            <p className="inv-rsvp-thanks-ar" lang="ar">جَزَاكَ ٱللَّٰهُ خَيْرًا</p>
            <p className="inv-rsvp-thanks-title">Thank you, {name.trim() || "dear guest"}!</p>
            <p>Your reply has been prepared in WhatsApp — just press send.</p>
            <button type="button" className="inv-btn" onClick={() => setSent(false)}>
              Edit reply
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="inv-rsvp-form">
            <label className="inv-field">
              <span>Your name</span>
              <input
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
              />
            </label>

            <fieldset className="inv-choice">
              <legend>Will you attend?</legend>
              <label className={attending === "yes" ? "is-on" : ""}>
                <input type="radio" name="att" checked={attending === "yes"} onChange={() => setAttending("yes")} />
                Joyfully accept
              </label>
              <label className={attending === "no" ? "is-on" : ""}>
                <input type="radio" name="att" checked={attending === "no"} onChange={() => setAttending("no")} />
                Regretfully decline
              </label>
            </fieldset>

            {attending === "yes" && (
              <div className="inv-field">
                <span>Number of guests</span>
                <div className="inv-stepper">
                  <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label="Fewer guests">
                    −
                  </button>
                  <output aria-live="polite">{count}</output>
                  <button type="button" onClick={() => setCount((c) => Math.min(20, c + 1))} aria-label="More guests">
                    +
                  </button>
                </div>
              </div>
            )}

            <label className="inv-field">
              <span>A dua or message for the couple (optional)</span>
              <textarea
                rows={3}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="May Allah bless you both…"
              />
            </label>

            <button type="submit" className="inv-btn inv-btn-solid inv-btn-wide">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.7-.2 1.3z"
                />
              </svg>
              Send RSVP
            </button>
          </form>
        )}
      </div>

      <div className="inv-contact" data-reveal>
        <p className="inv-contact-label">For any queries, reach us at</p>
        <p className="inv-contact-number">{CONTACT_PHONE}</p>
        <div className="inv-event-actions">
          <a className="inv-btn" href={`tel:+${RSVP_WHATSAPP}`}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"
              />
            </svg>
            Call
          </a>
          <a
            className="inv-btn"
            href={`https://wa.me/${RSVP_WHATSAPP}?text=${encodeURIComponent(`Assalamu Alaikum! Regarding the Nikah of ${GROOM} & ${BRIDE} —`)}`}
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

function DuaScene() {
  const [shareMsg, setShareMsg] = useState("");
  const share = async () => {
    const url = window.location.origin + window.location.pathname;
    const text = `You are cordially invited to the Nikah of ${GROOM} with ${BRIDE} — Monday, 15th March 2027, Insha Allah.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Nikah Invitation", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg("Invitation link copied!");
    } catch {
      /* share sheet dismissed */
    }
  };

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
        <p className="inv-kicker light" data-reveal>With love and gratitude</p>
        <h2 className="inv-shukriya" data-reveal>Shukriya</h2>
        <p className="inv-dua-ar" lang="ar" dir="rtl" data-reveal>
          بَارَكَ ٱللَّٰهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
        </p>
        <p className="inv-dua-en" data-reveal>
          “May Allah bless you both, shower His blessings upon you, and unite you in goodness.”
        </p>
        <Divider />
        <p className="inv-dua-note" data-reveal>Your presence and duas will make our joy complete</p>
        <p className="inv-dua-from" data-reveal>
          With best compliments from
          <span>Family &amp; Friends</span>
        </p>
        <button type="button" className="inv-btn inv-btn-gold" data-reveal onClick={share}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M14 5l7 7-7 7v-4c-6 0-9 2-11 6 1-6 4-11 11-12V5z" />
          </svg>
          Forward this invitation
        </button>
        {shareMsg && <p className="inv-share-msg">{shareMsg}</p>}
      </div>
    </section>
  );
}

/* ═══════════════ Page ═══════════════ */

/** Personalised guest name from the link: /invitation?to=Shaheen%20Khala */
function guestFromUrl() {
  const p = new URLSearchParams(window.location.search);
  return (p.get("to") ?? p.get("guest") ?? "").trim().slice(0, 40) || DEFAULT_GUEST;
}
const noopSubscribe = () => () => {};

export default function Invitation() {
  const [stage, setStage] = useState<"sealed" | "opening" | "open">("sealed");
  const guest = useSyncExternalStore(noopSubscribe, guestFromUrl, () => DEFAULT_GUEST);
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
    <div ref={rootRef} className={`inv-page stage-${stage}`}>
      {stage !== "open" && <Gate stage={stage} onOpen={openGate} />}
      <Petals />

      <nav className="inv-dots" aria-label="Invitation sections">
        {SCENES.map((label, i) => (
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
        <RsvpScene guest={guest} />
        <DuaScene />
      </main>
    </div>
  );
}
