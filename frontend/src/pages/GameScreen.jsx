import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { createGameConfig } from "../game/config/gameConfig";
import { gameEvents } from "../game/events/gameEvents";
import { SaveManager } from "../services/saveManager";
import CodeTrialOverlay from "./CodeTrialOverlay";
import PauseMenu from "./PauseMenu";
import AncientCodex from "./AncientCodex";
import SettingsPanel from "./SettingsPanel";

/**
 * GameScreen
 *
 * Hosts the Phaser game instance and all in-game overlays (Code Trial, Pause Menu,
 * Ancient Codex, Settings).
 *
 * CRITICAL LIFECYCLE RULE:
 * The Phaser Game instance must be created ONCE on mount and destroyed ONCE on unmount.
 * Never recreate the Phaser Game instance when React progression state updates.
 */
function GameScreen({
  initialSaveData = null,
  progressionState = {},
  onProgressionUpdate,
  onQuitToTitle,
  masterVolume,
  musicVolume,
  sfxVolume,
  onMasterChange,
  onMusicChange,
  onSfxChange,
}) {
  const gameContainerRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const onProgressionUpdateRef = useRef(onProgressionUpdate);

  // Keep callback reference fresh without causing useEffect re-runs
  useEffect(() => {
    onProgressionUpdateRef.current = onProgressionUpdate;
  }, [onProgressionUpdate]);

  const [isCodeTrialOpen, setIsCodeTrialOpen] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState("binary-search");

  // In-Game Menu States
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState(null);

  const toastTimerRef = useRef(null);

  // Initialize Phaser Game ONCE on component mount
  useEffect(() => {
    if (!gameContainerRef.current) return undefined;

    const config = createGameConfig(gameContainerRef.current, initialSaveData);
    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    // Open Code Trial overlay listener
    const handleOpenCodeTrial = (data) => {
      if (data && data.challengeId) {
        setActiveChallengeId(data.challengeId);
      } else {
        setActiveChallengeId("binary-search");
      }
      setIsCodeTrialOpen(true);
    };

    // Progression state sync listener
    const handleProgressionUpdate = (updates) => {
      if (onProgressionUpdateRef.current) {
        onProgressionUpdateRef.current(updates);
      }
    };

    // Autosave listener from Phaser scenes
    const handleAutosave = (data) => {
      if (!data) return;
      SaveManager.saveGame(data.progression, data.world);
      if (onProgressionUpdateRef.current && data.progression) {
        onProgressionUpdateRef.current(data.progression);
      }
    };

    gameEvents.on("open-code-trial", handleOpenCodeTrial);
    gameEvents.on("progression-update", handleProgressionUpdate);
    gameEvents.on("autosave", handleAutosave);

    const handlePlainsArrived = () => {
      handleProgressionUpdate({ plainsDiscovered: true });
    };
    window.addEventListener("algoverse:plains-arrived", handlePlainsArrived);

    return () => {
      gameEvents.off("open-code-trial", handleOpenCodeTrial);
      gameEvents.off("progression-update", handleProgressionUpdate);
      gameEvents.off("autosave", handleAutosave);
      window.removeEventListener("algoverse:plains-arrived", handlePlainsArrived);
      game.destroy(true);
      gameInstanceRef.current = null;
    };

    // Empty dependency array ensures Phaser instance is instantiated ONCE on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global ESC Key Handler for Pause Menu
  // ESC ONLY opens/closes Pause Menu. ESC NEVER skips story, dialogue, or cutscenes.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;

      // Do NOT open pause menu if active overlays (Code Trial, Codex, Settings) are open (they handle ESC to close panel)
      if (isCodeTrialOpen || isCodexOpen || isSettingsOpen) {
        return;
      }

      // Ignore ESC temporarily if a critical world transition is actively fading
      const game = gameInstanceRef.current;
      if (game) {
        const dungeon = game.scene.getScene("DungeonScene");
        if (dungeon && dungeon.isTransitioningToPlains) {
          return;
        }
      }

      e.preventDefault();
      e.stopPropagation();

      setIsPauseMenuOpen((prev) => {
        const next = !prev;
        if (gameInstanceRef.current) {
          if (next) {
            gameInstanceRef.current.scene.scenes.forEach((s) => s.scene.pause());
          } else {
            gameInstanceRef.current.scene.scenes.forEach((s) => s.scene.resume());
          }
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCodeTrialOpen, isCodexOpen, isSettingsOpen]);

  const handleCloseCodeTrial = () => {
    setIsCodeTrialOpen(false);
    gameEvents.emit("close-code-trial");
  };

  const handleResumeGame = () => {
    setIsPauseMenuOpen(false);
    if (gameInstanceRef.current) {
      gameInstanceRef.current.scene.scenes.forEach((s) => s.scene.resume());
    }
  };

  const showSaveToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSaveToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setSaveToastMessage(null);
    }, 2500);
  };

  const handleManualSave = () => {
    let activeSceneKey = "DungeonScene";
    let playerPos = { x: null, y: null };

    if (gameInstanceRef.current) {
      const activeScene = gameInstanceRef.current.scene.scenes.find((s) => s.scene.settings.active);
      if (activeScene) {
        activeSceneKey = activeScene.scene.key;
        if (activeScene.player) {
          playerPos = {
            x: activeScene.player.body ? activeScene.player.body.center.x : activeScene.player.x,
            y: activeScene.player.body ? activeScene.player.body.center.y : activeScene.player.y,
          };
        }
      }
    }

    const res = SaveManager.saveGame(progressionState, { scene: activeSceneKey, player: playerPos });
    if (res.success) {
      showSaveToast("PROGRESS SAVED");
    } else {
      showSaveToast("SAVE FAILED");
    }
  };

  const handleSaveAndQuit = () => {
    handleManualSave();
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }
    if (onQuitToTitle && typeof onQuitToTitle === "function") {
      onQuitToTitle();
    }
  };

  return (
    <div className="game-screen-wrapper" style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={gameContainerRef}
        className="game-screen"
        aria-label="AlgoVerse Gameplay Screen"
      />

      {/* Code Trial Overlay */}
      {isCodeTrialOpen && (
        <CodeTrialOverlay challengeId={activeChallengeId} onClose={handleCloseCodeTrial} />
      )}

      {/* In-Game Pause Menu */}
      {isPauseMenuOpen && !isCodexOpen && !isSettingsOpen && (
        <PauseMenu
          onResume={handleResumeGame}
          onSave={handleManualSave}
          onCodex={() => setIsCodexOpen(true)}
          onSettings={() => setIsSettingsOpen(true)}
          onSaveAndQuit={handleSaveAndQuit}
          saveMessage={saveToastMessage}
        />
      )}

      {/* Ancient Codex opened from Pause Menu */}
      {isCodexOpen && (
        <AncientCodex
          progressionState={progressionState}
          onBack={() => setIsCodexOpen(false)}
        />
      )}

      {/* Settings Panel opened from Pause Menu */}
      {isSettingsOpen && (
        <SettingsPanel
          masterVolume={masterVolume}
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onMasterChange={onMasterChange}
          onMusicChange={onMusicChange}
          onSfxChange={onSfxChange}
          onBack={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default GameScreen;
