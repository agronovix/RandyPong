# American Pong

Classic paddle Pong with a patriotic theme. Play against the CPU — first to 7 wins.

## Deploy

This game ships as a single Google Apps Script file.

1. Go to [script.google.com](https://script.google.com) and create a new project.
2. Replace the default `Code.gs` contents with the entire `american-pong-script.js` file.
3. **Deploy → New deployment → Type: Web app**
   - Execute as: Me
   - Who has access: Anyone (or your choice)
4. Open the deployment URL to play.

## Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move paddle up |
| `S` / `↓` | Move paddle down |
| `Enter` | Serve the ball |
| `Space` / `P` / `Esc` | Pause / resume |

## Difficulty

Choose a difficulty on the start screen before pressing **Start**:

| Level | Description |
|-------|-------------|
| **Easy** | Slower CPU, slower ball, less aggressive returns |
| **Normal** | Default balanced gameplay |
| **Hard** | Faster CPU, faster ball, sharper returns |

## License

MIT License — see [LICENSE](LICENSE).
