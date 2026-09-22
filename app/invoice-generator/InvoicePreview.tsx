"use client";

import { useEffect, useRef, useState } from "react";
import type { EditableTextField, InvoiceState, Totals } from "./types";
import {
  DEFAULT_LABELS,
  DEFAULT_VISIBILITY,
  amountInWords,
  fmt,
  fmtDate,
  fmtQty,
  paymentModeText,
} from "./utils";

type Props = {
  inv: InvoiceState;
  totals: Totals;
  onLabelChange: (key: string, value: string) => void;
  onTextChange: (field: EditableTextField, value: string) => void;
};

function partyLines(p: InvoiceState["seller"]): string {
  const cityLine = [p.city, p.pincode].filter(Boolean).join(" - ");
  const st = (p.state ?? "").trim();
  return [p.address, cityLine, st ? `State: ${st}` : ""]
    .filter(Boolean)
    .join("\n");
}

/* ─────────────────────────────────────────────
   Click-to-edit text. Renders plain text until
   clicked, so the printed page stays untouched.
   ───────────────────────────────────────────── */
function Editable({
  value,
  onCommit,
  multiline = false,
  title,
}: {
  value: string;
  onCommit: (next: string) => void;
  multiline?: boolean;
  title?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    const shared = {
      ref: ref as never,
      className: "inv-edit-input",
      value: draft,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setDraft(e.target.value),
      onBlur: commit,
    };
    return multiline ? (
      <textarea
        {...shared}
        rows={Math.min(10, Math.max(2, draft.split("\n").length))}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
        }}
      />
    ) : (
      <input
        {...shared}
        style={{ width: `${Math.max(4, draft.length + 1)}ch` }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
      />
    );
  }

  return (
    <span
      className={`inv-edit${value ? "" : " inv-edit-empty"}`}
      tabIndex={0}
      role="button"
      title={title ?? "Click to rename"}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }
      }}
    >
      {value || "click to edit"}
    </span>
  );
}

