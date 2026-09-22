import type {
  ExtraCharge,
  InvoiceState,
  Labels,
  LineItem,
  Party,
  TaxRow,
  Totals,
  Visibility,
} from "./types";

/* ─────────────────────────────────────────────
   What gets printed. Every block, row and column
   on the invoice can be switched off.
   ───────────────────────────────────────────── */
export const DEFAULT_VISIBILITY: Visibility = {
  logo: true,
  copyType: true,
  reverseChargeLine: true,
  sellerPan: true,
  sellerContact: true,

  metaDueDate: true,
  metaPo: true,
  metaPlaceOfSupply: true,
  metaSupplyType: false,
  metaStatus: false,

  shipTo: true,
  buyerGstin: true,
  buyerContact: true,
  transportRow: true,

  colHsn: true,
  colQty: true,
  colUom: true,
  colRate: true,
  colDisc: true,
  tableTotalRow: true,

  amountInWords: true,
  paymentMode: true,
  bankDetails: true,
  notes: true,
  totalsBreakdown: true,
  taxSummary: true,
  eInvoice: true,
  terms: true,
  declaration: true,
  signature: true,
  footerNote: true,
};

/** Label key → the visibility switch that controls where it appears,
    so a column can be renamed and removed from the same row. */
export const LABEL_TOGGLE: Record<string, string> = {
  copyType: "copyType",
  reverseChargePrefix: "reverseChargeLine",
  reverseChargeYes: "reverseChargeLine",
  reverseChargeNo: "reverseChargeLine",

  metaDueDate: "metaDueDate",
  metaPo: "metaPo",
  metaPlaceOfSupply: "metaPlaceOfSupply",
  metaSupplyType: "metaSupplyType",
  supplyIntra: "metaSupplyType",
  supplyInter: "metaSupplyType",
  metaStatus: "metaStatus",

  shipTo: "shipTo",
  unregistered: "buyerGstin",
  fieldPan: "sellerPan",
  fieldTransport: "transportRow",
  fieldVehicle: "transportRow",
  fieldEway: "transportRow",
  fieldIrn: "eInvoice",
  fieldAck: "eInvoice",
  fieldAckDate: "eInvoice",
  qrPlaceholder: "eInvoice",

  colHsn: "colHsn",
  colQty: "colQty",
  colUom: "colUom",
  colRate: "colRate",
  colDisc: "colDisc",
  rowTotal: "tableTotalRow",

  totalGross: "totalsBreakdown",
  totalItemDiscount: "totalsBreakdown",
  totalInvoiceDiscount: "totalsBreakdown",
  totalCharges: "totalsBreakdown",

  amountInWords: "amountInWords",
  bankDetails: "bankDetails",
  fieldPaymentMode: "paymentMode",
  fieldPaymentRef: "paymentMode",
  notes: "notes",
  taxSummary: "taxSummary",
  terms: "terms",
  declaration: "declaration",
  signatoryPrefix: "signature",
  signatory: "signature",
  footerNote: "footerNote",
};

export const VISIBILITY_GROUPS: {
  title: string;
  items: { key: string; label: string }[];
}[] = [
  {
    title: "Header",
    items: [
      { key: "logo", label: "Brand logo" },
      { key: "copyType", label: "Copy type line (Original for Recipient)" },
      {
        key: "reverseChargeLine",
        label: "Reverse-charge line (only when it applies)",
      },
      { key: "sellerPan", label: "Seller PAN" },
      { key: "sellerContact", label: "Seller phone & email" },
    ],
  },
  {
    title: "Invoice details block",
    items: [
      { key: "metaDueDate", label: "Due date" },
      { key: "metaPo", label: "P.O. number" },
      { key: "metaPlaceOfSupply", label: "Place of supply" },
      { key: "metaSupplyType", label: "Supply type (intra/inter-state)" },
      { key: "metaStatus", label: "Payment status badge" },
    ],
  },
  {
    title: "Parties & transport",
    items: [
      { key: "shipTo", label: "Ship-to / consignee block" },
      { key: "buyerGstin", label: "Customer GSTIN line" },
      { key: "buyerContact", label: "Customer phone & email" },
      { key: "transportRow", label: "Transport / vehicle / e-way strip" },
    ],
  },
  {
    title: "Item table columns",
    items: [
      { key: "colHsn", label: "HSN / SAC column" },
      { key: "colQty", label: "Qty column" },
      { key: "colUom", label: "UOM column" },
      { key: "colRate", label: "Rate column" },
      { key: "colDisc", label: "Discount column" },
      { key: "tableTotalRow", label: "Table total row" },
    ],
  },
  {
    title: "Lower blocks",
    items: [
      { key: "amountInWords", label: "Amount in words" },
      { key: "paymentMode", label: "Mode of payment & reference" },
      { key: "bankDetails", label: "Bank account details" },
      { key: "notes", label: "Notes" },
      { key: "totalsBreakdown", label: "Gross / discount / charges rows" },
      { key: "taxSummary", label: "HSN-wise tax summary" },
      { key: "eInvoice", label: "IRN / Ack / QR block" },
      { key: "terms", label: "Terms & conditions" },
      { key: "declaration", label: "Declaration" },
      { key: "signature", label: "Signature block" },
      { key: "footerNote", label: "Footer note" },
    ],
  },
];

