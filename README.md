# LeCalculator: Production-Grade Build Analysis Engine

**LeCalculator** is a client-side analytical engine designed for the high-fidelity simulation and calculation of character statistics, effective health (EHP), and damage-per-second (DPS) for the Action RPG *Last Epoch*.

## 🏗 Architectural Overview

The system is designed as a modular, decoupled frontend application. It leverages a centralized versioning system to ensure asset synchronization across deployments.

### Core Components
* **Calculation Engine (`summary.js`):** The heart of the application. It processes raw stat inputs through iterative passes to resolve complex dependencies (e.g., Attributes -> Health -> Ward Retention -> Stable Ward).
* **Expression Parser (`statsManager.js`):** Validates and evaluates user-defined mathematical expressions (e.g., `5 + dex * 0.5`).
* **Persistence Layer (`buildManager.js` & `jsonHandler.js`):** Implements state persistence via `localStorage` and provides serialization/deserialization for `.json` export and import functionality.
* **UI Orchestration (`sections.js` & `sectionsSearch.js`):** Manages a dynamic, searchable DOM structure for complex build configurations.

## 🛡 Stability & Security Analysis

### Evaluation Safety
* **Trade-off:** The engine currently utilizes the `Function` constructor for expression evaluation. While this provides high performance and flexibility for complex math, it introduces a potential XSS vector if importing builds from untrusted third-party sources.
* **Recommendation:** Sanitize all incoming strings in `jsonHandler.js` before evaluation.

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
Asset injection is handled via a centralized manifest in the HTML head. For production deployments:
* Ensure the `v` constant in `LeCalculator.html` is incremented to bypass browser-level cache stale-dating.
* Recommended CI/CD: Static analysis of JavaScript files to ensure no global namespace collisions.

## 🛠 Planned Enhancements (Production Roadmap)
- [ ] **Security:** Transition from `Function()` evaluation to a sandboxed math parser (e.g., `math.js`) to eliminate XSS risks.
- [ ] **Integrity:** Implement JSON schema validation for the `importBuildFromFile` function.
- [ ] **Reliability:** Add a Test Suite (e.g., Jest) to verify calculation accuracy against known game-mechanic benchmarks.

## ⚖ License
MIT — *LeCalculator is a fan-made tool and is not affiliated with Eleventh Hour Games.*
