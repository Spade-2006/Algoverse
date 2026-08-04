import Phaser from "phaser";
import playerSpritesheet      from "../../../../assets/sprites/player/player-spritesheet.png";
import grandmasterImage       from "../../../../assets/characters/grandmaster/grandmaster-idle.png";
import binaryRuneImage        from "../../../../assets/trials/binary-search/binary-rune.png";
import dungeonMapJson         from "../../../../assets/maps/dungeon/maps/dungeon-01.json";
import tilesetMain            from "../../../../assets/maps/dungeon/tilesets/Tiny Top Down 32x32.png";
import tilesetDecor           from "../../../../assets/maps/dungeon/tilesets/dungoen_tileset_png.png";
import { gameEvents }         from "../events/gameEvents";

// ─── Verified directional row mapping (1024×1536, 3 cols × 4 rows, 341×384) ──
const DIRECTIONS = {
  down:  { frameSeq: [1, 0, 1, 2] },
  up:    { frameSeq: [4, 3, 4, 5] },
  right: { frameSeq: [7, 6, 7, 8] },
  left:  { frameSeq: [10, 9, 10, 11] },
};

const ANIM_KEYS = {
  down:  "walk-down",
  up:    "walk-up",
  right: "walk-right",
  left:  "walk-left",
};

// ─── Tunable constants ────────────────────────────────────────────────────────
const MOVE_SPEED = 160;   // pixels/second at rendered scale
const WALK_FPS   = 6;     // animation frames per second

// ─── Sprite-sheet geometry (must match preload) ───────────────────────────────
const FRAME_W         = 341;
const FRAME_H         = 384;
const ALPHA_THRESHOLD = 10;

// ─── Normalised canvas dimensions ────────────────────────────────────────────
const NORM_W = 200;
const NORM_H = 400;

// ─── Player physics body size ─────────────────────────────────────────────────
const BODY_W = 20;  // physics body width (px at world scale)
const BODY_H = 14;  // physics body height — just the feet

// ─── Tileset names — MUST match `name` attribute in the TSX / JSON ────────────
const TS_MAIN  = "Tiny Top Down Tiles";
const TS_DECOR = "decorations";

// ─── Tiled layer names — exact case from the TMX ─────────────────────────────
const LAYER_FLOOR  = "floor";
const LAYER_WALLS  = "walls";
const LAYER_DECOR  = "decorations";
const LAYER_OBJ    = "objects";

// ─── Interaction defaults ────────────────────────────────────────────────────
const INTERACTION_RADIUS = 48; // proximity radius in pixels around object

// ─── Sealed Door Story Dialogue ──────────────────────────────────────────────
const DOOR_STORY_DIALOGUE = [
  { speaker: "???",    text: "You expected it to open?" },
  { speaker: "Player", text: "Who said that?" },
];

// ─── Grandmaster Dialogue Data ───────────────────────────────────────────────
const GRANDMASTER_INTRO_DIALOGUE = [
  { speaker: "Grandmaster", text: "Interesting." },
  { speaker: "Player",      text: "What's interesting?" },
  { speaker: "Grandmaster", text: "You survived the fall." },
  { speaker: "Player",      text: "What fall? Where am I?" },
  { speaker: "Grandmaster", text: "You remember nothing?" },
  { speaker: "Player",      text: "I remember waking up here. That's about it." },
  { speaker: "Grandmaster", text: "Then perhaps that's a mercy." },
  { speaker: "Player",      text: "Can you stop speaking in riddles and tell me how to open this gate?" },
  { speaker: "Grandmaster", text: "I cannot." },
  { speaker: "Player",      text: "Great." },
  { speaker: "Grandmaster", text: "But you can." },
  { speaker: "Player",      text: "How?" },
  { speaker: "Grandmaster", text: "This place was not built to keep you imprisoned." },
  { speaker: "Grandmaster", text: "It was built to decide whether you should be allowed to continue." },
  { speaker: "Player",      text: "Continue to where?" },
  { speaker: "Grandmaster", text: "To the realms beyond these walls." },
  { speaker: "Player",      text: "And what's waiting there?" },
  { speaker: "Grandmaster", text: "Answers." },
  { speaker: "Player",      text: "To what?" },
  { speaker: "Grandmaster", text: "Why you were brought here." },
  { speaker: "Grandmaster", text: "And why AlgoVerse is dying." },
  { speaker: "Player",      text: "...Dying?" },
  { speaker: "Grandmaster", text: "Open the first gate." },
  { speaker: "Grandmaster", text: "Then I'll know whether you're worth telling the rest." },
];

const GRANDMASTER_BRIEFING_DIALOGUE = [
  { speaker: "Grandmaster", text: "The gate before you has no key." },
  { speaker: "Player",      text: "Of course it doesn't." },
  { speaker: "Grandmaster", text: "It has something better." },
  { speaker: "Player",      text: "Which is?" },
  { speaker: "Grandmaster", text: "A choice." },
  { speaker: "Grandmaster", text: "Fifteen stones lie before the gate." },
  { speaker: "Grandmaster", text: "Hidden within one of them is the trigger that breaks its seal." },
  { speaker: "Player",      text: "So I check all fifteen." },
  { speaker: "Grandmaster", text: "No." },
  { speaker: "Grandmaster", text: "The gate will permit only four activations." },
  { speaker: "Player",      text: "Four... out of fifteen?" },
  { speaker: "Grandmaster", text: "Precisely." },
  { speaker: "Player",      text: "And I'm supposed to guess?" },
  { speaker: "Grandmaster", text: "If you rely on guessing, you will fail." },
  { speaker: "Grandmaster", text: "I know the mark carved upon the stone that holds the trigger." },
  { speaker: "Grandmaster", text: "When the trial begins, I will give you that mark." },
  { speaker: "Player",      text: "And the rest?" },
  { speaker: "Grandmaster", text: "Observe." },
  { speaker: "Grandmaster", text: "Think." },
  { speaker: "Grandmaster", text: "Choose." },
  { speaker: "Grandmaster", text: "Approach the stones when you are ready." },
];

// ─── Grandmaster Post-Code-Trial Dialogue ────────────────────────────────────
const GRANDMASTER_POST_CODE_TRIAL_DIALOGUE = [
  { speaker: "Grandmaster", text: "The trial has judged your code worthy." },
  { speaker: "Player",      text: "That's... it? It actually worked." },
  { speaker: "Grandmaster", text: "The gate recognizes you now." },
  { speaker: "Player",      text: "Then it'll open?" },
  { speaker: "Grandmaster", text: "Beyond it lie the Plains of Origins." },
  { speaker: "Grandmaster", text: "An ancient expanse untouched by those who came before you." },
  { speaker: "Grandmaster", text: "Go. The path beyond the Gate is yours." },
];

