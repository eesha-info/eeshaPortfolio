"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InvoicePreview from "./InvoicePreview";
import type {
  DiscountType,
  EditableTextField,
  TaxMode,
  ExtraCharge,
  InvoiceState,
  LineItem,
  Party,
} from "./types";
import {
  DEFAULT_LABELS,
  DEFAULT_VISIBILITY,
  GST_RATES,
  LABEL_GROUPS,
  LABEL_TOGGLE,
  MODES_NEEDING_BANK,
  OTHER_MODE,
  PAYMENT_MODES,
  PAYMENT_STATUSES,
  STATES,
  TRANSPORT_MODES,
  UOM_LIST,
  VISIBILITY_GROUPS,
  computeTotals,
  defaultInvoice,
  mergeSavedProfile,
  fmt,
  referenceLabel,
  resolveStateCode,
  stateName,
  gstinStateCode,
  isValidGstin,
  isValidPan,
  addDays,
  todayISO,
  uid,
} from "./utils";
import "./invoice.css";

const STORAGE_KEY = "mdeesha.invoice-generator.v1";
/** Source files bigger than this are rejected; anything smaller is
    automatically downscaled, so ordinary logo files just work. */
const MAX_SOURCE_BYTES = 12_000_000;
const MAX_IMAGE_DIMENSION = 700;

type SectionKey =
  | "seller"
  | "buyer"
  | "meta"
  | "items"
  | "charges"
  | "bank"
  | "extras"
  | "labels"
  | "visibility";

