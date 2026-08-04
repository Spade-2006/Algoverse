import { useCallback, useEffect, useState } from "react";
import "./App.css";
import titleScreen from "../../assets/background/title-screen.png";
import titleTaglineScroll from "../../assets/ui/title-tagline-scroll-wide.png";
import AncientCodex from "./pages/AncientCodex";
import ExitConfirmation from "./pages/ExitConfirmation";
import GameScreen from "./pages/GameScreen";
import IntroCutscene from "./pages/IntroCutscene";
import MainMenu from "./pages/MainMenu";
import NewGameConfirmation from "./pages/NewGameConfirmation";
import SettingsPanel, { DEFAULT_MASTER_VOLUME, DEFAULT_MUSIC_VOLUME, DEFAULT_SFX_VOLUME } from "./pages/SettingsPanel";
import { SaveManager } from "./services/saveManager";

function App() {
  const [showTitleScreen, setShowTitleScreen] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [shouldFocusExit, setShouldFocusExit] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);

  // Overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shouldFocusSettings, setShouldFocusSettings] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [shouldFocusCodex, setShouldFocusCodex] = useState(false);

  // New Journey / Cutscene / Game State
  const [isJourneyFading, setIsJourneyFading] = useState(false);
  const [showIntroCutscene, setShowIntroCutscene] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  // Persistent Settings
  const [masterVolume, setMasterVolume] = useState(() => SaveManager.loadSettings().masterVolume ?? DEFAULT_MASTER_VOLUME);
  const [musicVolume, setMusicVolume] = useState(() => SaveManager.loadSettings().musicVolume ?? DEFAULT_MUSIC_VOLUME);
  const [sfxVolume, setSfxVolume] = useState(() => SaveManager.loadSettings().sfxVolume ?? DEFAULT_SFX_VOLUME);

  // Save System & Progression State
  const [hasSave, setHasSave] = useState(() => SaveManager.hasSave());
  const [activeSaveData, setActiveSaveData] = useState(null);
  const [progressionState, setProgressionState] = useState({
    hasTriggeredSealedGate: false,
    hasCompletedGrandmasterIntro: false,
    hasCompletedBriefing: false,
    binaryPhysicalTrialCompleted: false,
    binaryCodeTrialCompleted: false,
    grandmasterPostTrialDone: false,
    gateUnlocked: false,
    plainsDiscovered: false,
  });

  // Save Settings when changed
  const updateMasterVolume = (val) => {
    setMasterVolume(val);
    SaveManager.saveSettings({ masterVolume: val, musicVolume, sfxVolume });
  };
  const updateMusicVolume = (val) => {
    setMusicVolume(val);
    SaveManager.saveSettings({ masterVolume, musicVolume: val, sfxVolume });
  };
  const updateSfxVolume = (val) => {
    setSfxVolume(val);
    SaveManager.saveSettings({ masterVolume, musicVolume, sfxVolume: val });
  };

  const handleProgressionUpdate = useCallback((updates) => {
    setProgressionState((prev) => ({ ...prev, ...updates }));
    setHasSave(SaveManager.hasSave());
  }, []);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setShowTitleScreen(true);
    }, 2600);
    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!showTitleScreen || !isPromptVisible) return undefined;
    const handleKeyDown = () => setIsPromptVisible(false);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPromptVisible, showTitleScreen]);

  useEffect(() => {
    if (!isFadingOut) return undefined;
    const farewellTimer = window.setTimeout(() => {
      setShowFarewell(true);
    }, 800);
    return () => window.clearTimeout(farewellTimer);
  }, [isFadingOut]);

  // Journey fade to cutscene
  useEffect(() => {
    if (!isJourneyFading) return undefined;
    const journeyTimer = window.setTimeout(() => {
      setShowIntroCutscene(true);
    }, 800);
    return () => window.clearTimeout(journeyTimer);
  }, [isJourneyFading]);

  useEffect(() => {
    if (!showTitleScreen || isPromptVisible) return undefined;
    const menuTimer = window.setTimeout(() => {
      setShowMainMenu(true);
    }, 350);
    return () => window.clearTimeout(menuTimer);
  }, [isPromptVisible, showTitleScreen]);

  // ── New Journey Click Handler ──
  const handleNewJourneyClick = () => {
    if (SaveManager.hasSave()) {
      setShowNewGameConfirm(true);
    } else {
      startNewJourney();
    }
  };

  const startNewJourney = () => {
    SaveManager.deleteSave();
    setHasSave(false);
    setActiveSaveData(null);
    setProgressionState({
      hasTriggeredSealedGate: false,
      hasCompletedGrandmasterIntro: false,
      hasCompletedBriefing: false,
      binaryPhysicalTrialCompleted: false,
      binaryCodeTrialCompleted: false,
      grandmasterPostTrialDone: false,
      gateUnlocked: false,
      plainsDiscovered: false,
    });
    setIsJourneyFading(true);
  };

  // ── Continue Click Handler ──
  const handleContinueClick = () => {
    const loadedSave = SaveManager.loadGame();
    if (!loadedSave) {
      console.warn("[App] Continue clicked but no valid save data found.");
      setHasSave(false);
      return;
    }

    setActiveSaveData(loadedSave);
    setProgressionState(loadedSave.progression || {});
    setShowGameScreen(true);
  };

  // ── Quit to Title from GameScreen ──
  const handleQuitToTitle = () => {
    setShowGameScreen(false);
    setShowIntroCutscene(false);
    setIsJourneyFading(false);
    setActiveSaveData(null);
    setHasSave(SaveManager.hasSave());
  };

  if (showFarewell) {
    return (
      <main className="farewell-screen">
        <p>Until our paths cross again...</p>
      </main>
    );
  }

  // ── Phaser Gameplay Screen ──
  if (showGameScreen) {
    return (
      <GameScreen
        initialSaveData={activeSaveData}
        progressionState={progressionState}
        onProgressionUpdate={handleProgressionUpdate}
        onQuitToTitle={handleQuitToTitle}
        masterVolume={masterVolume}
        musicVolume={musicVolume}
        sfxVolume={sfxVolume}
        onMasterChange={updateMasterVolume}
        onMusicChange={updateMusicVolume}
        onSfxChange={updateSfxVolume}
      />
    );
  }

  // ── Intro Cutscene Screen ──
  if (showIntroCutscene) {
    return (
      <IntroCutscene
        onComplete={() => {
          setShowIntroCutscene(false);
          setShowGameScreen(true);
        }}
      />
    );
  }

  if (showTitleScreen) {
    return (
      <main
        className="title-screen"
        aria-label="AlgoVerse title screen"
        onClick={isPromptVisible ? () => setIsPromptVisible(false) : undefined}
      >
        <img className="title-screen__background" src={titleScreen} alt="" />
        <div className="title-screen__vignette" aria-hidden="true" />
        <div className="title-screen__fog title-screen__fog--far" aria-hidden="true" />
        <div className="title-screen__fog title-screen__fog--near" aria-hidden="true" />
        <div className="title-screen__fireflies" aria-hidden="true">
          <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        </div>
        <div className="title-screen__particles" aria-hidden="true">
          <span /><span /><span /><span /><span /><span /><span /><span />
        </div>
        <section className="title-screen__content">
          <h1>ALGOVERSE</h1>
          <p className="title-screen__tagline">
            <img src={titleTaglineScroll} alt="" />
            <span>Every Algorithm Tells a Story</span>
          </p>
          <button
            className={`title-screen__prompt${isPromptVisible ? "" : " title-screen__prompt--hidden"}`}
            type="button"
            tabIndex="-1"
          >
            PRESS ANY KEY
          </button>
          {showMainMenu && <div className="title-screen__divider" aria-hidden="true">✦</div>}
          {showMainMenu && (
            <MainMenu
              hasSave={hasSave}
              onExit={() => setIsExitDialogOpen(true)}
              restoreExitFocus={shouldFocusExit}
              onExitFocusRestored={() => setShouldFocusExit(false)}
              onSettings={() => setIsSettingsOpen(true)}
              restoreSettingsFocus={shouldFocusSettings}
              onSettingsFocusRestored={() => setShouldFocusSettings(false)}
              onCodex={() => setIsCodexOpen(true)}
              restoreCodexFocus={shouldFocusCodex}
              onCodexFocusRestored={() => setShouldFocusCodex(false)}
              onNewJourney={handleNewJourneyClick}
              onContinue={handleContinueClick}
            />
          )}
        </section>
        {(isFadingOut || isJourneyFading) && <div className="title-screen__exit-fade" aria-hidden="true" />}
        
        {/* New Game Overwrite Confirmation Modal */}
        {showNewGameConfirm && (
          <NewGameConfirmation
            onConfirm={() => {
              setShowNewGameConfirm(false);
              startNewJourney();
            }}
            onCancel={() => setShowNewGameConfirm(false)}
          />
        )}

        {isExitDialogOpen && (
          <ExitConfirmation
            onConfirm={() => {
              setIsExitDialogOpen(false);
              setIsFadingOut(true);
            }}
            onCancel={() => {
              setIsExitDialogOpen(false);
              setShouldFocusExit(true);
            }}
          />
        )}
        {isSettingsOpen && (
          <SettingsPanel
            masterVolume={masterVolume}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            onMasterChange={updateMasterVolume}
            onMusicChange={updateMusicVolume}
            onSfxChange={updateSfxVolume}
            onBack={() => {
              setIsSettingsOpen(false);
              setShouldFocusSettings(true);
            }}
          />
        )}
        {isCodexOpen && (
          <AncientCodex
            progressionState={progressionState}
            onBack={() => {
              setIsCodexOpen(false);
              setShouldFocusCodex(true);
            }}
          />
        )}
      </main>
    );
  }

  return (
    <main className="splash-screen" aria-label="Spade Studios splash screen">
      <div className="splash-screen__credit">
        <p>Powered by</p>
        <h1>Spade Studios</h1>
      </div>
    </main>
  );
}

export default App;
