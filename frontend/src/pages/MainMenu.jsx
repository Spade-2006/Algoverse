import { useEffect, useRef, useState } from "react";

const menuItems = [
  "New Journey",
  "Continue",
  "Ancient Codex",
  "Settings",
  "Exit",
];

function MenuButton({ label, isSelected, onActivate, onKeyDown, onSelect, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      className={`main-menu__button${isSelected ? " main-menu__button--selected" : ""}`}
      type="button"
      onFocus={onSelect}
      onMouseEnter={onSelect}
      onKeyDown={onKeyDown}
      onClick={onActivate}
    >
      <span className="main-menu__indicator" aria-hidden="true">►</span>
      <span>{label}</span>
    </button>
  );
}

function MainMenu({ onExit, restoreExitFocus, onExitFocusRestored }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!restoreExitFocus) {
      return;
    }

    const exitIndex = menuItems.indexOf("Exit");
    itemRefs.current[exitIndex]?.focus();
    onExitFocusRestored();
  }, [onExitFocusRestored, restoreExitFocus]);

  const selectItem = (index, shouldFocus = false) => {
    setSelectedIndex(index);

    if (shouldFocus) {
      itemRefs.current[index]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const offset = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + offset + menuItems.length) % menuItems.length;
    selectItem(nextIndex, true);
  };

  return (
    <nav className="main-menu" aria-label="Main menu">
      {menuItems.map((item, index) => (
        <MenuButton
          key={item}
          label={item}
          isSelected={selectedIndex === index}
          onActivate={item === "Exit" ? onExit : undefined}
          onSelect={() => selectItem(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          buttonRef={(element) => {
            itemRefs.current[index] = element;
          }}
        />
      ))}
    </nav>
  );
}

export default MainMenu;
