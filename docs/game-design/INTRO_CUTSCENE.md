# AlgoVerse — Intro Cutscene

## 1. Purpose

The intro cutscene establishes:

- The former glory of the kingdom.
- The importance of knowledge in the world.
- The mysterious fall of the kingdom.
- The passage of time after its destruction.
- The awakening of the player.
- The transition from story into gameplay.

The villain's identity must NOT be revealed during the intro.

The cutscene should feel mysterious, cinematic, and relatively short.

---

# 2. Cutscene Flow

New Journey

↓

Fade to Black

↓

The Kingdom Before

↓

Kingdom of Knowledge

↓

Castle at its Peak

↓

The Fall Begins

↓

The Kingdom in Ruins

↓

Years Pass

↓

Dungeon Awakening

↓

Player Control Begins

---

# 3. Scene 1 — The Kingdom Before

## Asset

`assets/cutscenes/intro/kingdom-peaceful.png`

## Visual

Show a wide view of the prosperous kingdom during its golden age.

The kingdom is:

- Peaceful
- Beautiful
- Organized
- Prosperous
- Full of life

Use a slow cinematic zoom/pan if appropriate.

## Narration

> "There was once a kingdom where knowledge shaped the world."

## Transition

Slow crossfade into Scene 2.

---

# 4. Scene 2 — Kingdom of Knowledge

## Asset

`assets/cutscenes/intro/kingdom-scholars.png`

## Visual

Show the intellectual heart of the kingdom.

Scholars study.

Citizens learn.

Books, scrolls, inventions and academies surround the city.

Knowledge is shown as the foundation of civilization.

## Narration

> "Its paths were ordered."

> "Its towers stood tall."

## Transition

Slow crossfade into Scene 3.

---

# 5. Scene 3 — Castle Glory

## Asset

`assets/cutscenes/intro/castle-glory.png`

## Visual

Reveal the royal castle during the height of the kingdom.

The castle should represent:

- Order
- Knowledge
- Power
- Stability

Allow the image to remain visible briefly before displaying the final narration.

## Narration

> "Every problem had an answer."

## Transition

The peaceful atmosphere begins to darken.

Fade into Scene 4.

---

# 6. Scene 4 — The Fall Begins

## Asset

`assets/cutscenes/intro/kingdom-fall.png`

## Visual

The kingdom is suddenly shown during its destruction.

The sky changes.

Fire spreads.

Citizens flee.

Dark corruption begins consuming the kingdom.

A mysterious figure watches from a distance.

IMPORTANT:

The figure's:

- Face
- Name
- Identity
- Motivation

must NOT be revealed.

## Narration

> "But knowledge, in the wrong hands, became power."

## Transition

The scene darkens further.

Crossfade into the ruined kingdom.

---

# 7. Scene 5 — The Kingdom in Ruins

## Asset

`assets/cutscenes/intro/kingdom-ruins.png`

## Visual

Show the same civilization after its destruction.

The kingdom is now:

- Silent
- Abandoned
- Broken
- Corrupted

The castle remains visible in the distance.

No villain should appear.

## Narration

> "And power became ruin."

## Transition

Hold briefly.

Slowly fade the entire scene to black.

---

# 8. Scene 6 — Passage of Time

## Asset

No image.

Black screen only.

## Sequence

The following lines appear individually.

Each line fades in, remains briefly, then fades out.

### Text 1

> "Years passed."

↓

Black screen.

### Text 2

> "The kingdom waited."

↓

Black screen.

### Text 3

> "Until now."

After "Until now." disappears, remain completely black for a short moment.

Then begin revealing the dungeon.

---

# 9. Scene 7 — Dungeon Awakening

## Asset

`assets/cutscenes/intro/dungeon-awakening.png`

## Visual

Slowly fade into an abandoned dungeon.

The player lies unconscious on the stone floor.

The environment contains:

- Broken cells
- Chains
- Weak torchlight
- Water
- Ancient stonework
- A mysterious path deeper into the dungeon

No narration initially.

Let the environment speak for itself.

After a short pause, the player begins to awaken.

---

# 10. Transition Into Gameplay

The dungeon awakening is the bridge between:

Cutscene

↓

Gameplay

The cutscene ends here.

Player movement becomes available.

The player does NOT yet fully understand:

- Where they are
- Why they are there
- What happened to the kingdom
- Who destroyed the kingdom
- What their purpose is

These answers are discovered naturally through gameplay.

---

# 11. Next Story Sequence

After gaining control:

Player Awakens

↓

Explores Dungeon

↓

Learns Basic Movement

↓

Discovers Path Forward

↓

Encounters the Grandmaster

↓

Dialogue Begins

↓

Grandmaster explains the state of the kingdom

↓

Player receives responsibility to restore it

↓

Dungeon exit becomes accessible

↓

Journey toward the first region begins

---

# 12. Villain Rule

The villain must remain mysterious during the early game.

The intro may show:

- Silhouette
- Corruption
- Destruction
- Evidence of their power

The intro must NOT reveal:

- Name
- Face
- Full appearance
- Origin
- Motivation

Information about the villain should be discovered gradually throughout the game.

---

# 13. Cutscene Presentation

Narration should be rendered by the frontend.

Narration must NOT be permanently embedded into background images.

This allows:

- Text animation
- Timing changes
- Responsive positioning
- Future localization
- Accessibility improvements

Narration should use the established AlgoVerse pixel-fantasy typography.

---

# 14. Visual Transitions

Preferred transitions:

- Fade to black
- Crossfade
- Slow cinematic zoom
- Very subtle image movement

Avoid:

- Fast transitions
- Flashy effects
- Modern UI animations
- Excessive camera movement

The intro should feel like an old fantasy tale being revealed.

---

# 15. Audio

Audio is NOT part of the current implementation phase.

Future additions may include:

- Kingdom ambience
- Wind
- Fire
- Distant destruction
- Dungeon ambience
- Cinematic music
- Transition sound effects

The cutscene must work without audio first.

---

# 16. Player Skipping

Future feature:

The player may eventually be allowed to skip the intro cutscene.

Skip functionality is NOT required for the first implementation.

---

# 17. Core Story Principle

The intro should create questions rather than answer everything.

The player should enter the dungeon thinking:

"Who destroyed this kingdom?"

"Why am I here?"

"What happened while I was gone?"

"What lies beyond that door?"

The answers should come through exploration, dialogue, quests, and progression.