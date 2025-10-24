Orb Collector — Mini Game

How to run

1. Start a static server in the workspace or open the file via a local server. Example (PowerShell):

```powershell
cd chapters/mini_invented_game
python -m http.server 8000
```

2. Open in a browser:

http://localhost:8000/chapters/mini_invented_game/

Controls
- Space: Start the match
- WASD or Arrow keys: Move
- R: Restart after Game Over

Goal
- Collect the target number of glowing orbs while avoiding sentry bots. Orbs will respawn slowly if you miss them.