export default function InvoicePreview({
  inv,
  totals,
  onLabelChange,
  onTextChange,
}: Props) {
  const { isIntraState } = totals;
  const sym = inv.currencySymbol || "₹";
  const ship = inv.sameAsBilling ? inv.buyer : inv.shipTo;
  const status = inv.meta.paymentStatus;

  /** Current wording for a heading, falling back to the built-in default. */
  const L = (key: string): string => {
    const v = inv.labels?.[key];
    return v === undefined || v === null ? DEFAULT_LABELS[key] ?? "" : v;
  };

  /** Is this block printed? */
  const V = (key: string): boolean => {
    const v = inv.show?.[key];
    return v === undefined ? DEFAULT_VISIBILITY[key] !== false : v;
  };

  /** A heading the user can click and rename right on the page. */
  const E = (key: string) => (
    <Editable value={L(key)} onCommit={(next) => onLabelChange(key, next)} />
  );

  const showCopyType = V("copyType") && Boolean(L("copyType"));
  const showReverseChargeLine =
    V("reverseChargeLine") &&
    inv.meta.reverseCharge &&
    Boolean(L("reverseChargePrefix"));

  const showHsn = V("colHsn");
  const showQty = V("colQty");
  const showUom = V("colUom");
  const showRate = V("colRate");
  const showDisc = V("colDisc");

  // Item-table footer spans, which shift as columns are switched off.
  const preQtySpan = 2 + (showHsn ? 1 : 0); // #, description, HSN
  const postQtySpan =
    (showUom ? 1 : 0) + (showRate ? 1 : 0) + (showDisc ? 1 : 0);

  // Payment block: mode first, then the account details when they apply.
  const modeText = paymentModeText(inv.bank);
  const showAccount = V("bankDetails") && inv.bank.includeAccount;
  // A UPI-paid invoice prints the UPI handle even without the account block.
  const showUpiLine =
    V("bankDetails") && Boolean(inv.bank.upi) &&
    (showAccount || inv.bank.mode === "UPI");
  const paymentLines = [
    V("paymentMode") && modeText ? `${L("fieldPaymentMode")}: ${modeText}` : "",
    V("paymentMode") && inv.bank.reference
      ? `${L("fieldPaymentRef")}: ${inv.bank.reference}`
      : "",
    showAccount && inv.bank.accountName ? `A/c Name: ${inv.bank.accountName}` : "",
    showAccount && inv.bank.bankName ? `Bank: ${inv.bank.bankName}` : "",
    showAccount && inv.bank.branch ? `Branch: ${inv.bank.branch}` : "",
    showAccount && inv.bank.accountNumber
      ? `A/c No.: ${inv.bank.accountNumber}`
      : "",
    showAccount && inv.bank.ifsc ? `IFSC: ${inv.bank.ifsc.toUpperCase()}` : "",
    showUpiLine ? `UPI: ${inv.bank.upi}` : "",
  ].filter(Boolean);

  return (
    <div className="invoice-sheet" id="invoice-sheet">
      <div className="inv-frame">
        {/* ── Title ── */}
        <div className="inv-title-bar">
          <h1>{E("documentTitle")}</h1>
          {/* Two independent pieces: the reverse-charge sentence (only when
              reverse charge applies) and the copy type. */}
          {showReverseChargeLine || showCopyType ? (
            <p>
              {showReverseChargeLine ? (
                <>
                  {E("reverseChargePrefix")}
                  {" — "}
                  {E("reverseChargeYes")}
                  {showCopyType ? "  •  " : null}
                </>
              ) : null}
              {showCopyType ? E("copyType") : null}
            </p>
          ) : null}
        </div>

        {/* ── Seller + meta ── */}
        <div className="inv-head">
          <div className="inv-seller">
            {V("logo") && inv.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={inv.logo} alt="Brand logo" className="inv-logo" />
            ) : null}
            <div className="inv-seller-body">
              <p className="inv-seller-name">
                {inv.seller.name || "Your Company Name"}
              </p>
              <p className="inv-lines">{partyLines(inv.seller)}</p>
              {inv.seller.gstin ? (
                <p className="inv-kv">
                  {E("fieldGstin")}: <b>{inv.seller.gstin.toUpperCase()}</b>
                </p>
              ) : null}
              {V("sellerPan") && inv.seller.pan ? (
                <p className="inv-kv">
                  {E("fieldPan")}: <b>{inv.seller.pan.toUpperCase()}</b>
                </p>
              ) : null}
              {V("sellerContact") && (inv.seller.phone || inv.seller.email) ? (
                <p className="inv-kv">
                  {[inv.seller.phone, inv.seller.email]
                    .filter(Boolean)
                    .join("  |  ")}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <table className="inv-meta-table">
              <tbody>
                <tr>
                  <td>{E("metaNumber")}</td>
                  <td>{inv.meta.number || "—"}</td>
                </tr>
                <tr>
                  <td>{E("metaDate")}</td>
                  <td>{fmtDate(inv.meta.date)}</td>
                </tr>
                {V("metaDueDate") && inv.meta.dueDate ? (
                  <tr>
                    <td>{E("metaDueDate")}</td>
                    <td>{fmtDate(inv.meta.dueDate)}</td>
                  </tr>
                ) : null}
                {V("metaPo") && inv.meta.poNumber ? (
                  <tr>
                    <td>{E("metaPo")}</td>
                    <td>
                      {inv.meta.poNumber}
                      {inv.meta.poDate ? ` (${fmtDate(inv.meta.poDate)})` : ""}
                    </td>
                  </tr>
                ) : null}
                {V("metaPlaceOfSupply") ? (
                  <tr>
                    <td>{E("metaPlaceOfSupply")}</td>
                    <td>{(inv.meta.placeOfSupply ?? "").trim() || "—"}</td>
                  </tr>
                ) : null}
                {V("metaSupplyType") ? (
                  <tr>
                    <td>{E("metaSupplyType")}</td>
                    <td>
                      {isIntraState ? L("supplyIntra") : L("supplyInter")}
                    </td>
                  </tr>
                ) : null}
                {V("metaStatus") ? (
                  <tr>
                    <td>{E("metaStatus")}</td>
                    <td>
                      <span
                        className={`inv-watermark ${
                          status === "Paid" ? "inv-paid" : "inv-unpaid"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {V("transportRow") &&
        (inv.meta.transportMode || inv.meta.vehicleNo || inv.meta.ewayBill) ? (
          <div className="inv-eway">
            {inv.meta.transportMode ? (
              <span>
                {E("fieldTransport")}: <b>{inv.meta.transportMode}</b>
              </span>
            ) : null}
            {inv.meta.vehicleNo ? (
              <span>
                {E("fieldVehicle")}: <b>{inv.meta.vehicleNo}</b>
              </span>
            ) : null}
            {inv.meta.ewayBill ? (
              <span>
                {E("fieldEway")}: <b>{inv.meta.ewayBill}</b>
              </span>
            ) : null}
          </div>
        ) : null}

        {/* ── Bill to / Ship to ── */}
        <div className={`inv-parties${V("shipTo") ? "" : " inv-parties-one"}`}>
          <div>
            <p className="inv-party-label">{E("billTo")}</p>
            <p className="inv-party-name">{inv.buyer.name || "—"}</p>
            <p className="inv-lines">{partyLines(inv.buyer)}</p>
            {/* B2C customers have no GSTIN — the whole line can be dropped. */}
            {V("buyerGstin") ? (
              <p className="inv-kv">
                {E("fieldGstin")}:{" "}
                <b>
                  {inv.buyer.gstin
                    ? inv.buyer.gstin.toUpperCase()
                    : L("unregistered")}
                </b>
              </p>
            ) : null}
            {V("buyerContact") && (inv.buyer.phone || inv.buyer.email) ? (
              <p className="inv-kv">
                {[inv.buyer.phone, inv.buyer.email]
                  .filter(Boolean)
                  .join("  |  ")}
              </p>
            ) : null}
          </div>
          {V("shipTo") ? (
            <div>
              <p className="inv-party-label">{E("shipTo")}</p>
              <p className="inv-party-name">
                {ship.name || inv.buyer.name || "—"}
              </p>
              <p className="inv-lines">{partyLines(ship)}</p>
              {ship.gstin ? (
                <p className="inv-kv">
                  {E("fieldGstin")}: <b>{ship.gstin.toUpperCase()}</b>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* ── Items ── */}
        <table className="inv-items">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: "4%" }}>
                {E("colSr")}
              </th>
              <th rowSpan={2}>{E("colDescription")}</th>
              {showHsn ? (
                <th rowSpan={2} style={{ width: "8%" }}>
                  {E("colHsn")}
                </th>
              ) : null}
              {showQty ? (
                <th rowSpan={2} style={{ width: "6%" }}>
                  {E("colQty")}
                </th>
              ) : null}
              {showUom ? (
                <th rowSpan={2} style={{ width: "5%" }}>
                  {E("colUom")}
                </th>
              ) : null}
              {showRate ? (
                <th rowSpan={2} style={{ width: "8%" }}>
                  {E("colRate")}
                </th>
              ) : null}
              {showDisc ? (
                <th rowSpan={2} style={{ width: "7%" }}>
                  {E("colDisc")}
                </th>
              ) : null}
              <th rowSpan={2} style={{ width: "9%" }}>
                {E("colTaxable")}
              </th>
              {isIntraState ? (
                <>
                  <th colSpan={2} style={{ width: "13%" }}>
                    {E("colCgst")}
                  </th>
                  <th colSpan={2} style={{ width: "13%" }}>
                    {E("colSgst")}
                  </th>
                </>
              ) : (
                <th colSpan={2} style={{ width: "16%" }}>
                  {E("colIgst")}
                </th>
              )}
              <th rowSpan={2} style={{ width: "10%" }}>
                {E("colTotal")}
              </th>
            </tr>
            <tr>
              <th>{E("colPercent")}</th>
              <th>{E("colAmount")}</th>
              {isIntraState ? (
                <>
                  <th>{L("colPercent")}</th>
                  <th>{L("colAmount")}</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {totals.itemRows.map((row, i) => (
              <tr key={row.key}>
                <td className="ctr">{i + 1}</td>
                <td className="desc">
                  <b>{row.item.description || "—"}</b>
                </td>
                {showHsn ? <td className="ctr">{row.item.hsn || "—"}</td> : null}
                {showQty ? (
                  <td className="num">{fmtQty(row.item.qty)}</td>
                ) : null}
                {showUom ? <td className="ctr">{row.item.uom}</td> : null}
                {showRate ? <td className="num">{fmt(row.item.rate)}</td> : null}
                {showDisc ? (
                  <td className="num">
                    {row.lineDiscount > 0
                      ? row.item.discountType === "percent"
                        ? `${row.item.discountValue}%`
                        : fmt(row.lineDiscount)
                      : "—"}
                  </td>
                ) : null}
                <td className="num">{fmt(row.taxable)}</td>
                {isIntraState ? (
                  <>
                    <td className="ctr">{row.gstRate / 2}</td>
                    <td className="num">{fmt(row.cgst)}</td>
                    <td className="ctr">{row.gstRate / 2}</td>
                    <td className="num">{fmt(row.sgst)}</td>
                  </>
                ) : (
                  <>
                    <td className="ctr">{row.gstRate}</td>
                    <td className="num">{fmt(row.igst)}</td>
                  </>
                )}
                <td className="num">{fmt(row.total)}</td>
              </tr>
            ))}

            {totals.chargeRows.map((row, i) => (
              <tr key={row.key}>
                <td className="ctr">{totals.itemRows.length + i + 1}</td>
                <td className="desc">
                  <b>{row.label}</b>
                  {L("chargeTag") ? <small>{L("chargeTag")}</small> : null}
                </td>
                {showHsn ? <td className="ctr">—</td> : null}
                {showQty ? <td className="num">—</td> : null}
                {showUom ? <td className="ctr">—</td> : null}
                {showRate ? <td className="num">{fmt(row.taxable)}</td> : null}
                {showDisc ? <td className="num">—</td> : null}
                <td className="num">{fmt(row.taxable)}</td>
                {isIntraState ? (
                  <>
                    <td className="ctr">{row.gstRate / 2}</td>
                    <td className="num">{fmt(row.cgst)}</td>
                    <td className="ctr">{row.gstRate / 2}</td>
                    <td className="num">{fmt(row.sgst)}</td>
                  </>
                ) : (
                  <>
                    <td className="ctr">{row.gstRate}</td>
                    <td className="num">{fmt(row.igst)}</td>
                  </>
                )}
                <td className="num">{fmt(row.total)}</td>
              </tr>
            ))}
          </tbody>
          {V("tableTotalRow") ? (
            <tfoot>
              <tr>
                {showQty ? (
                  <>
                    <td colSpan={preQtySpan} style={{ textAlign: "right" }}>
                      {E("rowTotal")}
                    </td>
                    <td className="num">{fmtQty(totals.totalQty)}</td>
                    {postQtySpan > 0 ? <td colSpan={postQtySpan} /> : null}
                  </>
                ) : (
                  <td
                    colSpan={preQtySpan + postQtySpan}
                    style={{ textAlign: "right" }}
                  >
                    {E("rowTotal")}
                  </td>
                )}
                <td className="num">{fmt(totals.totalTaxable)}</td>
                {isIntraState ? (
                  <>
                    <td />
                    <td className="num">{fmt(totals.totalCgst)}</td>
                    <td />
                    <td className="num">{fmt(totals.totalSgst)}</td>
                  </>
                ) : (
                  <>
                    <td />
                    <td className="num">{fmt(totals.totalIgst)}</td>
                  </>
                )}
                <td className="num">{fmt(totals.beforeRound)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>

        {/* ── Words / bank  +  totals ── */}
        <div className="inv-lower">
          <div>
            {V("amountInWords") ? (
              <div className="inv-block">
                <p className="inv-block-label">{E("amountInWords")}</p>
                <p className="inv-words">{amountInWords(totals.grandTotal)}</p>
              </div>
            ) : null}

            {paymentLines.length > 0 ? (
              <div className="inv-block">
                <p className="inv-block-label">{E("bankDetails")}</p>
                <p className="inv-small">{paymentLines.join("\n")}</p>
              </div>
            ) : null}

            {V("notes") && inv.notes ? (
              <div className="inv-block">
                <p className="inv-block-label">{E("notes")}</p>
                <p className="inv-small">
                  <Editable
                    value={inv.notes}
                    multiline
                    onCommit={(v) => onTextChange("notes", v)}
                  />
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <table className="inv-totals">
              <tbody>
                {V("totalsBreakdown") ? (
                  <>
                    <tr>
                      <td>{E("totalGross")}</td>
                      <td>
                        {sym} {fmt(totals.grossTotal)}
                      </td>
                    </tr>
                    {totals.lineDiscountTotal > 0 && (
                      <tr>
                        <td>{E("totalItemDiscount")}</td>
                        <td>- {fmt(totals.lineDiscountTotal)}</td>
                      </tr>
                    )}
                    {totals.globalDiscountAmount > 0 && (
                      <tr>
                        <td>{E("totalInvoiceDiscount")}</td>
                        <td>- {fmt(totals.globalDiscountAmount)}</td>
                      </tr>
                    )}
                    {totals.chargesTotal > 0 && (
                      <tr>
                        <td>{E("totalCharges")}</td>
                        <td>{fmt(totals.chargesTotal)}</td>
                      </tr>
                    )}
                  </>
                ) : null}
                <tr className="sep">
                  <td>{E("totalTaxable")}</td>
                  <td>{fmt(totals.totalTaxable)}</td>
                </tr>
                {isIntraState ? (
                  <>
                    <tr>
                      <td>{E("totalCgst")}</td>
                      <td>{fmt(totals.totalCgst)}</td>
                    </tr>
                    <tr>
                      <td>{E("totalSgst")}</td>
                      <td>{fmt(totals.totalSgst)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td>{E("totalIgst")}</td>
                    <td>{fmt(totals.totalIgst)}</td>
                  </tr>
                )}
                <tr className="sep">
                  <td>{E("totalTax")}</td>
                  <td>{fmt(totals.totalTax)}</td>
                </tr>
                {inv.applyRoundOff && totals.roundOff !== 0 && (
                  <tr>
                    <td>{E("roundOff")}</td>
                    <td>
                      {totals.roundOff > 0 ? "+" : "-"}{" "}
                      {fmt(Math.abs(totals.roundOff))}
                    </td>
                  </tr>
                )}
                <tr className="grand">
                  <td>{E("grandTotal")}</td>
                  <td>
                    {sym} {fmt(totals.grandTotal)}
                  </td>
                </tr>
                {inv.meta.reverseCharge && (
                  <tr>
                    <td
                      colSpan={2}
                      style={{ fontSize: "7.8pt", paddingTop: "4pt" }}
                    >
                      <Editable
                        value={L("reverseChargeNote")}
                        multiline
                        onCommit={(v) => onLabelChange("reverseChargeNote", v)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── HSN-wise tax summary ── */}
        {V("taxSummary") && totals.hsnSummary.length > 0 ? (
          <div className="inv-summary">
            <p className="inv-block-label">{E("taxSummary")}</p>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "14%" }}>{L("colHsn")}</th>
                  <th style={{ width: "18%" }}>{L("totalTaxable")}</th>
                  {isIntraState ? (
                    <>
                      <th>{L("colCgst")} %</th>
                      <th>
                        {L("colCgst")} {L("colAmount")}
                      </th>
                      <th>{L("colSgst")} %</th>
                      <th>
                        {L("colSgst")} {L("colAmount")}
                      </th>
                    </>
                  ) : (
                    <>
                      <th>{L("colIgst")} %</th>
                      <th>
                        {L("colIgst")} {L("colAmount")}
                      </th>
                    </>
                  )}
                  <th style={{ width: "16%" }}>{L("totalTax")}</th>
                </tr>
              </thead>
              <tbody>
                {totals.hsnSummary.map((r) => (
                  <tr key={r.key}>
                    <td className="ctr">{r.label}</td>
                    <td className="num">{fmt(r.taxable)}</td>
                    {isIntraState ? (
                      <>
                        <td className="ctr">{r.gstRate / 2}%</td>
                        <td className="num">{fmt(r.cgst)}</td>
                        <td className="ctr">{r.gstRate / 2}%</td>
                        <td className="num">{fmt(r.sgst)}</td>
                      </>
                    ) : (
                      <>
                        <td className="ctr">{r.gstRate}%</td>
                        <td className="num">{fmt(r.igst)}</td>
                      </>
                    )}
                    <td className="num">{fmt(r.cgst + r.sgst + r.igst)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="ctr">{L("rowTotal")}</td>
                  <td className="num">{fmt(totals.totalTaxable)}</td>
                  {isIntraState ? (
                    <>
                      <td />
                      <td className="num">{fmt(totals.totalCgst)}</td>
                      <td />
                      <td className="num">{fmt(totals.totalSgst)}</td>
                    </>
                  ) : (
                    <>
                      <td />
                      <td className="num">{fmt(totals.totalIgst)}</td>
                    </>
                  )}
                  <td className="num">{fmt(totals.totalTax)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}

        {/* ── IRN / QR ── */}
        {V("eInvoice") &&
        (inv.meta.irn || inv.meta.ackNo || inv.meta.qrData) ? (
          <div className="inv-irn">
            <div>
              {inv.meta.irn ? (
                <div>
                  {E("fieldIrn")}: <b>{inv.meta.irn}</b>
                </div>
              ) : null}
              {inv.meta.ackNo ? (
                <div>
                  {E("fieldAck")}: <b>{inv.meta.ackNo}</b>
                  {inv.meta.ackDate
                    ? `  |  ${L("fieldAckDate")}: ${fmtDate(inv.meta.ackDate)}`
                    : ""}
                </div>
              ) : null}
            </div>
            <div className="inv-qr">
              {inv.meta.qrData?.startsWith("data:image") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={inv.meta.qrData} alt="e-Invoice QR code" />
              ) : (
                <span>{L("qrPlaceholder")}</span>
              )}
            </div>
          </div>
        ) : null}

        {/* ── Terms + signature ── */}
        {V("terms") || V("declaration") || V("signature") ? (
          <div
            className={`inv-sign${V("signature") ? "" : " inv-sign-one"}`}
          >
            <div>
              {V("terms") && inv.terms ? (
                <div
                  className="inv-block"
                  style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}
                >
                  <p className="inv-block-label">{E("terms")}</p>
                  <p className="inv-small">
                    <Editable
                      value={inv.terms}
                      multiline
                      onCommit={(v) => onTextChange("terms", v)}
                    />
                  </p>
                </div>
              ) : null}
              {V("declaration") && inv.declaration ? (
                <div className="inv-block">
                  <p className="inv-block-label">{E("declaration")}</p>
                  <p className="inv-small">
                    <Editable
                      value={inv.declaration}
                      multiline
                      onCommit={(v) => onTextChange("declaration", v)}
                    />
                  </p>
                </div>
              ) : null}
            </div>
            {V("signature") ? (
              <div>
                <p className="inv-block-label" style={{ textAlign: "right" }}>
                  {E("signatoryPrefix")}{" "}
                  {inv.seller.name || "Your Company Name"}
                </p>
                <div>
                  {inv.signature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inv.signature}
                      alt="Authorised signature"
                      className="inv-sign-img"
                    />
                  ) : null}
                  <div className="inv-sign-line">
                    <Editable
                      value={inv.signatoryName}
                      onCommit={(v) => onTextChange("signatoryName", v)}
                    />
                  </div>
                  <div className="inv-sign-sub">{E("signatory")}</div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {V("footerNote") && L("footerNote") ? (
          <div className="inv-foot">{E("footerNote")}</div>
        ) : null}
      </div>
    </div>
  );
}
