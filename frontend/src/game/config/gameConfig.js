import Phaser from "phaser";
import DungeonScene from "../scenes/DungeonScene";

export const createGameConfig = (parentElement) => ({
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
  scene: [DungeonScene],
});
