"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../invoice.css";
import "./mdi.css";
import { amountInWords, fmt, fmtDate, r2, todayISO, uid, addDays } from "../utils";

/* ─────────────────────────────────────────────
   Modern Delhi Infotech — student fee invoice
   Same workspace as the GST generator, but shaped
   around a course, its fee, GST and installments.
   ───────────────────────────────────────────── */

const STORAGE_KEY = "mdeesha.invoice-generator.mdi.v1";
const DEFAULT_LOGO = "/mdi/logo.png";
const MAX_LOGO_DIMENSION = 500;

const OTHER_COURSE = "Other";

/** Preset courses — picking one fills the full name and duration,
    both of which stay editable afterwards. */
const COURSES: { code: string; name: string; duration: string }[] = [
  { code: "ADIT", name: "Advanced Diploma in Information Technology", duration: "12 Months" },
  { code: "ADCA", name: "Advanced Diploma in Computer Applications", duration: "12 Months" },
  { code: "DCA", name: "Diploma in Computer Applications", duration: "6 Months" },
  { code: "DTP", name: "Desktop Publishing", duration: "3 Months" },
  { code: "Typing", name: "Typing (Hindi & English)", duration: "3 Months" },
];

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque"];
const OTHER_MODE = "Other";

type InstallmentStatus = "Paid" | "Due";

type Installment = {
  id: string;
  label: string;
  date: string;
  amount: number;
  mode: string;
  reference: string;
  status: InstallmentStatus;
};

type FeeLine = {
  id: string;
  label: string;
  amount: number;
};

type MdiState = {
  logo: string;
  institute: {
    name: string;
    tagline: string;
    branchCode: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
    headOffice: string;
  };
  meta: {
    title: string;
    number: string;
    date: string;
    session: string;
  };
  student: {
    name: string;
    guardian: string;
    mobile: string;
    address: string;
    regNo: string;
    batchNo: string;
    batchTime: string;
    admissionDate: string;
  };
  course: {
    code: string;
    customCode: string;
    fullName: string;
    duration: string;
  };
  courseFee: number;
  extras: FeeLine[];
  discount: number;
  gstOn: boolean;
  gstRate: number;
  installments: Installment[];
  notes: string;
  /** Optional authorised-signatory block for the institute; off by default. */
  showSignature: boolean;
  signatory: string;
  signatureImg: string;
};

type SectionKey =
  | "institute"
  | "meta"
  | "student"
  | "course"
  | "installments"
  | "notes";

/* ─── Defaults ─── */

/** Indian financial year for a date, e.g. 2026-10-31 → "2026-27". */
function sessionFor(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
}

function defaultState(): MdiState {
  const today = todayISO();
  const adit = COURSES[0];
  return {
    logo: "",
    institute: {
      name: "Modern Delhi Infotech",
      tagline: "Computer Education & Training Centre",
      branchCode: "2",
      address: "Near Janseva Nursing Home, Adarsh Nagar, Madhepura, Bihar – 852113",
      phone: "+91 70500 12501",
      email: "",
      gstin: "",
      headOffice:
        "Main Branch: SBI Road, in front of Pradhi Yadav Hospital, Madhepura, Bihar – 852113 · +91 75469 95935 / +91 80515 16000",
    },
    meta: {
      title: "Fee Invoice",
      number: `MDI/B2/${sessionFor(today)}/0001`,
      date: today,
      session: sessionFor(today),
    },
    student: {
      name: "",
      guardian: "",
      mobile: "",
      address: "",
      regNo: "",
      batchNo: "Batch-1",
      batchTime: "08:00 AM – 09:30 AM",
      admissionDate: today,
    },
    course: {
      code: adit.code,
      customCode: "",
      fullName: adit.name,
      duration: adit.duration,
    },
    courseFee: 0,
    extras: [],
    discount: 0,
    gstOn: true,
    gstRate: 18,
    installments: [],
    showSignature: false,
    signatory: "Authorised Signatory",
    signatureImg: "",
    notes:
      "Fees once paid are non-refundable and non-transferable under any circumstances.\nPlease pay each installment on or before its due date.\nKeep this invoice safe — it is required for exam forms and certificate collection.",
  };
}

/** Fill in anything an older saved draft is missing. */
function mergeSaved(d: MdiState, saved: Partial<MdiState>): MdiState {
  return {
    ...d,
    ...saved,
    institute: { ...d.institute, ...saved.institute },
    meta: { ...d.meta, ...saved.meta },
    student: { ...d.student, ...saved.student },
    course: { ...d.course, ...saved.course },
    extras: Array.isArray(saved.extras) ? saved.extras : d.extras,
    installments: Array.isArray(saved.installments) ? saved.installments : d.installments,
  };
}

/** Bumps the trailing number of an invoice number, keeping its padding:
    MDI/B2/2026-27/0009 → MDI/B2/2026-27/0010. */
function nextNumber(n: string): string {
  const m = n.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return n;
  const next = String(parseInt(m[2], 10) + 1).padStart(m[2].length, "0");
  return `${m[1]}${next}${m[3]}`;
}

