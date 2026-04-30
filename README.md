# justinstoneoh.github.io

Justin's personal website, deployed via **GitHub Pages**.

## 🌐 Live Site

**<https://justinstoneoh.github.io>**

---

## ✨ Features

| Feature | Where |
|---|---|
| 🎮 **Mini Arcade** (Snake, Tic-Tac-Toe, Reaction Timer) | [`games.html`](https://justinstoneoh.github.io/games.html) |
| 📋 **Goal Tracker** — add goals, check them off, saved in `localStorage` | Homepage `#tools` |
| ⏱ **Focus Timer** — Pomodoro-style countdown | Homepage `#tools` |
| 🏆 **Rankings & Votes** — beer rankings + best-sport vote | [`rankings.html`](https://justinstoneoh.github.io/rankings.html) |

Everything is **100% client-side** (HTML / CSS / Vanilla JS). No framework, no build step, no backend.

---

## 🎮 Interactive Component Details

### Snake
- Classic snake game on a canvas grid
- Arrow keys / WASD **or** the on-screen D-pad
- Swipe on mobile
- High score saved in `localStorage`

### Tic-Tac-Toe
- You are **X**, the CPU is **O**
- CPU uses **minimax** — it plays perfectly
- Running score tracked per session

### Reaction Timer
- Click when the box turns green
- Measures reaction time in milliseconds
- Best / average calculated from last 50 attempts, saved in `localStorage`

---

## 🏃 Run Locally

No build step needed. Use any static file server from the repo root:

```bash
# Python 3
python -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then open **<http://localhost:8080>** in your browser.

---

## 📁 File Structure

```
index.html          — Homepage (goal tracker + focus timer)
games.html          — Mini arcade (Snake, Tic-Tac-Toe, Reaction Timer)
rankings.html       — Rankings / vote widgets
style.css           — Shared styles
script.js           — Homepage JS
rankings.js         — Rankings page JS
*.pdf, *.docx       — Resume files
```

