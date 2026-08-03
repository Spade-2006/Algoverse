import { useEffect, useState } from "react";
import "./App.css";
import titleScreen from "../../assets/backgrounf/title-screen.png";
import titleTaglineScroll from "../../assets/ui/title-tagline-scroll-wide.png";
import MainMenu from "./pages/MainMenu";

function App() {
  const [showTitleScreen, setShowTitleScreen] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(false);

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
    if (!showTitleScreen || isPromptVisible) {
      return undefined;
    }

    const menuTimer = window.setTimeout(() => {
      setShowMainMenu(true);
    }, 350);

    return () => window.clearTimeout(menuTimer);
  }, [isPromptVisible, showTitleScreen]);

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
          {showMainMenu && <MainMenu />}
        </section>
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