const POST_TRIAL_DIALOGUE = [
  { speaker: "Player",      text: "Found it." },
  { speaker: "Grandmaster", text: "You did." },
  { speaker: "Player",      text: "Four chances for fifteen stones... that wasn't exactly fair." },
  { speaker: "Grandmaster", text: "Yet you found it." },
  { speaker: "Player",      text: "Because the marks had an order." },
  { speaker: "Grandmaster", text: "And once you understood that?" },
  { speaker: "Player",      text: "I didn't need to search everything." },
  { speaker: "Grandmaster", text: "Exactly." },
  { speaker: "Grandmaster", text: "You divided what remained... again and again." },
  { speaker: "Grandmaster", text: "Until there was nowhere left for the answer to hide." },
  { speaker: "Player",      text: "So that's what this place wanted me to understand?" },
  { speaker: "Grandmaster", text: "Understand?" },
  { speaker: "Grandmaster", text: "No." },
  { speaker: "Grandmaster", text: "Understanding is only half the trial." },
  { speaker: "Player",      text: "I knew there'd be another catch." },
  { speaker: "Grandmaster", text: "You discovered the path." },
  { speaker: "Grandmaster", text: "Now build it." },
  { speaker: "Player",      text: "Build what?" },
  { speaker: "Grandmaster", text: "The method you just used." },
  { speaker: "Grandmaster", text: "Others once called it Binary Search." },
  { speaker: "Player",      text: "And if I can recreate it?" },
  { speaker: "Grandmaster", text: "Then the gate will have no reason to remain closed." },
];

