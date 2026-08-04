import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MUSIC_VOLUME = 70;
const DEFAULT_SFX_VOLUME = 70;

/**
 * SettingsPanel
 *
 * Renders over the existing title-screen background.
 * Contains Music Volume, SFX Volume sliders (0–100) and a Back option.
 * No audio playback is wired – state is kept for future use.
 *
 * Props:
 *   onBack        – called when the player closes Settings (Back or Escape)
 *   musicVolume   – current music volume (controlled from App)
 *   sfxVolume     – current SFX volume (controlled from App)
 *   onMusicChange – (value: number) => void
 *   onSfxChange   – (value: number) => void
 */
function SettingsPanel({ onBack, musicVolume, sfxVolume, onMusicChange, onSfxChange }) {
  // "back" is the third focusable row (index 2)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rowRefs = useRef([]);

  // Focus the currently selected row on mount and when selection changes via keyboard
  const focusRow = useCallback((index) => {
    rowRefs.current[index]?.focus();
  }, []);

  // Auto-focus first row on open
  useEffect(() => {
    focusRow(0);
  }, [focusRow]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onBack();
          break;

        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const next = (prev + 1) % 3;
            focusRow(next);
            return next;
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const next = (prev - 1 + 3) % 3;
            focusRow(next);
            return next;
          });
          break;

        case "Enter":
        case " ":
          // Activate Back if it is selected
          if (selectedIndex === 2) {
            event.preventDefault();
            onBack();
          }
          // Sliders (index 0 and 1) handle their own Enter/Space natively
          break;

        case "ArrowLeft":
          if (selectedIndex === 0) {
            event.preventDefault();
            onMusicChange(Math.max(0, musicVolume - 5));
          } else if (selectedIndex === 1) {
            event.preventDefault();
            onSfxChange(Math.max(0, sfxVolume - 5));
          }
          break;

        case "ArrowRight":
          if (selectedIndex === 0) {
            event.preventDefault();
            onMusicChange(Math.min(100, musicVolume + 5));
          } else if (selectedIndex === 1) {
            event.preventDefault();
            onSfxChange(Math.min(100, sfxVolume + 5));
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusRow, musicVolume, onBack, onMusicChange, onSfxChange, selectedIndex, sfxVolume]);

  const selectRow = (index) => {
    setSelectedIndex(index);
  };

  return (
    <div className="settings-backdrop">
      <section
        className="settings-panel"
        aria-modal="true"
        aria-labelledby="settings-panel-title"
        role="dialog"
      >
        <h2 id="settings-panel-title" className="settings-panel__title">
          ⚙ Settings
        </h2>

        <div className="settings-panel__rows">
          {/* ── Music Volume ── */}
          <div
            className={`settings-panel__row${selectedIndex === 0 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(0)}
          >
            <label htmlFor="settings-music-volume" className="settings-panel__label">
              <span className="settings-panel__indicator" aria-hidden="true">►</span>
              Music Volume
            </label>
            <div className="settings-panel__slider-group">
              <input
                ref={(el) => { rowRefs.current[0] = el; }}
                id="settings-music-volume"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                className="settings-panel__slider"
                aria-valuenow={musicVolume}
                aria-valuemin={0}
                aria-valuemax={100}
                onFocus={() => selectRow(0)}
                onChange={(event) => onMusicChange(Number(event.target.value))}
              />
              <span className="settings-panel__value" aria-live="polite">
                {musicVolume}
              </span>
            </div>
          </div>

          {/* ── SFX Volume ── */}
          <div
            className={`settings-panel__row${selectedIndex === 1 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(1)}
          >
            <label htmlFor="settings-sfx-volume" className="settings-panel__label">
              <span className="settings-panel__indicator" aria-hidden="true">►</span>
              SFX Volume
            </label>
            <div className="settings-panel__slider-group">
              <input
                ref={(el) => { rowRefs.current[1] = el; }}
                id="settings-sfx-volume"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                className="settings-panel__slider"
                aria-valuenow={sfxVolume}
                aria-valuemin={0}
                aria-valuemax={100}
                onFocus={() => selectRow(1)}
                onChange={(event) => onSfxChange(Number(event.target.value))}
              />
              <span className="settings-panel__value" aria-live="polite">
                {sfxVolume}
              </span>
            </div>
          </div>

          {/* ── Back ── */}
          <div
            className={`settings-panel__row settings-panel__row--back${selectedIndex === 2 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(2)}
          >
            <button
              ref={(el) => { rowRefs.current[2] = el; }}
              type="button"
              className="settings-panel__back-btn"
              onFocus={() => selectRow(2)}
              onClick={onBack}
            >
              <span className="settings-panel__indicator" aria-hidden="true">►</span>
              Back
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export { DEFAULT_MUSIC_VOLUME, DEFAULT_SFX_VOLUME };
export default SettingsPanel;
