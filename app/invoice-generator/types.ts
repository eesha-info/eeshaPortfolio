export type DiscountType = "percent" | "amount";

export type LineItem = {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  uom: string;
  rate: number;
  discountValue: number;
  discountType: DiscountType;
  gstRate: number;
};

export type ExtraCharge = {
  id: string;
  label: string;
  amount: number;
  gstRate: number;
};

export type Party = {
  name: string;
  address: string;
  city: string;
  pincode: string;
  /** Free text — "Karnataka", "29 - Karnataka", "Dubai, UAE", anything.
      The two-digit GST code is resolved from it when possible. */
  state: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
};

export type InvoiceMeta = {
  number: string;
  date: string;
  dueDate: string;
  poNumber: string;
  poDate: string;
  paymentStatus: string;
  reverseCharge: boolean;
  placeOfSupply: string;
  irn: string;
  ackNo: string;
  ackDate: string;
  qrData: string;
  transportMode: string;
  vehicleNo: string;
  ewayBill: string;
};

export type BankDetails = {
  /** One of PAYMENT_MODES, or "Other" with customMode filled in. */
  mode: string;
  customMode: string;
  /** UTR / cheque no. / transaction id. */
  reference: string;
  /** Print the full account block alongside the mode. */
  includeAccount: boolean;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifsc: string;
  upi: string;
};

/** Editable headings / column titles shown on the printed invoice. */
export type Labels = Record<string, string>;

/** Which blocks, rows and columns are printed. */
export type Visibility = Record<string, boolean>;

export type EditableTextField =
  | "terms"
  | "declaration"
  | "notes"
  | "signatoryName";

/** How CGST+SGST vs IGST is decided. */
export type TaxMode = "auto" | "intra" | "inter";

export type InvoiceState = {
  labels: Labels;
  show: Visibility;
  taxMode: TaxMode;
  seller: Party;
  buyer: Party;
  shipTo: Party;
  sameAsBilling: boolean;
  meta: InvoiceMeta;
  items: LineItem[];
  charges: ExtraCharge[];
  globalDiscountType: DiscountType;
  globalDiscountValue: number;
  applyRoundOff: boolean;
  bank: BankDetails;
  terms: string;
  notes: string;
  declaration: string;
  logo: string;
  signature: string;
  signatoryName: string;
  currencySymbol: string;
};

export type TaxRow = {
  key: string;
  label: string;
  hsn: string;
  taxable: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

export type Totals = {
  rows: TaxRow[];
  itemRows: (TaxRow & { item: LineItem; gross: number; lineDiscount: number })[];
  chargeRows: (TaxRow & { charge: ExtraCharge })[];
  grossTotal: number;
  lineDiscountTotal: number;
  globalDiscountAmount: number;
  totalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  chargesTotal: number;
  beforeRound: number;
  roundOff: number;
  grandTotal: number;
  totalQty: number;
  isIntraState: boolean;
  /** Plain-language reason for the CGST+SGST vs IGST decision. */
  taxNote: string;
  /** False when the split was assumed rather than derived from both states. */
  taxCertain: boolean;
  hsnSummary: TaxRow[];
  rateSummary: TaxRow[];
};