/* ─────────────────────────────────────────────
   Editable headings — every visible title on the
   printed invoice, with its default wording.
   ───────────────────────────────────────────── */
export const DEFAULT_LABELS: Labels = {
  documentTitle: "Tax Invoice",
  copyType: "Original for Recipient",
  reverseChargePrefix: "Tax payable under Reverse Charge",
  reverseChargeYes: "YES",
  reverseChargeNo: "NO",

  metaNumber: "Invoice No.",
  metaDate: "Invoice Date",
  metaDueDate: "Due Date",
  metaPo: "P.O. No.",
  metaPlaceOfSupply: "Place of Supply",
  metaSupplyType: "Supply Type",
  metaStatus: "Status",
  supplyIntra: "Intra-State",
  supplyInter: "Inter-State",

  billTo: "Bill To (Recipient)",
  shipTo: "Ship To (Consignee)",
  unregistered: "Unregistered",

  fieldGstin: "GSTIN",
  fieldPan: "PAN",
  fieldTransport: "Transport",
  fieldVehicle: "Vehicle No.",
  fieldEway: "E-Way Bill",
  fieldIrn: "IRN",
  fieldAck: "Ack No.",
  fieldAckDate: "Ack Date",
  qrPlaceholder: "Signed QR Code",

  colSr: "#",
  colDescription: "Description of Goods / Services",
  colHsn: "HSN/SAC",
  colQty: "Qty",
  colUom: "UOM",
  colRate: "Rate",
  colDisc: "Disc.",
  colTaxable: "Taxable",
  colTotal: "Total",
  colCgst: "CGST",
  colSgst: "SGST/UTGST",
  colIgst: "IGST",
  colPercent: "%",
  colAmount: "Amount",
  rowTotal: "Total",
  chargeTag: "Additional charge",

  amountInWords: "Total Invoice Value (in words)",
  bankDetails: "Bank & Payment Details",
  fieldPaymentMode: "Mode of Payment",
  fieldPaymentRef: "Reference",
  notes: "Notes",

  totalGross: "Gross Amount",
  totalItemDiscount: "Less: Item Discount",
  totalInvoiceDiscount: "Less: Invoice Discount",
  totalCharges: "Add: Other Charges",
  totalTaxable: "Taxable Value",
  totalCgst: "CGST",
  totalSgst: "SGST / UTGST",
  totalIgst: "IGST",
  totalTax: "Total Tax",
  roundOff: "Round Off",
  grandTotal: "Grand Total",
  reverseChargeNote:
    "Tax payable by recipient under Reverse Charge Mechanism (Sec. 9(3)/9(4) CGST Act).",

  taxSummary: "HSN / SAC-wise Tax Summary",
  terms: "Terms & Conditions",
  declaration: "Declaration",
  signatoryPrefix: "For",
  signatory: "Authorised Signatory",
  footerNote:
    "This is a computer-generated tax invoice and is valid without a physical signature.",
};

