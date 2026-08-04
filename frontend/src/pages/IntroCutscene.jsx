import { useCallback, useEffect, useRef, useState } from "react";

import kingdomPeaceful   from "../../../assets/cutscenes/intro/kingdom_peaceful.png";
import kingdomScholars   from "../../../assets/cutscenes/intro/kingdom-scholars.png";
import castleGlory       from "../../../assets/cutscenes/intro/castle-glory.png";
import kingdomFall       from "../../../assets/cutscenes/intro/kingdom-fall.png";
import kingdomRuins      from "../../../assets/cutscenes/intro/kingdom-ruins.png";
import dungeonAwakening  from "../../../assets/cutscenes/intro/dungeon-awakening.png";

// ─── Timing constants (milliseconds) ─────────────────────────────────────────
const T = {
  // Image scenes (Scenes 1–5)
  NARRATION_FADE_IN:       800,
  NARRATION_HOLD:         3200,
  NARRATION_FADE_OUT:      800,
  SCENE_HOLD_BEFORE_NEXT:  700,
  CROSSFADE:              1600,
  SCENE5_HOLD:            1200,
  FINAL_IMAGE_FADE:       2200,

  // Passage-of-time
  PASSAGE_FADE_IN:         900,
  PASSAGE_HOLD:           2600,
  PASSAGE_FADE_OUT:        900,
  PASSAGE_BETWEEN:         700,
  PASSAGE_FINAL_PAUSE:    1400,

  // Dungeon Awakening
  DUNGEON_PRE_REVEAL:     1000,
  DUNGEON_REVEAL_FADE:    3200,
  DUNGEON_SILENT_HOLD:    2500,
  DUNGEON_NAR_FADE_IN:     900,
  DUNGEON_NAR_HOLD:       3200,
  DUNGEON_NAR_FADE_OUT:    900,
  DUNGEON_BEAT_PAUSE:      800,
  DUNGEON_FINAL_FADE:     2400,

  // Skip
  SKIP_FADE:               400,   // quick black fade before calling onComplete
};

// ─── Image-scene data ─────────────────────────────────────────────────────────
const SCENES = [
  {
    id: "kingdom-before",
    image: kingdomPeaceful,
    alt: "A peaceful, prosperous kingdom in its golden age",
    kbClass: "cutscene__image--kb-zoom-in",
    narration: ["There was once a kingdom where knowledge shaped the world."],
  },
  {
    id: "kingdom-of-knowledge",
    image: kingdomScholars,
    alt: "The intellectual heart of the kingdom — scholars and citizens learning",
    kbClass: "cutscene__image--kb-pan-right",
    narration: ["Its paths were ordered.", "Its towers stood tall."],
  },
  {
    id: "castle-glory",
    image: castleGlory,
    alt: "The royal castle at the height of the kingdom",
    kbClass: "cutscene__image--kb-zoom-out",
    narration: ["Every problem had an answer."],
  },
  {
    id: "kingdom-fall",
    image: kingdomFall,
    alt: "The kingdom in the grip of destruction — a mysterious figure watches",
    kbClass: "cutscene__image--kb-pan-left",
    narration: ["But knowledge, in the wrong hands, became power."],
  },
  {
    id: "kingdom-ruins",
    image: kingdomRuins,
    alt: "The silent, abandoned ruins of the fallen kingdom",
    kbClass: "cutscene__image--kb-drift",
    narration: ["And power became ruin."],
    holdAfterNarration: T.SCENE5_HOLD,
  },
];

// ─── Passage-of-time data ─────────────────────────────────────────────────────
const PASSAGE = [
  { id: "years-passed",   text: "Years passed." },
  { id: "kingdom-waited", text: "The kingdom waited." },
  { id: "until-now",      text: "Until now.", extraPause: T.PASSAGE_FINAL_PAUSE },
];

// ─── Dungeon narration beats ───────────────────────────────────────────────────
const DUNGEON_NARRATION = [
  { id: "cold-stone", text: "Cold stone beneath you.",        pauseAfter: T.DUNGEON_BEAT_PAUSE },
  { id: "awaken",     text: "You awaken... but remember nothing.", pauseAfter: 0 },
];

