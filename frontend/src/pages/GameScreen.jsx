import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { createGameConfig } from "../game/config/gameConfig";

function GameScreen() {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    if (!gameContainerRef.current) {
      return undefined;
    }

    const config = createGameConfig(gameContainerRef.current);
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      className="game-screen"
      aria-label="AlgoVerse Gameplay Screen"
    />
  );
}

export default GameScreen;
