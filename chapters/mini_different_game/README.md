Space Runner — Mini Different Game

How to run

1. Start a static server in the workspace (PowerShell):

```powershell
cd chapters/mini_different_game
python -m http.server 8000
```

2. Open in a browser:

http://localhost:8000/chapters/mini_different_game/

Controls
- Space: Start / Boost (jump upward)
- A/D or ArrowLeft/ArrowRight: Move left / right
- R: Restart after Game Over

Goal
- Avoid incoming asteroids and collect fuel cells to increase score. The game speeds up slowly over time.