/** Grouped for the editor UI. */
export const LABEL_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "Header",
    keys: [
      "documentTitle",
      "copyType",
      "reverseChargePrefix",
      "reverseChargeYes",
      "reverseChargeNo",
    ],
  },
  {
    title: "Invoice details block",
    keys: [
      "metaNumber",
      "metaDate",
      "metaDueDate",
      "metaPo",
      "metaPlaceOfSupply",
      "metaSupplyType",
      "metaStatus",
      "supplyIntra",
      "supplyInter",
    ],
  },
  {
    title: "Parties & field names",
    keys: [
      "billTo",
      "shipTo",
      "unregistered",
      "fieldGstin",
      "fieldPan",
      "fieldTransport",
      "fieldVehicle",
      "fieldEway",
      "fieldIrn",
      "fieldAck",
      "fieldAckDate",
      "qrPlaceholder",
    ],
  },
  {
    title: "Item table columns",
    keys: [
      "colSr",
      "colDescription",
      "colHsn",
      "colQty",
      "colUom",
      "colRate",
      "colDisc",
      "colTaxable",
      "colCgst",
      "colSgst",
      "colIgst",
      "colPercent",
      "colAmount",
      "colTotal",
      "rowTotal",
      "chargeTag",
    ],
  },
  {
    title: "Totals block",
    keys: [
      "totalGross",
      "totalItemDiscount",
      "totalInvoiceDiscount",
      "totalCharges",
      "totalTaxable",
      "totalCgst",
      "totalSgst",
      "totalIgst",
      "totalTax",
      "roundOff",
      "grandTotal",
      "reverseChargeNote",
    ],
  },
  {
    title: "Footer blocks",
    keys: [
      "amountInWords",
      "bankDetails",
      "fieldPaymentMode",
      "fieldPaymentRef",
      "notes",
      "taxSummary",
      "terms",
      "declaration",
      "signatoryPrefix",
      "signatory",
      "footerNote",
    ],
  },
];

/* ─── Indian states & UT codes (GST) ─── */
export const STATES: { code: string; name: string }[] = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
  { code: "96", name: "Other Country (Export)" },
];

export const GST_RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

export const UOM_LIST = [
  "NOS",
  "PCS",
  "KGS",
  "GMS",
  "LTR",
  "MTR",
  "SQF",
  "SQM",
  "BOX",
  "SET",
  "HRS",
  "DAY",
  "MON",
  "UNT",
  "OTH",
];

export const PAYMENT_STATUSES = ["Unpaid", "Paid", "Partially Paid", "Overdue"];

/* ─── Mode of payment ─── */
export const OTHER_MODE = "Other";

export const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "Bank Transfer (NEFT / RTGS / IMPS)",
  "Cheque",
  "Demand Draft",
  "Credit / Debit Card",
  "Net Banking",
  "Online Payment Gateway",
  "Credit (Pay Later)",
  OTHER_MODE,
];

/** Modes where the account number / IFSC block is worth printing. */
export const MODES_NEEDING_BANK = new Set([
  "Bank Transfer (NEFT / RTGS / IMPS)",
  "Cheque",
  "Demand Draft",
  "Net Banking",
]);

/** What the reference field is called for the chosen mode. */
export function referenceLabel(mode: string): string {
  if (mode === "Cheque") return "Cheque number & date";
  if (mode === "Demand Draft") return "DD number & date";
  if (mode === "UPI") return "UPI transaction ID";
  if (mode === "Cash") return "Receipt number";
  if (mode.startsWith("Bank Transfer")) return "UTR / reference number";
  return "Payment reference";
}

/** The wording that prints on the invoice. */
export function paymentModeText(bank: {
  mode: string;
  customMode: string;
}): string {
  if (!bank.mode) return "";
  return bank.mode === OTHER_MODE ? bank.customMode.trim() : bank.mode;
}

export const TRANSPORT_MODES = ["", "Road", "Rail", "Air", "Ship", "Courier", "Hand Delivery"];

export function stateName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? "";
}

export function stateLabel(code: string): string {
  const n = stateName(code);
  return n ? `${code} - ${n}` : "";
}

const normalise = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Works out the two-digit GST state code from whatever was typed:
 * "29", "29 - Karnataka", "Karnataka", "karnataka " all give "29".
 * Returns "" when nothing matches — the text still prints as entered.
 */
export function resolveStateCode(text: string | undefined | null): string {
  const raw = (text ?? "").trim();
  if (!raw) return "";

  // A leading two-digit code, on its own or before a separator.
  const codeMatch = raw.match(/^(\d{2})\b/);
  if (codeMatch && STATES.some((s) => s.code === codeMatch[1])) {
    return codeMatch[1];
  }

  const n = normalise(raw);
  if (!n) return "";
  const exact = STATES.find((s) => normalise(s.name) === n);
  if (exact) return exact.code;

  // Tolerate "Karnataka State", "Tamilnadu", trailing codes and the like.
  const partial = STATES.filter((s) => {
    const sn = normalise(s.name);
    return n.includes(sn) || sn.includes(n);
  });
  return partial.length === 1 ? partial[0].code : "";
}

