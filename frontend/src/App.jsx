import { useEffect, useState } from "react";
import "./App.css";
import titleScreen from "../../assets/background/title-screen.png";
import titleTaglineScroll from "../../assets/ui/title-tagline-scroll-wide.png";
import AncientCodex from "./pages/AncientCodex";
import ExitConfirmation from "./pages/ExitConfirmation";
import GameScreen from "./pages/GameScreen";
import IntroCutscene from "./pages/IntroCutscene";
import MainMenu from "./pages/MainMenu";
import SettingsPanel, { DEFAULT_MUSIC_VOLUME, DEFAULT_SFX_VOLUME } from "./pages/SettingsPanel";

function App() {
  const [showTitleScreen, setShowTitleScreen] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [shouldFocusExit, setShouldFocusExit] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shouldFocusSettings, setShouldFocusSettings] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [shouldFocusCodex, setShouldFocusCodex] = useState(false);
  const [isJourneyFading, setIsJourneyFading] = useState(false);
  const [showIntroCutscene, setShowIntroCutscene] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [musicVolume, setMusicVolume] = useState(DEFAULT_MUSIC_VOLUME);
  const [sfxVolume, setSfxVolume] = useState(DEFAULT_SFX_VOLUME);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setShowTitleScreen(true);
    }, 2600);

    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!showTitleScreen || !isPromptVisible) {
      return undefined;
    }

    const handleKeyDown = () => setIsPromptVisible(false);

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPromptVisible, showTitleScreen]);

  useEffect(() => {
    if (!isFadingOut) {
      return undefined;
    }

    const farewellTimer = window.setTimeout(() => {
      setShowFarewell(true);
    }, 800);

    return () => window.clearTimeout(farewellTimer);
  }, [isFadingOut]);

  // After the journey-fade overlay reaches black, swap to the cutscene screen
  useEffect(() => {
    if (!isJourneyFading) {
      return undefined;
    }

    const journeyTimer = window.setTimeout(() => {
      setShowIntroCutscene(true);
    }, 800);

    return () => window.clearTimeout(journeyTimer);
  }, [isJourneyFading]);

  useEffect(() => {
    if (!showTitleScreen || isPromptVisible) {
      return undefined;
    }

    const menuTimer = window.setTimeout(() => {
      setShowMainMenu(true);
    }, 350);

    return () => window.clearTimeout(menuTimer);
  }, [isPromptVisible, showTitleScreen]);

  if (showFarewell) {
    return (
      <main className="farewell-screen">
        <p>Until our paths cross again...</p>
      </main>
    );
  }

  // ── Phaser Gameplay Screen (replaces cutscene) ──
  if (showGameScreen) {
    return <GameScreen />;
  }

  // ── Intro Cutscene screen (replaces title screen entirely) ──
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
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="title-screen__particles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
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
              onExit={() => setIsExitDialogOpen(true)}
              restoreExitFocus={shouldFocusExit}
              onExitFocusRestored={() => setShouldFocusExit(false)}
              onSettings={() => setIsSettingsOpen(true)}
              restoreSettingsFocus={shouldFocusSettings}
              onSettingsFocusRestored={() => setShouldFocusSettings(false)}
              onCodex={() => setIsCodexOpen(true)}
              restoreCodexFocus={shouldFocusCodex}
              onCodexFocusRestored={() => setShouldFocusCodex(false)}
              onNewJourney={() => setIsJourneyFading(true)}
            />
          )}
        </section>
        {(isFadingOut || isJourneyFading) && <div className="title-screen__exit-fade" aria-hidden="true" />}
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
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            onMusicChange={setMusicVolume}
            onSfxChange={setSfxVolume}
            onBack={() => {
              setIsSettingsOpen(false);
              setShouldFocusSettings(true);
            }}
          />
        )}
        {isCodexOpen && (
          <AncientCodex
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
  )
}

export default App