const num = (v: string): number => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

/* ─── Totals ─── */

type Totals = {
  gross: number;
  discount: number;
  taxable: number;
  gst: number;
  cgst: number;
  sgst: number;
  total: number;
  paid: number;
  scheduled: number;
  dues: number;
  unscheduled: number;
};

function computeTotals(s: MdiState): Totals {
  const gross = r2(
    (s.courseFee || 0) + s.extras.reduce((a, e) => a + (e.amount || 0), 0),
  );
  const discount = r2(Math.min(Math.max(0, s.discount || 0), gross));
  // Fees are entered GST-inclusive: the student pays exactly the entered
  // amount and the tax is backed out of it, never added on top.
  const total = r2(gross - discount);
  const rate = s.gstOn ? s.gstRate || 0 : 0;
  const taxable = r2(total / (1 + rate / 100));
  const gst = r2(total - taxable);
  const cgst = r2(gst / 2);
  const sgst = r2(gst - cgst);
  const paid = r2(
    s.installments
      .filter((i) => i.status === "Paid")
      .reduce((a, i) => a + (i.amount || 0), 0),
  );
  const scheduled = r2(
    s.installments
      .filter((i) => i.status === "Due")
      .reduce((a, i) => a + (i.amount || 0), 0),
  );
  const dues = r2(total - paid);
  return {
    gross,
    discount,
    taxable,
    gst,
    cgst,
    sgst,
    total,
    paid,
    scheduled,
    dues,
    unscheduled: r2(dues - scheduled),
  };
}

/* ─── Component ─── */

