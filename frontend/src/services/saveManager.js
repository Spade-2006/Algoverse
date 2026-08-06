/**
 * Centralized Save & Settings Manager for AlgoVerse.
 * Encapsulates versioned localStorage operations, defensive loading,
 * metadata extraction, and application settings persistence.
 */

const SAVE_KEY = "algoverse_save_v1";
const SETTINGS_KEY = "algoverse_settings_v1";

export const DEFAULT_SETTINGS = {
  masterVolume: 70,
  musicVolume: 70,
  sfxVolume: 70,
};

export const SaveManager = {
  /**
   * Save game progression and world state.
   *
   * @param {Object} progressionState - High-level game progression flags
   * @param {Object} worldState - World data (scene key, player position)
   * @returns {Object} Result { success: boolean, error?: string, saveData?: Object }
   */
  saveGame(progressionState = {}, worldState = {}) {
    try {
      const saveData = {
        version: 1,
        savedAt: Date.now(),

        progression: {
          hasTriggeredSealedGate:       !!progressionState.hasTriggeredSealedGate,
          hasCompletedGrandmasterIntro: !!progressionState.hasCompletedGrandmasterIntro,
          hasCompletedBriefing:         !!progressionState.hasCompletedBriefing,
          binaryPhysicalTrialCompleted: !!progressionState.binaryPhysicalTrialCompleted,
          binaryCodeTrialCompleted:     !!progressionState.binaryCodeTrialCompleted,
          grandmasterPostTrialDone:     !!progressionState.grandmasterPostTrialDone,
          gateUnlocked:                 !!progressionState.gateUnlocked,
          plainsDiscovered:             !!progressionState.plainsDiscovered,
          quest1Discovered:             !!progressionState.quest1Discovered,
          quest1Data:                   progressionState.quest1Data || null,
        },

        world: {
          scene: worldState.scene || "DungeonScene",
          player: {
            x: typeof worldState.player?.x === "number" && !isNaN(worldState.player.x) ? Math.round(worldState.player.x) : null,
            y: typeof worldState.player?.y === "number" && !isNaN(worldState.player.y) ? Math.round(worldState.player.y) : null,
          },
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      return { success: true, saveData };
    } catch (err) {
      console.error("[SaveManager] Error saving game to localStorage:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Defensive load of saved game data.
   * Returns null if missing, corrupt, or incompatible.
   *
   * @returns {Object|null} Restored save data object or null
   */
  loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw);

      // Validate version & schema shape defensively
      if (
        !data ||
        typeof data !== "object" ||
        data.version !== 1 ||
        !data.progression ||
        typeof data.progression !== "object" ||
        !data.world ||
        typeof data.world !== "object"
      ) {
        console.warn("[SaveManager] Save data missing required fields or incompatible version:", data);
        return null;
      }

      return data;
    } catch (err) {
      console.error("[SaveManager] Error parsing save data from localStorage:", err);
      return null;
    }
  },

  /**
   * Check if a valid save file exists.
   *
   * @returns {boolean}
   */
  hasSave() {
    return this.loadGame() !== null;
  },

  /**
   * Delete saved game data.
   *
   * @returns {boolean}
   */
  deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (err) {
      console.error("[SaveManager] Error deleting save data:", err);
      return false;
    }
  },

  /**
   * Get metadata summary of the current save file.
   *
   * @returns {Object|null} { savedAt, scene, progression }
   */
  getSaveMetadata() {
    const data = this.loadGame();
    if (!data) return null;
    return {
      savedAt: data.savedAt,
      scene: data.world.scene,
      progression: data.progression,
    };
  },

  /**
   * Save application/audio settings separately from game save.
   *
   * @param {Object} settings
   */
  saveSettings(settings) {
    try {
      const merged = { ...DEFAULT_SETTINGS, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    } catch (err) {
      console.error("[SaveManager] Error saving settings:", err);
    }
  },

  /**
   * Load application/audio settings.
   *
   * @returns {Object} { masterVolume, musicVolume, sfxVolume }
   */
  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },
};
