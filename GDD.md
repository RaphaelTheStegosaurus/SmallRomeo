# Game Design Document (GDD)

**Game Title:** Romeo, You're Small
**Document Version:** 2.0
**Last Modified Date:** 11/01/2025
**Author / Studio:** Rafael Alberto Serrato Morales/RaphaelAlbertoTheStegosaurus

---

## 1. Introduction

### 1.1. Concept Summary
> A Puzzle/Platformer game focused on agility and movement where the player must reach the goal by utilizing environment objects to increase their stilt height, while simultaneously avoiding objects that impede their progress.

### 1.2. Purpose and Vision

* **Game Vision:** To create an experience that challenges and develops the player's dexterity and agility.
* **Target Audience:** The honorable public of the LittleJS Engine Jam and the esteemed jury of the JAM.
* **Genre:** 2D Platformer, Action, Puzzle.
* **Platforms:** Web Browser.

### 1.3. Design Pillars

1.  **Immediate Movement:** Character control must be immediate and responsive to efficiently move from point A to point B.
2.  **Item Management:** The player must collect most of the branches/items in the stage to increase the size of their makeshift stilts, or else the dogs will catch up to them.
3.  **Time is Paramount:** As time passes, the stilts shrink, being slowly gnawed away by the dogs. The constant threat forces the player to act quickly.

### 1.4. Project Scope

* **Game Jam Duration:** 5 days.
* **Minimum Viable Product (MVP):** 1 complete level featuring the core gameplay loop, and all necessary screens (Start Menu, Game Over, You Win).

---

## 2. Gameplay

### 2.1. Mechanics

#### 2.1.1. Character Movement

| Action | PC (Keyboard/Mouse)       | Mobile (Touch)                  |
| :----- | :------------------------ | :------------------------------ |
| Move   | A, D / Left, Right Arrows | Swipe Right or Left             |
| Jump   | W / Space / Up Arrow      | Tap (Right Side) / Double Touch |
| Pause  | Pressing the UI Button    | Pressing the UI Button          |

#### 2.1.2. Balance and Metrics (Core Stilt Mechanic)

This section defines the numerical values that control the game's difficulty and the flow of the central mechanic.

| Metric                         | Value               | Description                                                                        | Code Constant                      |
| :----------------------------- | :------------------ | :--------------------------------------------------------------------------------- | :--------------------------------- |
| **Initial Height**             | 5.0 units           | Stilt height at the start of each run.                                             | N/A                                |
| **Minimum Height (Game Over)** | 0.01 units          | The game ends (Game Over) if the stilt height reaches this value.                  | `STILT_HEIGHT_MIN`                 |
| **Win Height**                 | 2.8 units           | Minimum height required to reach the final platform and win.                       | `STILT_HEIGHT_TO_WIN`              |
| **Base Shrink Rate**           | -0.1 units/15second | Variable height loss, representing the passage of time.                            | (Controlled by `gameUpdate` logic) |
| **Height Increase (Branch)**   | +2.0 units          | Instant height gain upon collecting a Branch item.                                 | (Item Spawner Logic)               |
| **Collision Damage (Dog)**     | -1.0 seconds        | Instant height loss when hit by a DogChihuahua.                                    | (Collision Logic)                  |
| **Tool Effect (WoodTool)**     | +0.1 units          | Height gain value when picking up the WoodTool. Acts as a minor height boost item. | `WOODTOOL_VALUE`                   |

#### 2.1.3. Progression and Win/Loss Conditions
* **Loss Condition (Game Over):** Occurs when the stilt height reaches the minimum value of 0.01 units.
* **Win Condition (You Win):** The player must achieve the minimum required stilt height (`STILT_HEIGHT_TO_WIN`) **and** reach the final platform where the girlfriend is located.
* **Replayability:** Centered on achieving the fastest completion time or the highest survival duration.

### 2.2. Enemies
* **DogChihuahua (The main enemy):** Its primary mechanic is to pursue the player horizontally on the ground, trying to gnaw at their stilts. Its AI is purely a horizontal chase/pursuit.

---

## 3. Narrative

* **Main Character:** Romeo, a young man looking for his girlfriend. His short stature forces him to use makeshift stilts to reach her, as she is located in a high place.
* **Antagonist:** The DogChihuahuas, a pack of small dogs that bite and chew on Romeo's wooden stilts.
* **Context:** A one-act comedy/drama where Romeo battles the obstacles of his height and the dogs to be reunited with his beloved.

---

## 4. Style and Aesthetics

### 4.1. Art Style
* **Art Direction:** Retro-style Pixel Art, inspired by a limited GameBoy-like color palette.
* **References:** The art style is based on games like *Dead Cells* and *Enter the Gungeon*.

### 4.2. User Interface (UI) and User Experience (UX)
* **UI Style:** Minimalist, but with a background that tells the story or indicates the current location within the game. Button placement is designed not to obscure core visual elements, depending on the current menu.
* **HUD:**
    * Stilt Height Gauge (Top-left corner).
    * Pause Button (Top-left corner).

### 4.3. Sound
* **Music Direction:** Looping musical piece sourced from [Pixabay](https://pixabay.com/) by composer Maksym Maiko.
* **SFX:** Some sound effects are sourced from the built-in Zzfx examples within the LittleJS Engine, and others from [freesound](https://freesound.org/).

---

## 5. Technical Requirements

### 5.1. Technology and Tools
* **Game Engine:** LittleJS Engine.
* **Programming Languages:** Vanilla JavaScript.
* **Version Control:** Git (GitHub/GitLab).
* **Editor:** VSCode

### 5.2. Hardware Requirements
* **Minimum:** Currently only compatible on desktop computers.

---

## 6. Project Management

### 6.1. Version History

| Version | Date       | Author | Key Changes                                         |
| :------ | :--------- | :----- | :-------------------------------------------------- |
| 0.1     | 20/10/2024 | Rafael | Document creation and definition of design pillars. |
| 1.0     | 25/10/2024 | Rafael | Addition of narrative and first level drafts.       |
| 2.0     | 11/01/2025 | Rafael | Updated Balance and Metrics.                        |