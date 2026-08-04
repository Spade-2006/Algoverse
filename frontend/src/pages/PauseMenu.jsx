import { useCallback, useEffect, useRef, useState } from "react";

const MENU_ITEMS = [
  { id: "resume",       label: "RESUME" },
  { id: "save",         label: "SAVE GAME" },
  { id: "codex",        label: "ANCIENT CODEX" },
  { id: "settings",     label: "SETTINGS" },
  { id: "save-and-quit",label: "SAVE & QUIT" },
];

/**
 * PauseMenu
 *
 * In-game pause & options overlay.
 * Appears when ESC is pressed during gameplay.
 *
 * Props:
 *   onResume     - () => void
 *   onSave       - () => void
 *   onCodex      - () => void
 *   onSettings   - () => void
 *   onSaveAndQuit- () => void
 *   saveMessage  - string|null (notification toast message e.g. "PROGRESS SAVED")
 */
export default function PauseMenu({
  onResume,
  onSave,
  onCodex,
  onSettings,
  onSaveAndQuit,
  saveMessage,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef([]);

  const triggerAction = useCallback((itemId) => {
    switch (itemId) {
      case "resume":
        onResume();
        break;
      case "save":
        onSave();
        break;
      case "codex":
        onCodex();
        break;
      case "settings":
        onSettings();
        break;
      case "save-and-quit":
        onSaveAndQuit();
        break;
      default:
        break;
    }
  }, [onCodex, onResume, onSave, onSaveAndQuit, onSettings]);

  // Auto-focus selected button
  useEffect(() => {
    buttonRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onResume();
          break;

        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % MENU_ITEMS.length);
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          triggerAction(MENU_ITEMS[selectedIndex].id);
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, onResume, triggerAction]);

  return (
    <div className="pause-menu-backdrop" role="dialog" aria-modal="true" aria-label="Pause Menu">
      <div className="pause-menu-modal">
        <header className="pause-menu-header">
          <span className="pause-menu-header__decor">✦</span>
          <h2 className="pause-menu-header__title">ALGOVERSE</h2>
          <span className="pause-menu-header__decor">✦</span>
        </header>

        <p className="pause-menu-subtitle">GAME PAUSED</p>

        {/* Save notification toast */}
        {saveMessage && (
          <div className="pause-menu-toast" aria-live="polite">
            ✓ {saveMessage}
          </div>
        )}

        <nav className="pause-menu-nav" aria-label="Pause menu navigation">
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => { buttonRefs.current[index] = el; }}
              type="button"
              className={`pause-menu-btn${selectedIndex === index ? " pause-menu-btn--selected" : ""}`}
              onMouseEnter={() => setSelectedIndex(index)}
              onFocus={() => setSelectedIndex(index)}
              onClick={() => triggerAction(item.id)}
            >
              <span className="pause-menu-btn__indicator" aria-hidden="true">►</span>
              <span className="pause-menu-btn__label">{item.label}</span>
            </button>
          ))}
        </nav>

        <footer className="pause-menu-footer">
          Press <code>[ESC]</code> to resume
        </footer>
      </div>
    </div>
  );
}