// ─── Dungeon step identifiers ─────────────────────────────────────────────────
const DUNGEON_STEPS = {
  PENDING:    "pending",
  REVEALING:  "revealing",
  SILENT:     "silent",
  NARRATING:  "narrating",
  FADING_OUT: "fading-out",
  DONE:       "done",
};

// ─── IntroCutscene ────────────────────────────────────────────────────────────

/**
 * IntroCutscene
 *
 * Drives the complete intro sequence.
 * Props:
 *   onComplete – called when cutscene finishes (naturally or via skip).
 */
function IntroCutscene({ onComplete }) {

  // ── Image-scene state ──────────────────────────────────────────────────────
  const [sceneIndex,      setSceneIndex]      = useState(0);
  const [prevSceneIndex,  setPrevSceneIndex]  = useState(null);
  const [isCrossfading,   setIsCrossfading]   = useState(false);
  const [narrationBeat,   setNarrationBeat]   = useState(0);
  const [narrationPhase,  setNarrationPhase]  = useState("in");
  const [isFinalImageFade, setIsFinalImageFade] = useState(false);

  // ── Passage-of-time state ──────────────────────────────────────────────────
  const [inPassage,    setInPassage]    = useState(false);
  const [passageIndex, setPassageIndex] = useState(0);
  const [passagePhase, setPassagePhase] = useState("hidden");

  // ── Dungeon Awakening state ────────────────────────────────────────────────
  const [inDungeon,      setInDungeon]      = useState(false);
  const [dungeonStep,    setDungeonStep]    = useState(DUNGEON_STEPS.PENDING);
  const [dungeonBeat,    setDungeonBeat]    = useState(0);
  const [dungeonNarPhase, setDungeonNarPhase] = useState("hidden");

  // ── Skip state ─────────────────────────────────────────────────────────────
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [confirmChoice,  setConfirmChoice]  = useState("no"); // "yes" | "no"
  const [isSkipFading,   setIsSkipFading]   = useState(false);

  // ── Internal refs ──────────────────────────────────────────────────────────

  // All setTimeout IDs — cleared on unmount and on skip.
  const timersRef = useRef([]);

  // True once the user confirmed skip — blocks all sequencer callbacks.
  const skippedRef = useRef(false);

  // Stable ref to onComplete so we never re-register effects when it changes.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // ── Timer helper ───────────────────────────────────────────────────────────

  /**
   * Schedule `fn` to run after `delay` ms.
   * If skippedRef is already true the timer is never set.
   * The timer ID is tracked so clearAllTimers() can cancel it.
   */
  const after = useCallback((fn, delay) => {
    if (skippedRef.current) return;
    const id = window.setTimeout(() => {
      if (skippedRef.current) return; // guard: skip confirmed while timer was pending
      fn();
    }, delay);
    timersRef.current.push(id);
  }, []); // stable — no deps change

  // Clear every pending timer.
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // ── Skip logic ─────────────────────────────────────────────────────────────

  /** Opens the skip confirmation (does NOT immediately skip). */
  const openConfirm = useCallback(() => {
    if (skippedRef.current || isSkipFading) return;
    setShowConfirm(true);
    setConfirmChoice("no"); // always default to NO
  }, [isSkipFading]);

  /** Cancels the confirmation and resumes the cutscene. */
  const cancelConfirm = useCallback(() => {
    setShowConfirm(false);
  }, []);

  /**
   * Executes the skip:
   *  1. Mark skipped so no future timer callbacks run.
   *  2. Clear all pending timers.
   *  3. Begin a fast fade to black.
   *  4. After the fade, call onComplete — same callback as natural completion.
   */
  const executeSkip = useCallback(() => {
    skippedRef.current = true;
    clearAllTimers();
    setShowConfirm(false);
    setIsSkipFading(true);
    window.setTimeout(() => {
      onCompleteRef.current();
    }, T.SKIP_FADE);
  }, [clearAllTimers]);

  // ── Skip keyboard handler ─────────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e) => {
      // --- Confirmation is OPEN ---
      if (showConfirm) {
        if (e.key === "Escape") {
          e.preventDefault();
          cancelConfirm();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (confirmChoice === "yes") executeSkip();
          else cancelConfirm();
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          e.preventDefault();
          setConfirmChoice("yes");
          return;
        }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          e.preventDefault();
          setConfirmChoice("no");
          return;
        }
        return; // swallow all other keys while confirm is open
      }

      // --- Confirmation is CLOSED ---
      if (e.key === "Escape") {
        e.preventDefault();
        openConfirm();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showConfirm, confirmChoice, openConfirm, cancelConfirm, executeSkip]);

  // ── Image-scene sequencer ─────────────────────────────────────────────────

  useEffect(() => {
    if (inPassage || skippedRef.current) return;

    const scene = SCENES[sceneIndex];
    if (!scene) return;

    if (narrationPhase === "in") {
      after(() => setNarrationPhase("visible"), T.NARRATION_FADE_IN);
    }

    if (narrationPhase === "visible") {
      after(() => setNarrationPhase("out"), T.NARRATION_HOLD);
    }

    if (narrationPhase === "out") {
      after(() => {
        const isLastBeat = narrationBeat >= scene.narration.length - 1;

        if (!isLastBeat) {
          setNarrationBeat((b) => b + 1);
          setNarrationPhase("in");
          return;
        }

        const isLastScene = sceneIndex >= SCENES.length - 1;
        const sceneHold   = scene.holdAfterNarration ?? T.SCENE_HOLD_BEFORE_NEXT;

        after(() => {
          if (isLastScene) {
            setIsFinalImageFade(true);
            after(() => setInPassage(true), T.FINAL_IMAGE_FADE);
          } else {
            setPrevSceneIndex(sceneIndex);
            setIsCrossfading(true);
            setSceneIndex((s) => s + 1);
            setNarrationBeat(0);
            setNarrationPhase("in");

            after(() => {
              setPrevSceneIndex(null);
              setIsCrossfading(false);
            }, T.CROSSFADE);
          }
        }, sceneHold);
      }, T.NARRATION_FADE_OUT);
    }
  }, [sceneIndex, narrationBeat, narrationPhase, inPassage, after]);

  // ── Passage-of-time sequencer ──────────────────────────────────────────────

  useEffect(() => {
    if (!inPassage || inDungeon || skippedRef.current) return;

    const beat = PASSAGE[passageIndex];
    if (!beat) return;

    if (passagePhase === "hidden") {
      after(() => setPassagePhase("in"), T.PASSAGE_BETWEEN);
    }

    if (passagePhase === "in") {
      after(() => setPassagePhase("visible"), T.PASSAGE_FADE_IN);
    }

    if (passagePhase === "visible") {
      after(() => setPassagePhase("out"), T.PASSAGE_HOLD);
    }

    if (passagePhase === "out") {
      after(() => {
        const extraPause = beat.extraPause ?? 0;
        const isLastBeat = passageIndex >= PASSAGE.length - 1;

        after(() => {
          if (isLastBeat) {
            setInDungeon(true);
          } else {
            setPassageIndex((i) => i + 1);
            setPassagePhase("hidden");
          }
        }, extraPause);
      }, T.PASSAGE_FADE_OUT);
    }
  }, [inPassage, inDungeon, passageIndex, passagePhase, after]);

  // ── Dungeon Awakening sequencer ────────────────────────────────────────────

  useEffect(() => {
    if (!inDungeon || skippedRef.current) return;

    if (dungeonStep === DUNGEON_STEPS.PENDING) {
      after(() => setDungeonStep(DUNGEON_STEPS.REVEALING), T.DUNGEON_PRE_REVEAL);
    }

    if (dungeonStep === DUNGEON_STEPS.REVEALING) {
      after(() => setDungeonStep(DUNGEON_STEPS.SILENT), T.DUNGEON_REVEAL_FADE);
    }

    if (dungeonStep === DUNGEON_STEPS.SILENT) {
      after(() => {
        setDungeonBeat(0);
        setDungeonNarPhase("in");
        setDungeonStep(DUNGEON_STEPS.NARRATING);
      }, T.DUNGEON_SILENT_HOLD);
    }

    if (dungeonStep === DUNGEON_STEPS.FADING_OUT) {
      after(() => setDungeonStep(DUNGEON_STEPS.DONE), T.DUNGEON_FINAL_FADE);
    }

    if (dungeonStep === DUNGEON_STEPS.DONE) {
      onCompleteRef.current();
    }
  }, [inDungeon, dungeonStep, after]);

  // ── Dungeon narration sub-sequencer ────────────────────────────────────────

  useEffect(() => {
    if (!inDungeon || dungeonStep !== DUNGEON_STEPS.NARRATING || skippedRef.current) return;

    const beat = DUNGEON_NARRATION[dungeonBeat];
    if (!beat) return;

    if (dungeonNarPhase === "in") {
      after(() => setDungeonNarPhase("visible"), T.DUNGEON_NAR_FADE_IN);
    }

    if (dungeonNarPhase === "visible") {
      after(() => setDungeonNarPhase("out"), T.DUNGEON_NAR_HOLD);
    }

    if (dungeonNarPhase === "out") {
      after(() => {
        const pauseAfter = beat.pauseAfter ?? 0;
        const isLastBeat = dungeonBeat >= DUNGEON_NARRATION.length - 1;

        after(() => {
          if (isLastBeat) {
            setDungeonNarPhase("hidden");
            setDungeonStep(DUNGEON_STEPS.FADING_OUT);
          } else {
            setDungeonBeat((b) => b + 1);
            setDungeonNarPhase("in");
          }
        }, pauseAfter);
      }, T.DUNGEON_NAR_FADE_OUT);
    }
  }, [inDungeon, dungeonStep, dungeonBeat, dungeonNarPhase, after]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const currentScene = SCENES[sceneIndex];
  const prevScene    = prevSceneIndex !== null ? SCENES[prevSceneIndex] : null;

  // ── Skip UI overlay ────────────────────────────────────────────────────────

  const skipUI = (
    <>
      {/* SKIP button — top-right corner, always on top of cutscene */}
      {!isSkipFading && (
        <button
          id="cutscene-skip-btn"
          className="cutscene__skip-btn"
          type="button"
          aria-label="Skip intro cutscene"
          onClick={openConfirm}
          tabIndex={showConfirm ? -1 : 0}
        >
          SKIP&nbsp;&nbsp;<span className="cutscene__skip-key">[ESC]</span>
        </button>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          className="cutscene__confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skip-confirm-title"
        >
          <div className="cutscene__confirm">
            <p id="skip-confirm-title" className="cutscene__confirm-text">
              Skip the intro?
            </p>
            <div className="cutscene__confirm-choices" role="group" aria-label="Confirm skip choices">
              <button
                id="skip-confirm-yes"
                className={`cutscene__confirm-btn${confirmChoice === "yes" ? " cutscene__confirm-btn--selected" : ""}`}
                type="button"
                onClick={executeSkip}
                onMouseEnter={() => setConfirmChoice("yes")}
              >
                YES
              </button>
              <button
                id="skip-confirm-no"
                className={`cutscene__confirm-btn${confirmChoice === "no" ? " cutscene__confirm-btn--selected" : ""}`}
                type="button"
                onClick={cancelConfirm}
                onMouseEnter={() => setConfirmChoice("no")}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip-fade overlay — quick black fade before onComplete */}
      {isSkipFading && (
        <div
          className="cutscene__skip-fade"
          aria-hidden="true"
          style={{ "--skip-fade-duration": `${T.SKIP_FADE}ms` }}
        />
      )}
    </>
  );

  // ── Branch 3: Dungeon Awakening ───────────────────────────────────────────

  if (inDungeon) {
    const isRevealing   = dungeonStep === DUNGEON_STEPS.REVEALING;
    const showImage     = dungeonStep !== DUNGEON_STEPS.PENDING && dungeonStep !== DUNGEON_STEPS.DONE;
    const showNarration = dungeonStep === DUNGEON_STEPS.NARRATING;
    const showFinalFade = dungeonStep === DUNGEON_STEPS.FADING_OUT || dungeonStep === DUNGEON_STEPS.DONE;
    const dungeonBeatData = DUNGEON_NARRATION[dungeonBeat];

    return (
      <div className="cutscene cutscene--black" aria-label="Dungeon awakening" role="region">

        {showImage && (
          <div
            className={`cutscene__layer${isRevealing ? " cutscene__layer--dungeon-reveal" : " cutscene__layer--visible"}`}
            style={{ "--dungeon-reveal-duration": `${T.DUNGEON_REVEAL_FADE}ms` }}
          >
            <img
              className="cutscene__image cutscene__image--kb-dungeon"
              src={dungeonAwakening}
              alt="An abandoned dungeon — cold stone, weak torchlight, chains"
            />
          </div>
        )}

        {showNarration && (
          <div className="cutscene__narration-gradient" aria-hidden="true" />
        )}

        {showNarration && dungeonBeatData && (
          <p
            className={`cutscene__narration cutscene__narration--${dungeonNarPhase}`}
            aria-live="polite"
            style={{
              "--narration-fade-in":  `${T.DUNGEON_NAR_FADE_IN}ms`,
              "--narration-fade-out": `${T.DUNGEON_NAR_FADE_OUT}ms`,
            }}
          >
            {dungeonBeatData.text}
          </p>
        )}

        {showFinalFade && (
          <div
            className="cutscene__final-fade"
            aria-hidden="true"
            style={{ "--final-fade-duration": `${T.DUNGEON_FINAL_FADE}ms` }}
          />
        )}

        {skipUI}
      </div>
    );
  }

  // ── Branch 2: Passage of Time ─────────────────────────────────────────────

  if (inPassage) {
    const passageBeat = PASSAGE[passageIndex];
    return (
      <div className="cutscene cutscene--black" aria-label="Passage of time" role="region">
        {passageBeat && (
          <p
            className={`cutscene__passage cutscene__passage--${passagePhase}`}
            aria-live="polite"
            style={{
              "--passage-fade-in":  `${T.PASSAGE_FADE_IN}ms`,
              "--passage-fade-out": `${T.PASSAGE_FADE_OUT}ms`,
            }}
          >
            {passageBeat.text}
          </p>
        )}
        {skipUI}
      </div>
    );
  }

  // ── Branch 1: Image scenes (Scenes 1–5) ───────────────────────────────────

  return (
    <div className="cutscene" aria-label="Intro cutscene" role="region">

      {prevScene && (
        <div
          key={`prev-${prevScene.id}`}
          className={`cutscene__layer${isCrossfading ? " cutscene__layer--fade-out" : ""}`}
          aria-hidden="true"
          style={{ "--crossfade-duration": `${T.CROSSFADE}ms` }}
        >
          <img
            className={`cutscene__image ${prevScene.kbClass}`}
            src={prevScene.image}
            alt=""
          />
        </div>
      )}

      {currentScene && (
        <div
          key={`scene-${currentScene.id}`}
          className={`cutscene__layer${isCrossfading ? " cutscene__layer--fade-in" : " cutscene__layer--visible"}`}
          style={{ "--crossfade-duration": `${T.CROSSFADE}ms` }}
        >
          <img
            className={`cutscene__image ${currentScene.kbClass}`}
            src={currentScene.image}
            alt={currentScene.alt}
          />
        </div>
      )}

      <div className="cutscene__narration-gradient" aria-hidden="true" />

      {currentScene && (
        <p
          className={`cutscene__narration cutscene__narration--${narrationPhase}`}
          aria-live="polite"
          style={{
            "--narration-fade-in":  `${T.NARRATION_FADE_IN}ms`,
            "--narration-fade-out": `${T.NARRATION_FADE_OUT}ms`,
          }}
        >
          {currentScene.narration[narrationBeat]}
        </p>
      )}

      {isFinalImageFade && (
        <div
          className="cutscene__final-fade"
          aria-hidden="true"
          style={{ "--final-fade-duration": `${T.FINAL_IMAGE_FADE}ms` }}
        />
      )}

      {skipUI}
    </div>
  );
}

export default IntroCutscene;
