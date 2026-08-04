import { useEffect, useRef, useState } from "react";

const menuItems = [
  { id: "new-journey",  label: "New Journey" },
  { id: "continue",     label: "Continue" },
  { id: "codex",        label: "Ancient Codex" },
  { id: "settings",     label: "Settings" },
  { id: "exit",         label: "Exit" },
];

function MenuButton({ label, isSelected, isDisabled, onActivate, onKeyDown, onSelect, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      className={`main-menu__button${isSelected ? " main-menu__button--selected" : ""}${isDisabled ? " main-menu__button--disabled" : ""}`}
      type="button"
      disabled={isDisabled}
      onFocus={onSelect}
      onMouseEnter={onSelect}
      onKeyDown={onKeyDown}
      onClick={isDisabled ? undefined : onActivate}
    >
      <span className="main-menu__indicator" aria-hidden="true">►</span>
      <span>{label}</span>
    </button>
  );
}

function MainMenu({
  hasSave = false,
  onExit,
  restoreExitFocus,
  onExitFocusRestored,
  onSettings,
  restoreSettingsFocus,
  onSettingsFocusRestored,
  onCodex,
  restoreCodexFocus,
  onCodexFocusRestored,
  onNewJourney,
  onContinue,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!restoreExitFocus) return;
    const exitIndex = menuItems.findIndex((m) => m.id === "exit");
    itemRefs.current[exitIndex]?.focus();
    onExitFocusRestored();
  }, [onExitFocusRestored, restoreExitFocus]);

  useEffect(() => {
    if (!restoreSettingsFocus) return;
    const settingsIndex = menuItems.findIndex((m) => m.id === "settings");
    itemRefs.current[settingsIndex]?.focus();
    onSettingsFocusRestored();
  }, [onSettingsFocusRestored, restoreSettingsFocus]);

  useEffect(() => {
    if (!restoreCodexFocus) return;
    const codexIndex = menuItems.findIndex((m) => m.id === "codex");
    itemRefs.current[codexIndex]?.focus();
    onCodexFocusRestored();
  }, [onCodexFocusRestored, restoreCodexFocus]);

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
      {menuItems.map((item, index) => {
        const isDisabled = item.id === "continue" && !hasSave;
        return (
          <MenuButton
            key={item.id}
            label={item.label}
            isSelected={selectedIndex === index}
            isDisabled={isDisabled}
            onActivate={
              item.id === "exit" ? onExit
              : item.id === "settings" ? onSettings
              : item.id === "codex" ? onCodex
              : item.id === "new-journey" ? onNewJourney
              : item.id === "continue" ? onContinue
              : undefined
            }
            onSelect={() => selectItem(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            buttonRef={(element) => {
              itemRefs.current[index] = element;
            }}
          />
        );
      })}
    </nav>
  );
}

export default MainMenu;
