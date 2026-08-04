import Phaser from "phaser";
import DungeonScene from "../scenes/DungeonScene";
import PlainsOfOriginsScene from "../scenes/PlainsOfOriginsScene";

export const createGameConfig = (parentElement, initialSaveData = null) => ({
  type: Phaser.AUTO,
  parent: parentElement,
  width: "100%",
  height: "100%",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    roundPixels: true,
  },
  backgroundColor: "#080a10",
  scene: [DungeonScene, PlainsOfOriginsScene],
  callbacks: {
    postBoot: (game) => {
      if (initialSaveData) {
        const targetSceneKey = initialSaveData.world?.scene || "DungeonScene";

        if (targetSceneKey === "PlainsOfOriginsScene") {
          game.scene.stop("DungeonScene");
          game.scene.start("PlainsOfOriginsScene", { initialSaveData, isContinueLoad: true });
        } else {
          game.scene.stop("DungeonScene");
          game.scene.start("DungeonScene", { initialSaveData, isContinueLoad: true });
        }
      }
    },
  },
});
