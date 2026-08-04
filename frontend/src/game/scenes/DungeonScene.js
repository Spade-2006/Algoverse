import Phaser from "phaser";
import playerSpritesheet from "../../../../assets/sprites/player/player-spritesheet.png";
import dungeonMapJson    from "../../../../assets/maps/dungeon/maps/dungeon-01.json";
import tilesetMain       from "../../../../assets/maps/dungeon/tilesets/Tiny Top Down 32x32.png";
import tilesetDecor      from "../../../../assets/maps/dungeon/tilesets/dungoen_tileset_png.png";

// ─── Verified directional row mapping (1024×1536, 3 cols × 4 rows, 341×384) ──
// Row 0 = DOWN  (frames 0, 1, 2)
// Row 1 = UP    (frames 3, 4, 5)
// Row 2 = RIGHT (frames 6, 7, 8)
// Row 3 = LEFT  (frames 9, 10, 11)
//
// Each direction's 3 frames are used in the walk cycle:
//   centre → step-A → centre → step-B  →  [col1, col0, col1, col2]

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
// The rendered player is NORM_W * 0.25 = 50 px wide, NORM_H * 0.25 = 100 px tall.
// We use a smaller body around the feet/lower body for tight wall collision.
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

    // DungeonExit world position (kept for future use)
    this.dungeonExit  = null;
  }

  preload() {
    // ── Player spritesheet ──────────────────────────────────────────────────
    this.load.spritesheet("player", playerSpritesheet, {
      frameWidth:  FRAME_W,
      frameHeight: FRAME_H,
    });

    // ── Tilemap JSON ────────────────────────────────────────────────────────
    // Phaser 4 tilemapTiledJSON accepts an already-parsed object directly.
    this.cache.tilemap.add("dungeon-01", {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data:   dungeonMapJson,
    });

    // ── Tileset images ──────────────────────────────────────────────────────
    this.load.image(TS_MAIN,  tilesetMain);
    this.load.image(TS_DECOR, tilesetDecor);
  }

  create() {
    // ── Normalised player frame textures ───────────────────────────────────
    // (Must run after preload so "player" texture exists in cache.)
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

    // addTilesetImage(tilesetNameInTiled, textureKeyInPhaser)
    const tsMain  = map.addTilesetImage(TS_MAIN,  TS_MAIN);
    const tsDecor = map.addTilesetImage(TS_DECOR, TS_DECOR);

    // Layer render order: floor → decor → (player) → walls
    const floorLayer = map.createLayer(LAYER_FLOOR, [tsMain, tsDecor], 0, 0);
    const decorLayer = map.createLayer(LAYER_DECOR, [tsDecor, tsMain], 0, 0);
    this.wallsLayer  = map.createLayer(LAYER_WALLS, [tsMain, tsDecor], 0, 0);

    // Enable collision for every non-empty tile in the walls layer.
    // All non-zero tiles on the walls layer are structural — confirmed by
    // inspecting the TMX: tiles 2, 12, 32, 92 are all solid wall/corner tiles.
    this.wallsLayer.setCollisionByExclusion([-1, 0]);

    // Layers have no natural ordering issue since we create them in draw order;
    // floor and decor never collide.
    void floorLayer;
    void decorLayer;

    // ── Read object layer ───────────────────────────────────────────────────
    const objLayer = map.getObjectLayer(LAYER_OBJ);
    const objects  = objLayer ? objLayer.objects : [];

    let spawnX = map.widthInPixels  / 2; // safe fallback
    let spawnY = map.heightInPixels / 2;

    objects.forEach((obj) => {
      if (obj.type === "PlayerSpawn") {
        spawnX = obj.x;
        spawnY = obj.y;
      }
      if (obj.type === "DungeonExit") {
        this.dungeonExit = { x: obj.x, y: obj.y };
      }
    });

    if (!objects.find((o) => o.type === "PlayerSpawn")) {
      console.warn("[DungeonScene] PlayerSpawn object not found — using map centre as fallback.");
    }

    // ── Physics world bounds ────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // ── Player (physics sprite) ─────────────────────────────────────────────
    // Using physics.add.sprite so Arcade can resolve wall collisions.
    // All animation/texture logic is identical — a physics sprite IS a sprite.
    this.player = this.physics.add.sprite(
      spawnX,
      spawnY,
      this.idleTexture.down,
    );
    this.player.setScale(0.25);

    // Configure the physics body:
    //   - setCollideWorldBounds keeps player inside map bounds as a safety net.
    //   - A small foot-level body gives tight, natural wall collision.
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(BODY_W, BODY_H);
    // Offset: centre the body horizontally on the sprite, sit it at the bottom.
    // Sprite display size = NORM_W*0.25 = 50 w, NORM_H*0.25 = 100 h
    const spriteH = NORM_H * 0.25;
    this.player.body.setOffset(
      (NORM_W - BODY_W)  / 2,                  // centre horizontally in source
      (NORM_H - BODY_H)  - (spriteH * 0.05),   // near bottom of source canvas
    );

    // ── Arcade collision — player vs walls ──────────────────────────────────
    this.physics.add.collider(this.player, this.wallsLayer);

    // ── Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor("#0d0f17");
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12); // gentle lerp
    this.cameras.main.setZoom(2); // pixel art looks crisp at 2× on 32px tiles

    // ── Input ───────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();

    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update() {
    const { player, cursors, wasd } = this;
    if (!player) return;

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
    // Using setVelocity lets Arcade Physics handle both movement and collision
    // resolution against the walls layer automatically — no manual x/y update.
    player.body.setVelocity(vx * MOVE_SPEED, vy * MOVE_SPEED);

    // ── Facing direction (vertical priority for diagonals) ──────────────────
    if (isMoving) {
      if (vy < 0)      this.lastFacing = "up";
      else if (vy > 0) this.lastFacing = "down";
      else if (vx < 0) this.lastFacing = "left";
      else             this.lastFacing = "right";
    } else {
      // No input — zero out velocity so physics doesn't drift
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

    // ── No viewport clamping needed ─────────────────────────────────────────
    // Wall collision + world bounds handle containment.
    // The old manual clamp has been removed.
  }
}