export default function MdiInvoice() {
  const [s, setS] = useState<MdiState>(defaultState);
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    institute: false,
    meta: true,
    student: true,
    course: true,
    installments: true,
    notes: false,
  });
  const [restored, setRestored] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [planCount, setPlanCount] = useState(3);

  const flash = useCallback((msg: string, error = false) => {
    setToast({ msg, error });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (!error) {
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    }
  }, []);

  /* ── Restore the last draft (client only, after mount) ── */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<MdiState>;
        // Restoring after mount keeps the server and first client render identical.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setS((prev) => mergeSaved(prev, saved));
      }
    } catch {
      /* storage unavailable — carry on with defaults */
    }
    setRestored(true);
  }, []);

  /* ── Save every change straight away; it stays until "Clear" ── */
  const saveFailed = useRef(false);
  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      saveFailed.current = false;
    } catch {
      // Warn once per failure streak rather than on every keystroke.
      if (!saveFailed.current) {
        saveFailed.current = true;
        // Reporting a failed write to storage (an external system) is the point here.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        flash("Couldn't save in this browser — storage is full or blocked. Try a smaller logo or signature image.", true);
      }
    }
  }, [s, restored, flash]);

  /* ── Printing: give the PDF a sensible default filename ── */
  useEffect(() => {
    const original = document.title;
    const clean = (v: string) => v.replace(/[\\/:*?"<>|]/g, "-");
    const before = () => {
      const who = s.student.name ? `-${clean(s.student.name).slice(0, 40)}` : "";
      document.title = `MDI-Invoice-${clean(s.meta.number || "Draft")}${who}`;
    };
    const after = () => {
      document.title = original;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      document.title = original;
    };
  }, [s.meta.number, s.student.name]);

  const totals = useMemo(() => computeTotals(s), [s]);

  /* ── Fit the A4 sheet to the available preview width ── */
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const A4_PX = 794; // 210mm at 96dpi
    const measure = () => {
      const style = window.getComputedStyle(el);
      const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      setZoom(Math.min(1, Math.max(0.35, (el.clientWidth - pad) / A4_PX)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Setters ── */
  const setGroup =
    <G extends "institute" | "meta" | "student" | "course">(group: G) =>
    (field: keyof MdiState[G], value: string) =>
      setS((p) => ({ ...p, [group]: { ...p[group], [field]: value } }));

  const setInstitute = setGroup("institute");
  const setMeta = setGroup("meta");
  const setStudent = setGroup("student");
  const setCourse = setGroup("course");

  const pickCourse = (code: string) => {
    const preset = COURSES.find((c) => c.code === code);
    setS((p) => ({
      ...p,
      course: preset
        ? { ...p.course, code, fullName: preset.name, duration: preset.duration }
        : { ...p.course, code, fullName: "", duration: "" },
    }));
  };

  const updateExtra = (id: string, patch: Partial<FeeLine>) =>
    setS((p) => ({
      ...p,
      extras: p.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const updateInstallment = (id: string, patch: Partial<Installment>) =>
    setS((p) => ({
      ...p,
      installments: p.installments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  /** A new installment is pre-filled with the full outstanding balance;
      lower it for a part-payment. */
  const addInstallment = () =>
    setS((p) => {
      const t = computeTotals(p);
      return {
        ...p,
        installments: [
          ...p.installments,
          {
            id: uid(),
            label: `Installment ${p.installments.length + 1}`,
            date: todayISO(),
            amount: Math.max(0, t.dues),
            mode: "Cash",
            reference: "",
            status: "Paid",
          },
        ],
      };
    });

  /** Splits whatever is not yet paid or scheduled into equal monthly dues. */
  const planRemaining = () => {
    const count = Math.max(1, Math.min(24, Math.floor(planCount) || 1));
    if (totals.unscheduled <= 0) {
      flash("Nothing left to plan — every rupee is already paid or scheduled.");
      return;
    }
    setS((p) => {
      const t = computeTotals(p);
      const each = Math.floor(t.unscheduled / count);
      const last = r2(t.unscheduled - each * (count - 1));
      const start = p.installments.length;
      const added: Installment[] = Array.from({ length: count }, (_, k) => ({
        id: uid(),
        label: `Installment ${start + k + 1}`,
        date: addDays(p.meta.date, 30 * (k + 1)),
        amount: k === count - 1 ? last : each,
        mode: "Cash",
        reference: "",
        status: "Due",
      }));
      return { ...p, installments: [...p.installments, ...added] };
    });
    flash(`Added ${count} monthly due installment${count > 1 ? "s" : ""}.`);
  };

  /** Reads an uploaded image into the draft, downscaled so it stays small. */
  const onImage = (
    file: File | undefined,
    field: "logo" | "signatureImg",
    done: string,
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      flash("That file isn't an image — use PNG, JPG or SVG.", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        // Downscale so the saved draft stays small.
        const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale) || 1;
        canvas.height = Math.round(img.height * scale) || 1;
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setS((p) => ({ ...p, [field]: canvas.toDataURL("image/png") }));
        flash(done);
      };
      img.onerror = () => flash("Couldn't read that image.", true);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  /** Next student: keeps the institute, course list and notes, clears the rest. */
  const newInvoice = () =>
    setS((p) => {
      const d = defaultState();
      return {
        ...d,
        logo: p.logo,
        institute: p.institute,
        notes: p.notes,
        showSignature: p.showSignature,
        signatory: p.signatory,
        signatureImg: p.signatureImg,
        gstOn: p.gstOn,
        gstRate: p.gstRate,
        meta: { ...p.meta, number: nextNumber(p.meta.number), date: todayISO() },
      };
    });

  const clearAll = () => {
    if (!window.confirm("Clear all saved details, including the institute, and start over?")) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing stored to remove */
    }
    setS(defaultState());
    flash("Cleared. Everything is back to the defaults.");
  };

  const handlePrint = () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (!s.student.name || !s.meta.number) {
      flash("Heads up: student name or invoice number is still blank.");
    }
    window.print();
  };

  const toggle = (k: SectionKey) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const courseCode =
    s.course.code === OTHER_COURSE ? s.course.customCode || "Course" : s.course.code;

  return (
    <div className="ig-root mdi-root">
      {/* ── Toolbar ── */}
      <div className="ig-topbar ig-no-print">
        <div className="ig-topbar-inner">
          <div className="ig-title">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.logo || DEFAULT_LOGO} alt="" className="mdi-topbar-logo" />
            <div>
              Modern Delhi Infotech · Fee Invoice
              <small>
                Branch Code {s.institute.branchCode || "—"} · auto-saved in this browser until you clear it
              </small>
            </div>
          </div>
          <div className="ig-actions">
            <button type="button" className="ig-btn" onClick={newInvoice}>
              New invoice
            </button>
            <button type="button" className="ig-btn ig-btn-danger" onClick={clearAll}>
              Clear
            </button>
            <button type="button" className="ig-btn ig-btn-primary" onClick={handlePrint}>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="ig-no-print mdi-toast-wrap">
          <div className={`ig-note ${toast.error ? "ig-note-error" : ""}`} role="status">
            <span>{toast.msg}</span>
            <button
              type="button"
              className="ig-toast-close"
              aria-label="Dismiss message"
              onClick={() => setToast(null)}
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <div className="ig-layout">
        {/* ══════════ FORM ══════════ */}
        <div className="ig-form ig-no-print">
          {/* Student */}
          <Section label="1 · Student" openState={open.student} onToggle={() => toggle("student")}>
            <Field label="Student name">
              <input className="ig-input" value={s.student.name} placeholder="Rahul Kumar"
                onChange={(e) => setStudent("name", e.target.value)} />
            </Field>
            <Field label="Father's / Guardian's name">
              <input className="ig-input" value={s.student.guardian} placeholder="Suresh Prasad Yadav"
                onChange={(e) => setStudent("guardian", e.target.value)} />
            </Field>
            <div className="ig-grid ig-grid-2">
              <Field label="Mobile">
                <input className="ig-input" value={s.student.mobile} placeholder="+91 98765 43210"
                  onChange={(e) => setStudent("mobile", e.target.value)} />
              </Field>
              <Field label="Registration / Roll no.">
                <input className="ig-input" value={s.student.regNo} placeholder="MDI-B2-0147"
                  onChange={(e) => setStudent("regNo", e.target.value)} />
              </Field>
            </div>
            <Field label="Address">
              <textarea className="ig-textarea" value={s.student.address} placeholder="Ward No. 7, Purani Bazar, Madhepura"
                onChange={(e) => setStudent("address", e.target.value)} />
            </Field>
            <div className="ig-grid ig-grid-2">
              <Field label="Batch no.">
                <input className="ig-input" value={s.student.batchNo}
                  onChange={(e) => setStudent("batchNo", e.target.value)} />
              </Field>
              <Field label="Batch time">
                <input className="ig-input" value={s.student.batchTime}
                  onChange={(e) => setStudent("batchTime", e.target.value)} />
              </Field>
            </div>
            <Field label="Admission date">
              <input type="date" className="ig-input" value={s.student.admissionDate}
                onChange={(e) => setStudent("admissionDate", e.target.value)} />
            </Field>
          </Section>

          {/* Course & fee */}
          <Section label="2 · Course & fee" openState={open.course} onToggle={() => toggle("course")}>
            <Field label="Course">
              <div className="mdi-chips" role="radiogroup" aria-label="Course">
                {[...COURSES.map((c) => c.code), OTHER_COURSE].map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={s.course.code === code}
                    className={`mdi-chip ${s.course.code === code ? "on" : ""}`}
                    onClick={() => pickCourse(code)}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </Field>
            {s.course.code === OTHER_COURSE ? (
              <Field label="Course name / code">
                <input className="ig-input" value={s.course.customCode} placeholder="Tally Prime, CCC, Python…"
                  onChange={(e) => setCourse("customCode", e.target.value)} />
              </Field>
            ) : null}
            <div className="ig-grid ig-grid-2">
              <Field label="Full course title">
                <input className="ig-input" value={s.course.fullName} placeholder="Certificate course in…"
                  onChange={(e) => setCourse("fullName", e.target.value)} />
              </Field>
              <Field label="Duration">
                <input className="ig-input" value={s.course.duration} placeholder="6 Months"
                  onChange={(e) => setCourse("duration", e.target.value)} />
              </Field>
            </div>
            <Field label="Course fee (₹, incl. GST)">
              <input type="number" min={0} className="ig-input" value={s.courseFee || ""} placeholder="9000"
                onChange={(e) => setS((p) => ({ ...p, courseFee: num(e.target.value) }))} />
            </Field>

            <div className="ig-field">
              <label>Other charges</label>
              {s.extras.map((e) => (
                <div key={e.id} className="mdi-row">
                  <input className="ig-input" value={e.label} placeholder="Exam fee"
                    onChange={(ev) => updateExtra(e.id, { label: ev.target.value })} />
                  <input type="number" min={0} className="ig-input mdi-amount" value={e.amount || ""} placeholder="0"
                    onChange={(ev) => updateExtra(e.id, { amount: num(ev.target.value) })} />
                  <button type="button" className="ig-icon-btn" aria-label={`Remove ${e.label || "charge"}`}
                    onClick={() => setS((p) => ({ ...p, extras: p.extras.filter((x) => x.id !== e.id) }))}>
                    ✕
                  </button>
                </div>
              ))}
              <div className="mdi-chips">
                {["Admission / Registration Fee", "Examination Fee", "Study Material", "Other"].map((label) => (
                  <button key={label} type="button" className="ig-btn ig-btn-sm"
                    onClick={() =>
                      setS((p) => ({
                        ...p,
                        extras: [...p.extras, { id: uid(), label: label === "Other" ? "" : label, amount: 0 }],
                      }))
                    }>
                    + {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ig-grid ig-grid-2">
              <Field label="Discount / scholarship (₹)">
                <input type="number" min={0} className="ig-input" value={s.discount || ""} placeholder="0"
                  onChange={(e) => setS((p) => ({ ...p, discount: num(e.target.value) }))} />
              </Field>
              <Field label="GST rate (%)">
                <input type="number" min={0} className="ig-input" value={s.gstRate} disabled={!s.gstOn}
                  onChange={(e) => setS((p) => ({ ...p, gstRate: num(e.target.value) }))} />
              </Field>
            </div>
            <label className="ig-check">
              <input type="checkbox" checked={s.gstOn}
                onChange={(e) => setS((p) => ({ ...p, gstOn: e.target.checked }))} />
              GST {s.gstRate}% included in the fee — shown as CGST {s.gstRate / 2}% + SGST {s.gstRate / 2}%
            </label>
            <div className="mdi-mini-total">
              <span>Total course fee payable</span>
              <strong>₹{fmt(totals.total)}</strong>
            </div>
          </Section>

          {/* Installments */}
          <Section label="3 · Installments & payments" openState={open.installments} onToggle={() => toggle("installments")}>
            {s.installments.length === 0 ? (
              <p className="ig-hint">
                No installments yet. Add each payment the student makes — the balance due on the
                invoice is the total fee minus every installment marked Paid.
              </p>
            ) : null}
            {s.installments.map((i, idx) => (
              <div key={i.id} className={`ig-item mdi-inst ${i.status === "Due" ? "due" : ""}`}>
                <div className="ig-item-top">
                  <span className="ig-item-tag">#{idx + 1}</span>
                  <div className="mdi-seg" role="radiogroup" aria-label="Status">
                    {(["Paid", "Due"] as const).map((st) => (
                      <button key={st} type="button" role="radio" aria-checked={i.status === st}
                        className={i.status === st ? `on ${st.toLowerCase()}` : ""}
                        onClick={() => updateInstallment(i.id, { status: st })}>
                        {st === "Paid" ? "Paid" : "Due"}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="ig-icon-btn" aria-label={`Remove ${i.label}`}
                    onClick={() => setS((p) => ({ ...p, installments: p.installments.filter((x) => x.id !== i.id) }))}>
                    ✕
                  </button>
                </div>
                <div className="ig-grid ig-grid-2">
                  <Field label="Label">
                    <input className="ig-input" value={i.label}
                      onChange={(e) => updateInstallment(i.id, { label: e.target.value })} />
                  </Field>
                  <Field label="Amount (₹)">
                    <input type="number" min={0} className="ig-input" value={i.amount || ""} placeholder="0"
                      onChange={(e) => updateInstallment(i.id, { amount: num(e.target.value) })} />
                  </Field>
                  <Field label={i.status === "Paid" ? "Paid on" : "Due on"}>
                    <input type="date" className="ig-input" value={i.date}
                      onChange={(e) => updateInstallment(i.id, { date: e.target.value })} />
                  </Field>
                  <Field label="Mode">
                    <select className="ig-select"
                      value={PAYMENT_MODES.includes(i.mode) ? i.mode : OTHER_MODE}
                      onChange={(e) =>
                        updateInstallment(i.id, { mode: e.target.value === OTHER_MODE ? "" : e.target.value })
                      }>
                      {[...PAYMENT_MODES, OTHER_MODE].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                {PAYMENT_MODES.includes(i.mode) ? null : (
                  <Field label="Other mode">
                    <input className="ig-input" value={i.mode} placeholder="Demand draft, wallet…"
                      onChange={(e) => updateInstallment(i.id, { mode: e.target.value })} />
                  </Field>
                )}
                <Field label="Reference (UTR / receipt / cheque no.)">
                  <input className="ig-input" value={i.reference} placeholder="Optional"
                    onChange={(e) => updateInstallment(i.id, { reference: e.target.value })} />
                </Field>
              </div>
            ))}
            <button type="button" className="ig-btn" onClick={addInstallment}>
              + Add installment
            </button>
            <div className="mdi-plan">
              <span>Plan the rest in</span>
              <input type="number" min={1} max={24} className="ig-input" value={planCount}
                onChange={(e) => setPlanCount(num(e.target.value))} aria-label="Number of monthly installments" />
              <span>monthly dues</span>
              <button type="button" className="ig-btn ig-btn-sm" onClick={planRemaining}>
                Plan
              </button>
            </div>
            <div className="mdi-ledger">
              <span className={`mdi-ledger-status ${paymentStatus(totals).cls}`}>
                {paymentStatus(totals).text}
              </span>
              <div><span>Total payable</span><b>₹{fmt(totals.total)}</b></div>
              <div><span>Paid so far</span><b className="ok">₹{fmt(totals.paid)}</b></div>
              <div><span>Balance due</span><b className={totals.dues > 0 ? "bad" : "ok"}>₹{fmt(totals.dues)}</b></div>
              {totals.dues > 0 && totals.unscheduled !== 0 ? (
                <p className="ig-hint ig-warn">
                  {totals.unscheduled > 0
                    ? `₹${fmt(totals.unscheduled)} of the balance isn't scheduled as an installment yet.`
                    : `Installments exceed the balance by ₹${fmt(-totals.unscheduled)}.`}
                </p>
              ) : null}
            </div>
          </Section>

          {/* Invoice details */}
          <Section label="4 · Invoice details" openState={open.meta} onToggle={() => toggle("meta")}>
            <Field label="Document title">
              <input className="ig-input" value={s.meta.title}
                onChange={(e) => setMeta("title", e.target.value)} />
            </Field>
            <div className="ig-grid ig-grid-2">
              <Field label="Invoice no.">
                <input className="ig-input" value={s.meta.number}
                  onChange={(e) => setMeta("number", e.target.value)} />
              </Field>
              <Field label="Invoice date">
                <input type="date" className="ig-input" value={s.meta.date}
                  onChange={(e) => setMeta("date", e.target.value)} />
              </Field>
            </div>
            <Field label="Academic session">
              <input className="ig-input" value={s.meta.session}
                onChange={(e) => setMeta("session", e.target.value)} />
            </Field>
          </Section>

          {/* Institute */}
          <Section label="5 · Institute & branch" openState={open.institute} onToggle={() => toggle("institute")}>
            <div className="ig-upload">
              <div className="ig-upload-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logo || DEFAULT_LOGO} alt="Logo preview" />
              </div>
              <div className="ig-field">
                <input type="file" accept="image/*" className="ig-file"
                  onChange={(e) => {
                    onImage(e.target.files?.[0], "logo", "Logo updated.");
                    e.target.value = "";
                  }} />
                {s.logo ? (
                  <button type="button" className="ig-btn ig-btn-sm"
                    onClick={() => setS((p) => ({ ...p, logo: "" }))}>
                    Use original logo
                  </button>
                ) : (
                  <span className="ig-hint">Using the institute&apos;s original logo.</span>
                )}
              </div>
            </div>
            <Field label="Institute name">
              <input className="ig-input" value={s.institute.name}
                onChange={(e) => setInstitute("name", e.target.value)} />
            </Field>
            <Field label="Tagline">
              <input className="ig-input" value={s.institute.tagline}
                onChange={(e) => setInstitute("tagline", e.target.value)} />
            </Field>
            <Field label="Branch code">
              <input className="ig-input" value={s.institute.branchCode} placeholder="2"
                onChange={(e) => setInstitute("branchCode", e.target.value)} />
            </Field>
            <Field label="Branch address">
              <textarea className="ig-textarea" value={s.institute.address}
                onChange={(e) => setInstitute("address", e.target.value)} />
            </Field>
            <div className="ig-grid ig-grid-2">
              <Field label="Phone">
                <input className="ig-input" value={s.institute.phone}
                  onChange={(e) => setInstitute("phone", e.target.value)} />
              </Field>
              <Field label="Email">
                <input className="ig-input" value={s.institute.email} placeholder="Optional"
                  onChange={(e) => setInstitute("email", e.target.value)} />
              </Field>
            </div>
            <Field label="GSTIN">
              <input className="ig-input" value={s.institute.gstin} placeholder="Optional — printed when filled"
                onChange={(e) => setInstitute("gstin", e.target.value.toUpperCase())} />
            </Field>
            <Field label="Head office line (footer)">
              <textarea className="ig-textarea" value={s.institute.headOffice}
                onChange={(e) => setInstitute("headOffice", e.target.value)} />
            </Field>
          </Section>

          {/* Notes */}
          <Section label="6 · Terms & signature" openState={open.notes} onToggle={() => toggle("notes")}>
            <Field label="Terms (one per line)">
              <textarea className="ig-textarea" rows={5} value={s.notes}
                onChange={(e) => setS((p) => ({ ...p, notes: e.target.value }))} />
            </Field>
            <label className="ig-check">
              <input type="checkbox" checked={Boolean(s.showSignature)}
                onChange={(e) => setS((p) => ({ ...p, showSignature: e.target.checked }))} />
              Show authorised signatory on the invoice
            </label>
            {s.showSignature ? (
              <>
                <Field label="Signatory title">
                  <input className="ig-input" value={s.signatory ?? ""} placeholder="Authorised Signatory"
                    onChange={(e) => setS((p) => ({ ...p, signatory: e.target.value }))} />
                </Field>
                <div className="ig-upload">
                  <div className="ig-upload-preview">
                    {s.signatureImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.signatureImg} alt="Signature preview" />
                    ) : (
                      <span>Signature</span>
                    )}
                  </div>
                  <div className="ig-field">
                    <input type="file" accept="image/*" className="ig-file"
                      onChange={(e) => {
                        onImage(e.target.files?.[0], "signatureImg", "Signature added.");
                        e.target.value = "";
                      }} />
                    {s.signatureImg ? (
                      <button type="button" className="ig-btn ig-btn-sm"
                        onClick={() => setS((p) => ({ ...p, signatureImg: "" }))}>
                        Remove signature image
                      </button>
                    ) : (
                      <span className="ig-hint">Optional — a PNG with a transparent background looks best.</span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </Section>

          <div className="ig-note">
            {/* One child: .ig-note is a flex row, so loose text and <b> tags would become columns. */}
            <p className="mdi-note-text">
              Everything you enter is saved in this browser as you type and stays — even after
              closing the tab — until you press <b>Clear</b>. &quot;Download PDF&quot; opens the
              print dialog; choose <b>Save as PDF</b>, paper <b>A4</b>, and turn on{" "}
              <b>Background graphics</b> for the coloured header.
            </p>
          </div>
        </div>

        {/* ══════════ PREVIEW ══════════ */}
        <div className="ig-preview-pane">
          <div className="ig-preview-bar ig-no-print">
            <span className="ig-preview-label">Live preview · A4</span>
            <span className={`ig-badge ${totals.dues > 0 ? "ig-badge-warn" : "ig-badge-intra"}`}>
              {courseCode} · {totals.dues > 0 ? `₹${fmt(totals.dues)} due` : "Fully paid"}
            </span>
          </div>

          <div className="ig-summary-strip ig-no-print" style={{ marginBottom: "1rem" }}>
            <div className="ig-stat">
              <span>Actual price (excl. GST)</span>
              <strong>₹{fmt(totals.taxable)}</strong>
            </div>
            <div className="ig-stat">
              <span>GST included</span>
              <strong>₹{fmt(totals.gst)}</strong>
            </div>
            <div className="ig-stat">
              <span>Paid</span>
              <strong>₹{fmt(totals.paid)}</strong>
            </div>
            <div className={`ig-stat ${totals.dues > 0 ? "mdi-stat-due" : "ig-stat-accent"}`}>
              <span>Balance due</span>
              <strong>₹{fmt(totals.dues)}</strong>
            </div>
          </div>

          <div className="ig-paper-wrap" ref={paperRef}>
            <div className="ig-zoom" style={{ "--ig-zoom": zoom } as React.CSSProperties}>
              <Sheet s={s} totals={totals} courseCode={courseCode} />
            </div>
          </div>

          <p className="ig-hint ig-no-print" style={{ marginTop: "0.9rem" }}>
            {restored ? "Tip: “New invoice” keeps the institute details and bumps the invoice number." : "Loading saved draft…"}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Fully paid once nothing is outstanding; partially paid after any payment. */
function paymentStatus(t: Totals): { text: string; cls: "paid" | "part" | "unpaid" } {
  if (t.total > 0 && t.dues <= 0) return { text: "Fully Paid", cls: "paid" };
  if (t.paid > 0) return { text: "Partially Paid", cls: "part" };
  return { text: "Unpaid", cls: "unpaid" };
}

/* ─── The printed sheet ─── */

function Sheet({ s, totals, courseCode }: { s: MdiState; totals: Totals; courseCode: string }) {
  const logo = s.logo || DEFAULT_LOGO;
  const status = paymentStatus(totals);
  const terms = s.notes.split("\n").map((t) => t.trim()).filter(Boolean);
  const paidList = s.installments;
  const half = s.gstRate / 2;

  return (
    <div className="invoice-sheet mdi-sheet">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" className="mdi-watermark" />

      {/* Header */}
      <header className="mdi-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${s.institute.name} logo`} className="mdi-logo" />
        <div className="mdi-brand">
          <h1>{s.institute.name || "Institute name"}</h1>
          <div className="mdi-flourish" aria-hidden="true">
            <i />
            <span>{s.institute.tagline}</span>
            <i />
          </div>
          {s.institute.branchCode ? (
            <div className="mdi-branch">
              <span>Branch Code</span>
              <em>{s.institute.branchCode}</em>
            </div>
          ) : null}
          <p className="mdi-contact">
            {s.institute.address}
            {s.institute.phone ? <> · ☎ {s.institute.phone}</> : null}
            {s.institute.email ? <> · {s.institute.email}</> : null}
          </p>
          {s.institute.gstin ? (
            <p className="mdi-contact">
              GSTIN: <b>{s.institute.gstin}</b>
            </p>
          ) : null}
        </div>
      </header>
      <div className="mdi-ribbon" aria-hidden="true" />

      {/* Title + meta */}
      <div className="mdi-titlebar">
        <div>
          <h2>{s.meta.title || "Fee Invoice"}</h2>
          <p>{s.gstOn ? `Tax invoice · GST @ ${s.gstRate}% included` : "Original for student"}</p>
        </div>
        <dl className="mdi-meta">
          <div><dt>Invoice No.</dt><dd>{s.meta.number || "—"}</dd></div>
          <div><dt>Date</dt><dd>{fmtDate(s.meta.date)}</dd></div>
          <div><dt>Session</dt><dd>{s.meta.session || "—"}</dd></div>
        </dl>
      </div>

      {/* Student + course */}
      <section className="mdi-cards">
        <div className="mdi-card">
          <h3>Student details</h3>
          <table className="mdi-kv">
            <tbody>
              <tr><td>Name</td><td><b className="mdi-student">{s.student.name || "—"}</b></td></tr>
              <tr><td>S/o, D/o</td><td>{s.student.guardian || "—"}</td></tr>
              <tr><td>Mobile</td><td>{s.student.mobile || "—"}</td></tr>
              <tr><td>Address</td><td>{s.student.address || "—"}</td></tr>
              <tr><td>Reg. No.</td><td>{s.student.regNo || "—"}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mdi-card mdi-card-course">
          <h3>Course enrolled</h3>
          <div className="mdi-course">
            <span className="mdi-course-code">{courseCode}</span>
            <span className="mdi-course-name">{s.course.fullName}</span>
          </div>
          <table className="mdi-kv">
            <tbody>
              <tr><td>Duration</td><td>{s.course.duration || "—"}</td></tr>
              <tr><td>Batch No.</td><td>{s.student.batchNo || "—"}</td></tr>
              <tr><td>Batch Time</td><td>{s.student.batchTime || "—"}</td></tr>
              <tr><td>Admission</td><td>{fmtDate(s.student.admissionDate)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Fee particulars */}
      <section className="mdi-section">
        <h3 className="mdi-h">Fee particulars</h3>
        <table className="mdi-table">
          <thead>
            <tr>
              <th className="ctr" style={{ width: "8%" }}>Sr.</th>
              <th>Particulars</th>
              <th className="num" style={{ width: "24%" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="ctr">1</td>
              <td>
                <b>Course Fee — {courseCode}</b>
                {s.course.fullName ? <small>{s.course.fullName}{s.course.duration ? ` · ${s.course.duration}` : ""}</small> : null}
              </td>
              <td className="num">{fmt(s.courseFee || 0)}</td>
            </tr>
            {s.extras.map((e, i) => (
              <tr key={e.id}>
                <td className="ctr">{i + 2}</td>
                <td>{e.label || "Other charge"}</td>
                <td className="num">{fmt(e.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {totals.discount > 0 ? (
              <>
                <tr><td /><td className="num">Gross amount</td><td className="num">{fmt(totals.gross)}</td></tr>
                <tr><td /><td className="num">Less: Discount / Scholarship</td><td className="num">− {fmt(totals.discount)}</td></tr>
              </>
            ) : null}
            {s.gstOn ? (
              <>
                <tr><td /><td className="num">Amount (incl. GST)</td><td className="num">{fmt(totals.total)}</td></tr>
                <tr><td /><td className="num">Less: CGST @ {half}% (included)</td><td className="num">− {fmt(totals.cgst)}</td></tr>
                <tr><td /><td className="num">Less: SGST @ {half}% (included)</td><td className="num">− {fmt(totals.sgst)}</td></tr>
                <tr className="mdi-actual"><td /><td className="num">Actual price (excl. GST)</td><td className="num">{fmt(totals.taxable)}</td></tr>
              </>
            ) : null}
            <tr className="grand">
              <td />
              <td className="num">Total Course Fee Payable{s.gstOn ? " (incl. GST)" : ""}</td>
              <td className="num">₹ {fmt(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Installments */}
      <section className="mdi-section">
        <h3 className="mdi-h">Installment &amp; payment record</h3>
        <table className="mdi-table mdi-inst-table">
          <thead>
            <tr>
              <th className="ctr" style={{ width: "6%" }}>#</th>
              <th>Installment</th>
              <th className="ctr">Date</th>
              <th>Mode / Ref.</th>
              <th className="ctr">Status</th>
              <th className="num" style={{ width: "18%" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {paidList.length === 0 ? (
              <tr>
                <td colSpan={6} className="ctr mdi-empty">No installment recorded yet</td>
              </tr>
            ) : (
              paidList.map((i, idx) => (
                <tr key={i.id} className={i.status === "Due" ? "is-due" : ""}>
                  <td className="ctr">{idx + 1}</td>
                  <td>{i.label || `Installment ${idx + 1}`}</td>
                  <td className="ctr">{fmtDate(i.date)}</td>
                  <td>
                    {i.mode || "—"}
                    {i.reference ? <small>{i.reference}</small> : null}
                  </td>
                  <td className="ctr">
                    <span className={`mdi-tag ${i.status === "Paid" ? "paid" : "due"}`}>
                      {i.status === "Paid" ? "Paid" : "Due"}
                    </span>
                  </td>
                  <td className="num">{fmt(i.amount || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td />
              <td colSpan={4} className="num">Total paid</td>
              <td className="num">{fmt(totals.paid)}</td>
            </tr>
            {totals.scheduled > 0 ? (
              <tr>
                <td />
                <td colSpan={4} className="num">Scheduled (upcoming)</td>
                <td className="num">{fmt(totals.scheduled)}</td>
              </tr>
            ) : null}
          </tfoot>
        </table>
      </section>

      {/* Summary */}
      <section className="mdi-lower">
        <div className="mdi-words">
          <h3>Amount received (in words)</h3>
          <p>{amountInWords(totals.paid)}</p>
          {terms.length ? (
            <>
              <h3>Terms &amp; conditions</h3>
              <ol>
                {terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </>
          ) : null}
        </div>
        <div className="mdi-summary">
          <div className="row"><span>Total course fee</span><b>₹ {fmt(totals.total)}</b></div>
          <div className="row ok"><span>Total paid</span><b>₹ {fmt(totals.paid)}</b></div>
          <div className={`dues ${totals.dues > 0 ? "" : "clear"}`}>
            <span>{totals.dues >= 0 ? "Balance dues" : "Excess paid"}</span>
            <b>₹ {fmt(Math.abs(totals.dues))}</b>
          </div>
          <div className={`mdi-stamp ${status.cls}`}>{status.text}</div>
        </div>
      </section>

      {s.showSignature ? (
        <section className="mdi-sign">
          {s.signatureImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.signatureImg} alt="Authorised signature" />
          ) : null}
          <div className="line" />
          <span>{s.signatory || "Authorised Signatory"}</span>
          <small>For {s.institute.name}</small>
        </section>
      ) : null}

      <footer className="mdi-foot">
        {s.institute.headOffice ? <p>{s.institute.headOffice}</p> : null}
        <p className="soft">This is a computer-generated invoice. Thank you for learning with us!</p>
      </footer>
    </div>
  );
}

/* ─── Small presentational helpers ─── */

function Section({
  label,
  openState,
  onToggle,
  children,
}: {
  label: string;
  openState: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="ig-card">
      <button type="button" className="ig-card-head" onClick={onToggle} aria-expanded={openState}>
        <span>{label}</span>
        <span className={`ig-chev ${openState ? "open" : ""}`}>▶</span>
      </button>
      {openState ? <div className="ig-card-body">{children}</div> : null}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ig-field">
      <label>{label}</label>
      {children}
    </div>
  );
}