export default function InvoiceGenerator() {
  const [inv, setInv] = useState<InvoiceState>(defaultInvoice);
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    seller: true,
    buyer: true,
    meta: true,
    items: true,
    charges: false,
    bank: false,
    extras: false,
    labels: false,
    visibility: false,
  });
  const [restored, setRestored] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(
    null,
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Restore saved profile (client only, after mount) ── */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<InvoiceState>;
        // mergeSavedProfile fills in anything an older save is missing.
        setInv((prev) => mergeSavedProfile(prev, saved));
      }
    } catch {
      /* storage unavailable — carry on with defaults */
    }
    setRestored(true);
  }, []);

  const flash = useCallback((msg: string, error = false) => {
    setToast({ msg, error });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    // Errors stay put until dismissed; confirmations fade on their own.
    if (!error) {
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    }
  }, []);

  /* ── Printing: give the PDF a sensible default filename ── */
  useEffect(() => {
    const original = document.title;
    const before = () => {
      const n = inv.meta.number ? inv.meta.number.replace(/[\\/:*?"<>|]/g, "-") : "Draft";
      const who = inv.buyer.name
        ? `-${inv.buyer.name.replace(/[\\/:*?"<>|]/g, "-").slice(0, 40)}`
        : "";
      document.title = `Tax-Invoice-${n}${who}`;
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
  }, [inv.meta.number, inv.buyer.name]);

  const totals = useMemo(() => computeTotals(inv), [inv]);

  /* ── Fit the A4 sheet to the available preview width ── */
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const A4_PX = 794; // 210mm at 96dpi
    const measure = () => {
      const style = window.getComputedStyle(el);
      const pad =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = el.clientWidth - pad;
      setZoom(Math.min(1, Math.max(0.35, available / A4_PX)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Generic setters ── */
  const setParty = (key: "seller" | "buyer" | "shipTo") =>
    (field: keyof Party, value: string) =>
      setInv((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));

  const setSeller = setParty("seller");
  const setBuyer = setParty("buyer");
  const setShip = setParty("shipTo");

  const setMeta = <K extends keyof InvoiceState["meta"]>(
    field: K,
    value: InvoiceState["meta"][K],
  ) => setInv((p) => ({ ...p, meta: { ...p.meta, [field]: value } }));

  const setBank = (
    field: "customMode" | "reference" | "accountName" | "accountNumber" | "bankName" | "branch" | "ifsc" | "upi",
    value: string,
  ) => setInv((p) => ({ ...p, bank: { ...p.bank, [field]: value } }));

  /** Switching mode re-decides whether the account block is worth printing. */
  const setPaymentMode = (mode: string) =>
    setInv((p) => ({
      ...p,
      bank: {
        ...p.bank,
        mode,
        includeAccount:
          mode === OTHER_MODE
            ? p.bank.includeAccount
            : MODES_NEEDING_BANK.has(mode),
      },
    }));

  const setItem = <K extends keyof LineItem>(
    id: string,
    field: K,
    value: LineItem[K],
  ) =>
    setInv((p) => ({
      ...p,
      items: p.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));

  const addItem = () =>
    setInv((p) => ({
      ...p,
      items: [
        ...p.items,
        {
          id: uid(),
          description: "",
          hsn: "",
          qty: 1,
          uom: "NOS",
          rate: 0,
          discountValue: 0,
          discountType: "percent" as DiscountType,
          gstRate: p.items[p.items.length - 1]?.gstRate ?? 18,
        },
      ],
    }));

  const removeItem = (id: string) =>
    setInv((p) => ({
      ...p,
      items: p.items.length > 1 ? p.items.filter((i) => i.id !== id) : p.items,
    }));

  const duplicateItem = (id: string) =>
    setInv((p) => {
      const idx = p.items.findIndex((i) => i.id === id);
      if (idx < 0) return p;
      const copy = { ...p.items[idx], id: uid() };
      const items = [...p.items];
      items.splice(idx + 1, 0, copy);
      return { ...p, items };
    });

  const setCharge = <K extends keyof ExtraCharge>(
    id: string,
    field: K,
    value: ExtraCharge[K],
  ) =>
    setInv((p) => ({
      ...p,
      charges: p.charges.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));

  const addCharge = (label = "") =>
    setInv((p) => ({
      ...p,
      charges: [...p.charges, { id: uid(), label, amount: 0, gstRate: 18 }],
    }));

  const removeCharge = (id: string) =>
    setInv((p) => ({ ...p, charges: p.charges.filter((c) => c.id !== id) }));

  /* ── Image uploads ──
     Large photos are downscaled in the browser rather than rejected, so any
     ordinary logo file works and the stored data URL stays small. */
  const readImage = (
    file: File | undefined,
    onDone: (dataUrl: string) => void,
  ) => {
    if (!file) return;
    const isImage =
      file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
    if (!isImage) {
      flash(
        `“${file.name}” isn’t an image file. Please choose a PNG, JPG, WEBP or SVG.`,
        true,
      );
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      flash(
        `“${file.name}” is ${(file.size / 1_000_000).toFixed(1)} MB. Please use a file under 12 MB.`,
        true,
      );
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => flash("Could not read that image file.", true);
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (!dataUrl) {
        flash("Could not read that image file.", true);
        return;
      }
      // SVG is already resolution-independent — keep it untouched.
      if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
        onDone(dataUrl);
        flash("Image added.");
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
        if (scale === 1 && dataUrl.length < 400_000) {
          onDone(dataUrl);
          flash("Image added.");
          return;
        }
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("no canvas context");
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const out =
            file.type === "image/jpeg"
              ? canvas.toDataURL("image/jpeg", 0.92)
              : canvas.toDataURL("image/png");
          onDone(out);
          flash("Image added and optimised for printing.");
        } catch {
          onDone(dataUrl);
          flash("Image added.");
        }
      };
      img.onerror = () =>
        flash(
          `“${file.name}” could not be decoded — try re-saving it as a PNG or JPG.`,
          true,
        );
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  /* ── A GSTIN suggests the state, but never overwrites what you typed ── */
  const stateFromGstin = (gstin: string, current: string | undefined): string => {
    const now = current ?? "";
    const name = stateName(gstinStateCode(gstin));
    // Only fill a blank box, or replace a value we ourselves suggested.
    if (!name) return now;
    const isOurs = !now.trim() || STATES.some((s) => s.name === now.trim());
    return isOurs ? name : now;
  };

  const applyBuyerGstin = (value: string) => {
    const v = value.toUpperCase();
    setInv((p) => {
      const nextState = stateFromGstin(v, p.buyer.state);
      const pos = (p.meta.placeOfSupply ?? "").trim();
      const followsBuyer = !pos || pos === (p.buyer.state ?? "").trim();
      return {
        ...p,
        buyer: { ...p.buyer, gstin: v, state: nextState },
        meta: {
          ...p.meta,
          placeOfSupply: followsBuyer ? nextState : p.meta.placeOfSupply,
        },
      };
    });
  };

  const applySellerGstin = (value: string) => {
    const v = value.toUpperCase();
    setInv((p) => ({
      ...p,
      seller: {
        ...p.seller,
        gstin: v,
        state: stateFromGstin(v, p.seller.state),
        pan: p.seller.pan || (v.length >= 12 ? v.slice(2, 12) : p.seller.pan),
      },
    }));
  };

  /* ── Persistence ── */
  const saveProfile = () => {
    try {
      const {
        seller,
        bank,
        terms,
        declaration,
        logo,
        signature,
        signatoryName,
        currencySymbol,
        labels,
        show,
      } = inv;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          seller,
          bank,
          terms,
          declaration,
          logo,
          signature,
          signatoryName,
          currencySymbol,
          labels,
          show,
        }),
      );
      flash("Business profile, logo, labels and layout saved in this browser.");
    } catch {
      flash(
        "Could not save — browser storage is full or unavailable. Try removing the logo and saving again.",
        true,
      );
    }
  };

  const clearProfile = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      flash("Saved profile cleared.");
    } catch {
      /* ignore */
    }
  };

  const resetAll = () => {
    setInv(defaultInvoice());
    flash("Started a fresh invoice.");
  };

  const loadSample = () => {
    const base = defaultInvoice();
    setInv({
      ...base,
      seller: {
        name: "Nimbus Cloud Labs Pvt. Ltd.",
        address: "4th Floor, Prestige Tech Park, Marathahalli",
        city: "Bengaluru",
        pincode: "560103",
        state: "Karnataka",
        gstin: "29ABCDE1234F1Z5",
        pan: "ABCDE1234F",
        phone: "+91 98450 11223",
        email: "accounts@nimbuscloudlabs.in",
      },
      // Same state as the seller, so the sample shows the common
      // intra-state case: CGST + SGST at half the rate each.
      buyer: {
        name: "Vertex Retail Solutions LLP",
        address: "No. 9, 3rd Block, Koramangala",
        city: "Bengaluru",
        pincode: "560034",
        state: "Karnataka",
        gstin: "29FGHIJ5678K1Z9",
        pan: "",
        phone: "+91 90000 45678",
        email: "finance@vertexretail.in",
      },
      shipTo: base.shipTo,
      sameAsBilling: true,
      meta: {
        ...base.meta,
        number: "NCL/25-26/0042",
        dueDate: addDays(todayISO(), 15),
        poNumber: "VRS-PO-8891",
        poDate: addDays(todayISO(), -6),
        placeOfSupply: "Karnataka",
        paymentStatus: "Unpaid",
      },
      items: [
        {
          id: uid(),
          description:
            "Cloud migration & AWS architecture consulting — Phase 2",
          hsn: "998313",
          qty: 40,
          uom: "HRS",
          rate: 3500,
          discountValue: 5,
          discountType: "percent",
          gstRate: 18,
        },
        {
          id: uid(),
          description: "Managed Node.js API support — monthly retainer",
          hsn: "998314",
          qty: 1,
          uom: "MON",
          rate: 85000,
          discountValue: 0,
          discountType: "percent",
          gstRate: 18,
        },
        {
          id: uid(),
          description: "CI/CD pipeline setup & handover documentation",
          hsn: "998313",
          qty: 1,
          uom: "NOS",
          rate: 25000,
          discountValue: 2500,
          discountType: "amount",
          gstRate: 18,
        },
      ],
      charges: [
        { id: uid(), label: "Onsite visit charges", amount: 6000, gstRate: 18 },
      ],
      bank: {
        mode: "Bank Transfer (NEFT / RTGS / IMPS)",
        customMode: "",
        reference: "",
        includeAccount: true,
        accountName: "Nimbus Cloud Labs Pvt. Ltd.",
        accountNumber: "50200098765432",
        bankName: "HDFC Bank",
        branch: "Marathahalli, Bengaluru",
        ifsc: "HDFC0001234",
        upi: "nimbuslabs@hdfcbank",
      },
      notes:
        "Thank you for your business. Please quote the invoice number when making the payment.",
      signatoryName: "Mohammad Eesha",
    });
    flash("Sample invoice loaded — edit anything you like.");
  };

  const setLabel = (key: string, value: string) =>
    setInv((p) => ({ ...p, labels: { ...p.labels, [key]: value } }));

  const resetLabels = () => {
    setInv((p) => ({ ...p, labels: { ...DEFAULT_LABELS } }));
    flash("Headings reset to their defaults.");
  };

  const setText = (field: EditableTextField, value: string) =>
    setInv((p) => ({ ...p, [field]: value }));

  const setShow = (key: string, value: boolean) =>
    setInv((p) => ({ ...p, show: { ...p.show, [key]: value } }));

  const setAllShown = (value: boolean) =>
    setInv((p) => {
      const next: Record<string, boolean> = { ...p.show };
      VISIBILITY_GROUPS.forEach((g) =>
        g.items.forEach((i) => {
          next[i.key] = value;
        }),
      );
      return { ...p, show: next };
    });

  const handlePrint = () => {
    // Commit an open inline editor before the dialog opens.
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (!inv.seller.name || !inv.buyer.name || !inv.meta.number) {
      flash(
        "Heads up: seller name, customer name or invoice number is still blank.",
      );
    }
    window.print();
  };

  const toggle = (k: SectionKey) =>
    setOpen((p) => ({ ...p, [k]: !p[k] }));

  /** Nothing here blocks you — a GSTIN is only flagged once it is
      the full 15 characters and still doesn't match the format. */
  const gstinState = (
    value: string,
  ): { bad: boolean; ok: boolean; hint: string } => {
    const v = value.trim();
    if (!v) return { bad: false, ok: false, hint: "" };
    if (v.length < 15)
      return { bad: false, ok: false, hint: `${v.length} of 15 characters` };
    if (isValidGstin(v))
      return { bad: false, ok: true, hint: "Valid GSTIN format." };
    return {
      bad: true,
      ok: false,
      hint: "Doesn't match the usual 15-character format — it will still print as typed.",
    };
  };

  const sellerGstin = gstinState(inv.seller.gstin);
  const buyerGstin = gstinState(inv.buyer.gstin);
  const sellerPanOk =
    !inv.seller.pan ||
    inv.seller.pan.length < 10 ||
    isValidPan(inv.seller.pan);

  return (
    <div className="ig-root">
      <StateDataList />

      {/* ── Toolbar ── */}
      <div className="ig-topbar ig-no-print">
        <div className="ig-topbar-inner">
          <div className="ig-title">
            <span aria-hidden="true">🧾</span>
            <div>
              GST Invoice Generator
              <small>
                India-compliant tax invoice · runs entirely in your browser
              </small>
            </div>
          </div>
          <div className="ig-actions">
            <button type="button" className="ig-btn" onClick={loadSample}>
              Load sample
            </button>
            <button type="button" className="ig-btn" onClick={saveProfile}>
              Save my business
            </button>
            <button type="button" className="ig-btn ig-btn-danger" onClick={resetAll}>
              Reset
            </button>
            <button type="button" className="ig-btn ig-btn-primary" onClick={handlePrint}>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          className="ig-no-print"
          style={{
            maxWidth: 1500,
            margin: "0.9rem auto -0.4rem",
            padding: "0 1.5rem",
          }}
        >
          <div
            className={`ig-note ${toast.error ? "ig-note-error" : ""}`}
            role="status"
          >
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
          {/* Seller */}
          <Section
            label="1 · Your business (seller)"
            openState={open.seller}
            onToggle={() => toggle("seller")}
          >
            <div className="ig-upload">
              <div className="ig-upload-preview">
                {inv.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inv.logo} alt="Logo preview" />
                ) : (
                  <span>Brand logo</span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  className="ig-file"
                  onChange={(e) =>
                    readImage(e.target.files?.[0], (d) =>
                      setInv((p) => ({ ...p, logo: d })),
                    )
                  }
                />
                {inv.logo ? (
                  <button
                    type="button"
                    className="ig-btn ig-btn-sm"
                    style={{ marginTop: "0.4rem" }}
                    onClick={() => setInv((p) => ({ ...p, logo: "" }))}
                  >
                    Remove logo
                  </button>
                ) : (
                  <p className="ig-hint" style={{ marginTop: "0.35rem" }}>
                    PNG / JPG / SVG, up to 1.5 MB.
                  </p>
                )}
              </div>
            </div>

            <Field label="Legal / trade name">
              <input
                className="ig-input"
                value={inv.seller.name}
                placeholder="Nimbus Cloud Labs Pvt. Ltd."
                onChange={(e) => setSeller("name", e.target.value)}
              />
            </Field>

            <Field label="Registered address">
              <textarea
                className="ig-textarea"
                rows={2}
                value={inv.seller.address}
                placeholder="Building, street, area"
                onChange={(e) => setSeller("address", e.target.value)}
              />
            </Field>

            <div className="ig-grid ig-grid-2">
              <Field label="City">
                <input
                  className="ig-input"
                  value={inv.seller.city}
                  onChange={(e) => setSeller("city", e.target.value)}
                />
              </Field>
              <Field label="PIN code">
                <input
                  className="ig-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={inv.seller.pincode}
                  onChange={(e) => setSeller("pincode", e.target.value)}
                />
              </Field>
            </div>

            <Field label="GSTIN">
              <input
                className={`ig-input ${sellerGstin.bad ? "ig-invalid" : ""}`}
                maxLength={15}
                value={inv.seller.gstin}
                placeholder="29ABCDE1234F1Z5"
                onChange={(e) => applySellerGstin(e.target.value)}
              />
              {sellerGstin.hint ? (
                <span
                  className={`ig-hint ${
                    sellerGstin.bad ? "ig-err" : sellerGstin.ok ? "ig-ok" : ""
                  }`}
                >
                  {sellerGstin.hint}
                </span>
              ) : null}
            </Field>

            <div className="ig-grid ig-grid-2">
              <Field label="State (place of business)">
                <StateInput
                  value={inv.seller.state}
                  onChange={(v) => setSeller("state", v)}
                />
              </Field>
              <Field label="PAN">
                <input
                  className={`ig-input ${sellerPanOk ? "" : "ig-invalid"}`}
                  maxLength={10}
                  value={inv.seller.pan}
                  onChange={(e) => setSeller("pan", e.target.value.toUpperCase())}
                />
              </Field>
            </div>

            <div className="ig-grid ig-grid-2">
              <Field label="Phone">
                <input
                  className="ig-input"
                  value={inv.seller.phone}
                  onChange={(e) => setSeller("phone", e.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  className="ig-input"
                  type="email"
                  value={inv.seller.email}
                  onChange={(e) => setSeller("email", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* Buyer */}
          <Section
            label="2 · Customer (bill to / ship to)"
            openState={open.buyer}
            onToggle={() => toggle("buyer")}
          >
            <Field label="Customer name">
              <input
                className="ig-input"
                value={inv.buyer.name}
                placeholder="Vertex Retail Solutions LLP"
                onChange={(e) => setBuyer("name", e.target.value)}
              />
            </Field>

            <Field label="Billing address">
              <textarea
                className="ig-textarea"
                rows={2}
                value={inv.buyer.address}
                onChange={(e) => setBuyer("address", e.target.value)}
              />
            </Field>

            <div className="ig-grid ig-grid-2">
              <Field label="City">
                <input
                  className="ig-input"
                  value={inv.buyer.city}
                  onChange={(e) => setBuyer("city", e.target.value)}
                />
              </Field>
              <Field label="PIN code">
                <input
                  className="ig-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={inv.buyer.pincode}
                  onChange={(e) => setBuyer("pincode", e.target.value)}
                />
              </Field>
            </div>

            <Field label="GSTIN (leave blank if unregistered / B2C)">
              <input
                className={`ig-input ${buyerGstin.bad ? "ig-invalid" : ""}`}
                maxLength={15}
                value={inv.buyer.gstin}
                placeholder="36FGHIJ5678K1Z9"
                onChange={(e) => applyBuyerGstin(e.target.value)}
              />
              {buyerGstin.hint ? (
                <span
                  className={`ig-hint ${
                    buyerGstin.bad ? "ig-err" : buyerGstin.ok ? "ig-ok" : ""
                  }`}
                >
                  {buyerGstin.hint}
                </span>
              ) : null}
            </Field>

            <div className="ig-grid ig-grid-2">
              <Field label="State">
                <StateInput
                  value={inv.buyer.state}
                  onChange={(v) => {
                    setBuyer("state", v);
                    setMeta("placeOfSupply", v);
                  }}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="ig-input"
                  value={inv.buyer.phone}
                  onChange={(e) => setBuyer("phone", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Email">
              <input
                className="ig-input"
                type="email"
                value={inv.buyer.email}
                onChange={(e) => setBuyer("email", e.target.value)}
              />
            </Field>

            <label className="ig-check">
              <input
                type="checkbox"
                checked={inv.sameAsBilling}
                onChange={(e) =>
                  setInv((p) => ({ ...p, sameAsBilling: e.target.checked }))
                }
              />
              Shipping address same as billing
            </label>

            {!inv.sameAsBilling && (
              <>
                <Field label="Consignee name">
                  <input
                    className="ig-input"
                    value={inv.shipTo.name}
                    onChange={(e) => setShip("name", e.target.value)}
                  />
                </Field>
                <Field label="Shipping address">
                  <textarea
                    className="ig-textarea"
                    rows={2}
                    value={inv.shipTo.address}
                    onChange={(e) => setShip("address", e.target.value)}
                  />
                </Field>
                <div className="ig-grid ig-grid-3">
                  <Field label="City">
                    <input
                      className="ig-input"
                      value={inv.shipTo.city}
                      onChange={(e) => setShip("city", e.target.value)}
                    />
                  </Field>
                  <Field label="PIN">
                    <input
                      className="ig-input"
                      maxLength={6}
                      value={inv.shipTo.pincode}
                      onChange={(e) => setShip("pincode", e.target.value)}
                    />
                  </Field>
                  <Field label="GSTIN">
                    <input
                      className="ig-input"
                      maxLength={15}
                      value={inv.shipTo.gstin}
                      onChange={(e) =>
                        setShip("gstin", e.target.value.toUpperCase())
                      }
                    />
                  </Field>
                </div>
                <Field label="State">
                  <StateInput
                    value={inv.shipTo.state}
                    onChange={(v) => setShip("state", v)}
                  />
                </Field>
              </>
            )}
          </Section>

          {/* Invoice details */}
          <Section
            label="3 · Invoice details"
            openState={open.meta}
            onToggle={() => toggle("meta")}
          >
            <div className="ig-grid ig-grid-2">
              <Field label="Invoice number">
                <input
                  className="ig-input"
                  value={inv.meta.number}
                  placeholder="NCL/25-26/0042"
                  onChange={(e) => setMeta("number", e.target.value)}
                />
              </Field>
              <Field label="Invoice date">
                <input
                  type="date"
                  className="ig-input"
                  value={inv.meta.date}
                  onChange={(e) => setMeta("date", e.target.value)}
                />
              </Field>
            </div>

            <div className="ig-grid ig-grid-2">
              <Field label="Due date">
                <input
                  type="date"
                  className="ig-input"
                  value={inv.meta.dueDate}
                  onChange={(e) => setMeta("dueDate", e.target.value)}
                />
              </Field>
              <Field label="Payment status">
                <select
                  className="ig-select"
                  value={inv.meta.paymentStatus}
                  onChange={(e) => setMeta("paymentStatus", e.target.value)}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Place of supply">
              <StateInput
                value={inv.meta.placeOfSupply}
                onChange={(v) => setMeta("placeOfSupply", v)}
              />
            </Field>

            <Field label="Tax type">
              <select
                className="ig-select"
                value={inv.taxMode}
                onChange={(e) =>
                  setInv((p) => ({
                    ...p,
                    taxMode: e.target.value as TaxMode,
                  }))
                }
              >
                <option value="auto">
                  Automatic — compare seller state & place of supply
                </option>
                <option value="intra">Always CGST + SGST (intra-state)</option>
                <option value="inter">Always IGST (inter-state / export)</option>
              </select>
              <span
                className={`ig-hint ${totals.taxCertain ? "ig-ok" : "ig-warn"}`}
              >
                {totals.taxNote}
              </span>
            </Field>

            <div className="ig-note">
              <span>
                <b>How this works:</b> supplying inside your own state means{" "}
                <b>CGST + SGST</b>, each at half the GST rate — 18% becomes 9% +
                9%. Supplying to another state means <b>IGST</b> at the full
                18%. Either way the customer pays the same total; only the split
                differs.
              </span>
            </div>

            <div className="ig-grid ig-grid-2">
              <Field label="P.O. number">
                <input
                  className="ig-input"
                  value={inv.meta.poNumber}
                  onChange={(e) => setMeta("poNumber", e.target.value)}
                />
              </Field>
              <Field label="P.O. date">
                <input
                  type="date"
                  className="ig-input"
                  value={inv.meta.poDate}
                  onChange={(e) => setMeta("poDate", e.target.value)}
                />
              </Field>
            </div>

            <label className="ig-check">
              <input
                type="checkbox"
                checked={inv.meta.reverseCharge}
                onChange={(e) => setMeta("reverseCharge", e.target.checked)}
              />
              Tax payable under reverse charge
            </label>
          </Section>

          {/* Items */}
          <Section
            label={`4 · Line items (${inv.items.length})`}
            openState={open.items}
            onToggle={() => toggle("items")}
          >
            {inv.items.map((item, idx) => {
              const row = totals.itemRows[idx];
              return (
                <div className="ig-item" key={item.id}>
                  <div className="ig-item-top">
                    <span className="ig-item-tag">Item {idx + 1}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="ig-item-total">
                        ₹ {fmt(row?.total ?? 0)}
                      </span>
                      <button
                        type="button"
                        className="ig-icon-btn"
                        title="Duplicate"
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => duplicateItem(item.id)}
                      >
                        ⧉
                      </button>
                      <button
                        type="button"
                        className="ig-icon-btn"
                        title="Remove"
                        onClick={() => removeItem(item.id)}
                        disabled={inv.items.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <Field label="Description">
                    <input
                      className="ig-input"
                      value={item.description}
                      placeholder="Goods or service description"
                      onChange={(e) =>
                        setItem(item.id, "description", e.target.value)
                      }
                    />
                  </Field>

                  <div className="ig-grid ig-grid-3">
                    <Field label="HSN / SAC">
                      <input
                        className="ig-input"
                        value={item.hsn}
                        onChange={(e) => setItem(item.id, "hsn", e.target.value)}
                      />
                    </Field>
                    <Field label="Qty">
                      <input
                        className="ig-input"
                        type="number"
                        min={0}
                        step="any"
                        value={item.qty}
                        onChange={(e) =>
                          setItem(item.id, "qty", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="UOM">
                      <select
                        className="ig-select"
                        value={item.uom}
                        onChange={(e) => setItem(item.id, "uom", e.target.value)}
                      >
                        {UOM_LIST.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="ig-grid ig-grid-3">
                    <Field label="Rate (₹)">
                      <input
                        className="ig-input"
                        type="number"
                        min={0}
                        step="any"
                        value={item.rate}
                        onChange={(e) =>
                          setItem(item.id, "rate", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Discount">
                      <input
                        className="ig-input"
                        type="number"
                        min={0}
                        step="any"
                        value={item.discountValue}
                        onChange={(e) =>
                          setItem(item.id, "discountValue", Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Disc. type">
                      <select
                        className="ig-select"
                        value={item.discountType}
                        onChange={(e) =>
                          setItem(
                            item.id,
                            "discountType",
                            e.target.value as DiscountType,
                          )
                        }
                      >
                        <option value="percent">%</option>
                        <option value="amount">₹</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="GST rate">
                    <select
                      className="ig-select"
                      value={item.gstRate}
                      onChange={(e) =>
                        setItem(item.id, "gstRate", Number(e.target.value))
                      }
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}%{" "}
                          {totals.isIntraState
                            ? `(CGST ${r / 2}% + SGST ${r / 2}%)`
                            : "(IGST)"}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              );
            })}

            <button type="button" className="ig-btn" onClick={addItem}>
              + Add line item
            </button>
          </Section>

          {/* Charges & discount */}
          <Section
            label="5 · Charges & invoice discount"
            openState={open.charges}
            onToggle={() => toggle("charges")}
          >
            {inv.charges.map((c) => (
              <div className="ig-item" key={c.id}>
                <div className="ig-item-top">
                  <span className="ig-item-tag">Charge</span>
                  <button
                    type="button"
                    className="ig-icon-btn"
                    onClick={() => removeCharge(c.id)}
                  >
                    ✕
                  </button>
                </div>
                <Field label="Label">
                  <input
                    className="ig-input"
                    value={c.label}
                    placeholder="Freight / Packing / Installation"
                    onChange={(e) => setCharge(c.id, "label", e.target.value)}
                  />
                </Field>
                <div className="ig-grid ig-grid-2">
                  <Field label="Amount (₹)">
                    <input
                      className="ig-input"
                      type="number"
                      step="any"
                      value={c.amount}
                      onChange={(e) =>
                        setCharge(c.id, "amount", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field label="GST rate">
                    <select
                      className="ig-select"
                      value={c.gstRate}
                      onChange={(e) =>
                        setCharge(c.id, "gstRate", Number(e.target.value))
                      }
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="ig-btn ig-btn-sm"
                onClick={() => addCharge("Shipping charges")}
              >
                + Shipping
              </button>
              <button
                type="button"
                className="ig-btn ig-btn-sm"
                onClick={() => addCharge("Packing charges")}
              >
                + Packing
              </button>
              <button
                type="button"
                className="ig-btn ig-btn-sm"
                onClick={() => addCharge("")}
              >
                + Other charge
              </button>
            </div>

            <div className="ig-grid ig-grid-2">
              <Field label="Invoice-level discount">
                <input
                  className="ig-input"
                  type="number"
                  min={0}
                  step="any"
                  value={inv.globalDiscountValue}
                  onChange={(e) =>
                    setInv((p) => ({
                      ...p,
                      globalDiscountValue: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Type">
                <select
                  className="ig-select"
                  value={inv.globalDiscountType}
                  onChange={(e) =>
                    setInv((p) => ({
                      ...p,
                      globalDiscountType: e.target.value as DiscountType,
                    }))
                  }
                >
                  <option value="amount">₹</option>
                  <option value="percent">%</option>
                </select>
              </Field>
            </div>
            <p className="ig-hint">
              Invoice discount is spread across items in proportion to their
              value, so each line&apos;s taxable value and GST stay correct.
            </p>

            <label className="ig-check">
              <input
                type="checkbox"
                checked={inv.applyRoundOff}
                onChange={(e) =>
                  setInv((p) => ({ ...p, applyRoundOff: e.target.checked }))
                }
              />
              Round off the grand total to the nearest rupee
            </label>
          </Section>

          {/* Bank */}
          <Section
            label="6 · Payment"
            openState={open.bank}
            onToggle={() => toggle("bank")}
          >
            <Field label="Mode of payment">
              <select
                className="ig-select"
                value={inv.bank.mode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            {inv.bank.mode === OTHER_MODE ? (
              <Field label="Write your own payment mode">
                <input
                  className="ig-input"
                  autoFocus
                  value={inv.bank.customMode}
                  placeholder="e.g. Adjusted against advance, Barter, Crypto"
                  onChange={(e) => setBank("customMode", e.target.value)}
                />
                <span className="ig-hint">
                  This exact wording is printed as the mode of payment.
                </span>
              </Field>
            ) : null}

            <Field label={referenceLabel(inv.bank.mode)}>
              <input
                className="ig-input"
                value={inv.bank.reference}
                placeholder="Optional"
                onChange={(e) => setBank("reference", e.target.value)}
              />
            </Field>

            <label className="ig-check">
              <input
                type="checkbox"
                checked={inv.bank.includeAccount}
                onChange={(e) =>
                  setInv((p) => ({
                    ...p,
                    bank: { ...p.bank, includeAccount: e.target.checked },
                  }))
                }
              />
              Print full bank account details on the invoice
            </label>

            {!inv.bank.includeAccount ? (
              <p className="ig-hint">
                Only the mode of payment
                {inv.bank.reference ? " and reference" : ""} will be printed.
              </p>
            ) : null}

            {inv.bank.mode === "UPI" && !inv.bank.includeAccount ? (
              <Field label="UPI ID">
                <input
                  className="ig-input"
                  value={inv.bank.upi}
                  placeholder="business@bank"
                  onChange={(e) => setBank("upi", e.target.value)}
                />
              </Field>
            ) : null}

            {inv.bank.includeAccount ? (
              <>
            <Field label="Account holder name">
              <input
                className="ig-input"
                value={inv.bank.accountName}
                onChange={(e) => setBank("accountName", e.target.value)}
              />
            </Field>
            <div className="ig-grid ig-grid-2">
              <Field label="Bank name">
                <input
                  className="ig-input"
                  value={inv.bank.bankName}
                  onChange={(e) => setBank("bankName", e.target.value)}
                />
              </Field>
              <Field label="Branch">
                <input
                  className="ig-input"
                  value={inv.bank.branch}
                  onChange={(e) => setBank("branch", e.target.value)}
                />
              </Field>
            </div>
            <div className="ig-grid ig-grid-2">
              <Field label="Account number">
                <input
                  className="ig-input"
                  value={inv.bank.accountNumber}
                  onChange={(e) => setBank("accountNumber", e.target.value)}
                />
              </Field>
              <Field label="IFSC">
                <input
                  className="ig-input"
                  maxLength={11}
                  value={inv.bank.ifsc}
                  onChange={(e) => setBank("ifsc", e.target.value.toUpperCase())}
                />
              </Field>
            </div>
            <Field label="UPI ID">
              <input
                className="ig-input"
                value={inv.bank.upi}
                placeholder="business@bank"
                onChange={(e) => setBank("upi", e.target.value)}
              />
            </Field>
              </>
            ) : null}
          </Section>

          {/* Extras */}
          <Section
            label="7 · Signature, e-invoice & terms"
            openState={open.extras}
            onToggle={() => toggle("extras")}
          >
            <div className="ig-upload">
              <div className="ig-upload-preview">
                {inv.signature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inv.signature} alt="Signature preview" />
                ) : (
                  <span>Signature</span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  className="ig-file"
                  onChange={(e) =>
                    readImage(e.target.files?.[0], (d) =>
                      setInv((p) => ({ ...p, signature: d })),
                    )
                  }
                />
                {inv.signature ? (
                  <button
                    type="button"
                    className="ig-btn ig-btn-sm"
                    style={{ marginTop: "0.4rem" }}
                    onClick={() => setInv((p) => ({ ...p, signature: "" }))}
                  >
                    Remove signature
                  </button>
                ) : null}
              </div>
            </div>

            <Field label="Authorised signatory name">
              <input
                className="ig-input"
                value={inv.signatoryName}
                onChange={(e) =>
                  setInv((p) => ({ ...p, signatoryName: e.target.value }))
                }
              />
            </Field>

            <div className="ig-grid ig-grid-2">
              <Field label="Transport mode">
                <select
                  className="ig-select"
                  value={inv.meta.transportMode}
                  onChange={(e) => setMeta("transportMode", e.target.value)}
                >
                  {TRANSPORT_MODES.map((m) => (
                    <option key={m || "none"} value={m}>
                      {m || "—"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Vehicle number">
                <input
                  className="ig-input"
                  value={inv.meta.vehicleNo}
                  onChange={(e) => setMeta("vehicleNo", e.target.value)}
                />
              </Field>
            </div>

            <Field label="E-Way Bill number">
              <input
                className="ig-input"
                value={inv.meta.ewayBill}
                onChange={(e) => setMeta("ewayBill", e.target.value)}
              />
            </Field>

            <Field label="IRN (e-invoice reference number)">
              <input
                className="ig-input"
                value={inv.meta.irn}
                onChange={(e) => setMeta("irn", e.target.value)}
              />
            </Field>

            <div className="ig-grid ig-grid-2">
              <Field label="Acknowledgement no.">
                <input
                  className="ig-input"
                  value={inv.meta.ackNo}
                  onChange={(e) => setMeta("ackNo", e.target.value)}
                />
              </Field>
              <Field label="Acknowledgement date">
                <input
                  type="date"
                  className="ig-input"
                  value={inv.meta.ackDate}
                  onChange={(e) => setMeta("ackDate", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Signed QR code image">
              <input
                type="file"
                accept="image/*"
                className="ig-file"
                onChange={(e) =>
                  readImage(e.target.files?.[0], (d) => setMeta("qrData", d))
                }
              />
              <span className="ig-hint">
                Upload the QR issued by the IRP. Leave blank if you are not
                under e-invoicing.
              </span>
            </Field>

            <Field label="Terms & conditions">
              <textarea
                className="ig-textarea"
                rows={4}
                value={inv.terms}
                onChange={(e) => setInv((p) => ({ ...p, terms: e.target.value }))}
              />
            </Field>

            <Field label="Declaration">
              <textarea
                className="ig-textarea"
                rows={2}
                value={inv.declaration}
                onChange={(e) =>
                  setInv((p) => ({ ...p, declaration: e.target.value }))
                }
              />
            </Field>

            <Field label="Notes to customer">
              <textarea
                className="ig-textarea"
                rows={2}
                value={inv.notes}
                onChange={(e) => setInv((p) => ({ ...p, notes: e.target.value }))}
              />
            </Field>

            <button type="button" className="ig-btn ig-btn-sm" onClick={clearProfile}>
              Clear saved business profile
            </button>
          </Section>

          {/* Labels */}
          <Section
            label="8 · Labels & headings"
            openState={open.labels}
            onToggle={() => toggle("labels")}
          >
            <p className="ig-hint">
              Rename anything printed on the invoice — the document title,
              column headers, totals rows and footer blocks. Defaults are used
              until you change them. Use <b>− Remove</b> / <b>+ Add</b> beside a
              field to drop that column or block from the PDF or bring it back.
            </p>

            {LABEL_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="ig-group-title">{group.title}</p>
                <div className="ig-grid ig-grid-2">
                  {group.keys.map((key) => {
                    const toggleKey = LABEL_TOGGLE[key];
                    const shown = toggleKey
                      ? inv.show?.[toggleKey] ?? true
                      : true;
                    return (
                      <div
                        className={`ig-field${shown ? "" : " ig-field-off"}`}
                        key={key}
                      >
                        <div className="ig-field-head">
                          <label htmlFor={`lbl-${key}`}>
                            {DEFAULT_LABELS[key]}
                          </label>
                          {toggleKey ? (
                            <button
                              type="button"
                              className={`ig-pill ${shown ? "on" : "off"}`}
                              title={
                                shown
                                  ? "Remove this from the invoice"
                                  : "Add this back to the invoice"
                              }
                              onClick={() => setShow(toggleKey, !shown)}
                            >
                              {shown ? "− Remove" : "+ Add"}
                            </button>
                          ) : null}
                        </div>
                        <input
                          id={`lbl-${key}`}
                          className="ig-input"
                          value={inv.labels?.[key] ?? DEFAULT_LABELS[key]}
                          placeholder={DEFAULT_LABELS[key]}
                          disabled={!shown}
                          onChange={(e) => setLabel(key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button type="button" className="ig-btn ig-btn-sm" onClick={resetLabels}>
              Reset all headings to default
            </button>
          </Section>

          {/* Visibility */}
          <Section
            label="9 · Show / hide on the PDF"
            openState={open.visibility}
            onToggle={() => toggle("visibility")}
          >
            <p className="ig-hint">
              Untick anything you don&apos;t want printed. Blocks with no data
              are hidden automatically.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="ig-btn ig-btn-sm"
                onClick={() => setAllShown(true)}
              >
                Show all
              </button>
              <button
                type="button"
                className="ig-btn ig-btn-sm"
                onClick={() => setAllShown(false)}
              >
                Hide all
              </button>
              <button
                type="button"
                className="ig-btn ig-btn-sm"
                onClick={() => {
                  setInv((p) => ({ ...p, show: { ...DEFAULT_VISIBILITY } }));
                  flash("Layout reset to defaults.");
                }}
              >
                Reset
              </button>
            </div>

            {VISIBILITY_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="ig-group-title">{group.title}</p>
                <div className="ig-toggle-list">
                  {group.items.map((item) => (
                    <label className="ig-check" key={item.key}>
                      <input
                        type="checkbox"
                        checked={inv.show?.[item.key] ?? true}
                        onChange={(e) => setShow(item.key, e.target.checked)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          <div className="ig-note">
            Everything stays on this device — nothing is uploaded to a server.
            &quot;Download PDF&quot; opens your browser&apos;s print dialog;
            choose <b>Save as PDF</b>, paper size <b>A4</b>, margins{" "}
            <b>Default</b>, and turn on <b>Background graphics</b> for the
            shaded header rows.
          </div>
        </div>

        {/* ══════════ PREVIEW ══════════ */}
        <div className="ig-preview-pane">
          <div className="ig-preview-bar ig-no-print">
            <span className="ig-preview-label">
              Live preview · A4 · click any heading to rename it
            </span>
            <span
              className={`ig-badge ${
                !totals.taxCertain
                  ? "ig-badge-warn"
                  : totals.isIntraState
                    ? "ig-badge-intra"
                    : "ig-badge-inter"
              }`}
              title={totals.taxNote}
            >
              {totals.isIntraState
                ? "Intra-state · CGST + SGST"
                : "Inter-state · IGST"}
              {totals.taxCertain ? "" : " · check this"}
            </span>
          </div>

          <div className="ig-summary-strip ig-no-print" style={{ marginBottom: "1rem" }}>
            <div className="ig-stat">
              <span>Taxable value</span>
              <strong>₹{fmt(totals.totalTaxable)}</strong>
            </div>
            <div className="ig-stat">
              <span>Total GST</span>
              <strong>₹{fmt(totals.totalTax)}</strong>
            </div>
            <div className="ig-stat">
              <span>Round off</span>
              <strong>₹{fmt(totals.roundOff)}</strong>
            </div>
            <div className="ig-stat ig-stat-accent">
              <span>Grand total</span>
              <strong>₹{fmt(totals.grandTotal)}</strong>
            </div>
          </div>

          <div className="ig-paper-wrap" ref={paperRef}>
            <div
              className="ig-zoom"
              style={{ "--ig-zoom": zoom } as React.CSSProperties}
            >
              <InvoicePreview
                inv={inv}
                totals={totals}
                onLabelChange={setLabel}
                onTextChange={setText}
              />
            </div>
          </div>

          <p className="ig-hint ig-no-print" style={{ marginTop: "0.9rem" }}>
            {restored
              ? "Tip: save your business details once and they will be pre-filled next time."
              : "Loading saved details…"}
          </p>
        </div>
      </div>
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
      <button
        type="button"
        className="ig-card-head"
        onClick={onToggle}
        aria-expanded={openState}
      >
        <span>{label}</span>
        <span className={`ig-chev ${openState ? "open" : ""}`}>▶</span>
      </button>
      {openState ? <div className="ig-card-body">{children}</div> : null}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ig-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

/**
 * Free-text state entry. Type anything — the suggestion list is only a
 * shortcut, and the GST code is resolved from whatever ends up in the box.
 */
function StateInput({
  value,
  onChange,
  placeholder = "Karnataka",
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  // A profile saved by an older version may not carry this field at all.
  const safe = value ?? "";
  const code = resolveStateCode(safe);
  return (
    <>
      <input
        className="ig-input"
        list="ig-state-list"
        value={safe}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {safe.trim() ? (
        <span className={`ig-hint ${code ? "ig-ok" : ""}`}>
          {code
            ? `Recognised as GST state code ${code}.`
            : "Printed as typed — set the tax type manually if needed."}
        </span>
      ) : null}
    </>
  );
}

/** One shared suggestion list for every state box on the page. */
function StateDataList() {
  return (
    <datalist id="ig-state-list">
      {STATES.map((s) => (
        <option key={s.code} value={s.name}>
          {s.code}
        </option>
      ))}
    </datalist>
  );
}
