import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MASTER_VOLUME = 70;
const DEFAULT_MUSIC_VOLUME = 70;
const DEFAULT_SFX_VOLUME = 70;

/**
 * SettingsPanel
 *
 * Renders over the Title Screen or inside the Pause Menu.
 * Contains Master Volume, Music Volume, SFX Volume sliders (0–100) and a Back option.
 *
 * Props:
 *   onBack          – called when the player closes Settings (Back or Escape)
 *   masterVolume    – current master volume
 *   musicVolume     – current music volume
 *   sfxVolume       – current SFX volume
 *   onMasterChange  – (value: number) => void
 *   onMusicChange   – (value: number) => void
 *   onSfxChange     – (value: number) => void
 */
function SettingsPanel({
  onBack,
  masterVolume = DEFAULT_MASTER_VOLUME,
  musicVolume = DEFAULT_MUSIC_VOLUME,
  sfxVolume = DEFAULT_SFX_VOLUME,
  onMasterChange,
  onMusicChange,
  onSfxChange,
}) {
  // Row 0: Master, Row 1: Music, Row 2: SFX, Row 3: Back
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rowRefs = useRef([]);

  const focusRow = useCallback((index) => {
    rowRefs.current[index]?.focus();
  }, []);

  useEffect(() => {
    focusRow(0);
  }, [focusRow]);

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
            const next = (prev + 1) % 4;
            focusRow(next);
            return next;
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const next = (prev - 1 + 4) % 4;
            focusRow(next);
            return next;
          });
          break;

        case "Enter":
        case " ":
          if (selectedIndex === 3) {
            event.preventDefault();
            onBack();
          }
          break;

        case "ArrowLeft":
          event.preventDefault();
          if (selectedIndex === 0 && onMasterChange) {
            onMasterChange(Math.max(0, masterVolume - 5));
          } else if (selectedIndex === 1 && onMusicChange) {
            onMusicChange(Math.max(0, musicVolume - 5));
          } else if (selectedIndex === 2 && onSfxChange) {
            onSfxChange(Math.max(0, sfxVolume - 5));
          }
          break;

        case "ArrowRight":
          event.preventDefault();
          if (selectedIndex === 0 && onMasterChange) {
            onMasterChange(Math.min(100, masterVolume + 5));
          } else if (selectedIndex === 1 && onMusicChange) {
            onMusicChange(Math.min(100, musicVolume + 5));
          } else if (selectedIndex === 2 && onSfxChange) {
            onSfxChange(Math.min(100, sfxVolume + 5));
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusRow, masterVolume, musicVolume, onBack, onMasterChange, onMusicChange, onSfxChange, selectedIndex, sfxVolume]);

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
          {/* ── Master Volume ── */}
          <div
            className={`settings-panel__row${selectedIndex === 0 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(0)}
          >
            <label htmlFor="settings-master-volume" className="settings-panel__label">
              <span className="settings-panel__indicator" aria-hidden="true">►</span>
              Master Volume
            </label>
            <div className="settings-panel__slider-group">
              <input
                ref={(el) => { rowRefs.current[0] = el; }}
                id="settings-master-volume"
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                className="settings-panel__slider"
                aria-valuenow={masterVolume}
                aria-valuemin={0}
                aria-valuemax={100}
                onFocus={() => selectRow(0)}
                onChange={(event) => onMasterChange && onMasterChange(Number(event.target.value))}
              />
              <span className="settings-panel__value" aria-live="polite">
                {masterVolume}
              </span>
            </div>
          </div>

          {/* ── Music Volume ── */}
          <div
            className={`settings-panel__row${selectedIndex === 1 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(1)}
          >
            <label htmlFor="settings-music-volume" className="settings-panel__label">
              <span className="settings-panel__indicator" aria-hidden="true">►</span>
              Music Volume
            </label>
            <div className="settings-panel__slider-group">
              <input
                ref={(el) => { rowRefs.current[1] = el; }}
                id="settings-music-volume"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                className="settings-panel__slider"
                aria-valuenow={musicVolume}
                aria-valuemin={0}
                aria-valuemax={100}
                onFocus={() => selectRow(1)}
                onChange={(event) => onMusicChange && onMusicChange(Number(event.target.value))}
              />
              <span className="settings-panel__value" aria-live="polite">
                {musicVolume}
              </span>
            </div>
          </div>

          {/* ── SFX Volume ── */}
          <div
            className={`settings-panel__row${selectedIndex === 2 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(2)}
          >
            <label htmlFor="settings-sfx-volume" className="settings-panel__label">
              <span className="settings-panel__indicator" aria-hidden="true">►</span>
              SFX Volume
            </label>
            <div className="settings-panel__slider-group">
              <input
                ref={(el) => { rowRefs.current[2] = el; }}
                id="settings-sfx-volume"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                className="settings-panel__slider"
                aria-valuenow={sfxVolume}
                aria-valuemin={0}
                aria-valuemax={100}
                onFocus={() => selectRow(2)}
                onChange={(event) => onSfxChange && onSfxChange(Number(event.target.value))}
              />
              <span className="settings-panel__value" aria-live="polite">
                {sfxVolume}
              </span>
            </div>
          </div>

          {/* ── Back ── */}
          <div
            className={`settings-panel__row settings-panel__row--back${selectedIndex === 3 ? " settings-panel__row--selected" : ""}`}
            onMouseEnter={() => selectRow(3)}
          >
            <button
              ref={(el) => { rowRefs.current[3] = el; }}
              type="button"
              className="settings-panel__back-btn"
              onFocus={() => selectRow(3)}
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

export { DEFAULT_MASTER_VOLUME, DEFAULT_MUSIC_VOLUME, DEFAULT_SFX_VOLUME };
export default SettingsPanel;
