# LeCalculator: Production-Grade Build Analysis Engine

**LeCalculator** is a client-side analytical engine designed for the high-fidelity simulation and calculation of character statistics, effective health (EHP), and damage-per-second (DPS) for the Action RPG *Last Epoch*.

## 🏗 Architectural Overview

The system is designed as a modular, decoupled frontend application. It leverages a centralized versioning system to ensure asset synchronization across deployments.

### Core Components
* **Calculation Engine (`summary.js`):** The heart of the application. It processes raw stat inputs through iterative passes to resolve complex dependencies (e.g., Attributes -> Health -> Ward Retention -> Stable Ward).
* **Expression Parser (`statsManager.js`):** Validates and evaluates user-defined mathematical expressions (e.g., `5 + dex * 0.5`).
* **Persistence Layer (`buildManager.js` & `jsonHandler.js`):** Implements state persistence via `localStorage` and provides serialization/deserialization for `.json` export and import functionality.
* **UI Orchestration (`sections.js` & `sectionsSearch.js`):** Manages a dynamic, searchable DOM structure for complex build configurations.

### Performance Optimization
* **Expression Caching:** To prevent redundant CPU cycles, evaluated expressions are stored in a `Map`-based cache.
* **Debounced Updates:** Input listeners are throttled via `setTimeout` to ensure the UI remains responsive during rapid data entry.

## 📊 Technical Specifications

| Feature | Implementation Detail |
| :--- | :--- |
| **Stat Registry** | Immutable `stats` object containing unique identifiers for all game variables. |
| **Math Models** | High-precision formulas for Armor Mitigation, Dodge Chance, and Stable Ward decay. |
| **Dependencies** | Minimal footprint. Utilizes `Sortable.js` for drag-and-drop state management. |
| **Storage** | LocalStorage-backed build list with explicit `buildOrder` persistence. |

## 🚀 Getting Started

### Local Development
The project is designed to run in an isolated browser environment with no server-side dependencies.
1.  Clone the repository.
2.  Open `LeCalculator.html` in a modern, standards-compliant browser.

### Deployment
Asset injection is handled via a centralized manifest in the HTML head. For production deployments ensure the `v` constant in `LeCalculator.html` is incremented to bypass browser-level cache stale-dating.

## ⚖ License
MIT — *LeCalculator is a fan-made tool and is not affiliated with Eleventh Hour Games.*
