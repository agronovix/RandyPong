/**
 * American Pong — single-file Google Apps Script deployment
 *
 * Setup:
 * 1. Go to https://script.google.com and create a new project.
 * 2. Replace the default Code.gs contents with this entire file.
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (or your choice)
 * 4. Open the deployment URL to play.
 */

function doGet() {
  return HtmlService.createHtmlOutput(getGameHtml())
    .setTitle('American Pong')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getGameHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>American Pong</title>
  <style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #1a2744 0%, #0d1117 70%);
  font-family: "Segoe UI", system-ui, sans-serif;
  color: #e6edf3;
}

#game-container {
  text-align: center;
  padding: 1.5rem;
}

header h1 {
  font-size: 2.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #bf0a30, #ffffff 45%, #002868);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.tagline {
  color: #8b949e;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

#canvas-wrap {
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

#game {
  display: block;
  border: 3px solid #30363d;
  border-radius: 8px;
  box-shadow:
    0 0 40px rgba(0, 40, 104, 0.2),
    inset 0 0 60px rgba(0, 0, 0, 0.4);
  background: #0a1628;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(10, 22, 40, 0.88);
  border-radius: 8px;
  padding: 2rem;
}

.overlay.hidden {
  display: none;
}

.overlay h2 {
  font-size: 2rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.overlay .menu-subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.menu-btn {
  min-width: 160px;
  padding: 0.65rem 1.5rem;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: linear-gradient(180deg, #21262d, #161b22);
  color: #e6edf3;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.menu-btn:hover {
  border-color: #58a6ff;
  background: linear-gradient(180deg, #30363d, #21262d);
}

.menu-btn.primary {
  border-color: #bf0a30;
  background: linear-gradient(180deg, #d4143a, #bf0a30);
}

.menu-btn.primary:hover {
  border-color: #ff4d6d;
  background: linear-gradient(180deg, #e8224a, #d4143a);
}

.credits {
  margin-top: 0.75rem;
  color: #6e7681;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

#hud {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  max-width: 900px;
}

.score {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8b949e;
}

.score span:last-child {
  font-size: 2.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

#status {
  font-size: 0.95rem;
  color: #58a6ff;
  min-height: 1.4em;
}

#controls {
  margin-top: 1.25rem;
  color: #6e7681;
  font-size: 0.85rem;
  line-height: 1.8;
}

kbd {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border: 1px solid #30363d;
  border-radius: 4px;
  background: #161b22;
  font-family: inherit;
  font-size: 0.8rem;
  color: #c9d1d9;
}
  </style>
</head>
<body>
  <div id="game-container">
    <header>
      <h1>American Pong</h1>
      <p class="tagline">Classic paddle action. First to 7.</p>
    </header>

    <div id="canvas-wrap">
      <canvas id="game" width="900" height="520" aria-label="American Pong game canvas"></canvas>

      <div id="start-menu" class="overlay">
        <h2>American Pong</h2>
        <p class="menu-subtitle">First to 7 wins</p>
        <button id="btn-start" class="menu-btn primary" type="button">Start</button>
        <p class="credits">by Austin Buhl</p>
      </div>

      <div id="pause-menu" class="overlay hidden">
        <h2>Paused</h2>
        <button id="btn-resume" class="menu-btn primary" type="button">Resume</button>
        <button id="btn-restart" class="menu-btn" type="button">Restart</button>
        <p class="credits">by Austin Buhl</p>
      </div>
    </div>

    <div id="hud">
      <div class="score">
        <span class="label">You</span>
        <span id="player-score">0</span>
      </div>
      <div id="status">Press Start to play</div>
      <div class="score">
        <span class="label">CPU</span>
        <span id="cpu-score">0</span>
      </div>
    </div>

    <div id="controls">
      <p><kbd>W</kbd> / <kbd>S</kbd> or <kbd>↑</kbd> / <kbd>↓</kbd> — move paddle</p>
      <p><kbd>SPACE</kbd> — serve &nbsp;·&nbsp; <kbd>P</kbd> / <kbd>ESC</kbd> — pause</p>
    </div>
  </div>

  <script>
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const statusEl = document.getElementById("status");
const startMenuEl = document.getElementById("start-menu");
const pauseMenuEl = document.getElementById("pause-menu");
const btnStart = document.getElementById("btn-start");
const btnResume = document.getElementById("btn-resume");
const btnRestart = document.getElementById("btn-restart");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 24;
const BALL_RADIUS = 10;
const WIN_SCORE = 7;

const state = {
  phase: "start",
  playerY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  cpuY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  ball: { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0 },
  playerScore: 0,
  cpuScore: 0,
  serving: true,
  serveDirection: 1,
  lastTime: 0,
};

const keys = { up: false, down: false };

const PADDLE_SPEED = 420;
const CPU_SPEED = 340;
const INITIAL_SPEED = 380;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setStatus(text) {
  statusEl.textContent = text;
}

function showStartMenu() {
  state.phase = "start";
  startMenuEl.classList.remove("hidden");
  pauseMenuEl.classList.add("hidden");
  setStatus("Press Start to play");
}

function showPauseMenu() {
  state.phase = "paused";
  pauseMenuEl.classList.remove("hidden");
  setStatus("Paused");
}

function hideMenus() {
  startMenuEl.classList.add("hidden");
  pauseMenuEl.classList.add("hidden");
}

function resetBall(direction) {
  state.ball.x = WIDTH / 2;
  state.ball.y = HEIGHT / 2;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.serving = true;
  state.serveDirection = direction;
  if (state.phase === "playing") {
    setStatus("Press SPACE to serve");
  }
}

function restartMatch() {
  state.playerScore = 0;
  state.cpuScore = 0;
  playerScoreEl.textContent = "0";
  cpuScoreEl.textContent = "0";
  state.playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  state.cpuY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

function startGame() {
  hideMenus();
  state.phase = "playing";
  restartMatch();
}

function resumeGame() {
  hideMenus();
  state.phase = "playing";
  setStatus(state.serving ? "Press SPACE to serve" : "Ball in play");
}

function pauseGame() {
  if (state.phase !== "playing") return;
  showPauseMenu();
}

function serveBall() {
  if (state.phase !== "playing" || !state.serving) return;

  const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
  state.ball.vx = Math.cos(angle) * INITIAL_SPEED * state.serveDirection;
  state.ball.vy = Math.sin(angle) * INITIAL_SPEED;
  state.serving = false;
  setStatus("Ball in play");
}

function drawCourt() {
  ctx.fillStyle = "#0a1628";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(0, 40, 104, 0.45)";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, WIDTH - 4, HEIGHT - 4);
}

function drawPaddle(x, y, color) {
  const gradient = ctx.createLinearGradient(x, 0, x + PADDLE_WIDTH, 0);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, shadeColor(color, -20));

  ctx.fillStyle = gradient;
  roundRect(ctx, x, y, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  roundRect(ctx, x + 3, y + 4, 4, PADDLE_HEIGHT - 8, 2);
  ctx.fill();
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const r = clamp(((num >> 16) & 0xff) + percent, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + percent, 0, 255);
  const b = clamp((num & 0xff) + percent, 0, 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawBall(x, y) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.arc(x, y + 3, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createRadialGradient(
    x - BALL_RADIUS * 0.35,
    y - BALL_RADIUS * 0.35,
    1,
    x,
    y,
    BALL_RADIUS
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#b8c0cc");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function updatePlayer(dt) {
  let dy = 0;
  if (keys.up) dy -= PADDLE_SPEED * dt;
  if (keys.down) dy += PADDLE_SPEED * dt;
  state.playerY = clamp(state.playerY + dy, 0, HEIGHT - PADDLE_HEIGHT);
}

function updateCpu(dt) {
  const paddleCenter = state.cpuY + PADDLE_HEIGHT / 2;
  const diff = state.ball.y - paddleCenter;
  let move = 0;
  if (Math.abs(diff) > 8) {
    move = Math.sign(diff) * CPU_SPEED * dt;
  }
  state.cpuY = clamp(state.cpuY + move, 0, HEIGHT - PADDLE_HEIGHT);
}

function collideWithPaddle(paddleY, paddleX, isPlayer) {
  const ball = state.ball;
  const nextX = ball.x + ball.vx * 0.016;

  const withinY =
    ball.y + BALL_RADIUS > paddleY &&
    ball.y - BALL_RADIUS < paddleY + PADDLE_HEIGHT;

  const hitLeft =
    isPlayer &&
    ball.vx < 0 &&
    nextX - BALL_RADIUS <= paddleX + PADDLE_WIDTH &&
    ball.x - BALL_RADIUS >= paddleX;

  const hitRight =
    !isPlayer &&
    ball.vx > 0 &&
    nextX + BALL_RADIUS >= paddleX &&
    ball.x + BALL_RADIUS <= paddleX + PADDLE_WIDTH;

  if (!withinY || (!hitLeft && !hitRight)) return;

  const paddleCenter = paddleY + PADDLE_HEIGHT / 2;
  const relativeIntersect = (ball.y - paddleCenter) / (PADDLE_HEIGHT / 2);
  const bounceAngle = relativeIntersect * (Math.PI / 3);
  const speed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.04 + 12, 720);
  const direction = isPlayer ? 1 : -1;

  ball.vx = Math.cos(bounceAngle) * speed * direction;
  ball.vy = Math.sin(bounceAngle) * speed;

  if (isPlayer) {
    ball.x = paddleX + PADDLE_WIDTH + BALL_RADIUS + 1;
  } else {
    ball.x = paddleX - BALL_RADIUS - 1;
  }

  setStatus(isPlayer ? "Nice return!" : "CPU returned it!");
}

function updateBall(dt) {
  if (state.serving) return;

  const ball = state.ball;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.y - BALL_RADIUS <= 0) {
    ball.y = BALL_RADIUS;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + BALL_RADIUS >= HEIGHT) {
    ball.y = HEIGHT - BALL_RADIUS;
    ball.vy = -Math.abs(ball.vy);
  }

  collideWithPaddle(state.playerY, PADDLE_MARGIN, true);
  collideWithPaddle(state.cpuY, WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, false);

  if (ball.x - BALL_RADIUS < 0) {
    state.cpuScore += 1;
    cpuScoreEl.textContent = state.cpuScore;
    checkWin();
    resetBall(1);
  } else if (ball.x + BALL_RADIUS > WIDTH) {
    state.playerScore += 1;
    playerScoreEl.textContent = state.playerScore;
    checkWin();
    resetBall(-1);
  }
}

function checkWin() {
  if (state.playerScore >= WIN_SCORE) {
    setStatus("You win! Press Restart to play again.");
    state.serving = true;
    state.phase = "paused";
    showPauseMenu();
  } else if (state.cpuScore >= WIN_SCORE) {
    setStatus("CPU wins. Press Restart for a rematch.");
    state.serving = true;
    state.phase = "paused";
    showPauseMenu();
  }
}

function draw() {
  drawCourt();
  drawPaddle(PADDLE_MARGIN, state.playerY, "#58a6ff");
  drawPaddle(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, state.cpuY, "#bf0a30");
  drawBall(state.ball.x, state.ball.y);

  if (state.phase === "playing" && state.serving && state.playerScore < WIN_SCORE && state.cpuScore < WIN_SCORE) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#e6edf3";
    ctx.font = "600 18px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPACE to serve", WIDTH / 2, HEIGHT / 2 + 50);
  }
}

function update(dt) {
  updatePlayer(dt);
  updateCpu(dt);
  updateBall(dt);
}

function loop(timestamp) {
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.032);
  state.lastTime = timestamp;

  if (state.phase === "playing") {
    update(dt);
  }
  draw();
  requestAnimationFrame(loop);
}

btnStart.addEventListener("click", startGame);
btnResume.addEventListener("click", resumeGame);
btnRestart.addEventListener("click", () => {
  hideMenus();
  state.phase = "playing";
  restartMatch();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW" || e.code === "ArrowUp") {
    keys.up = true;
    e.preventDefault();
  }
  if (e.code === "KeyS" || e.code === "ArrowDown") {
    keys.down = true;
    e.preventDefault();
  }
  if (e.code === "KeyP" || e.code === "Escape") {
    e.preventDefault();
    if (state.phase === "playing") {
      pauseGame();
    } else if (state.phase === "paused") {
      resumeGame();
    }
  }
  if (e.code === "Space") {
    e.preventDefault();
    if (state.phase === "playing") {
      serveBall();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW" || e.code === "ArrowUp") keys.up = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.down = false;
});

resetBall(1);
requestAnimationFrame(loop);
  <\/script>
</body>
</html>`;
}
