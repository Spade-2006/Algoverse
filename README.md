<div align="center">

# ⚔️ AlgoVerse

### Learn Data Structures & Algorithms by living through them.

**An RPG-based educational game where algorithms become quests, puzzles, and challenges.**

<br>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Phaser](https://img.shields.io/badge/Phaser-1E1E1E?style=for-the-badge&logo=phaser&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<br>

🚧 **Currently in active development**

</div>

---

## 🎮 What is AlgoVerse?

AlgoVerse is an **RPG-based educational game** that transforms Data Structures & Algorithms from traditional coding problems into:

- ⚔️ Quests
- 🧩 Interactive puzzles
- 🗺️ Exploration
- 📜 Story-driven challenges
- 💻 Coding trials
- 🏆 Progression systems

Instead of simply reading about an algorithm, the player **experiences the problem first**, discovers the underlying pattern through gameplay, and then implements the algorithm in an integrated coding trial.

### The Traditional Loop

**Learn Algorithm → Solve Problem → Repeat**

### The AlgoVerse Loop

**Explore → Encounter Problem → Discover Pattern → Solve Physically → Code the Algorithm → Unlock Progress**

> **What if learning an algorithm felt like discovering a power instead of memorizing a solution?**

---

## 🌎 The World

### 🏰 The Dungeon

The player's journey begins inside an ancient dungeon under the guidance of the **Grandmaster**.

The Dungeon introduces AlgoVerse's core gameplay systems and the first algorithmic trials.

Players must complete both physical and coding challenges before the Dungeon gate recognizes their progress and allows them to enter the outside world.

---

### 🌿 Plains of Origins

After escaping the Dungeon, the Hero reaches the first major open region:

**The Plains of Origins**

The region contains multiple algorithm-based quest areas connected through exploration and story progression.

The first completed quest introduces the **Two Pointer technique** through the mysterious **Soul-Bind Pillars**.

---

## ⚔️ Quest I — Disarming the Soul-Bind Pillars

A magical resonance field prevents the Hero from progressing deeper into the Plains.

Two ancient pillars maintain the barrier using rune stones containing sorted harmonic frequencies.

The Hero must find two frequencies whose combined resonance matches the target frequency.

### 🧩 Physical Trial

The player interacts with the rune system using two pointers:

- One begins at the lowest frequency.
- One begins at the highest frequency.
- The pointers move inward based on the current sum.
- The correct pair destabilizes the Soul-Bind Pillars.

This allows the player to understand the **Two Pointer technique visually** before writing any code.

### 💻 Code Trial

After solving the physical puzzle, the Grandmaster asks the Hero to encode what they learned.

The player implements:

```javascript
findResonancePair(frequencies, target)
```

The solution is executed against multiple test cases using AlgoVerse's integrated code execution system.

Only after successfully passing the coding trial is the algorithm considered mastered.

---

## 📜 Ancient Codex

Algorithms discovered during the journey are permanently recorded inside the **Ancient Codex**.

The Codex acts as the player's growing DSA reference book.

Unlocked concepts can contain:

- 📖 Concept explanation
- 💡 Core intuition
- 🧭 Algorithm steps
- ⏱️ Complexity analysis
- 💻 Reference implementation

The Codex grows alongside the player's progression through AlgoVerse.

---

## 💻 Integrated Coding Trials

AlgoVerse contains an in-game coding environment where players implement the algorithms encountered during quests.

The system connects:

**Gameplay → Understanding → Implementation**

### Current Coding-Trial Architecture

- Starter code templates
- Language selection
- Code execution
- Visible test cases
- Hidden test cases
- Runtime feedback
- Success / failure states
- Quest progression integration

```text
                 QUEST
                   │
                   ▼
           Physical Puzzle
                   │
                   ▼
            Learn Pattern
                   │
                   ▼
            Coding Terminal
                   │
                   ▼
            Submit Solution
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Passed             Failed
          │                 │
          ▼                 ▼
     Unlock Quest        Try Again
```

---

## 💾 Save & Continue

AlgoVerse includes persistent progression so players can continue their journey without restarting completed content.

Progression can include:

- Story progress
- Completed trials
- Quest progression
- Unlocked Codex entries
- Region progression

---

## 🗺️ Current Game Progression

```text
🏰 THE DUNGEON
       │
       ▼
🌿 PLAINS OF ORIGINS
       │
       ├── ⚔️ Soul-Bind Pillars
       │       └── Two Pointers
       │
       ├── 🌫️ Crimson Mist Corridor
       │       └── Sliding Window
       │
       ├── 💥 Artillery Strike Zones
       │       └── Prefix Sum
       │
       ├── 🗿 Titan-Breaker Siege
       │       └── Binary Search on Answer
       │
       └── ⚔️ Fallen Army
               └── Kadane's Algorithm
```

---

## 🧠 Planned DSA Challenges

| Quest | Concept |
|---|---|
| ⚔️ Soul-Bind Pillars | Two Pointers |
| 🌫️ Crimson Mist Corridor | Sliding Window |
| 💥 Artillery Strike Zones | Prefix Sum |
| 🗿 Titan-Breaker Siege | Binary Search on Answer |
| ⚔️ Fallen Army | Kadane's Algorithm |

Each concept is designed to be introduced through **gameplay first**, followed by its coding challenge.

---

## 🛠️ Tech Stack

### 🎨 Frontend

- React
- JavaScript
- Phaser
- Vite
- HTML / CSS

### ⚙️ Backend

- Node.js
- Express

### 🎮 Game Development

- Phaser Tilemap System
- Tiled Map Editor
- TMX / JSON Tilemaps
- Custom Pixel-Art Assets

### 💻 Code Execution

- Multi-language execution pipeline
- Automated test-case evaluation
- Runtime handling
- Timeout handling

### 🔧 Development

- Git
- GitHub
- ESLint

---

## 🏗️ Architecture

```text
                    ALGOVERSE
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   React + Phaser                  Node + Express
        │                               │
        │                         Backend Services
        │                               │
        ▼                               ▼
   Game Engine                    Code Execution
        │                               │
        ├── Scenes                      ├── Languages
        ├── Player                      ├── Test Cases
        ├── Quests                      ├── Runtime
        ├── Dialogue                    └── Results
        ├── Codex
        └── Progression
```

---

## 📁 Project Structure

```text
AlgoVerse/
│
├── assets/                 # Shared game assets
├── backend/                # API and code-execution services
│
├── docs/
│   └── game-design/        # Game design documentation
│
├── frontend/               # React + Phaser game client
│   └── src/
│       └── game/
│           └── scenes/
│
├── .env.example
├── package.json
└── README.md
```

---

## 📸 Screenshots

Screenshots will be added as the game continues to evolve.

---

## 🚧 Development Status

### ✅ Implemented

- [x] RPG game foundation
- [x] Main menu and game flow
- [x] Dungeon environment
- [x] Story / dialogue system
- [x] Player movement and collision
- [x] Code Terminal
- [x] Algorithm coding trials
- [x] Save & Continue system
- [x] Ancient Codex
- [x] Plains of Origins map
- [x] Barrier and region progression
- [x] Soul-Bind Pillars storyline
- [x] Two Pointer physical puzzle
- [x] Two Pointer coding challenge
- [x] Quest-based Codex unlocking

### 🔨 Currently In Development

The **Plains of Origins** is being expanded with additional DSA quests, challenges, and progression toward its final encounter.

---

## 🗺️ Roadmap

- [x] Core RPG foundation
- [x] Dungeon
- [x] Plains of Origins
- [x] First DSA quest
- [x] Two Pointer physical puzzle
- [x] Integrated coding trial
- [x] Ancient Codex
- [x] Save & Continue
- [ ] Sliding Window quest
- [ ] Prefix Sum quest
- [ ] Binary Search quest
- [ ] Kadane's Algorithm quest
- [ ] More regions
- [ ] More enemies and puzzles
- [ ] Expanded progression system
- [ ] More programming languages
- [ ] Final Plains of Origins encounter

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Spade-2006/AlgoVerse.git
```

### 2. Enter the project

```bash
cd AlgoVerse
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🎯 Vision

AlgoVerse is built around one simple idea:

> **What if learning an algorithm felt like discovering a power instead of memorizing a solution?**

The long-term vision is to create a world where DSA concepts become:

```text
Algorithms
    ↓
Abilities
    ↓
Puzzles
    ↓
Enemies
    ↓
Quests
    ↓
World Mechanics
    ↓
Memories
```

The goal isn't simply to make DSA more entertaining.

It is to make the **intuition behind algorithms something players experience and remember.**

---

## 👨‍💻 Developer

**Satyansh Acharya**

B.Tech Computer Science & Engineering

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Spade-2006)

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### ⚔️ Explore. Learn. Solve. Conquer.

**AlgoVerse — Where Algorithms Become Adventures.**

</div>
