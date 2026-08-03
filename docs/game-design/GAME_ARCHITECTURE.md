# GAME ARCHITECTURE

## 1. Purpose

This document defines the internal architecture of AlgoVerse.

Its objective is to ensure that every system has a clear responsibility, allowing the project to remain modular, scalable, maintainable, and easy to extend.

---

# 2. High-Level Architecture

Player

↓

React Frontend

↓

React Router

↓

Scene Manager

↓

Game Manager

↓

Subsystem Managers

↓

REST API

↓

C++ Backend

↓

DSA Algorithm Engine

---

# 3. Core Components

## Frontend

Technology:
- React
- React Router

Responsibilities:
- User Interface
- Screen Navigation
- User Input
- HUD
- Menus
- Animations
- Communication with Backend

---

## Backend

Technology:
- C++

Responsibilities:
- DSA Algorithms
- Quest Validation
- Hint Logic
- Complexity Analysis
- Game Logic

---

## Assets

Contains:
- Backgrounds
- Sprites
- NPCs
- Audio
- Fonts
- Icons
- Tilesets

---

## Documentation

Contains:
- Story
- World Design
- Architecture
- UI
- Development Notes

---

# 4. Game Managers

The application is divided into independent managers.

Each manager has a single responsibility.

Managers communicate through the Game Manager.

---

## Game Manager

Responsibilities:
- Manage overall game state
- Initialize core systems
- Coordinate managers
- Handle global events

---

## Scene Manager

Purpose:

Controls all game screens and scene transitions.

Responsibilities:
- Splash Screen
- Title Screen
- Main Menu
- Cutscenes
- Gameplay
- Pause Menu
- Victory Screen
- Game Over Screen

Transitions:
- Fade In
- Fade Out
- Scene Loading
- Scene Unloading

---

## UI Manager

Responsibilities:
- Menus
- Buttons
- Windows
- HUD
- Screen Transitions

---

## Dialogue Manager

Responsibilities:
- NPC Conversations
- Cutscenes
- Story Dialogues
- Hint Dialogues

---

## Quest Manager

Responsibilities:
- Quest Creation
- Quest Tracking
- Rewards
- Progress

---

## Inventory Manager

Responsibilities:
- Coins
- Books
- Scrolls
- Keys
- Artifacts
- Potions

---

## Save Manager

Responsibilities:
- Save Game
- Load Game
- Checkpoints
- Player Progress

---

## Audio Manager

Responsibilities:
- Background Music
- Ambient Sounds
- Sound Effects
- Volume Controls

---

## Animation Manager

Responsibilities:
- Character Animations
- UI Animations
- Fade Effects
- Scene Transitions

---

# 5. Game States

Splash

↓

Title Screen

↓

Main Menu

↓

Intro Cutscene

↓

Gameplay

↓

Dialogue

↓

Quest

↓

Inventory

↓

Pause

↓

Victory

↓

Game Over

---

# 6. Player Flow

Game Launch

↓

Splash Screen

↓

Title Screen

↓

Main Menu

↓

Intro Cutscene

↓

Gameplay

↓

Quest

↓

Reward

↓

Next Region

↓

Final Boss

↓

Game Complete

---

# 7. Communication Flow

Player

↓

React Frontend

↓

REST API

↓

C++ Backend

↓

DSA Algorithm Engine

↓

Response

↓

React Frontend

---

# 8. Folder Responsibilities

frontend/

Responsible for:
- UI
- Screens
- Navigation
- Animations

backend/

Responsible for:
- DSA Logic
- Quest Validation
- Hint Engine

assets/

Stores:
- Backgrounds
- Sprites
- Audio
- Fonts
- Tilesets
- Icons

docs/

Stores:
- Documentation
- Story
- Architecture
- Planning

scripts/

Utility scripts.

.github/

GitHub configuration and workflows.

---

# 9. Design Principles

- Modular
- Reusable
- Readable
- Scalable
- Maintainable
- Separation of Concerns
- Single Responsibility Principle

---

# 10. Coding Standards

- PascalCase → Components
- camelCase → Variables & Functions
- UPPER_CASE → Constants
- One Responsibility per File
- One Feature per Branch
- Consistent Folder Structure

---

# 11. Future Expansion

Potential future features:

- Multiplayer
- Achievements
- Cloud Save
- Leaderboards
- Daily Challenges
- Additional Kingdoms
- Mod Support

---

# 12. Architecture Diagram

```
                    Player
                       │
                       ▼
               React Frontend
                       │
                 React Router
                       │
                 Scene Manager
                       │
                       ▼
                  Game Manager
        ┌────────┼────────┬────────┬────────┐
        ▼        ▼        ▼        ▼
       UI    Dialogue   Quest  Inventory
        │        │        │        │
        └────────┴────────┴────────┘
                 │
        Audio • Save • Animation
                 │
                 ▼
              REST API
                 │
                 ▼
            C++ Backend
                 │
                 ▼
        DSA Algorithm Engine
```