/* ─── Money helpers ─── */
export const r2 = (n: number): number =>
  Math.round((Number.isFinite(n) ? n : 0) * 100 + Number.EPSILON) / 100;

export function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(r2(n));
}

export function fmtQty(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(Number.isFinite(n) ? n : 0);
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mmm = d.toLocaleString("en-GB", { month: "short" });
  return `${dd}-${mmm}-${d.getFullYear()}`;
}

/* ─── Amount in words (Indian numbering system) ─── */
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? ` ${ONES[o]}` : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let out = "";
  if (h) out += `${ONES[h]} Hundred`;
  if (rest) out += `${h ? " " : ""}${twoDigits(rest)}`;
  return out;
}

export function numberToWordsIndian(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${numberToWordsIndian(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ").trim();
}

export function amountInWords(value: number, currency = "Rupees"): string {
  const sign = value < 0 ? "Minus " : "";
  const abs = Math.abs(r2(value));
  const whole = Math.floor(abs);
  const paise = Math.round((abs - whole) * 100);
  let out = `${sign}${currency} ${numberToWordsIndian(whole)}`;
  if (paise > 0) out += ` and ${twoDigits(paise)} Paise`;
  return `${out} Only`;
}

/* ─── GSTIN validation ─── */
const GSTIN_RE =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGstin(g: string): boolean {
  return GSTIN_RE.test(g.trim().toUpperCase());
}

export function gstinStateCode(g: string): string {
  const v = g.trim();
  return v.length >= 2 ? v.slice(0, 2) : "";
}

export function isValidPan(p: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(p.trim().toUpperCase());
}

/* ─── Core GST computation ─── */
export function computeTotals(inv: InvoiceState): Totals {
  /* ── CGST + SGST or IGST? ──
     Same state as the seller  → CGST + SGST (half the rate each)
     Different state or export → IGST (the full rate)
     Anything we can't read is flagged rather than silently assumed. */
  const sellerRaw = (inv.seller.state ?? "").trim();
  const supplyRaw = (inv.meta.placeOfSupply || inv.buyer.state || "").trim();
  const sellerCode = resolveStateCode(sellerRaw);
  const supplyCode = resolveStateCode(supplyRaw);

  let autoIntra: boolean;
  let taxCertain = true;
  let taxNote: string;

  if (sellerCode && supplyCode) {
    autoIntra = sellerCode === supplyCode;
    taxNote = autoIntra
      ? `Place of supply is in your own state (${stateName(sellerCode)}), so CGST + SGST apply — half the GST rate each.`
      : `${stateName(supplyCode)} is outside your state (${stateName(sellerCode)}), so IGST applies at the full rate.`;
  } else if (!supplyRaw) {
    // Nothing entered yet: a domestic invoice is far more often within
    // the seller's own state, so assume that rather than defaulting to IGST.
    autoIntra = true;
    taxCertain = false;
    taxNote =
      "No place of supply entered yet — assuming a supply inside your own state, so CGST + SGST are shown.";
  } else if (!sellerCode) {
    autoIntra = Boolean(supplyCode);
    taxCertain = false;
    taxNote = sellerRaw
      ? `Your business state “${sellerRaw}” isn't recognised, so the split can't be checked — assuming ${autoIntra ? "CGST + SGST" : "IGST"}.`
      : "Your business state is empty, so the split can't be checked — fill it in or set the tax type manually.";
  } else {
    // A place of supply was typed but isn't an Indian state — export or SEZ.
    autoIntra = false;
    taxCertain = false;
    taxNote = `“${supplyRaw}” isn't an Indian state, so it is being treated as an inter-state supply (IGST). Set the tax type manually if that's wrong.`;
  }

  const isIntraState =
    inv.taxMode === "intra"
      ? true
      : inv.taxMode === "inter"
        ? false
        : autoIntra;

  const prepared = inv.items.map((item: LineItem) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const gross = r2(qty * rate);
    const dv = Number(item.discountValue) || 0;
    const lineDiscount = r2(
      item.discountType === "percent" ? (gross * dv) / 100 : Math.min(dv, gross),
    );
    const net = r2(Math.max(0, gross - lineDiscount));
    return { item, gross, lineDiscount, net, qty };
  });

  const netSubtotal = r2(prepared.reduce((s, p) => s + p.net, 0));
  const gdv = Number(inv.globalDiscountValue) || 0;
  const globalDiscountAmount = r2(
    Math.min(
      netSubtotal,
      inv.globalDiscountType === "percent" ? (netSubtotal * gdv) / 100 : gdv,
    ),
  );

  const itemRows = prepared.map((p, idx) => {
    const share =
      netSubtotal > 0 ? (globalDiscountAmount * p.net) / netSubtotal : 0;
    const taxable = r2(Math.max(0, p.net - share));
    const gstRate = Number(p.item.gstRate) || 0;
    const tax = r2((taxable * gstRate) / 100);
    const cgst = isIntraState ? r2(tax / 2) : 0;
    const sgst = isIntraState ? r2(tax - cgst) : 0;
    const igst = isIntraState ? 0 : tax;
    return {
      key: `item-${p.item.id}-${idx}`,
      label: p.item.description,
      hsn: p.item.hsn,
      taxable,
      gstRate,
      cgst,
      sgst,
      igst,
      total: r2(taxable + cgst + sgst + igst),
      item: p.item,
      gross: p.gross,
      lineDiscount: p.lineDiscount,
    };
  });

  const chargeRows = inv.charges
    .filter((c: ExtraCharge) => (Number(c.amount) || 0) !== 0)
    .map((c, idx) => {
      const taxable = r2(Number(c.amount) || 0);
      const gstRate = Number(c.gstRate) || 0;
      const tax = r2((taxable * gstRate) / 100);
      const cgst = isIntraState ? r2(tax / 2) : 0;
      const sgst = isIntraState ? r2(tax - cgst) : 0;
      const igst = isIntraState ? 0 : tax;
      return {
        key: `charge-${c.id}-${idx}`,
        label: c.label || "Other charges",
        hsn: "",
        taxable,
        gstRate,
        cgst,
        sgst,
        igst,
        total: r2(taxable + cgst + sgst + igst),
        charge: c,
      };
    });

  const rows: TaxRow[] = [...itemRows, ...chargeRows];

  const sum = (fn: (r: TaxRow) => number) => r2(rows.reduce((s, r) => s + fn(r), 0));

  const totalTaxable = sum((r) => r.taxable);
  const totalCgst = sum((r) => r.cgst);
  const totalSgst = sum((r) => r.sgst);
  const totalIgst = sum((r) => r.igst);
  const totalTax = r2(totalCgst + totalSgst + totalIgst);
  const chargesTotal = r2(chargeRows.reduce((s, c) => s + c.taxable, 0));
  const beforeRound = r2(totalTaxable + totalTax);
  const rounded = Math.round(beforeRound);
  const roundOff = inv.applyRoundOff ? r2(rounded - beforeRound) : 0;
  const grandTotal = inv.applyRoundOff ? rounded : beforeRound;

  const group = (keyFn: (r: TaxRow) => string, labelFn: (r: TaxRow) => string) => {
    const map = new Map<string, TaxRow>();
    rows.forEach((r) => {
      const k = keyFn(r);
      const found = map.get(k);
      if (found) {
        found.taxable = r2(found.taxable + r.taxable);
        found.cgst = r2(found.cgst + r.cgst);
        found.sgst = r2(found.sgst + r.sgst);
        found.igst = r2(found.igst + r.igst);
        found.total = r2(found.total + r.total);
      } else {
        map.set(k, {
          key: k,
          label: labelFn(r),
          hsn: r.hsn,
          taxable: r.taxable,
          gstRate: r.gstRate,
          cgst: r.cgst,
          sgst: r.sgst,
          igst: r.igst,
          total: r.total,
        });
      }
    });
    return Array.from(map.values());
  };

  return {
    rows,
    itemRows,
    chargeRows,
    grossTotal: r2(prepared.reduce((s, p) => s + p.gross, 0)),
    lineDiscountTotal: r2(prepared.reduce((s, p) => s + p.lineDiscount, 0)),
    globalDiscountAmount,
    totalTaxable,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTax,
    chargesTotal,
    beforeRound,
    roundOff,
    grandTotal,
    totalQty: prepared.reduce((s, p) => s + p.qty, 0),
    isIntraState,
    taxNote:
      inv.taxMode === "auto"
        ? taxNote
        : `Tax type is set manually to ${
            isIntraState ? "CGST + SGST" : "IGST"
          }, so the state boxes are ignored.`,
    taxCertain: inv.taxMode === "auto" ? taxCertain : true,
    hsnSummary: group(
      (r) => `${r.hsn || "-"}|${r.gstRate}`,
      (r) => r.hsn || "-",
    ),
    rateSummary: group(
      (r) => `${r.gstRate}`,
      (r) => `${r.gstRate}%`,
    ),
  };
}

/* ─────────────────────────────────────────────
   Restoring an older saved profile
   ───────────────────────────────────────────── */

/** An address block saved by an earlier version used a `stateCode`. */
type LegacyParty = Partial<Party> & { stateCode?: string };

function mergeParty(base: Party, saved: LegacyParty | undefined): Party {
  const merged = { ...base, ...(saved ?? {}) } as Party & {
    stateCode?: string;
  };
  if (!merged.state && merged.stateCode) {
    merged.state = stateName(merged.stateCode) || merged.stateCode;
  }
  merged.state = merged.state ?? "";
  delete merged.stateCode;
  return merged;
}

/** "36" from an older save becomes "Telangana". */
function migratePlaceOfSupply(value: string | undefined): string {
  const v = (value ?? "").trim();
  if (/^\d{2}$/.test(v)) return stateName(v) || v;
  return v;
}

/**
 * Folds a saved profile onto the current defaults, so a profile written by
 * an earlier version can never leave a required field undefined.
 */
export function mergeSavedProfile(
  base: InvoiceState,
  saved: Partial<InvoiceState>,
): InvoiceState {
  return {
    ...base,
    ...saved,
    labels: { ...DEFAULT_LABELS, ...(saved.labels ?? {}) },
    show: { ...DEFAULT_VISIBILITY, ...(saved.show ?? {}) },
    taxMode: saved.taxMode ?? base.taxMode,
    seller: mergeParty(base.seller, saved.seller),
    buyer: mergeParty(base.buyer, saved.buyer),
    shipTo: mergeParty(base.shipTo, saved.shipTo),
    bank: { ...base.bank, ...(saved.bank ?? {}) },
    meta: {
      ...base.meta,
      ...(saved.meta ?? {}),
      placeOfSupply: migratePlaceOfSupply(saved.meta?.placeOfSupply),
      date: todayISO(),
    },
    // A saved profile never carries line items.
    items: base.items,
    charges: saved.charges ?? base.charges,
  };
}

/* ─── Defaults ─── */
export const uid = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const emptyParty = () => ({
  name: "",
  address: "",
  city: "",
  pincode: "",
  state: "",
  gstin: "",
  pan: "",
  phone: "",
  email: "",
});

/** Shifts an ISO date by whole days, staying in the local timezone. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function defaultInvoice(): InvoiceState {
  return {
    labels: { ...DEFAULT_LABELS },
    show: { ...DEFAULT_VISIBILITY },
    taxMode: "auto",
    seller: emptyParty(),
    buyer: emptyParty(),
    shipTo: emptyParty(),
    sameAsBilling: true,
    meta: {
      number: "",
      date: todayISO(),
      dueDate: "",
      poNumber: "",
      poDate: "",
      paymentStatus: "Unpaid",
      reverseCharge: false,
      placeOfSupply: "",
      irn: "",
      ackNo: "",
      ackDate: "",
      qrData: "",
      transportMode: "",
      vehicleNo: "",
      ewayBill: "",
    },
    items: [
      {
        id: uid(),
        description: "",
        hsn: "",
        qty: 1,
        uom: "NOS",
        rate: 0,
        discountValue: 0,
        discountType: "percent",
        gstRate: 18,
      },
    ],
    charges: [],
    globalDiscountType: "amount",
    globalDiscountValue: 0,
    applyRoundOff: true,
    bank: {
      mode: "Bank Transfer (NEFT / RTGS / IMPS)",
      customMode: "",
      reference: "",
      includeAccount: true,
      accountName: "",
      accountNumber: "",
      bankName: "",
      branch: "",
      ifsc: "",
      upi: "",
    },
    terms:
      "1. Payment due within the agreed credit period.\n2. Interest @18% p.a. is chargeable on overdue invoices.\n3. Goods once sold will not be taken back.\n4. Subject to jurisdiction of the seller's registered state.",
    notes: "",
    declaration:
      "We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.",
    logo: "",
    signature: "",
    signatoryName: "",
    currencySymbol: "₹",
  };
}
