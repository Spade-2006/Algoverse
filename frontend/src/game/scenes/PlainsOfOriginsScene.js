import Phaser from "phaser";
import playerSpritesheet from "../../../../assets/sprites/player/player-spritesheet.png";
import plainsMapJson     from "../../../../assets/maps/plains-of-origins/maps/plains-of-origin.json";
import tilesetGrass      from "../../../../assets/maps/plains-of-origins/tilesets/Grass/1. Grass and dirt.png";
import tilesetWater      from "../../../../assets/maps/plains-of-origins/tilesets/Water/2. Water.png";
import tilesetPaths      from "../../../../assets/maps/plains-of-origins/tilesets/Paths/6. Dirt paths.png";
import tilesetTrees      from "../../../../assets/maps/plains-of-origins/tilesets/Trees/4. Trees.png";
import tilesetRocks      from "../../../../assets/maps/plains-of-origins/tilesets/Rocks/3. Rocks and cliffs.png";
import tilesetDesert     from "../../../../assets/maps/plains-of-origins/tilesets/Desert/8. Desert.png";
import obeliskImg        from "../../../../assets/maps/plains-of-origins/quest-1/Soul-Bind Obelisk,.png";
import runeStoneImg      from "../../../../assets/maps/plains-of-origins/quest-1/Rune Stone.png";
import { gameEvents }    from "../events/gameEvents";

// ─── Directional row mapping ──────────────────────────────────────────────────
const DIRECTIONS = {
  down:  { frameSeq: [1, 0, 1, 2] },
  up:    { frameSeq: [4, 3, 4, 5] },
  right: { frameSeq: [7, 6, 7, 8] },
  left:  { frameSeq: [10, 9, 10, 11] },
};

const ANIM_KEYS = {
  down:  "plains-walk-down",
  up:    "plains-walk-up",
  right: "plains-walk-right",
  left:  "plains-walk-left",
};

const MOVE_SPEED = 160;
const WALK_FPS   = 6;

// Sprite-sheet cell dimensions
const FRAME_W = 341;
const FRAME_H = 384;

// Normalised canvas geometry
const NORM_W          = 200;
const NORM_H          = 400;
const ALPHA_THRESHOLD = 10;

// Solid physics body in normalized space
const BODY_W = 110;
const BODY_H = 180;

// Typewriter text animation speed (ms per character)
const TYPEWRITER_SPEED = 24;

// ─── Original Barrier Inspection Story Dialogue ──────────────────────────────
const BARRIER_INSPECTION_DIALOGUE = [
  { speaker: "Hero", text: "Whoa—!" },
  { speaker: "Hero", text: "That's not a wall..." },
  { speaker: "Hero", text: "Something is holding the path shut." },
  { speaker: "Hero", text: "And whatever is powering it is somewhere nearby." },
  { speaker: "Grandmaster", text: "Not nearby." },
  { speaker: "Grandmaster", text: "Behind you." },
  { speaker: "Hero", text: "...You can do that?" },
  { speaker: "Grandmaster", text: "I can do many things you have yet to understand." },
  { speaker: "Hero", text: "Could've mentioned that before I walked face-first into it." },
  { speaker: "Grandmaster", text: "Experience is a remarkably effective teacher." },
  { speaker: "Hero", text: "Of course you'd say that." },
];

// ─── Quest 1 Story Dialogue ───────────────────────────────────────────────────
const DISCOVERY_DIALOGUE = [
  { speaker: "Grandmaster", text: "So... you found them." },
  { speaker: "Hero", text: "These pillars... they're feeding the barrier?" },
  { speaker: "Grandmaster", text: "Not feeding it. Binding it." },
  { speaker: "Grandmaster", text: "Each stone carries a harmonic frequency." },
  { speaker: "Grandmaster", text: "Two frequencies, chosen correctly, can force the pillars into resonance." },
  { speaker: "Hero", text: "And if I choose wrong?" },
  { speaker: "Grandmaster", text: "...Then I suggest you learn quickly." },
];

const SUCCESS_DIALOGUE = [
  { speaker: "Grandmaster", text: "Well done. Two frequencies in harmony, and the binding breaks." },
  { speaker: "Hero", text: "The barrier's gone! The path into Plains of Origins is open." },
  { speaker: "Grandmaster", text: "Remember what this taught you. A sorted path narrows from both ends." },
];

const PHYSICAL_SUCCESS_DIALOGUE = [
  { speaker: "Grandmaster", text: "Brilliant! Your physical intuition aligned the rune frequencies." },
  { speaker: "Grandmaster", text: "Yet physical alignment is only half the bond. To unseal the ancient barrier, you must encode the Two Pointer algorithm into the ruin's terminal." },
  { speaker: "Hero", text: "I understand. I'll translate the physical technique into code." },
];

const CODE_SUCCESS_DIALOGUE = [
  { speaker: "Grandmaster", text: "The ancient ruins pulse with power! The Two Pointer algorithm is inscribed into stone." },
  { speaker: "Grandmaster", text: "The resonance barrier guarding Area 1 has dissolved. The path forward into the Plains of Origins is open!" },
  { speaker: "Hero", text: "The barrier is gone. I can cross the bridge into the next expanse." },
];

// Helper: Generate Quest 1 Two-Pointer puzzle data state
function generateQuest1Data() {
  const set = new Set();
  while (set.size < 7) {
    const val = Math.floor(Math.random() * 201) - 100;
    set.add(val);
  }
  const frequencies = Array.from(set).sort((a, b) => a - b);
  // Pick indices 1 & 5 to guarantee a valid solvable target pair
  const target = frequencies[1] + frequencies[5];

  return {
    discovered: false,
    frequencies,
    target,
    solved: false,
    leftIndex: 0,
    rightIndex: 6,
    movesRemaining: 6,
  };
}

