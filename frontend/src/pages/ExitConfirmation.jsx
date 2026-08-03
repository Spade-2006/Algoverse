import { useEffect, useRef, useState } from "react";

const options = ["Yes", "No"];

function ExitConfirmation({ onCancel, onConfirm }) {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const optionRefs = useRef([]);

  useEffect(() => {
    optionRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        setSelectedIndex((index) => (index === 0 ? 1 : 0));
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        (selectedIndex === 0 ? onConfirm : onCancel)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, onConfirm, selectedIndex]);

  return (
    <div className="exit-dialog-backdrop">
      <section className="exit-dialog" aria-modal="true" aria-labelledby="exit-dialog-title" role="dialog">
        <h2 id="exit-dialog-title">Leave the Kingdom?</h2>
        <div className="exit-dialog__options">
          {options.map((option, index) => (
            <button
              key={option}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              className={`exit-dialog__option${selectedIndex === index ? " exit-dialog__option--selected" : ""}`}
              type="button"
              onFocus={() => setSelectedIndex(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={index === 0 ? onConfirm : onCancel}
            >
              <span aria-hidden="true">►</span>
              {option}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ExitConfirmation;
