import { useEffect, useRef } from "react";

/**
 * NewGameConfirmation Modal
 *
 * Renders over the Title Screen when the player selects "New Journey"
 * but a saved game already exists in localStorage.
 *
 * Props:
 *   onConfirm - Function called when user clicks "BEGIN NEW JOURNEY"
 *   onCancel  - Function called when user clicks "CANCEL" or presses ESC
 */
export default function NewGameConfirmation({ onConfirm, onCancel }) {
  const cancelBtnRef = useRef(null);

  // Focus Cancel button by default to prevent accidental overwrite
  useEffect(() => {
    cancelBtnRef.current?.focus();
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="new-game-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="new-game-confirm-modal">
        <div className="new-game-confirm-modal__header">
          <span className="new-game-confirm-modal__icon">⚠️</span>
          <h3 id="confirm-dialog-title" className="new-game-confirm-modal__title">
            BEGIN NEW JOURNEY?
          </h3>
        </div>

        <p className="new-game-confirm-modal__message">
          Your current saved progress will be permanently overwritten.
        </p>

        <div className="new-game-confirm-modal__actions">
          <button
            type="button"
            className="new-game-confirm-btn new-game-confirm-btn--confirm"
            onClick={onConfirm}
          >
            [BEGIN NEW JOURNEY]
          </button>
          <button
            ref={cancelBtnRef}
            type="button"
            className="new-game-confirm-btn new-game-confirm-btn--cancel"
            onClick={onCancel}
          >
            [CANCEL]
          </button>
        </div>
      </div>
    </div>
  );
}