// ─── Helper: tight bounding box from spritesheet frame ───────────────────────
function getFrameBounds(scene, frameIndex) {
  const texture = scene.textures.get("player");
  const frame   = texture.frames[frameIndex];

  const tmp = document.createElement("canvas");
  tmp.width  = FRAME_W;
  tmp.height = FRAME_H;
  const ctx  = tmp.getContext("2d");

  ctx.drawImage(
    texture.getSourceImage(),
    frame.cutX, frame.cutY,
    FRAME_W, FRAME_H,
    0, 0,
    FRAME_W, FRAME_H,
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

  return { minX, maxX, minY, maxY };
}

// ─── Helper: build normalised bottom-centred canvas for one frame ─────────────
function makeNormalisedCanvas(scene, frameIndex) {
  const texture = scene.textures.get("player");
  const frame   = texture.frames[frameIndex];
  const src     = texture.getSourceImage();

  const { minX, maxX, minY, maxY } = getFrameBounds(scene, frameIndex);
  const visW = maxX - minX + 1;
  const visH = maxY - minY + 1;

  const destX = Math.floor((NORM_W - visW) / 2);
  const destY = NORM_H - visH;

  const canvas = document.createElement("canvas");
  canvas.width  = NORM_W;
  canvas.height = NORM_H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    src,
    frame.cutX + minX,
    frame.cutY  + minY,
    visW, visH,
    destX, destY,
    visW, visH,
  );

  return canvas;
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super({ key: "DungeonScene" });

    this.player      = null;
    this.cursors     = null;
    this.wasd        = null;
    this.lastFacing  = "down";
    this.currentAnim = null;
    this.normTextures = {};
    this.idleTexture  = {};

    // Walls static layer — used for arcade collision
    this.wallsLayer   = null;

    // DungeonExit world position
    this.dungeonExit  = null;

    // ── Interaction System v1 State ─────────────────────────────────────────
    this.interactables      = [];
    this.activeInteractable = null;
    this.promptTextUI       = null;
    this.messageTextUI      = null;
    this.messageTimer       = null;

    // ── Story Event State ───────────────────────────────────────────────────
    this.hasTriggeredSealedGate       = false;
    this.grandmasterSpawned           = false;
    this.grandmasterSpawn             = null;
    this.grandmaster                  = null;
    this.hasCompletedGrandmasterIntro = false;
    this.hasCompletedBriefing         = false;

    // ── Trial 01 & Code Trial State ─────────────────────────────────────────
    this.stonesSpawned                 = false;
    this.binaryTrialReady              = false;
    this.trialActive                   = false;
    this.trialSuccess                  = false;
    this.binaryPhysicalTrialCompleted = false;
    this.binaryCodeTrialReady          = false;
    this.isCodeTrialOpen               = false;

    // ── Post-Code-Trial Progression State ───────────────────────────────────
    this.binaryCodeTrialCompleted      = false;
    this.grandmasterPostTrialDone      = false;
    this.gateUnlocked                  = false;
    this.plainsDiscovered              = false;
    this.isTransitioningToPlains       = false;

    // Gate trigger zone (from DungeonExit object on map)
    this.gateTriggerActive             = false;

    this.targetValue          = null;
    this.activationsRemaining = 4;
    this.trialSlots           = [];

    // Trial HUD UI elements
    this.trialHUDPanel           = null;
    this.trialHUDTargetText      = null;
    this.trialHUDActivationsText = null;

    // Code Trial Prompt UI elements
    this.codeTrialPromptGraphics = null;
    this.codeTrialPromptTitle    = null;
    this.codeTrialPromptSub      = null;
    this.codeTrialPromptKey      = null;

    // ── Dialogue System v1 State ────────────────────────────────────────────
    this.isDialogueActive                    = false;
    this.currentDialogue                     = [];
    this.currentDialogueIndex                = 0;
    this.isGrandmasterIntroConversation      = false;
    this.isBriefingConversation              = false;
    this.isPostTrialConversation             = false;
    this.isDoorStoryConversation             = false;
    this.isPostCodeTrialConversation         = false;

    this.dialogueBoxGraphics  = null;
    this.dialogueSpeakerUI    = null;
    this.dialogueTextUI       = null;
    this.dialogueIndicatorUI  = null;

    // ── Save State Data (set via init(data)) ─────────────────────────────────
    this.initSaveData = null;
  }

  init(data) {
    if (data && data.initialSaveData) {
      this.initSaveData = data.initialSaveData;
    }
  }

  preload() {
    // ── Player spritesheet ──────────────────────────────────────────────────
    this.load.spritesheet("player", playerSpritesheet, {
      frameWidth:  FRAME_W,
      frameHeight: FRAME_H,
    });

    // ── Grandmaster image (standalone texture) ──────────────────────────────
    this.load.image("grandmaster-idle", grandmasterImage);

    // ── Binary Rune Stone image (standalone texture) ────────────────────────
    this.load.image("binary-rune", binaryRuneImage);

    // ── Tilemap JSON ────────────────────────────────────────────────────────
    this.cache.tilemap.add("dungeon-01", {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data:   dungeonMapJson,
    });

    // ── Tileset images ──────────────────────────────────────────────────────
    this.load.image(TS_MAIN,  tilesetMain);
    this.load.image(TS_DECOR, tilesetDecor);
  }

  create() {
    // Reset story & trial state on scene create
    this.hasTriggeredSealedGate       = false;
    this.grandmasterSpawned           = false;
    this.grandmasterSpawn             = null;
    this.grandmaster                  = null;
    this.hasCompletedGrandmasterIntro = false;
    this.hasCompletedBriefing         = false;

    this.stonesSpawned                 = false;
    this.binaryTrialReady              = false;
    this.trialActive                   = false;
    this.trialSuccess                  = false;
    this.binaryPhysicalTrialCompleted = false;
    this.binaryCodeTrialReady          = false;
    this.isCodeTrialOpen               = false;
    this.binaryCodeTrialCompleted      = false;
    this.grandmasterPostTrialDone      = false;
    this.gateUnlocked                  = false;
    this.plainsDiscovered              = false;
    this.isTransitioningToPlains       = false;
    this.gateTriggerActive             = false;

    this.targetValue          = null;
    this.activationsRemaining = 4;
    this.trialSlots           = [];

    // Reset dialogue state
    this.isDialogueActive                    = false;
    this.currentDialogue                     = [];
    this.currentDialogueIndex                = 0;
    this.isGrandmasterIntroConversation      = false;
    this.isBriefingConversation              = false;
    this.isPostTrialConversation             = false;
    this.isDoorStoryConversation             = false;
    this.isPostCodeTrialConversation         = false;

    // ── Normalised player frame textures ───────────────────────────────────
    Object.entries(DIRECTIONS).forEach(([dir, { frameSeq }]) => {
      const rawFrames = [...new Set(frameSeq)];

      rawFrames.forEach((phFrame) => {
        const key = `norm-${dir}-${phFrame}`;
        if (!this.textures.exists(key)) {
          this.textures.addCanvas(key, makeNormalisedCanvas(this, phFrame));
        }
      });

      this.normTextures[dir] = frameSeq.map((f) => `norm-${dir}-${f}`);
      this.idleTexture[dir]  = `norm-${dir}-${frameSeq[0]}`;
    });

    // ── Walk animations ─────────────────────────────────────────────────────
    Object.entries(DIRECTIONS).forEach(([dir, { frameSeq }]) => {
      this.anims.create({
        key:       ANIM_KEYS[dir],
        frames:    frameSeq.map((f) => ({ key: `norm-${dir}-${f}`, frame: 0 })),
        frameRate: WALK_FPS,
        repeat:    -1,
      });
    });

    // ── Tilemap ─────────────────────────────────────────────────────────────
    const map = this.make.tilemap({ key: "dungeon-01" });

    const tsMain  = map.addTilesetImage(TS_MAIN,  TS_MAIN);
    const tsDecor = map.addTilesetImage(TS_DECOR, TS_DECOR);

    const floorLayer = map.createLayer(LAYER_FLOOR, [tsMain, tsDecor], 0, 0);
    const decorLayer = map.createLayer(LAYER_DECOR, [tsDecor, tsMain], 0, 0);
    this.wallsLayer  = map.createLayer(LAYER_WALLS, [tsMain, tsDecor], 0, 0);

    this.wallsLayer.setCollisionByExclusion([-1, 0]);

    void floorLayer;
    void decorLayer;

    // ── Read object layer ───────────────────────────────────────────────────
    this.interactables = [];
    const objLayer = map.getObjectLayer(LAYER_OBJ);
    const objects  = objLayer ? objLayer.objects : [];

    let spawnX = map.widthInPixels  / 2;
    let spawnY = map.heightInPixels / 2;

    objects.forEach((obj) => {
      const typeMatches = obj.type === "PlayerSpawn" || obj.name === "PlayerSpawn";
      const exitMatches = obj.type === "DungeonExit" || obj.name === "DungeonExit";
      const gmMatches   = obj.type === "GrandmasterSpawn" || obj.name === "GrandmasterSpawn";

      if (typeMatches) {
        spawnX = obj.x;
        spawnY = obj.y;
      }
      if (exitMatches) {
        this.dungeonExit = { x: obj.x, y: obj.y };
        this.registerInteractable({
          id: "dungeon-exit",
          x: obj.x,
          y: obj.y,
          radius: INTERACTION_RADIUS,
          promptText: "[E] Interact",
          onInteract: () => {
            if (this.hasTriggeredSealedGate) {
              this.showMessage("The path ahead is sealed.");
              return;
            }

            this.hasTriggeredSealedGate = true;
            this.showMessage("The path ahead is sealed.");

            this.time.delayedCall(1200, () => {
              this.startDialogue(DOOR_STORY_DIALOGUE, { isDoorStory: true });
            });
          },
        });
      }
      if (gmMatches) {
        this.grandmasterSpawn = { x: obj.x, y: obj.y };
      }
    });

    // Parse BinarySlot01 ... BinarySlot15 coordinates ONLY (no sprites created yet)
    for (let i = 1; i <= 15; i++) {
      const slotNum  = i < 10 ? `0${i}` : `${i}`;
      const slotName = `BinarySlot${slotNum}`;
      const slotObj  = objects.find((o) => o.name === slotName || o.type === slotName);

      if (slotObj) {
        this.trialSlots.push({
          index: i - 1,
          id: `stone-${i - 1}`,
          x: slotObj.x,
          y: slotObj.y,
          value: null,
          isActivated: false,
          tempLabelTimer: null,
          worldLabelText: null,
          sprite: null,
        });
      }
    }

    if (!objects.find((o) => o.type === "PlayerSpawn" || o.name === "PlayerSpawn")) {
      console.warn("[DungeonScene] PlayerSpawn object not found — using map centre as fallback.");
    }

    // Restore player spawn coordinates from save if valid and within map boundaries
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

    // ── Physics world bounds ────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // ── Player (physics sprite) ─────────────────────────────────────────────
    this.player = this.physics.add.sprite(
      spawnX,
      spawnY,
      this.idleTexture.down,
    );
    this.player.setScale(0.25);

    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(BODY_W, BODY_H);

    const spriteH = NORM_H * 0.25;
    this.player.body.setOffset(
      (NORM_W - BODY_W)  / 2,
      (NORM_H - BODY_H)  - (spriteH * 0.05),
    );

    // ── Arcade collision — player vs walls ──────────────────────────────────
    this.physics.add.collider(this.player, this.wallsLayer);

    // ── Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor("#0d0f17");
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(2);

    // ── Movement Inputs ─────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();

    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Keydown-C: Code Trial Interaction
    this.input.keyboard.on("keydown-C", () => {
      if (this.binaryCodeTrialReady && !this.isDialogueActive && !this.isCodeTrialOpen) {
        this.openCodeTrialPlaceholder();
      }
    });

    // Event-driven listener for E key (world interaction / inspection ONLY)
    this.input.keyboard.on("keydown-E", () => {
      if (!this.isDialogueActive && !this.isCodeTrialOpen && this.activeInteractable && typeof this.activeInteractable.onInteract === "function") {
        this.activeInteractable.onInteract();
      }
    });

    // Event-driven listener for ENTER key (dialogue advance OR stone activation)
    this.input.keyboard.on("keydown-ENTER", (event) => {
      if (this.isDialogueActive) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        this.advanceDialogue();
      } else if (!this.isCodeTrialOpen && this.activeInteractable && this.activeInteractable.slotData) {
        const slot = this.activeInteractable.slotData;
        if (!slot.isActivated && !this.trialSuccess) {
          this.onActivateStone(slot);
        }
      }
    });

    // Event-driven listener for SPACE key (dialogue skip ONLY)
    this.input.keyboard.on("keydown-SPACE", (event) => {
      if (this.isDialogueActive) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        this.skipDialogue();
      }
    });

    // Event-driven listener for ESC key (close Code Trial overlay ONLY)
    // Note: ESC never skips dialogue or story content.
    this.input.keyboard.on("keydown-ESC", (event) => {
      if (this.isCodeTrialOpen) {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        this.closeCodeTrialPlaceholder();
      }
    });

    // Listen for close-code-trial event from React overlay
    const handleReactCloseCodeTrial = () => {
      this.closeCodeTrialPlaceholder();
    };
    gameEvents.on("close-code-trial", handleReactCloseCodeTrial);

    // Listen for code-trial-passed event from React overlay (ALL_PASSED)
    const handleCodeTrialPassed = ({ challengeId } = {}) => {
      if (challengeId === "binary-search" && !this.binaryCodeTrialCompleted) {
        this.binaryCodeTrialCompleted = true;
        this.triggerAutosave();

        // Close the overlay first (brief delay for the success banner to be seen)
        this.time.delayedCall(1200, () => {
          this.closeCodeTrialPlaceholder();
          gameEvents.emit("close-code-trial");
          // Emit progression state update so React can update Codex
          gameEvents.emit("progression-update", {
            binaryCodeTrialCompleted: true,
          });
          // Short pause then start Grandmaster post-trial dialogue
          this.time.delayedCall(800, () => {
            this.startGrandmasterPostTrialDialogue();
          });
        });
      }
    };
    gameEvents.on("code-trial-passed", handleCodeTrialPassed);

    // Listen for request-save event (from pause menu or React)
    const handleRequestSave = () => {
      this.triggerAutosave();
    };
    gameEvents.on("request-save", handleRequestSave);

    // Cleanup event listeners when scene shuts down
    this.events.once("shutdown", () => {
      gameEvents.off("close-code-trial", handleReactCloseCodeTrial);
      gameEvents.off("code-trial-passed", handleCodeTrialPassed);
      gameEvents.off("request-save", handleRequestSave);
      this.input.keyboard.off("keydown-C");
      this.input.keyboard.off("keydown-E");
      this.input.keyboard.off("keydown-ENTER");
      this.input.keyboard.off("keydown-SPACE");
      this.input.keyboard.off("keydown-ESC");
    });

    // ── Create UI Elements ───────────────────────────────────────────────────
    this.createInteractionUI();
    this.createDialogueUI();
    this.createTrialHUD();
    this.createCodeTrialUI();

    // ── Restore Game Progression State from Save Data ────────────────────────
    if (this.initSaveData?.progression) {
      const p = this.initSaveData.progression;
      this.hasTriggeredSealedGate       = !!p.hasTriggeredSealedGate;
      this.hasCompletedGrandmasterIntro = !!p.hasCompletedGrandmasterIntro;
      this.hasCompletedBriefing         = !!p.hasCompletedBriefing;
      this.binaryPhysicalTrialCompleted = !!p.binaryPhysicalTrialCompleted;
      this.binaryCodeTrialCompleted     = !!p.binaryCodeTrialCompleted;
      this.grandmasterPostTrialDone     = !!p.grandmasterPostTrialDone;
      this.gateUnlocked                 = !!p.gateUnlocked;
      this.plainsDiscovered             = !!p.plainsDiscovered;

      if (this.hasTriggeredSealedGate) {
        this.spawnGrandmaster();
      }

      if (this.hasCompletedBriefing) {
        this.spawnTrialStones();
        this.binaryTrialReady = true;
      }

      if (this.binaryPhysicalTrialCompleted) {
        this.trialSuccess = true;
        this.trialActive = false;
        this.binaryCodeTrialReady = true;
      }

      if (this.gateUnlocked) {
        this.unlockGate({ silent: true });
      }
    }
  }

  // ── Story Event: Grandmaster Spawning ─────────────────────────────────────

  spawnGrandmaster() {
    if (this.grandmasterSpawned) return;
    this.grandmasterSpawned = true;

    if (!this.grandmasterSpawn) {
      console.warn("[DungeonScene] GrandmasterSpawn coordinates not found on map.");
      return;
    }

    const gmX = this.grandmasterSpawn.x;
    const gmY = this.grandmasterSpawn.y + 20;

    this.grandmaster = this.physics.add.staticSprite(gmX, gmY, "grandmaster-idle");

    this.grandmaster.setScale(0.085);
    this.grandmaster.setOrigin(0.5, 0.78);

    this.grandmaster.body.setSize(612, 518);
    this.grandmaster.body.setOffset(206, 681);

    this.grandmaster.refreshBody();

    this.physics.add.collider(this.player, this.grandmaster);

    this.grandmaster.setAlpha(0);
    this.tweens.add({
      targets:  this.grandmaster,
      alpha:    1,
      duration: 500,
      ease:     "Power1",
    });

    this.registerInteractable({
      id: "grandmaster",
      x: gmX,
      y: gmY,
      radius: 60,
      promptText: "[E] Talk",
      onInteract: () => {
        if (this.grandmasterPostTrialDone) {
          // After the gate opens, Grandmaster simply watches
          this.startDialogue([
            { speaker: "Grandmaster", text: "The path is open." },
            { speaker: "Grandmaster", text: "What waits beyond it is yours to discover." },
          ]);
        } else if (this.binaryCodeTrialCompleted) {
          // In case they talk again mid-post-trial sequence
          this.startDialogue([
            { speaker: "Grandmaster", text: "Your code has already spoken for you." },
          ]);
        } else if (this.trialSuccess) {
          this.showMessage("The stone answers.");
        } else if (this.trialActive) {
          this.startDialogue([
            { speaker: "Grandmaster", text: "Four activations." },
            { speaker: "Grandmaster", text: "Make them count." },
          ]);
        } else if (this.binaryTrialReady) {
          this.startDialogue([
            { speaker: "Grandmaster", text: "Approach the stones when you are ready." },
          ]);
        } else if (this.hasCompletedGrandmasterIntro) {
          this.startDialogue(GRANDMASTER_BRIEFING_DIALOGUE, { isBriefing: true });
        } else {
          this.startDialogue(GRANDMASTER_INTRO_DIALOGUE, { isGrandmasterIntro: true });
        }
      },
    });
  }

  // ── Spawn Physical Trial Stones (Called AFTER Briefing Completes) ─────────

  spawnTrialStones() {
    if (this.stonesSpawned) return;
    this.stonesSpawned = true;

    this.trialSlots.forEach((slot) => {
      const stoneSprite = this.physics.add.staticSprite(slot.x, slot.y, "binary-rune");
      stoneSprite.setScale(0.028);
      stoneSprite.setOrigin(0.5, 0.5);
      stoneSprite.setDepth(slot.y);
      stoneSprite.refreshBody();

      slot.sprite = stoneSprite;
      this.physics.add.collider(this.player, stoneSprite);

      const self = this;
      this.registerInteractable({
        id: slot.id,
        x: slot.x,
        y: slot.y,
        radius: 36,
        slotData: slot,
        get promptText() {
          if (self.trialSuccess || slot.isActivated) {
            return "[ACTIVATED]";
          }
          return "[E] Inspect     [ENTER] Activate";
        },
        onInteract: () => {
          if (!self.trialSuccess && !slot.isActivated) {
            self.inspectStone(slot);
          }
        },
      });
    });
  }

  // ── Trial 01 Implementation ──────────────────────────────────────────────

  startTrial() {
    if (this.trialActive || this.trialSuccess) return;

    // Generate 15 UNIQUE random integers between 1 and 100
    const uniqueVals = new Set();
    while (uniqueVals.size < 15) {
      uniqueVals.add(Phaser.Math.Between(1, 100));
    }
    const sortedVals = Array.from(uniqueVals).sort((a, b) => a - b);

    // Assign values LEFT -> RIGHT to BinarySlot01..15
    this.trialSlots.forEach((slot, idx) => {
      slot.value = sortedVals[idx];
      slot.isActivated = false;
      if (slot.tempLabelTimer) {
        slot.tempLabelTimer.remove();
        slot.tempLabelTimer = null;
      }
      if (slot.worldLabelText) {
        slot.worldLabelText.destroy();
        slot.worldLabelText = null;
      }
    });

    // Randomly select ONE slot as hidden trigger stone
    const targetIndex = Phaser.Math.Between(0, 14);
    this.targetValue = this.trialSlots[targetIndex].value;

    this.activationsRemaining = 4;
    this.trialActive = true;

    this.startDialogue([
      { speaker: "Grandmaster", text: "The mark you seek is..." },
      { speaker: "Grandmaster", text: `TARGET MARK: ${this.targetValue}` },
      { speaker: "Grandmaster", text: "Four activations." },
      { speaker: "Grandmaster", text: "Make them count." },
    ]);
  }

  inspectStone(slot) {
    if (!this.trialActive || slot.value === null) return;

    if (slot.tempLabelTimer) {
      slot.tempLabelTimer.remove();
      slot.tempLabelTimer = null;
    }
    if (slot.worldLabelText) {
      slot.worldLabelText.destroy();
      slot.worldLabelText = null;
    }

    const labelText = this.add.text(slot.x, slot.y - 20, `${slot.value}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#00ffcc",
      backgroundColor: "rgba(10, 14, 20, 0.9)",
      padding: { x: 4, y: 2 },
    });
    labelText.setOrigin(0.5, 1);
    labelText.setDepth(slot.y + 100);
    slot.worldLabelText = labelText;

    slot.tempLabelTimer = this.time.delayedCall(1800, () => {
      if (slot.worldLabelText) {
        slot.worldLabelText.destroy();
        slot.worldLabelText = null;
      }
      slot.tempLabelTimer = null;
    });
  }

  onActivateStone(slot) {
    if (!this.trialActive || slot.isActivated || this.activationsRemaining <= 0 || this.trialSuccess) return;

    slot.isActivated = true;
    this.activationsRemaining--;

    if (slot.value === this.targetValue) {
      // SUCCESS!
      this.trialSuccess = true;
      this.trialActive  = false;
      this.binaryPhysicalTrialCompleted = true;
      this.showMessage("The stone answers.");

      this.triggerAutosave();

      if (this.promptTextUI) {
        this.promptTextUI.setVisible(false);
      }

      // Short pause, then start post-trial dialogue
      this.time.delayedCall(1500, () => {
        this.startDialogue(POST_TRIAL_DIALOGUE, { isPostTrial: true });
      });
    } else {
      // WRONG ACTIVATION
      if (this.activationsRemaining > 0) {
        this.showMessage("Not that one.");
      } else {
        // FAILURE -> RESTART
        this.trialActive = false;
        this.restartTrial();
      }
    }
  }

  restartTrial() {
    this.showMessage("Again.");

    this.time.delayedCall(1500, () => {
      const uniqueVals = new Set();
      while (uniqueVals.size < 15) {
        uniqueVals.add(Phaser.Math.Between(1, 100));
      }
      const sortedVals = Array.from(uniqueVals).sort((a, b) => a - b);

      this.trialSlots.forEach((slot, idx) => {
        slot.value = sortedVals[idx];
        slot.isActivated = false;
        if (slot.tempLabelTimer) {
          slot.tempLabelTimer.remove();
          slot.tempLabelTimer = null;
        }
        if (slot.worldLabelText) {
          slot.worldLabelText.destroy();
          slot.worldLabelText = null;
        }
      });

      const targetIndex = Phaser.Math.Between(0, 14);
      this.targetValue = this.trialSlots[targetIndex].value;
      this.activationsRemaining = 4;
      this.trialActive = true;

      this.startDialogue([
        { speaker: "Grandmaster", text: "The mark you seek is..." },
        { speaker: "Grandmaster", text: `TARGET MARK: ${this.targetValue}` },
        { speaker: "Grandmaster", text: "Four activations." },
        { speaker: "Grandmaster", text: "Make them count." },
      ]);
    });
  }

  createTrialHUD() {
    this.trialHUDPanel = this.add.graphics();
    this.trialHUDPanel.setScrollFactor(0);
    this.trialHUDPanel.setDepth(2000);
    this.trialHUDPanel.setVisible(false);

    this.trialHUDTargetText = this.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#00ffcc",
    });
    this.trialHUDTargetText.setScrollFactor(0);
    this.trialHUDTargetText.setDepth(2001);
    this.trialHUDTargetText.setVisible(false);

    this.trialHUDActivationsText = this.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#f0e0a0",
    });
    this.trialHUDActivationsText.setScrollFactor(0);
    this.trialHUDActivationsText.setDepth(2001);
    this.trialHUDActivationsText.setVisible(false);
  }

  // ── Code Trial UI Elements & Handlers ─────────────────────────────────────

  createCodeTrialUI() {
    // Notification Prompt UI ("CODE TRIAL UNLOCKED / Binary Search / Press [C] to begin")
    this.codeTrialPromptGraphics = this.add.graphics();
    this.codeTrialPromptGraphics.setScrollFactor(0);
    this.codeTrialPromptGraphics.setDepth(2100);
    this.codeTrialPromptGraphics.setVisible(false);

    this.codeTrialPromptTitle = this.add.text(0, 0, "CODE TRIAL UNLOCKED", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#00ffcc",
    });
    this.codeTrialPromptTitle.setScrollFactor(0);
    this.codeTrialPromptTitle.setOrigin(0.5, 0.5);
    this.codeTrialPromptTitle.setDepth(2101);
    this.codeTrialPromptTitle.setVisible(false);

    this.codeTrialPromptSub = this.add.text(0, 0, "Binary Search", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#f0e0a0",
    });
    this.codeTrialPromptSub.setScrollFactor(0);
    this.codeTrialPromptSub.setOrigin(0.5, 0.5);
    this.codeTrialPromptSub.setDepth(2101);
    this.codeTrialPromptSub.setVisible(false);

    this.codeTrialPromptKey = this.add.text(0, 0, "Press [C] to begin", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#ffffff",
    });
    this.codeTrialPromptKey.setScrollFactor(0);
    this.codeTrialPromptKey.setOrigin(0.5, 0.5);
    this.codeTrialPromptKey.setDepth(2101);
    this.codeTrialPromptKey.setVisible(false);
  }

  openCodeTrialPlaceholder() {
    this.isCodeTrialOpen = true;

    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0);
      if (this.currentAnim) {
        this.player.anims.stop();
        this.player.setTexture(this.idleTexture[this.lastFacing]);
        this.currentAnim = null;
      }
    }

    if (this.promptTextUI) {
      this.promptTextUI.setVisible(false);
    }

    // Emit event to React to open CodeTrialOverlay
    gameEvents.emit("open-code-trial");
    this.updateHUDPositions();
  }

  closeCodeTrialPlaceholder() {
    this.isCodeTrialOpen = false;
    this.updateHUDPositions();
  }

  // ── Interaction System Registration & UI Creation ─────────────────────────

  registerInteractable(config) {
    this.interactables.push(config);
  }

  createInteractionUI() {
    this.promptTextUI = this.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#f0e0a0",
      backgroundColor: "rgba(17, 14, 8, 0.9)",
      padding: { x: 8, y: 5 },
      align: "center",
    });
    this.promptTextUI.setScrollFactor(0);
    this.promptTextUI.setOrigin(0.5, 0.5);
    this.promptTextUI.setDepth(2000);
    this.promptTextUI.setVisible(false);

    this.messageTextUI = this.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#e8dfc4",
      backgroundColor: "rgba(10, 8, 5, 0.95)",
      padding: { x: 10, y: 6 },
      align: "center",
    });
    this.messageTextUI.setScrollFactor(0);
    this.messageTextUI.setOrigin(0.5, 0.5);
    this.messageTextUI.setDepth(2001);
    this.messageTextUI.setVisible(false);

    this.updateHUDPositions();
  }

  // ── Dialogue System v1 Creation & Handlers ────────────────────────────────

  createDialogueUI() {
    this.dialogueBoxGraphics = this.add.graphics();
    this.dialogueBoxGraphics.setScrollFactor(0);
    this.dialogueBoxGraphics.setDepth(3000);
    this.dialogueBoxGraphics.setVisible(false);

    this.dialogueSpeakerUI = this.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "10px",
      color: "#f0e0a0",
    });
    this.dialogueSpeakerUI.setScrollFactor(0);
    this.dialogueSpeakerUI.setDepth(3001);
    this.dialogueSpeakerUI.setVisible(false);

    this.dialogueTextUI = this.add.text(0, 0, "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "9px",
      color: "#f5ecd5",
      lineSpacing: 4,
    });
    this.dialogueTextUI.setScrollFactor(0);
    this.dialogueTextUI.setDepth(3001);
    this.dialogueTextUI.setVisible(false);

    this.dialogueIndicatorUI = this.add.text(0, 0, "[ENTER] Next    [SPACE] Skip", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "7px",
      color: "#a09060",
    });
    this.dialogueIndicatorUI.setScrollFactor(0);
    this.dialogueIndicatorUI.setOrigin(1, 1);
    this.dialogueIndicatorUI.setDepth(3001);
    this.dialogueIndicatorUI.setVisible(false);
  }

  // ── Post-Code-Trial: Grandmaster acknowledges + unlocks gate ─────────────

  startGrandmasterPostTrialDialogue() {
    if (this.grandmasterPostTrialDone) return;
    this.startDialogue(GRANDMASTER_POST_CODE_TRIAL_DIALOGUE, { isPostCodeTrial: true });
  }

  unlockGate(options = {}) {
    if (this.gateUnlocked) return;
    this.gateUnlocked = true;

    // Re-enable the dungeon-exit interactable as the walkthrough trigger
    const exitInteractable = this.interactables.find((i) => i.id === "dungeon-exit");
    if (exitInteractable) {
      exitInteractable.promptText = "[E] Enter";
      exitInteractable.radius = 60;
      exitInteractable.onInteract = () => {
        // Walking into open gate is preferred, but allow E as fallback too
        this.beginTransitionToPlains();
      };
    }

    // Activate the walk-through gate trigger zone
    this.gateTriggerActive = true;

    // Visual: brief flash/glow to signal gate open (unless silent load)
    if (!options.silent) {
      this.cameras.main.flash(400, 210, 180, 100, false);
    }

    // Emit progression update to React
    gameEvents.emit("progression-update", {
      gateUnlocked: true,
      plainsDiscovered: true,
    });

    if (!options.silent) {
      this.triggerAutosave();
    }
  }

  triggerAutosave() {
    const pX = this.player && this.player.body ? this.player.body.center.x : (this.player ? this.player.x : null);
    const pY = this.player && this.player.body ? this.player.body.center.y : (this.player ? this.player.y : null);

    const progression = {
      hasTriggeredSealedGate:       this.hasTriggeredSealedGate,
      hasCompletedGrandmasterIntro: this.hasCompletedGrandmasterIntro,
      hasCompletedBriefing:         this.hasCompletedBriefing,
      binaryPhysicalTrialCompleted: this.binaryPhysicalTrialCompleted,
      binaryCodeTrialCompleted:     this.binaryCodeTrialCompleted,
      grandmasterPostTrialDone:     this.grandmasterPostTrialDone,
      gateUnlocked:                 this.gateUnlocked,
      plainsDiscovered:             this.plainsDiscovered,
    };

    gameEvents.emit("autosave", {
      progression,
      world: {
        scene: "DungeonScene",
        player: { x: pX, y: pY },
      },
    });
  }

  beginTransitionToPlains() {
    if (this.isTransitioningToPlains) return;
    this.isTransitioningToPlains = true;
    this.plainsDiscovered = true;

    // Disable all player input
    this.input.keyboard.enabled = false;
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0);
    }
    if (this.player && this.currentAnim) {
      this.player.anims.stop();
      this.player.setTexture(this.idleTexture[this.lastFacing]);
      this.currentAnim = null;
    }

    // Fade to black
    this.cameras.main.fadeOut(800, 0, 0, 0);

    // After fade-out completes, hold ~2 seconds then launch Plains scene
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.time.delayedCall(2000, () => {
        gameEvents.emit("progression-update", { plainsDiscovered: true });
        this.scene.start("PlainsOfOriginsScene");
      });
    });
  }

  startDialogue(entries, config = {}) {
    if (!entries || entries.length === 0) return;

    this.isDialogueActive                    = true;
    this.currentDialogue                     = entries;
    this.currentDialogueIndex                = 0;
    this.isGrandmasterIntroConversation      = !!config.isGrandmasterIntro;
    this.isBriefingConversation              = !!config.isBriefing;
    this.isPostTrialConversation             = !!config.isPostTrial;
    this.isDoorStoryConversation             = !!config.isDoorStory;
    this.isPostCodeTrialConversation         = !!config.isPostCodeTrial;

    if (this.promptTextUI) this.promptTextUI.setVisible(false);

    this.dialogueBoxGraphics.setVisible(true);
    this.dialogueSpeakerUI.setVisible(true);
    this.dialogueTextUI.setVisible(true);
    this.dialogueIndicatorUI.setVisible(true);

    this.displayDialogueEntry();
  }

  displayDialogueEntry() {
    const entry = this.currentDialogue[this.currentDialogueIndex];
    if (!entry) return;

    const speakerName = entry.speaker.toUpperCase();
    this.dialogueSpeakerUI.setText(speakerName);

    if (speakerName === "GRANDMASTER") {
      this.dialogueSpeakerUI.setColor("#f0e0a0");
    } else if (speakerName === "???") {
      this.dialogueSpeakerUI.setColor("#e8dfc4");
    } else {
      this.dialogueSpeakerUI.setColor("#a0c0f0");
    }

    this.dialogueTextUI.setText(entry.text);
    this.updateHUDPositions();
  }

  advanceDialogue() {
    this.currentDialogueIndex++;
    if (this.currentDialogueIndex < this.currentDialogue.length) {
      this.displayDialogueEntry();
    } else {
      this.closeDialogue();
    }
  }

  skipDialogue() {
    this.closeDialogue();
  }

  closeDialogue() {
    this.isDialogueActive     = false;
    this.currentDialogue      = [];
    this.currentDialogueIndex = 0;

    this.dialogueBoxGraphics.setVisible(false);
    this.dialogueSpeakerUI.setVisible(false);
    this.dialogueTextUI.setVisible(false);
    this.dialogueIndicatorUI.setVisible(false);

    if (this.isGrandmasterIntroConversation) {
      this.hasCompletedGrandmasterIntro = true;
      this.isGrandmasterIntroConversation = false;
    }

    if (this.isBriefingConversation) {
      this.hasCompletedBriefing = true;
      this.binaryTrialReady = true;
      this.isBriefingConversation = false;

      this.spawnTrialStones();
    }

    if (this.isPostTrialConversation) {
      this.binaryPhysicalTrialCompleted = true;
      this.binaryCodeTrialReady = true;
      this.isPostTrialConversation = false;
    }

    if (this.isDoorStoryConversation) {
      this.spawnGrandmaster();
      this.isDoorStoryConversation = false;
    }

    if (this.isPostCodeTrialConversation) {
      this.grandmasterPostTrialDone = true;
      this.isPostCodeTrialConversation = false;
      this.triggerAutosave();

      // Open the gate after a very brief pause
      this.time.delayedCall(400, () => {
        this.unlockGate();
      });
    }
  }

  updateHUDPositions() {
    const cam  = this.cameras.main;
    const camW = cam.width;
    const camH = cam.height;
    const zoom = cam.zoom || 1;

    const centerX  = camW / 2;
    const promptY  = camH / 2 + (camH / 2 - 50) / zoom;
    const messageY = camH / 2 + (camH / 2 - 85) / zoom;

    if (this.promptTextUI) {
      this.promptTextUI.setPosition(centerX, promptY);
    }
    if (this.messageTextUI) {
      this.messageTextUI.setPosition(centerX, messageY);
    }

    // ── Trial HUD Positioning ───────────────────────────────────────────────
    if ((this.trialActive || this.trialSuccess) && this.trialHUDPanel) {
      const panelW = 160 / zoom;
      const panelH = 34 / zoom;
      const rightX = camW / 2 + (camW / 2 - (175 / zoom));
      const topY   = camH / 2 - (camH / 2 - (16 / zoom));

      this.trialHUDPanel.clear();
      this.trialHUDPanel.fillStyle(0x110e08, 0.9);
      this.trialHUDPanel.fillRect(rightX, topY, panelW, panelH);
      this.trialHUDPanel.lineStyle(1.5 / zoom, 0x00ffcc, 0.85);
      this.trialHUDPanel.strokeRect(rightX, topY, panelW, panelH);

      this.trialHUDTargetText.setPosition(rightX + (8 / zoom), topY + (6 / zoom));
      this.trialHUDTargetText.setText(`TARGET MARK: ${this.targetValue || "---"}`);

      this.trialHUDActivationsText.setPosition(rightX + (8 / zoom), topY + (19 / zoom));
      this.trialHUDActivationsText.setText(`ACTIVATIONS: ${this.activationsRemaining}`);

      this.trialHUDPanel.setVisible(true);
      this.trialHUDTargetText.setVisible(true);
      this.trialHUDActivationsText.setVisible(true);
    } else if (this.trialHUDPanel) {
      this.trialHUDPanel.setVisible(false);
      this.trialHUDTargetText.setVisible(false);
      this.trialHUDActivationsText.setVisible(false);
    }

    // ── Code Trial Notification Positioning ────────────────────────────────
    if (this.binaryCodeTrialReady && !this.isDialogueActive && !this.isCodeTrialOpen && this.codeTrialPromptGraphics) {
      const notifW = 200 / zoom;
      const notifH = 38 / zoom;
      const notifX = centerX - notifW / 2;
      const notifY = camH / 2 + (camH / 2 - (65 / zoom));

      this.codeTrialPromptGraphics.clear();
      this.codeTrialPromptGraphics.fillStyle(0x110e08, 0.92);
      this.codeTrialPromptGraphics.fillRect(notifX, notifY, notifW, notifH);
      this.codeTrialPromptGraphics.lineStyle(1.5 / zoom, 0x00ffcc, 0.85);
      this.codeTrialPromptGraphics.strokeRect(notifX, notifY, notifW, notifH);

      this.codeTrialPromptTitle.setPosition(centerX, notifY + (8 / zoom));
      this.codeTrialPromptSub.setPosition(centerX, notifY + (19 / zoom));
      this.codeTrialPromptKey.setPosition(centerX, notifY + (29 / zoom));

      this.codeTrialPromptGraphics.setVisible(true);
      this.codeTrialPromptTitle.setVisible(true);
      this.codeTrialPromptSub.setVisible(true);
      this.codeTrialPromptKey.setVisible(true);
    } else if (this.codeTrialPromptGraphics) {
      this.codeTrialPromptGraphics.setVisible(false);
      this.codeTrialPromptTitle.setVisible(false);
      this.codeTrialPromptSub.setVisible(false);
      this.codeTrialPromptKey.setVisible(false);
    }

    // ── Dialogue UI Screen Positioning & Word Wrapping ──────────────────────
    if (this.isDialogueActive) {
      const boxW  = (camW * 0.8) / zoom;
      const boxH  = 96 / zoom;
      const boxY  = camH / 2 + (camH / 2 - 60) / zoom;
      const leftX = centerX - boxW / 2;
      const topY  = boxY - boxH / 2;

      this.dialogueBoxGraphics.clear();
      this.dialogueBoxGraphics.fillStyle(0x110e08, 0.93);
      this.dialogueBoxGraphics.fillRect(leftX, topY, boxW, boxH);
      this.dialogueBoxGraphics.lineStyle(2 / zoom, 0xd2b978, 0.85);
      this.dialogueBoxGraphics.strokeRect(leftX, topY, boxW, boxH);

      const padX = 16 / zoom;
      const padY = 12 / zoom;

      this.dialogueSpeakerUI.setPosition(leftX + padX, topY + padY);

      const textTopY = topY + padY + (34 / zoom);
      const maxTextW = boxW - (padX * 2);

      this.dialogueTextUI.setPosition(leftX + padX, textTopY);
      this.dialogueTextUI.setWordWrapWidth(maxTextW);

      this.dialogueIndicatorUI.setPosition(leftX + boxW - padX, topY + boxH - (10 / zoom));
    }
  }

  showMessage(text) {
    if (this.messageTimer) {
      this.messageTimer.remove();
      this.messageTimer = null;
    }

    this.messageTextUI.setText(text);
    this.messageTextUI.setVisible(true);

    this.messageTimer = this.time.delayedCall(2000, () => {
      this.messageTextUI.setVisible(false);
      this.messageTimer = null;
    });
  }

  update() {
    const { player, cursors, wasd } = this;
    if (!player) return;

    // ── Dynamic Y-based Depth Sorting for Player & Grandmaster ────────────────
    if (player.body) {
      player.setDepth(player.body.center.y);
    } else {
      player.setDepth(player.y);
    }

    if (this.grandmaster) {
      this.grandmaster.setDepth(this.grandmaster.y);
    }

    // ── Keep HUD & Dialogue UI elements positioned at bottom of viewport ───────
    this.updateHUDPositions();

    // ── Auto-Start Trial 01 when player reaches stones area ──────────────────
    if (this.binaryTrialReady && this.stonesSpawned && !this.trialActive && !this.trialSuccess) {
      const pFeetX = player.body ? player.body.center.x : player.x;
      const pFeetY = player.body ? player.body.center.y : player.y;

      if (pFeetX >= 320 && pFeetY >= 450) {
        this.startTrial();
      }
    }

    // ── Gate walk-through detection (after gate unlocked) ─────────────────────
    if (this.gateTriggerActive && !this.isTransitioningToPlains && this.dungeonExit) {
      const pFeetX = player.body ? player.body.center.x : player.x;
      const pFeetY = player.body ? player.body.center.y : player.y;
      const dist   = Phaser.Math.Distance.Between(pFeetX, pFeetY, this.dungeonExit.x, this.dungeonExit.y);

      if (dist <= 40) {
        this.beginTransitionToPlains();
      }
    }

    // ── While Dialogue or Code Trial is Active: Freeze Movement & Hide Prompt ─
    if (this.isDialogueActive || this.isCodeTrialOpen) {
      player.body.setVelocity(0, 0);
      if (this.currentAnim) {
        player.anims.stop();
        player.setTexture(this.idleTexture[this.lastFacing]);
        this.currentAnim = null;
      }
      if (this.promptTextUI) {
        this.promptTextUI.setVisible(false);
      }
      return;
    }

    // ── Read inputs ─────────────────────────────────────────────────────────
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

    // ── Diagonal normalisation ──────────────────────────────────────────────
    if (vx !== 0 && vy !== 0) {
      const INV_SQRT2 = 0.7071067811865476;
      vx *= INV_SQRT2;
      vy *= INV_SQRT2;
    }

    // ── Apply movement via Arcade velocity ─────────────────────────────────
    player.body.setVelocity(vx * MOVE_SPEED, vy * MOVE_SPEED);

    // ── Facing direction (vertical priority for diagonals) ──────────────────
    if (isMoving) {
      if (vy < 0)      this.lastFacing = "up";
      else if (vy > 0) this.lastFacing = "down";
      else if (vx < 0) this.lastFacing = "left";
      else             this.lastFacing = "right";
    } else {
      player.body.setVelocity(0, 0);
    }

    // ── Drive animation ─────────────────────────────────────────────────────
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

    // ── Proximity Check & Interaction Detection ─────────────────────────────
    const playerFeetX = player.body ? player.body.center.x : player.x;
    const playerFeetY = player.body ? player.body.center.y : player.y;

    let nearestInteractable = null;
    let shortestDist = Infinity;

    this.interactables.forEach((item) => {
      const dist = Phaser.Math.Distance.Between(playerFeetX, playerFeetY, item.x, item.y);
      if (dist <= item.radius && dist < shortestDist) {
        shortestDist = dist;
        nearestInteractable = item;
      }
    });

    if (nearestInteractable) {
      this.activeInteractable = nearestInteractable;
      this.promptTextUI.setText(nearestInteractable.promptText);
      this.promptTextUI.setVisible(true);
    } else {
      this.activeInteractable = null;
      this.promptTextUI.setVisible(false);
    }
  }
}
