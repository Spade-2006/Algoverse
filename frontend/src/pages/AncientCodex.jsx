import { useEffect, useRef } from "react";

/**
 * Region data — fantasy names only.
 * DSA concepts are intentionally withheld from the UI.
 */
const REGIONS = [
  {
    id: "plains-of-origins",
    name: "Plains of Origins",
    lore: "Knowledge yet undiscovered.",
    locked: true,
  },
  {
    id: "temple-of-echoes",
    name: "Temple of Echoes",
    lore: "Knowledge yet undiscovered.",
    locked: true,
  },
  {
    id: "verdant-arbor",
    name: "Verdant Arbor",
    lore: "Knowledge yet undiscovered.",
    locked: true,
  },
];

/**
 * AncientCodex
 *
 * Renders a full-screen parchment book overlay on top of the title-screen
 * background. Lists discovered (and locked) regions as codex chapters.
 * Region entries are display-only — no interaction yet.
 *
 * Props:
 *   onBack – called when the player closes the Codex (Back button or Escape)
 */
function AncientCodex({ onBack }) {
  const backRef = useRef(null);

  // Focus the Back button on mount so keyboard users can act immediately
  useEffect(() => {
    backRef.current?.focus();
  }, []);

  // Escape closes the Codex
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  return (
    <div className="codex-backdrop">
      {/* Decorative ambient dust motes */}
      <div className="codex-dust" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div
        className="codex-book"
        role="dialog"
        aria-modal="true"
        aria-labelledby="codex-title"
      >
        {/* ── Left page ─────────────────────────────────────── */}
        <div className="codex-book__page codex-book__page--left">
          {/* Aged corner ornaments */}
          <span className="codex-book__corner codex-book__corner--tl" aria-hidden="true" />
          <span className="codex-book__corner codex-book__corner--bl" aria-hidden="true" />

          <div className="codex-book__left-content">
            <p className="codex-book__illuminated-letter" aria-hidden="true">𝔸</p>
            <p className="codex-book__flavour">
              Herein lie the chronicles of the known world — regions where the
              ancient arts of order and pattern were first etched into stone and
              sky. Only the worthy may walk these lands.
            </p>
            <div className="codex-book__seal" aria-hidden="true">
              <span className="codex-book__seal-ring">✦</span>
            </div>
            <p className="codex-book__page-number" aria-hidden="true">I</p>
          </div>
        </div>

        {/* ── Spine ─────────────────────────────────────────── */}
        <div className="codex-book__spine" aria-hidden="true">
          <span />
        </div>

        {/* ── Right page ────────────────────────────────────── */}
        <div className="codex-book__page codex-book__page--right">
          <span className="codex-book__corner codex-book__corner--tr" aria-hidden="true" />
          <span className="codex-book__corner codex-book__corner--br" aria-hidden="true" />

          <div className="codex-book__right-content">
            <h2 id="codex-title" className="codex-book__title">
              Ancient Codex
            </h2>
            <div className="codex-book__divider" aria-hidden="true">
              <span />
              <span>✦</span>
              <span />
            </div>

            {/* Region entries */}
            <ol className="codex-regions" aria-label="Known regions">
              {REGIONS.map((region) => (
                <li
                  key={region.id}
                  className={`codex-region${region.locked ? " codex-region--locked" : ""}`}
                  aria-label={`${region.name}${region.locked ? ", sealed" : ""}`}
                >
                  <div className="codex-region__header">
                    <span className="codex-region__numeral" aria-hidden="true">
                      {/* Roman numerals via CSS counter */}
                    </span>
                    <span className="codex-region__name">{region.name}</span>
                    {region.locked && (
                      <span className="codex-region__lock" aria-hidden="true" title="Sealed">
                        🔒
                      </span>
                    )}
                  </div>
                  <p className="codex-region__lore">{region.lore}</p>
                  <div className="codex-region__rule" aria-hidden="true" />
                </li>
              ))}
            </ol>

            {/* Back */}
            <div className="codex-book__back-row">
              <button
                ref={backRef}
                type="button"
                className="codex-book__back-btn"
                onClick={onBack}
              >
                <span aria-hidden="true">◄</span>
                Back
              </button>
            </div>

            <p className="codex-book__page-number" aria-hidden="true">II</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AncientCodex;