// ─── Safe Bounding Box Helper ─────────────────────────────────────────────────
function getFrameBounds(scene, frameIndex) {
  const textureKey = scene.textures.exists("player-plains") ? "player-plains" : "player";
  const texture = scene.textures.get(textureKey);
  if (!texture) return { minX: 0, maxX: FRAME_W - 1, minY: 0, maxY: FRAME_H - 1 };

  const frame = texture.frames[frameIndex];
  if (!frame) return { minX: 0, maxX: FRAME_W - 1, minY: 0, maxY: FRAME_H - 1 };

  const src = texture.getSourceImage();
  if (!src) return { minX: 0, maxX: FRAME_W - 1, minY: 0, maxY: FRAME_H - 1 };

  try {
    const tmp = document.createElement("canvas");
    tmp.width  = FRAME_W;
    tmp.height = FRAME_H;
    const ctx  = tmp.getContext("2d");

    ctx.drawImage(
      src,
      frame.cutX, frame.cutY,
      FRAME_W, FRAME_H,
      0, 0,
      FRAME_W, FRAME_H
    );

    const data = ctx.getImageData(0, 0, FRAME_W, FRAME_H).data;
    let minX = FRAME_W, maxX = -1, minY = FRAME_H, maxY = -1;

    for (let y = 0; y < FRAME_H; y++) {
      for (let x = 0; x < FRAME_W; x++) {
        if (data[(y * FRAME_W + x) * 4 + 3] > ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return { minX: 0, maxX: FRAME_W - 1, minY: 0, maxY: FRAME_H - 1 };
    }

    return { minX, maxX, minY, maxY };
  } catch {
    return { minX: 0, maxX: FRAME_W - 1, minY: 0, maxY: FRAME_H - 1 };
  }
}

// ─── Normalised Canvas Helper ─────────────────────────────────────────────────
function makeNormalisedCanvas(scene, frameIndex) {
  const textureKey = scene.textures.exists("player-plains") ? "player-plains" : "player";
  const texture = scene.textures.get(textureKey);
  if (!texture) return document.createElement("canvas");

  const frame = texture.frames[frameIndex];
  if (!frame) return document.createElement("canvas");

  const src = texture.getSourceImage();
  if (!src) return document.createElement("canvas");

  const canvas = document.createElement("canvas");
  canvas.width  = NORM_W;
  canvas.height = NORM_H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  try {
    const { minX, maxX, minY, maxY } = getFrameBounds(scene, frameIndex);
    const visW = maxX - minX + 1;
    const visH = maxY - minY + 1;

    const destX = Math.floor((NORM_W - visW) / 2);
    const destY = NORM_H - visH;

    ctx.drawImage(
      src,
      frame.cutX + minX,
      frame.cutY + minY,
      visW, visH,
      destX, destY,
      visW, visH
    );
  } catch {
    console.warn("Canvas normalization fallback for frame", frameIndex);
  }

  return canvas;
}

export default class PlainsOfOriginsScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlainsOfOriginsScene" });
    this.isContinueLoad      = false;
    this.isFromDungeonGate   = false;
    this.initSaveData        = null;
    this.hasSeenPlainsIntro  = false;
    this.hasInspectedBarrier = false;
    this.quest1PuzzleActive  = false;
    this.quest1State         = null;
    this.isEncounterActive   = false;
    this.isDialogueActive    = false;
    this.currentDialogue     = [];
    this.currentDialogueIdx  = 0;
    this.onDialogueEnd       = null;

    // Typewriter state
    this.typewriterTimer     = null;
    this.typewriterFullText  = "";
    this.isTypewriterDone    = false;
  }

  init(data) {
    if (data) {
      if (data.isContinueLoad) {
        this.isContinueLoad = true;
      }
      if (data.fromDungeon || data.isFromDungeonGate) {
        this.isFromDungeonGate = true;
      }
      if (data.initialSaveData) {
        this.initSaveData = data.initialSaveData;
      }
    }
  }

  preload() {
    if (!this.textures.exists("player-plains")) {
      this.load.spritesheet("player-plains", playerSpritesheet, {
        frameWidth:  FRAME_W,
        frameHeight: FRAME_H,
      });
    }

    if (!this.cache.tilemap.exists("plains-of-origin")) {
      this.cache.tilemap.add("plains-of-origin", {
        format: Phaser.Tilemaps.Formats.TILED_JSON,
        data:   plainsMapJson,
      });
    }

    this.load.image("ts-grass",  tilesetGrass);
    this.load.image("ts-water",  tilesetWater);
    this.load.image("ts-paths",  tilesetPaths);
    this.load.image("ts-trees",  tilesetTrees);
    this.load.image("ts-rocks",  tilesetRocks);
    this.load.image("ts-desert", tilesetDesert);

    this.load.image("obelisk",    obeliskImg);
    this.load.image("rune-stone", runeStoneImg);
  }

  create() {
    // Clear camera fade state and fade in smoothly
    this.cameras.main.resetFX();
    this.cameras.main.setVisible(true);
    this.cameras.main.setAlpha(1);
    this.cameras.main.fadeIn(800, 0, 0, 0);

    this.input.keyboard.enabled = true;

    try {
      // ── Restore or Generate State ──────────────────────────────────────────
      this.hasSeenPlainsIntro  = !!this.initSaveData?.progression?.hasSeenPlainsIntro;
      this.hasInspectedBarrier = !!this.initSaveData?.progression?.hasInspectedBarrier;

      if (this.initSaveData?.progression?.quest1Data) {
        this.quest1State = { ...this.initSaveData.progression.quest1Data };
      } else {
        this.quest1State = generateQuest1Data();
      }

      if (this.initSaveData?.progression?.quest1Solved || this.initSaveData?.progression?.twoPointersUnlocked) {
        // Quest complete — restore solved state fully
        this.quest1State.solved     = true;
        this.quest1State.discovered = true;
        this.quest1PuzzleActive     = false;
        this.physicalPuzzleSolved   = true;
      } else {
        // Quest NOT solved — always reset to beginning so story sequence plays
        this.quest1State.solved     = false;
        this.quest1State.discovered = false;
        this.quest1PuzzleActive     = false;
        this.physicalPuzzleSolved   = false;
      }

      // Ensure defaults for pointer state
      if (this.quest1State.leftIndex === undefined) this.quest1State.leftIndex = 0;
      if (this.quest1State.rightIndex === undefined) this.quest1State.rightIndex = 6;
      if (this.quest1State.movesRemaining === undefined) this.quest1State.movesRemaining = 6;

      // ── Normalised bottom-centred frame textures ────────────────────────────
      this.normTextures = {};
      this.idleTexture  = {};

      Object.entries(DIRECTIONS).forEach(([dir, { frameSeq }]) => {
        frameSeq.forEach((phFrame) => {
          const key = `plains-norm-${dir}-${phFrame}`;
          if (!this.textures.exists(key)) {
            const cvs = makeNormalisedCanvas(this, phFrame);
            this.textures.addCanvas(key, cvs);
          }
        });

        this.normTextures[dir] = frameSeq.map((f) => `plains-norm-${dir}-${f}`);
        this.idleTexture[dir]  = `plains-norm-${dir}-${frameSeq[0]}`;
      });

      // ── Walk animations ─────────────────────────────────────────────────────
      Object.entries(DIRECTIONS).forEach(([dir, { frameSeq }]) => {
        if (!this.anims.exists(ANIM_KEYS[dir])) {
          this.anims.create({
            key:       ANIM_KEYS[dir],
            frames:    frameSeq.map((f) => ({ key: `plains-norm-${dir}-${f}`, frame: 0 })),
            frameRate: WALK_FPS,
            repeat:    -1,
          });
        }
      });

      // ── Tilemap ─────────────────────────────────────────────────────────────
      const map = this.make.tilemap({ key: "plains-of-origin" });

      const tsGrass  = map.addTilesetImage("1. Grass and dirt",  "ts-grass");
      const tsWater  = map.addTilesetImage("2. Water",           "ts-water");
      const tsPaths  = map.addTilesetImage("6. Dirt paths",       "ts-paths");
      const tsTrees  = map.addTilesetImage("4. Trees",            "ts-trees");
      const tsRocks  = map.addTilesetImage("3. Rocks and cliffs", "ts-rocks");
      const tsDesert = map.addTilesetImage("8. Desert",           "ts-desert");
      const allTilesets = [tsGrass, tsWater, tsPaths, tsTrees, tsRocks, tsDesert];

      const grassWaterLayer    = map.createLayer("Grasss and Water", allTilesets, 0, 0);
      const pathsLayer         = map.createLayer("Paths", allTilesets, 0, 0);
      const rocksAndTreesLayer = map.createLayer("Rocks and trees", allTilesets, 0, 0);
      const templeLayer        = map.createLayer("Temple", allTilesets, 0, 0);

      // ── Precise Path-Priority Collisions ────────────────────────────────────
      const mapW = map.width;
      const mapH = map.height;

      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const pathTile = pathsLayer ? pathsLayer.getTileAt(x, y) : null;
          const hasPath  = pathTile && pathTile.index > 0;

          if (pathsLayer) {
            const pTile = pathsLayer.getTileAt(x, y);
            if (pTile) pTile.setCollision(false, false, false, false);
          }

          if (hasPath) {
            if (rocksAndTreesLayer) {
              const rTile = rocksAndTreesLayer.getTileAt(x, y);
              if (rTile) rTile.setCollision(false, false, false, false);
            }
            if (grassWaterLayer) {
              const wTile = grassWaterLayer.getTileAt(x, y);
              if (wTile) wTile.setCollision(false, false, false, false);
            }
          } else {
            if (rocksAndTreesLayer) {
              const rTile = rocksAndTreesLayer.getTileAt(x, y);
              if (rTile) {
                const gid = rTile.index;
                const isRock = gid >= 6021 && gid <= 7524;
                const isTreeTrunk = gid >= 5900 && gid <= 6020;

                if (isRock || isTreeTrunk) {
                  rTile.setCollision(true, true, true, true);
                } else {
                  rTile.setCollision(false, false, false, false);
                }
              }
            }

            if (grassWaterLayer) {
              const wTile = grassWaterLayer.getTileAt(x, y);
              if (wTile) {
                const gid = wTile.index;
                if (gid >= 1509 && gid <= 3012) {
                  wTile.setCollision(true, true, true, true);
                } else {
                  wTile.setCollision(false, false, false, false);
                }
              }
            }
          }

          if (templeLayer) {
            const tTile = templeLayer.getTileAt(x, y);
            if (tTile) {
              if (tTile.index > 0) {
                tTile.setCollision(true, true, true, true);
              } else {
                tTile.setCollision(false, false, false, false);
              }
            }
          }
        }
      }

      // ── Object Layer: Spawn Points & Quest Objects ───────────────────────────
      const objLayer = map.getObjectLayer("Spaw Points");
      const objects  = objLayer ? objLayer.objects : [];

      const spawnObj = objects.find((o) => o.name === "player_spawn");
      let spawnX = spawnObj ? spawnObj.x : 20;
      let spawnY = spawnObj ? spawnObj.y : 84;

      if (
        this.initSaveData?.world?.player?.x &&
        typeof this.initSaveData.world.player.x === "number" &&
        !isNaN(this.initSaveData.world.player.x) &&
        this.initSaveData.world.player.x >= 16 &&
        this.initSaveData.world.player.x <= map.widthInPixels - 16
      ) {
        spawnX = this.initSaveData.world.player.x;
      }

      if (
        this.initSaveData?.world?.player?.y &&
        typeof this.initSaveData.world.player.y === "number" &&
        !isNaN(this.initSaveData.world.player.y) &&
        this.initSaveData.world.player.y >= 16 &&
        this.initSaveData.world.player.y <= map.heightInPixels - 16
      ) {
        spawnY = this.initSaveData.world.player.y;
      }

      // Read Quest 1 Tiled Map Objects
      this.area1ExitObj     = objects.find((o) => o.name === "area1_exit" || o.name === "barrior" || o.name === "barrier");
      this.quest1TriggerObj = objects.find((o) => o.name === "quest1_trigger");
      this.quest1CenterObj  = objects.find((o) => o.name === "quest1_center");
      this.obeliskLeftObj   = objects.find((o) => o.name === "obelisk_left");
      this.obeliskRightObj  = objects.find((o) => o.name === "obelisk_right");

      this.runeObjects = [];
      for (let i = 1; i <= 7; i++) {
        const rObj = objects.find((o) => o.name === `rune_${i}` || (i === 2 && o.name === "rune_"));
        if (rObj) this.runeObjects.push(rObj);
      }

      // ── Create Scaled Player Sprite ─────────────────────────────────────────
      this.player = this.physics.add.sprite(spawnX, spawnY, this.idleTexture.down);
      this.player.setScale(0.17);
      this.player.setCollideWorldBounds(true);
      this.player.body.setSize(BODY_W, BODY_H);
      this.player.body.setOffset(
        (NORM_W - BODY_W) / 2,
        NORM_H - BODY_H
      );

      if (templeLayer)        this.physics.add.collider(this.player, templeLayer);
      if (rocksAndTreesLayer) this.physics.add.collider(this.player, rocksAndTreesLayer);
      if (grassWaterLayer)    this.physics.add.collider(this.player, grassWaterLayer);

      // ── Spawn Soul-Bind Obelisks (Physical map objects, always visible) ───────
      this.obelisks = [];
      if (this.obeliskLeftObj) {
        const obLX = this.obeliskLeftObj.x - 50;
        const obLY = this.obeliskLeftObj.y - 20;
        const obL  = this.add.image(obLX, obLY, "obelisk").setScale(0.12);
        obL.setDepth(obLY);
        obL.setVisible(true);
        this.obelisks.push(obL);
      }
      if (this.obeliskRightObj) {
        const obRX = this.obeliskRightObj.x + 50;
        const obRY = this.obeliskRightObj.y - 20;
        const obR  = this.add.image(obRX, obRY, "obelisk").setScale(0.12);
        obR.setDepth(obRY);
        obR.setVisible(true);
        this.obelisks.push(obR);
      }

      // ── Spawn 7 Rune Stones & Floating Labels ────────────────────────────────
      this.runeSprites = [];
      this.runeLabels  = [];

      this.runeObjects.forEach((rObj, idx) => {
        const dx = (idx - 3) * 14;
        const dy = -Math.sin((idx / 6) * Math.PI) * 22;

        const runeX = rObj.x + dx;
        const runeY = rObj.y + dy;

        const stone = this.add.image(runeX, runeY, "rune-stone").setScale(0.088);
        stone.setDepth(runeY);
        stone.setVisible(true);
        this.runeSprites.push(stone);

        // Dynamic Frequency Value Floating Text
        const label = this.add.text(runeX, runeY - 18, "?", {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: "9px",
          color: "#7090a0",
          backgroundColor: "#0d0f17cc",
          padding: { x: 4, y: 2 },
        });
        label.setOrigin(0.5, 0.5);
        label.setDepth(runeY + 500);
        label.setVisible(false); // Hidden until puzzle is activated
        this.runeLabels.push(label);
      });

      // ── Full-Width Area 1 Exit Magical Barrier Coverage ─────────────────────
      const barX = 400;
      const barY = 855;

      this.barrierVisual = this.add.rectangle(barX, barY, 340, 48, 0x00e5ff, 0.45);
      this.barrierVisual.setDepth(barY);

      this.barrierTween = this.tweens.add({
        targets:  this.barrierVisual,
        alpha:    { from: 0.35, to: 0.70 },
        duration: 1200,
        yoyo:     true,
        repeat:   -1,
        ease:     "Sine.easeInOut",
      });

      // Solid physics body blocking 100% of Area 1 exit corridor
      this.barrierBody = this.add.rectangle(barX, barY, 340, 48, 0x000000, 0);
      this.physics.add.existing(this.barrierBody, true);
      this.barrierCollider = this.physics.add.collider(this.player, this.barrierBody);

      // If already solved, remove barrier immediately
      if (this.quest1State.solved) {
        if (this.barrierVisual) this.barrierVisual.setVisible(false);
        if (this.barrierCollider) this.physics.world.removeCollider(this.barrierCollider);
        if (this.barrierBody) this.barrierBody.destroy();
      }

      // ── Dialogue UI & Interactive Overlay System ───────────────────────────
      this.createDialogueUI();

      // ── Input Controls ──────────────────────────────────────────────────────
      this.cursors  = this.input.keyboard.createCursorKeys();
      this.wasd     = this.input.keyboard.addKeys({
        up:    Phaser.Input.Keyboard.KeyCodes.W,
        down:  Phaser.Input.Keyboard.KeyCodes.S,
        left:  Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.eKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

      this.lastFacing  = "down";
      this.currentAnim = null;

      // ── Physics World Bounds & Camera Setup ─────────────────────────────────
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.setZoom(1.23);
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

      // ── Trigger Original Plains Introductory Title Card Event ───────────────
      if (!this.hasSeenPlainsIntro) {
        this.hasSeenPlainsIntro = true;
        this.showPlainsTitleCard();
      }

      // Sync labels & HUD card state
      this.updateRuneLabels();

      // Listen for code-trial-passed event from React overlay
      const handleCodeTrialPassed = ({ challengeId } = {}) => {
        if (challengeId === "two-pointers" && !this.quest1State?.solved) {
          this.handleCodeTrialSuccess();
        }
      };
      gameEvents.on("code-trial-passed", handleCodeTrialPassed);

      const handleReactCloseCodeTrial = () => {
        // React overlay closed
      };
      gameEvents.on("close-code-trial", handleReactCloseCodeTrial);

      this.events.once("shutdown", () => {
        gameEvents.off("code-trial-passed", handleCodeTrialPassed);
        gameEvents.off("close-code-trial", handleReactCloseCodeTrial);
      });

      window.dispatchEvent(new CustomEvent("algoverse:plains-arrived"));
      this.triggerAutosave();
    } catch (error) {
      console.error("[PLAINS FATAL ERROR]", error, error?.stack);
    }
  }

  // ─── Original Plains Location Title Card Intro Event ───────────────────────
  showPlainsTitleCard() {
    const { width, height } = this.scale;

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
    titleText.setDepth(4000);
    titleText.setAlpha(0);

    const subtitleText = this.add.text(width / 2, height / 2 + 16, "an ancient expanse beyond the Gate", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#a09060",
    });
    subtitleText.setOrigin(0.5, 0.5);
    subtitleText.setScrollFactor(0);
    subtitleText.setDepth(4000);
    subtitleText.setAlpha(0);

    this.tweens.add({
      targets: [titleText, subtitleText],
      alpha: 1,
      duration: 800,
      ease: "Power2",
      onComplete: () => {
        this.time.delayedCall(2200, () => {
          this.tweens.add({
            targets: [titleText, subtitleText],
            alpha: 0,
            duration: 800,
            ease: "Power2",
            onComplete: () => {
              titleText.destroy();
              subtitleText.destroy();
            },
          });
        });
      },
    });
  }

  createDialogueUI() {
    const { width: camW, height: camH } = this.scale;
    const boxW = Math.min(640, camW - 40);
    const boxH = 125;
    const boxX = (camW - boxW) / 2;
    const boxY = camH - boxH - 45;

    this.dialogueBoxGraphics = this.add.graphics();
    this.dialogueBoxGraphics.fillStyle(0x0d0f17, 0.92);
    this.dialogueBoxGraphics.fillRoundedRect(boxX, boxY, boxW, boxH, 8);
    this.dialogueBoxGraphics.lineStyle(2, 0x00e5ff, 0.7);
    this.dialogueBoxGraphics.strokeRoundedRect(boxX, boxY, boxW, boxH, 8);
    this.dialogueBoxGraphics.setScrollFactor(0);
    this.dialogueBoxGraphics.setDepth(2000);
    this.dialogueBoxGraphics.setVisible(false);

    this.dialogueSpeakerUI = this.add.text(boxX + 16, boxY + 10, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "11px",
      color: "#f0e0a0",
    });
    this.dialogueSpeakerUI.setScrollFactor(0);
    this.dialogueSpeakerUI.setDepth(2001);
    this.dialogueSpeakerUI.setVisible(false);

    this.dialogueTextUI = this.add.text(boxX + 16, boxY + 32, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#e8dfc4",
      wordWrap: { width: boxW - 32 },
      lineSpacing: 4,
    });
    this.dialogueTextUI.setScrollFactor(0);
    this.dialogueTextUI.setDepth(2001);
    this.dialogueTextUI.setVisible(false);

    this.dialogueIndicatorUI = this.add.text(boxX + boxW - 240, boxY + boxH - 16, "ENTER  Continue        SPACE  Skip", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#00e5ff",
    });
    this.dialogueIndicatorUI.setScrollFactor(0);
    this.dialogueIndicatorUI.setDepth(2001);
    this.dialogueIndicatorUI.setVisible(false);

    this.promptTextUI = this.add.text(camW / 2, camH - 120, "[E] Inspect the strange barrier", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#00e5ff",
      backgroundColor: "#0d0f17dd",
      padding: { x: 14, y: 8 },
    });
    this.promptTextUI.setOrigin(0.5, 0.5);
    this.promptTextUI.setScrollFactor(0);
    this.promptTextUI.setDepth(3000);
    this.promptTextUI.setVisible(false);

    // ── 1. Stone Platform HUD Panel: Required Frequency ──────────────────────
    this.objectiveCardUI = this.add.text(437, 270, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#00e5ff",
      align: "center",
      backgroundColor: "#0d0f17ee",
      padding: { x: 12, y: 6 },
      shadow: { offsetX: 0, offsetY: 0, color: "#00e5ff60", blur: 10, fill: true },
    });
    this.objectiveCardUI.setOrigin(0.5, 0.5);
    this.objectiveCardUI.setDepth(5000);
    this.objectiveCardUI.setVisible(false);

    // ── 2. Stone Platform HUD Panel: Move & Activate Controls ────────────────
    this.controlsCardUI = this.add.text(437, 305, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#00e5ff",
      align: "center",
      backgroundColor: "#0d0f17ee",
      padding: { x: 10, y: 5 },
      shadow: { offsetX: 0, offsetY: 0, color: "#00e5ff40", blur: 8, fill: true },
    });
    this.controlsCardUI.setOrigin(0.5, 0.5);
    this.controlsCardUI.setDepth(5000);
    this.controlsCardUI.setVisible(false);
  }

  updateObjectiveCard() {
    if (!this.objectiveCardUI) return;

    if (!this.quest1PuzzleActive) {
      this.objectiveCardUI.setVisible(false);
      if (this.controlsCardUI) this.controlsCardUI.setVisible(false);
      return;
    }

    const centerX = this.quest1CenterObj ? this.quest1CenterObj.x : 437;
    const centerY = this.quest1CenterObj ? this.quest1CenterObj.y : 289;

    if (this.quest1State?.solved) {
      this.objectiveCardUI.setPosition(centerX, centerY);
      this.objectiveCardUI.setText("QUEST I — SOLVED: Path Open!");
      this.objectiveCardUI.setVisible(true);
      if (this.controlsCardUI) this.controlsCardUI.setVisible(false);
      return;
    }

    const { target } = this.quest1State;

    // Display Required Frequency on the upper portion of the stone structure
    this.objectiveCardUI.setPosition(centerX, centerY - 18);
    this.objectiveCardUI.setText(`REQUIRED FREQUENCY: ${target}`);
    this.objectiveCardUI.setVisible(true);

    // Display Controls on the lower portion of the stone structure
    if (this.controlsCardUI) {
      this.controlsCardUI.setPosition(centerX, centerY + 18);
      this.controlsCardUI.setText("[A/D] Move Left/Right    [ENTER] Activate");
      this.controlsCardUI.setVisible(true);
    }
  }

  updateRuneLabels() {
    if (!this.runeLabels || this.runeLabels.length === 0) return;

    if (!this.quest1PuzzleActive || !this.quest1State) {
      this.runeLabels.forEach((label) => label.setVisible(false));
      if (this.objectiveCardUI) this.objectiveCardUI.setVisible(false);
      if (this.controlsCardUI) this.controlsCardUI.setVisible(false);
      return;
    }

    const { frequencies, leftIndex, rightIndex, solved } = this.quest1State;

    this.runeLabels.forEach((label, idx) => {
      label.setVisible(true);
      if (solved) {
        label.setText(`${frequencies[idx]}`);
        label.setColor("#00ffcc");
        label.setBackgroundColor("#0d0f17ee");
      } else if (idx === leftIndex) {
        label.setText(`[L] ${frequencies[idx]}`);
        label.setColor("#00e5ff");
        label.setBackgroundColor("#003847ee");
      } else if (idx === rightIndex) {
        label.setText(`[R] ${frequencies[idx]}`);
        label.setColor("#f0e0a0");
        label.setBackgroundColor("#4a3800ee");
      } else {
        label.setText("?");
        label.setColor("#7090a0");
        label.setBackgroundColor("#0d0f17cc");
      }
    });

    this.updateObjectiveCard();
  }

  // ─── STEP 1: Inspect Barrier Handler ──────────────────────────────────────
  handleBarrierInspection() {
    if (this.hasInspectedBarrier || this.isEncounterActive) return;

    this.hasInspectedBarrier = true; // Set IMMEDIATELY so state persists!
    this.isEncounterActive    = true;
    this.activeDialogueType   = 'barrier';
    if (this.promptTextUI) this.promptTextUI.setVisible(false);

    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0);
    }

    this.startDialogue(BARRIER_INSPECTION_DIALOGUE, () => {
      this.activeDialogueType = null;
      this.isEncounterActive = false;
      this.triggerAutosave();
    });
  }

  // ─── STEP 2: Inspect Ruins Story Explanation Handler ──────────────────────
  handleQuest1Discovery() {
    if (!this.hasInspectedBarrier || this.quest1State?.discovered || this.isEncounterActive) return;

    this.isEncounterActive  = true;
    this.activeDialogueType = 'ruin';
    if (this.promptTextUI) this.promptTextUI.setVisible(false);

    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0);
    }

    this.cameras.main.flash(400, 0, 229, 255);

    this.startDialogue(DISCOVERY_DIALOGUE, () => {
      if (this.quest1State) {
        this.quest1State.discovered = true; // Story done — now show [E] Begin Trial prompt
      }
      this.activeDialogueType = null;
      this.quest1PuzzleActive = false; // Trial NOT yet active — player must press [E] again
      this.isEncounterActive   = false;

      this.updateRuneLabels();
      this.triggerAutosave();
    });
  }

  // ─── STEP 3: Begin Trial Handler (after ruin story, player presses [E]) ────
  handleBeginTrial() {
    if (this.quest1PuzzleActive || this.isEncounterActive || this.quest1State?.solved) return;
    if (!this.quest1State?.discovered) return;

    this.quest1PuzzleActive = true;
    this.cameras.main.flash(300, 0, 229, 255);
    this.updateRuneLabels();
    this.triggerAutosave();
  }

  // ─── Two-Pointer Navigation & Immediate Activation Handlers ──────────────
  moveLeftPointer() {
    if (this.isDialogueActive || this.isEncounterActive || this.quest1State?.solved) return;
    if (!this.quest1PuzzleActive) return;

    if (this.quest1State.leftIndex < this.quest1State.rightIndex - 1) {
      if (this.quest1State.movesRemaining > 0) {
        this.quest1State.leftIndex++;
        this.quest1State.movesRemaining--;
        this.updateRuneLabels();
      } else {
        this.triggerPuzzleFailure("OUT OF MOVES — Pointer energy exhausted.");
      }
    }
  }

  moveRightPointer() {
    if (this.isDialogueActive || this.isEncounterActive || this.quest1State?.solved) return;
    if (!this.quest1PuzzleActive) return;

    if (this.quest1State.rightIndex > this.quest1State.leftIndex + 1) {
      if (this.quest1State.movesRemaining > 0) {
        this.quest1State.rightIndex--;
        this.quest1State.movesRemaining--;
        this.updateRuneLabels();
      } else {
        this.triggerPuzzleFailure("OUT OF MOVES — Pointer energy exhausted.");
      }
    }
  }

  // Direct One-Touch Activation on [ENTER] (No Modal Overlay Interception)
  confirmActivationAttempt() {
    if (this.isDialogueActive || this.isEncounterActive || this.quest1State?.solved) return;
    if (!this.quest1PuzzleActive) return;

    const { frequencies, leftIndex, rightIndex, target } = this.quest1State;
    const lVal = frequencies[leftIndex];
    const rVal = frequencies[rightIndex];
    const currentSum = lVal + rVal;

    if (currentSum === target) {
      this.handlePuzzleSuccess();
    } else {
      const hint = currentSum < target
        ? "RESONANCE TOO WEAK — Abandon the lesser frequency and move inward."
        : "RESONANCE TOO STRONG — Abandon the greater frequency and move inward.";
      this.triggerPuzzleFailure(hint);
    }
  }

  handlePuzzleSuccess() {
    this.physicalPuzzleSolved = true;
    this.quest1PuzzleActive   = false;
    this.updateRuneLabels();

    // Visual resonance pulse from runes to obelisks
    this.cameras.main.flash(500, 0, 229, 255);
    this.runeSprites.forEach((stone) => {
      this.tweens.add({
        targets: stone,
        scale: 0.12,
        duration: 400,
        yoyo: true,
        repeat: 2,
      });
    });

    this.obelisks.forEach((ob) => {
      this.tweens.add({
        targets: ob,
        alpha: { from: 0.4, to: 1.0 },
        duration: 300,
        yoyo: true,
        repeat: 4,
      });
    });

    // Play dialogue acknowledging physical success, then open Code Trial terminal
    this.startDialogue(PHYSICAL_SUCCESS_DIALOGUE, () => {
      gameEvents.emit("open-code-trial", { challengeId: "two-pointers" });
    });
  }

  handleCodeTrialSuccess() {
    if (this.quest1State?.solved) return;
    this.quest1State.solved = true;
    this.quest1PuzzleActive = false;
    this.updateRuneLabels();

    // Close code trial overlay
    this.time.delayedCall(800, () => {
      gameEvents.emit("close-code-trial");
      gameEvents.emit("progression-update", {
        quest1Solved: true,
        twoPointersUnlocked: true,
        gateUnlocked: true,
      });

      // Visual fade effect on Area 1 Exit Barrier
      if (this.barrierVisual) {
        this.tweens.add({
          targets: this.barrierVisual,
          alpha: 0,
          duration: 800,
          onComplete: () => {
            if (this.barrierVisual) this.barrierVisual.destroy();
          },
        });
      }
      if (this.barrierCollider) {
        this.physics.world.removeCollider(this.barrierCollider);
      }
      if (this.barrierBody) {
        this.barrierBody.destroy();
      }

      // Play final short Grandmaster dialogue acknowledging completion
      this.time.delayedCall(600, () => {
        this.startDialogue(CODE_SUCCESS_DIALOGUE, () => {
          this.triggerAutosave();
        });
      });
    });
  }

  triggerPuzzleFailure(reasonMessage) {
    this.cameras.main.flash(400, 255, 60, 60);

    const hintDialogue = [
      { speaker: "Grandmaster", text: reasonMessage },
      { speaker: "Grandmaster", text: "The stones are resetting. Listen closely to the resonance." },
    ];

    this.startDialogue(hintDialogue, () => {
      // Regenerate fresh puzzle trial
      const newPuzzle = generateQuest1Data();
      newPuzzle.discovered = true;
      this.quest1State = newPuzzle;
      this.quest1PuzzleActive = true;
      this.updateRuneLabels();
      this.triggerAutosave();
    });
  }

  // ─── Dialogue System ───────────────────────────────────────────────────────
  startDialogue(entries, onComplete = null) {
    if (!entries || entries.length === 0) return;

    this.isDialogueActive     = true;
    this.currentDialogue      = entries;
    this.currentDialogueIdx   = 0;
    this.onDialogueEnd        = onComplete;

    this.dialogueBoxGraphics.setVisible(true);
    this.dialogueSpeakerUI.setVisible(true);
    this.dialogueTextUI.setVisible(true);
    this.dialogueIndicatorUI.setVisible(true);

    this.displayDialogueEntry();
  }

  displayDialogueEntry() {
    const entry = this.currentDialogue[this.currentDialogueIdx];
    if (!entry) return;

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    const speakerName = entry.speaker.toUpperCase();
    this.dialogueSpeakerUI.setText(speakerName);

    if (speakerName === "GRANDMASTER") {
      this.dialogueSpeakerUI.setColor("#f0e0a0");
    } else {
      this.dialogueSpeakerUI.setColor("#00e5ff");
    }

    this.typewriterFullText = entry.text;
    this.isTypewriterDone   = false;
    this.dialogueTextUI.setText("");

    let charIdx = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: TYPEWRITER_SPEED,
      repeat: this.typewriterFullText.length - 1,
      callback: () => {
        charIdx++;
        this.dialogueTextUI.setText(this.typewriterFullText.substring(0, charIdx));
        if (charIdx >= this.typewriterFullText.length) {
          this.isTypewriterDone = true;
          this.typewriterTimer  = null;
        }
      },
    });
  }

  advanceDialogue() {
    if (!this.isDialogueActive) return;

    if (!this.isTypewriterDone) {
      if (this.typewriterTimer) {
        this.typewriterTimer.remove();
        this.typewriterTimer = null;
      }
      this.dialogueTextUI.setText(this.typewriterFullText);
      this.isTypewriterDone = true;
      return;
    }

    this.currentDialogueIdx++;
    if (this.currentDialogueIdx < this.currentDialogue.length) {
      this.displayDialogueEntry();
    } else {
      this.closeDialogue();
    }
  }

  skipDialogue() {
    if (!this.isDialogueActive && !this.isEncounterActive) return;

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    this.tweens.killTweensOf(this.cameras.main);
    if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    }

    // Advance ONLY the flag for whichever dialogue is currently playing
    const dtype = this.activeDialogueType;
    this.activeDialogueType = null;

    if (dtype === 'barrier') {
      // Skipped barrier dialogue — mark barrier done only
      this.hasInspectedBarrier = true;
    } else if (dtype === 'ruin') {
      // Skipped ruin discovery dialogue — mark discovered, NOT puzzle active
      if (this.quest1State) this.quest1State.discovered = true;
      this.quest1PuzzleActive = false; // Player must still press [E] Begin Trial
    }
    // For any other dialogue (intro, etc.) skip does nothing to quest flags

    this.isEncounterActive = false;
    this.closeDialogue();
    this.updateRuneLabels();
    this.triggerAutosave();
  }

  closeDialogue() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    this.isDialogueActive     = false;
    this.currentDialogue      = [];
    this.currentDialogueIdx   = 0;

    this.dialogueBoxGraphics.setVisible(false);
    this.dialogueSpeakerUI.setVisible(false);
    this.dialogueTextUI.setVisible(false);
    this.dialogueIndicatorUI.setVisible(false);

    if (typeof this.onDialogueEnd === "function") {
      const callback = this.onDialogueEnd;
      this.onDialogueEnd = null;
      callback();
    }
  }

  triggerAutosave() {
    const pX = this.player && this.player.body ? this.player.body.center.x : (this.player ? this.player.x : null);
    const pY = this.player && this.player.body ? this.player.body.center.y : (this.player ? this.player.y : null);

    gameEvents.emit("autosave", {
      progression: {
        hasTriggeredSealedGate:       true,
        hasCompletedGrandmasterIntro: true,
        hasCompletedBriefing:         true,
        binaryPhysicalTrialCompleted: true,
        binaryCodeTrialCompleted:     true,
        grandmasterPostTrialDone:     true,
        gateUnlocked:                 true,
        plainsDiscovered:             true,
        hasSeenPlainsIntro:           !!this.hasSeenPlainsIntro,
        hasInspectedBarrier:          !!this.hasInspectedBarrier,
        quest1Discovered:             !!this.quest1State?.discovered,
        quest1PuzzleActive:           !!this.quest1PuzzleActive,
        quest1Solved:                 !!this.quest1State?.solved,
        quest1Data:                   this.quest1State || null,
      },
      world: {
        scene: "PlainsOfOriginsScene",
        player: { x: pX, y: pY },
      },
    });
  }

  update() {
    // Dialogue Controls
    if (this.isDialogueActive || this.isEncounterActive) {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.advanceDialogue();
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.skipDialogue();
        return;
      }
    }

    const { player, cursors, wasd } = this;
    if (!player) return;

    // Freeze player movement during dialogue
    if (this.isEncounterActive || this.isDialogueActive) {
      if (player.body) player.body.setVelocity(0, 0);
      if (this.currentAnim) {
        player.anims.stop();
        player.setTexture(this.idleTexture[this.lastFacing]);
        this.currentAnim = null;
      }
      return;
    }

    // ── Interactive Proximity Check for Barrier / Quest 1 Discovery ────────────
    const pFeetX = player.body ? player.body.center.x : player.x;
    const pFeetY = player.body ? player.body.bottom : player.y;

    // Focused barrier inspection range (~75px)
    const barX = this.area1ExitObj ? this.area1ExitObj.x : 400;
    const barY = this.area1ExitObj ? this.area1ExitObj.y : 855;
    const distToBarrier = Phaser.Math.Distance.Between(pFeetX, pFeetY, barX, barY);
    const inBarrierRange = distToBarrier <= 75 || (Math.abs(pFeetY - barY) <= 50 && Math.abs(pFeetX - barX) <= 120);

    // Ruins platform range (~160px)
    const centerX  = this.quest1CenterObj ? this.quest1CenterObj.x : 437;
    const centerY  = this.quest1CenterObj ? this.quest1CenterObj.y : 289;
    const triggerX = this.quest1TriggerObj ? this.quest1TriggerObj.x : 442;
    const triggerY = this.quest1TriggerObj ? this.quest1TriggerObj.y : 461;

    const distToCenter  = Phaser.Math.Distance.Between(pFeetX, pFeetY, centerX, centerY);
    const distToTrigger = Phaser.Math.Distance.Between(pFeetX, pFeetY, triggerX, triggerY);
    const inRuinRange   = distToCenter <= 220 || distToTrigger <= 220 || (pFeetX >= 280 && pFeetX <= 600 && pFeetY >= 160 && pFeetY <= 520);

    if (!this.hasInspectedBarrier) {
      // ── STEP 1: Walk to barrier → [E] Inspect the strange barrier ────────────
      if (inBarrierRange) {
        if (this.promptTextUI) {
          this.promptTextUI.setText("[E] Inspect the strange barrier");
          this.promptTextUI.setVisible(true);
        }
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
          if (this.promptTextUI) this.promptTextUI.setVisible(false);
          this.handleBarrierInspection();
          return;
        }
      } else {
        if (this.promptTextUI) this.promptTextUI.setVisible(false);
      }

    } else if (this.hasInspectedBarrier && !this.quest1State?.discovered && !this.quest1State?.solved) {
      // ── STEP 2: Walk to ruins → [E] Inspect the strange ruin → story plays ───
      if (inRuinRange) {
        if (this.promptTextUI) {
          this.promptTextUI.setText("[E] Inspect the strange ruin");
          this.promptTextUI.setVisible(true);
        }
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
          if (this.promptTextUI) this.promptTextUI.setVisible(false);
          this.handleQuest1Discovery();
          return;
        }
      } else {
        if (this.promptTextUI) this.promptTextUI.setVisible(false);
      }

    } else if (this.hasInspectedBarrier && this.quest1State?.discovered && !this.quest1PuzzleActive && !this.quest1State?.solved) {
      if (this.physicalPuzzleSolved) {
        // Physical puzzle solved → [E] Open Two Pointer Code Terminal
        if (inRuinRange) {
          if (this.promptTextUI) {
            this.promptTextUI.setText("[E] Open Two Pointer Code Terminal");
            this.promptTextUI.setVisible(true);
          }
          if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (this.promptTextUI) this.promptTextUI.setVisible(false);
            gameEvents.emit("open-code-trial", { challengeId: "two-pointers" });
            return;
          }
        } else {
          if (this.promptTextUI) this.promptTextUI.setVisible(false);
        }
      } else {
        // ── STEP 3: Ruin story done → [E] Begin Soul-Bind Trial ──────────────────
        if (inRuinRange) {
          if (this.promptTextUI) {
            this.promptTextUI.setText("[E] Begin Soul-Bind Trial");
            this.promptTextUI.setVisible(true);
          }
          if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (this.promptTextUI) this.promptTextUI.setVisible(false);
            this.handleBeginTrial();
            return;
          }
        } else {
          if (this.promptTextUI) this.promptTextUI.setVisible(false);
        }
      }

    } else if (this.quest1PuzzleActive && !this.quest1State?.solved) {
      // ── STEP 4: Trial active — controls live (HUD shows top target + bottom controls) ─
      if (this.promptTextUI) this.promptTextUI.setVisible(false);
      this.updateObjectiveCard();
      this.updateRuneLabels();

      if (Phaser.Input.Keyboard.JustDown(wasd.left) || Phaser.Input.Keyboard.JustDown(cursors.left)) {
        this.moveLeftPointer();
      } else if (Phaser.Input.Keyboard.JustDown(wasd.right) || Phaser.Input.Keyboard.JustDown(cursors.right)) {
        this.moveRightPointer();
      } else if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.eKey)) {
        this.confirmActivationAttempt();
        return;
      }
    } else {
      if (this.promptTextUI) this.promptTextUI.setVisible(false);
    }

    // Dynamic depth sorting based on feet position
    if (player.body) {
      player.setDepth(player.body.center.y);
    } else {
      player.y;
    }

    // Movement controls
    const movingUp    = cursors.up.isDown    || wasd.up.isDown;
    const movingDown  = cursors.down.isDown  || wasd.down.isDown;
    const movingLeft  = cursors.left.isDown  || wasd.left.isDown;
    const movingRight = cursors.right.isDown || wasd.right.isDown;

    let vx = 0;
    let vy = 0;
    if (movingLeft)  vx -= 1;
    if (movingRight) vx += 1;
    if (movingUp)    vy -= 1;
    if (movingDown)  vy += 1;

    const isMoving = vx !== 0 || vy !== 0;

    if (vx !== 0 && vy !== 0) {
      const INV_SQRT2 = 0.7071067811865476;
      vx *= INV_SQRT2;
      vy *= INV_SQRT2;
    }

    player.body.setVelocity(vx * MOVE_SPEED, vy * MOVE_SPEED);

    if (isMoving) {
      if (vy < 0)      this.lastFacing = "up";
      else if (vy > 0) this.lastFacing = "down";
      else if (vx < 0) this.lastFacing = "left";
      else             this.lastFacing = "right";
    } else {
      player.body.setVelocity(0, 0);
    }

    const targetAnim = isMoving ? ANIM_KEYS[this.lastFacing] : null;

    if (targetAnim !== this.currentAnim) {
      if (targetAnim) {
        player.anims.play(targetAnim);
      } else {
        player.anims.stop();
        player.setTexture(this.idleTexture[this.lastFacing]);
      }
      this.currentAnim = targetAnim;
    }
  }
}
