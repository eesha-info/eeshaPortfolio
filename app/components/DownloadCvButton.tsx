"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CORRECT_PIN = "9494";

type Props = {
  resumeUrl: string;
  className?: string;
};

export default function DownloadCvButton({ resumeUrl, className }: Props) {
  const [open, setOpen] = useState(false);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function openModal() {
    setOpen(true);
    setDigits(["", "", "", ""]);
    setError(false);
    setSuccess(false);
    setShowHint(false);
  }

  function closeModal() {
    setOpen(false);
  }

  useEffect(() => {
    if (open && !success) {
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open, success]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function checkPin(pin: string) {
    if (pin === CORRECT_PIN) {
      setSuccess(true);
      setError(false);
      // Let the success animation play, then redirect this tab to the CV.
      // (A delayed window.open would get blocked as an unrequested popup,
      // so navigate the current tab instead.)
      setTimeout(() => {
        window.location.href = resumeUrl;
      }, 2000);
    } else {
      setError(true);
      setDigits(["", "", "", ""]);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(false);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
    if (value && index === 3) {
      const pin = next.join("");
      if (pin.length === 4) checkPin(pin);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      e.preventDefault();
      setDigits(pasted.split(""));
      checkPin(pasted);
    }
  }

  return (
    <>
      <button type="button" onClick={openModal} className={className}>
        📄 Download CV
      </button>

      {open &&
        createPortal(
          <div
            className="pin-modal-overlay"
            onClick={closeModal}
            role="presentation"
          >
          <div
            className="pin-modal-card animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pinModalTitle"
          >
            <button
              className="pin-modal-close"
              onClick={closeModal}
              aria-label="Close"
              type="button"
            >
              ✕
            </button>

            <div
              className="pin-hint-wrapper"
              onMouseEnter={() => setShowHint(true)}
              onMouseLeave={() => setShowHint(false)}
            >
              <button
                type="button"
                className="pin-hint-btn"
                aria-label="Where do I get the PIN?"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint((v) => !v);
                }}
              >
                i
              </button>
              {showHint && (
                <div className="pin-hint-tooltip animate-scale-in" role="tooltip">
                  Reach out to MD Eesha for the CV PIN to view/download.
                </div>
              )}
            </div>

            {!success ? (
              <>
                <div className="pin-modal-icon">🔒</div>
                <h3 className="pin-modal-title" id="pinModalTitle">
                  Enter MD Eesha&apos;s PIN
                </h3>
                <p className="pin-modal-subtitle">to view this CV</p>

                <div className={`pin-digit-row ${error ? "shake" : ""}`}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputsRef.current[i] = el;
                      }}
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      className={`pin-digit-input ${error ? "pin-digit-error" : ""}`}
                      aria-label={`PIN digit ${i + 1}`}
                    />
                  ))}
                </div>

                <p className={`pin-error-text ${error ? "show" : ""}`}>
                  ❌ Incorrect PIN — try again.
                </p>
              </>
            ) : (
              <>
                <div className="pin-success-icon">
                  <svg viewBox="0 0 52 52" className="pin-checkmark">
                    <circle
                      className="pin-checkmark-circle"
                      cx="26"
                      cy="26"
                      r="23"
                      fill="none"
                    />
                    <path
                      className="pin-checkmark-check"
                      fill="none"
                      d="M14 27l7 7 16-16"
                    />
                  </svg>
                  <span className="pin-sparkle">✨</span>
                  <span className="pin-sparkle">✨</span>
                  <span className="pin-sparkle">✨</span>
                </div>
                <h3
                  className="pin-modal-title animate-fade-in-up"
                  style={{
                    opacity: 0,
                    animationFillMode: "forwards",
                    animationDelay: "0.5s",
                  }}
                >
                  Access Granted 🎉
                </h3>
                <p
                  className="pin-modal-subtitle animate-fade-in-up"
                  style={{
                    opacity: 0,
                    animationFillMode: "forwards",
                    animationDelay: "0.65s",
                  }}
                >
                  Redirecting you to the CV…
                </p>
              </>
            )}
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
