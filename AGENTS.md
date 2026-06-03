# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

**Randy Pong** is a client-side Pong clone (HTML5 Canvas + vanilla JavaScript). There are no npm/pip dependencies, no build step, and no backend services.

**Branch note:** `main` currently contains only a stub `README.md`. The playable game lives on `cursor/randy-pong-4029` (`index.html`, `game.js`, `styles.css`). Check out that branch (or merge it) before running or testing the app.

## Development commands

| Task | Command |
|------|---------|
| Serve locally | `python3 -m http.server 8080` (from repo root) |
| Open in browser | http://localhost:8080 |
| JS syntax check | `node --check game.js` |

There is no configured linter or test suite.

## Controls (in-game)

- `W` / `S` or `↑` / `↓` — move player paddle
- `Space` — serve Randy (or restart after a match)

First to 7 points wins.

## Cursor Cloud specific instructions

- **No dependency install step.** Python 3 and a browser are sufficient. Node.js is optional (only for `node --check game.js`).
- **Start the static server in tmux** so it survives the session:
  ```bash
  SESSION_NAME="randy-pong-server"
  tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
    || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "/workspace" -- "${SHELL:-zsh}" -l
  tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" 'cd /workspace && python3 -m http.server 8080' C-m
  ```
- **Use branch `cursor/randy-pong-4029`** for the full game files if `index.html` is missing on your current branch.
- **Google Chrome** is available at `/usr/local/bin/google-chrome` for GUI/manual testing.
- Opening `index.html` via `file://` also works per README, but serving over HTTP is preferred for browser testing.
- The only common console noise is a harmless 404 for `favicon.ico` (not shipped).
