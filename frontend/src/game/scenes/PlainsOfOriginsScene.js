import Phaser from "phaser";
import { gameEvents } from "../events/gameEvents";

/**
 * PlainsOfOriginsScene
 *
 * Placeholder destination after completing the Dungeon 01 gate sequence.
 * Supports being entered either via gate transition or directly from Continue Game.
 */
export default class PlainsOfOriginsScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlainsOfOriginsScene" });
    this.isContinueLoad = false;
  }

  init(data) {
    if (data && data.isContinueLoad) {
      this.isContinueLoad = true;
    }
  }

  create() {
    const { width, height } = this.scale;

    // Dark background — prototype destination
    this.cameras.main.setBackgroundColor("#05070d");

    // ── Location Title Card ──────────────────────────────────────────────────
    const titleText = this.add.text(width / 2, height / 2 - 20, "PLAINS OF ORIGINS", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "18px",
      color: "#d2b978",
      stroke: "#3a2e14",
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: "#ffcc6640", blur: 18, fill: true },
    });
    titleText.setOrigin(0.5, 0.5);
    titleText.setScrollFactor(0);
    titleText.setDepth(1000);
    titleText.setAlpha(0);

    // Subtitle
    const subtitleText = this.add.text(width / 2, height / 2 + 14, "an ancient expanse beyond the Gate", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#a09060",
    });
    subtitleText.setOrigin(0.5, 0.5);
    subtitleText.setScrollFactor(0);
    subtitleText.setDepth(1000);
    subtitleText.setAlpha(0);

    // Fade camera in
    const fadeDuration = this.isContinueLoad ? 600 : 1200;
    this.cameras.main.fadeIn(fadeDuration, 5, 7, 13);

    // Display title card
    this.time.delayedCall(this.isContinueLoad ? 600 : 1400, () => {
      this.tweens.add({
        targets: [titleText, subtitleText],
        alpha: 1,
        duration: 800,
        ease: "Power2",
        onComplete: () => {
          this.time.delayedCall(2500, () => {
            this.tweens.add({
              targets: [titleText, subtitleText],
              alpha: 0,
              duration: 1000,
              ease: "Power2",
              onComplete: () => {
                titleText.destroy();
                subtitleText.destroy();
              },
            });
          });
        },
      });
    });

    // Notify React & trigger autosave checkpoint for Plains arrival
    window.dispatchEvent(new CustomEvent("algoverse:plains-arrived"));

    this.triggerAutosave();
  }

  triggerAutosave() {
    gameEvents.emit("autosave", {
      progression: {
        hasTriggeredSealedGate: true,
        hasCompletedGrandmasterIntro: true,
        hasCompletedBriefing: true,
        binaryPhysicalTrialCompleted: true,
        binaryCodeTrialCompleted: true,
        grandmasterPostTrialDone: true,
        gateUnlocked: true,
        plainsDiscovered: true,
      },
      world: {
        scene: "PlainsOfOriginsScene",
        player: { x: null, y: null },
      },
    });
  }
}
