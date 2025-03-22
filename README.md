# LeCalculator

**LeCalculator** is a web-based calculator tool built for analyzing **damage, survivability, and overall stat interactions** for character builds in the action RPG **Last Epoch**.

It allows you to:
- Input, edit, and organize various character stats by section.
- Define mathematical expressions for stats (e.g., `5 + dex * 0.5`).
- Calculate derived stats like DPS, Health, More Damage multipliers, etc.
- Visualize contributions from different gear pieces or passive nodes via expandable tooltips.
- Highlight linked values (e.g., see what contributes to a stat when you hover or search).

## Features

- ✨ **Modular UI** with collapsible and duplicable sections.
- ✎ **Dynamic stat calculation** using JavaScript expressions.
- 🔍 **Search functionality** for section names, stat names, and math expressions.
- 🔺 **Tooltip linkage** that highlights related sections and inputs.
- 🖊️ **Expression parser** supporting custom functions like `recurveHits(x)`.
- 📂 **Save/load** builds via Base64-encoded strings and local storage.
- 📅 **Section and summary collapse states** persist between changes.
- 🔄 **Draggable stat lists** for reordering priorities.

## Getting Started

1. Clone the repo:
```bash
git clone https://github.com/your-username/lecalculator.git
cd lecalculator
```

2. Open `index.html` in a modern browser.

> No build step or server is required. Everything runs locally in your browser.

## File Overview

| File | Description |
|------|-------------|
| `index.html` | Main UI layout |
| `sections.js` | Controls creation and manipulation of sections |
| `summary.js` | Builds the summary section and calculates final stats |
| `mainGlow.js` | Tooltip interactions and UI highlighting |
| `statManager.js` | Handles stat entry logic |
| `base64Handler.js` | Build save/load logic via Base64 |
| `buildManager.js` | LocalStorage build persistence |
| `style.css` | Styling and themes |

## Custom Functions

- `recurveHits(x)`
  - Calculates average hits per second for recurve bow mechanics.
  - Integrated directly into expression evaluation logic.

## Planned Features / TODO
- [ ] Export builds as shareable URLs or JSON
- [ ] Add defensive EHP calculation support
- [ ] Compare multiple builds side-by-side
- [ ] Auto-import from in-game planner tools

## Contributing
Pull requests are welcome! Please ensure any new logic is cleanly separated and UI elements are styled consistently.

## License
MIT

---
**LeCalculator** is a fan-made tool and is not affiliated with Eleventh Hour Games or Last Epoch.

