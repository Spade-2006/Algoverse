# ⚔️ Algoverse

> **Learn Data Structures & Algorithms by living through them.**

Algoverse is an RPG-based educational game that transforms Data Structures & Algorithms from traditional coding problems into interactive quests, puzzles, exploration, and story-driven challenges.

Instead of simply reading about an algorithm, the player first encounters the problem inside the game world, understands the underlying idea through gameplay, and then implements the algorithm in an integrated coding trial.

---

## 🎮 The Core Idea

Traditional DSA learning often follows:

**Learn Algorithm → Solve Problem → Repeat**

Algoverse changes the loop to:

**Explore → Encounter Problem → Discover Pattern → Solve Physically → Code the Algorithm → Unlock Progress**

Algorithms are integrated directly into the world and storyline rather than presented as isolated coding exercises.

---

## 🗺️ The World

### 🏰 The Dungeon

The player's journey begins inside an ancient dungeon under the guidance of the Grandmaster.

The Dungeon introduces the player to Algoverse's core gameplay systems and the first algorithmic trials.

The player must complete both physical and coding challenges before the Dungeon gate recognizes their progress and allows them to enter the outside world.

### 🌿 Plains of Origins

After escaping the Dungeon, the player reaches the first major open region:

**The Plains of Origins**

The region contains multiple algorithm-based quest areas connected through exploration and story progression.

The first completed quest introduces the **Two Pointer technique** through the mysterious Soul-Bind Pillars.

---

## ⚡ Quest I — Disarming the Soul-Bind Pillars

A magical resonance field prevents the Hero from progressing deeper into the Plains.

Two ancient pillars maintain the barrier using rune stones containing sorted harmonic frequencies.

The Hero must find two frequencies whose combined resonance matches the target frequency.

### Physical Trial

The player interacts with the rune system using two pointers:

- One begins at the lowest frequency.
- One begins at the highest frequency.
- The pointers move inward based on the current sum.
- The correct pair destabilizes the Soul-Bind Pillars.

This allows the player to understand the Two Pointer technique visually before writing any code.

### Code Trial

After solving the physical puzzle, the Grandmaster asks the Hero to encode what they learned.

The player implements:

```text
findResonancePair(frequencies, target)
```

The solution is executed against multiple test cases using Algoverse's integrated code execution system.

Only after successfully passing the coding trial is the algorithm considered mastered.

---

## 📜 Ancient Codex

Algorithms discovered during the journey are permanently recorded inside the **Ancient Codex**.

The Codex acts as the player's growing DSA reference book.

Unlocked concepts can contain:

- Concept explanation
- Core intuition
- Algorithm steps
- Complexity analysis
- Reference implementation

The Codex grows alongside the player's progression through Algoverse.

---

## 💻 Integrated Coding Trials

Algoverse contains an in-game coding environment where players implement the algorithms encountered during quests.

The system supports multiple programming languages and evaluates submissions using test cases.

Current coding-trial architecture includes:

- Starter code templates
- Language selection
- Code execution
- Visible and hidden test cases
- Runtime feedback
- Success/failure states
- Quest progression integration

---

## 💾 Save & Continue

Algoverse includes persistent progression.

The game can preserve progression such as:

- Story progress
- Completed trials
- Quest progression
- Unlocked Codex entries
- Region progression

Players can continue their journey without restarting completed content.

---

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript
- Phaser
- Vite
- HTML/CSS

### Backend
- Node.js
- Express

### Game Development
- Phaser Tilemap System
- Tiled Map Editor
- TMX / JSON tilemaps
- Custom pixel-art assets

### Code Execution
- Multi-language execution pipeline
- Automated test-case evaluation
- Runtime and timeout handling

### Development
- Git
- GitHub
- ESLint

---

## 🏗️ Project Structure

```text
Algoverse/
│
├── assets/             # Shared game assets
├── backend/            # API and code-execution services
├── docs/
│   └── game-design/    # Game design documentation
│
├── frontend/           # React + Phaser game client
│   └── src/
│       └── game/
│           └── scenes/
│
├── .env.example
├── package.json
└── README.md
```

---

## 🚧 Current Development Status

Algoverse is currently under active development.

### Implemented

- RPG game foundation
- Main menu and game flow
- Dungeon environment
- Story/dialogue system
- Player movement and collision
- Code Terminal
- Algorithm coding trials
- Save & Continue system
- Ancient Codex
- Plains of Origins map
- Barrier and region progression
- Soul-Bind Pillars storyline
- Two Pointer physical puzzle
- Two Pointer coding challenge
- Quest-based Codex unlocking

### In Development

The Plains of Origins will continue expanding with additional DSA quests and progression toward its final encounter.

---

## 🧠 Planned Plains of Origins Challenges

The region is designed around several algorithmic techniques:

| Quest | Concept |
|---|---|
| Soul-Bind Pillars | Two Pointers |
| Crimson Mist Corridor | Sliding Window |
| Artillery Strike Zones | Prefix Sum |
| Titan-Breaker Siege | Binary Search on Answer |
| Fallen Army | Kadane's Algorithm |

Each concept is designed to be introduced through gameplay before its coding challenge.

---

## 🎯 Vision

Algoverse explores a simple idea:

> **What if learning an algorithm felt like discovering a power instead of memorizing a solution?**

The long-term goal is to build a world where DSA concepts become locations, enemies, puzzles, abilities, and memories from the player's journey.

---

## 👨‍💻 Developer

Developed by **Satyansh**

B.Tech Computer Science & Engineering

---

## 📄 License

This project is licensed under the MIT License.