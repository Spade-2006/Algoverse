import { useEffect, useRef } from "react";
import { SaveManager } from "../services/saveManager";

/**
 * AncientCodex
 *
 * Renders a full-screen parchment book overlay.
 * Reused as the single canonical Ancient Codex component across all entry points
 * (Main Menu and Pause Menu).
 *
 * Automatically resolves effective progression state by merging runtime in-memory
 * state with persisted save data from SaveManager.
 *
 * Props:
 *   onBack           – called when the player closes the Codex
 *   progressionState – optional runtime progression flags from an active game session
 */
function AncientCodex({ onBack, progressionState = {} }) {
  const backRef = useRef(null);

  // Unify progression resolution: read saved game data from SaveManager if available
  const savedProgression = SaveManager.loadGame()?.progression || {};
  const binaryCodeTrialCompleted = !!(progressionState.binaryCodeTrialCompleted || savedProgression.binaryCodeTrialCompleted);
  const plainsDiscovered = !!(progressionState.plainsDiscovered || savedProgression.plainsDiscovered);
  const twoPointersUnlocked = !!(
    progressionState.twoPointersUnlocked ||
    progressionState.quest1Solved ||
    savedProgression.twoPointersUnlocked ||
    savedProgression.quest1Solved
  );

  // Focus the Back button on mount so keyboard users can act immediately
  useEffect(() => {
    backRef.current?.focus();
  }, []);

  // Escape closes the Codex
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
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

            {/* ── Phase 0 / Dungeon Trial Knowledge ────────── */}
            {binaryCodeTrialCompleted && (
              <div className="codex-trial-section">
                <p className="codex-trial-section__phase">Phase 0 — The Dungeon</p>

                <div className="codex-trial-entry">
                  <p className="codex-trial-entry__name">Binary Search</p>
                  <p className="codex-trial-entry__status">⚔ Trial Conquered</p>

                  <p className="codex-trial-entry__label">Core Idea</p>
                  <p className="codex-trial-entry__body">
                    Repeatedly reduces the search space by comparing the target
                    with the middle element of a sorted collection.
                  </p>

                  <p className="codex-trial-entry__label">Requirement</p>
                  <p className="codex-trial-entry__body">The collection must be sorted.</p>

                  <p className="codex-trial-entry__label">The Method</p>
                  <ol className="codex-trial-entry__steps">
                    <li>Check the middle element.</li>
                    <li>If it is the target, return its position.</li>
                    <li>If the target is smaller, search the left half.</li>
                    <li>If the target is larger, search the right half.</li>
                    <li>Repeat until found or the space is empty.</li>
                  </ol>

                  <div className="codex-trial-entry__complexity-row">
                    <span className="codex-trial-entry__complexity-item">
                      <span className="codex-trial-entry__complexity-label">Time</span>
                      <code className="codex-trial-entry__complexity-val">O(log n)</code>
                    </span>
                    <span className="codex-trial-entry__complexity-item">
                      <span className="codex-trial-entry__complexity-label">Space</span>
                      <code className="codex-trial-entry__complexity-val">O(1)</code>
                    </span>
                  </div>

                  <p className="codex-trial-entry__note">
                    Code Trial completed.
                  </p>
                </div>
              </div>
            )}

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

              {/* Plains of Origins — unlocked when discovered */}
              <li
                className={`codex-region${!plainsDiscovered ? " codex-region--locked" : ""}`}
                aria-label={`Plains of Origins${!plainsDiscovered ? ", sealed" : ""}`}
              >
                <div className="codex-region__header">
                  <span className="codex-region__numeral" aria-hidden="true" />
                  <span className="codex-region__name">Plains of Origins</span>
                  {!plainsDiscovered && (
                    <span className="codex-region__lock" aria-hidden="true" title="Sealed">
                      🔒
                    </span>
                  )}
                </div>
                <p className="codex-region__lore">
                  {plainsDiscovered
                    ? "An ancient expanse beyond the Grandmaster's Gate. What waits across its forgotten paths remains unknown."
                    : "Knowledge yet undiscovered."}
                </p>

                {/* Two Pointers Entry — unlocked upon Quest 1 Code Trial completion */}
                {twoPointersUnlocked && (
                  <div className="codex-trial-entry" style={{ marginTop: "12px" }}>
                    <p className="codex-trial-entry__name">Two Pointers</p>
                    <p className="codex-trial-entry__status">⚔ Trial Conquered</p>

                    <p className="codex-trial-entry__label">Core Idea</p>
                    <p className="codex-trial-entry__body">
                      Uses two pointers (`left` and `right`) traversing a sorted collection from opposite ends to find a target pair without checking every pair.
                    </p>

                    <p className="codex-trial-entry__label">When Useful</p>
                    <p className="codex-trial-entry__body">
                      Searching pairs or sub-ranges in sorted arrays with linear time O(n).
                    </p>

                    <p className="codex-trial-entry__label">The Method</p>
                    <ol className="codex-trial-entry__steps">
                      <li>Place `left` at start (0) and `right` at end (N-1).</li>
                      <li>Compute current sum = `arr[left] + arr[right]`.</li>
                      <li>If sum equals target, pair found.</li>
                      <li>If sum &lt; target, move `left` forward.</li>
                      <li>If sum &gt; target, move `right` backward.</li>
                    </ol>

                    <div className="codex-trial-entry__complexity-row">
                      <span className="codex-trial-entry__complexity-item">
                        <span className="codex-trial-entry__complexity-label">Time</span>
                        <code className="codex-trial-entry__complexity-val">O(n)</code>
                      </span>
                      <span className="codex-trial-entry__complexity-item">
                        <span className="codex-trial-entry__complexity-label">Space</span>
                        <code className="codex-trial-entry__complexity-val">O(1)</code>
                      </span>
                    </div>

                    <p className="codex-trial-entry__note">
                      Code Trial completed in Plains of Origins.
                    </p>
                  </div>
                )}

                <div className="codex-region__rule" aria-hidden="true" />
              </li>

              {/* Future regions — always locked */}
              <li
                className="codex-region codex-region--locked"
                aria-label="Temple of Echoes, sealed"
              >
                <div className="codex-region__header">
                  <span className="codex-region__numeral" aria-hidden="true" />
                  <span className="codex-region__name">Temple of Echoes</span>
                  <span className="codex-region__lock" aria-hidden="true" title="Sealed">🔒</span>
                </div>
                <p className="codex-region__lore">Knowledge yet undiscovered.</p>
                <div className="codex-region__rule" aria-hidden="true" />
              </li>

              <li
                className="codex-region codex-region--locked"
                aria-label="Verdant Arbor, sealed"
              >
                <div className="codex-region__header">
                  <span className="codex-region__numeral" aria-hidden="true" />
                  <span className="codex-region__name">Verdant Arbor</span>
                  <span className="codex-region__lock" aria-hidden="true" title="Sealed">🔒</span>
                </div>
                <p className="codex-region__lore">Knowledge yet undiscovered.</p>
                <div className="codex-region__rule" aria-hidden="true" />
              </li>

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
