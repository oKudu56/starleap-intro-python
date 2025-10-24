Battle Royale Prototype (three.js)

Quick start

1. From the repo root run a simple static server (Python recommended):

```powershell
cd chapters/3d_minecraft_battle
python -m http.server 8000
```

2. Open your browser at: http://localhost:8000/

Controls
- Space: Jump out of the battle bus (starts the match)
- WASD: Move (after jumping)
- Mouse: Look
- Click: Fire (placeholder)

Notes
- This is an MVP scaffold. If the page is black, open DevTools -> Console and paste errors here. The app loads three.js from a CDN; if you have network restrictions, say "add local three" and I will add a local copy.
- Next steps: weapons, consumables, chests loot tables, AI improvements, match flow and safe zone.
