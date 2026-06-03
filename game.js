const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("player-score");
const cpuScoreEl = document.getElementById("cpu-score");
const statusEl = document.getElementById("status");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 24;
const RANDY_RADIUS = 22;
const WIN_SCORE = 7;

const state = {
  playerY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  cpuY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  randy: {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 0,
    vy: 0,
    spin: 0,
    limbPhase: 0,
  },
  playerScore: 0,
  cpuScore: 0,
  serving: true,
  serveDirection: 1,
  lastTime: 0,
};

const keys = {
  up: false,
  down: false,
};

const PADDLE_SPEED = 420;
const CPU_SPEED = 340;
const INITIAL_SPEED = 380;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetRandy(direction) {
  state.randy.x = WIDTH / 2;
  state.randy.y = HEIGHT / 2;
  state.randy.vx = 0;
  state.randy.vy = 0;
  state.randy.spin = 0;
  state.serving = true;
  state.serveDirection = direction;
  statusEl.textContent = "Press SPACE to serve Randy";
}

function serveRandy() {
  if (!state.serving) return;

  const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
  state.randy.vx = Math.cos(angle) * INITIAL_SPEED * state.serveDirection;
  state.randy.vy = Math.sin(angle) * INITIAL_SPEED;
  state.randy.spin = state.serveDirection * 6;
  state.serving = false;
  statusEl.textContent = "Randy is in play!";
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

  ctx.strokeStyle = "rgba(255, 107, 53, 0.35)";
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
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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

function drawRandy(x, y, spin, limbPhase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);

  const bounce = Math.sin(limbPhase * 2) * 2;
  ctx.translate(0, bounce);

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(0, RANDY_RADIUS + 4, RANDY_RADIUS * 0.8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const legSwing = Math.sin(limbPhase) * 8;
  ctx.strokeStyle = "#2d4a6f";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 10);
  ctx.lineTo(-8 + legSwing, 22);
  ctx.moveTo(6, 10);
  ctx.lineTo(8 - legSwing, 22);
  ctx.stroke();

  // Body
  ctx.fillStyle = "#ff6b35";
  roundRect(ctx, -10, -2, 20, 16, 4);
  ctx.fill();

  // Arms (flailing!)
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 4;
  const armSwing = Math.cos(limbPhase * 1.5) * 10;
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(-18, -6 + armSwing);
  ctx.moveTo(10, 2);
  ctx.lineTo(18, 8 - armSwing);
  ctx.stroke();

  // Head
  ctx.fillStyle = "#ffd4a3";
  ctx.beginPath();
  ctx.arc(0, -14, 12, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.arc(0, -18, 10, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes (panicked)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(-4, -15, 2.5, 3.5, -0.2, 0, Math.PI * 2);
  ctx.ellipse(4, -15, 2.5, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "#c97b63";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -10, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Name tag
  ctx.rotate(-spin);
  ctx.fillStyle = "#f7c948";
  ctx.font = "bold 9px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("RANDY", 0, RANDY_RADIUS + 14);

  ctx.restore();
}

function updatePlayer(dt) {
  let dy = 0;
  if (keys.up) dy -= PADDLE_SPEED * dt;
  if (keys.down) dy += PADDLE_SPEED * dt;
  state.playerY = clamp(state.playerY + dy, 0, HEIGHT - PADDLE_HEIGHT);
}

function updateCpu(dt) {
  const paddleCenter = state.cpuY + PADDLE_HEIGHT / 2;
  const target = state.randy.y;
  const diff = target - paddleCenter;

  let move = 0;
  if (Math.abs(diff) > 8) {
    move = Math.sign(diff) * CPU_SPEED * dt;
  }

  state.cpuY = clamp(state.cpuY + move, 0, HEIGHT - PADDLE_HEIGHT);
}

function collideWithPaddle(paddleY, paddleX, isPlayer) {
  const randy = state.randy;
  const nextX = randy.x + randy.vx * 0.016;

  const withinY =
    randy.y + RANDY_RADIUS > paddleY &&
    randy.y - RANDY_RADIUS < paddleY + PADDLE_HEIGHT;

  const hitLeft =
    isPlayer &&
    randy.vx < 0 &&
    nextX - RANDY_RADIUS <= paddleX + PADDLE_WIDTH &&
    randy.x - RANDY_RADIUS >= paddleX;

  const hitRight =
    !isPlayer &&
    randy.vx > 0 &&
    nextX + RANDY_RADIUS >= paddleX &&
    randy.x + RANDY_RADIUS <= paddleX + PADDLE_WIDTH;

  if (!withinY || (!hitLeft && !hitRight)) return;

  const paddleCenter = paddleY + PADDLE_HEIGHT / 2;
  const relativeIntersect = (randy.y - paddleCenter) / (PADDLE_HEIGHT / 2);
  const bounceAngle = relativeIntersect * (Math.PI / 3);
  const speed = Math.min(
    Math.hypot(randy.vx, randy.vy) * 1.04 + 12,
    720
  );
  const direction = isPlayer ? 1 : -1;

  randy.vx = Math.cos(bounceAngle) * speed * direction;
  randy.vy = Math.sin(bounceAngle) * speed;
  randy.spin += direction * 4;

  if (isPlayer) {
    randy.x = paddleX + PADDLE_WIDTH + RANDY_RADIUS + 1;
  } else {
    randy.x = paddleX - RANDY_RADIUS - 1;
  }

  statusEl.textContent = isPlayer ? "Nice hit!" : "CPU returned Randy!";
}

function updateRandy(dt) {
  if (state.serving) return;

  const randy = state.randy;
  randy.x += randy.vx * dt;
  randy.y += randy.vy * dt;
  randy.spin += randy.vx * dt * 0.015;
  randy.limbPhase += dt * 12;

  if (randy.y - RANDY_RADIUS <= 0) {
    randy.y = RANDY_RADIUS;
    randy.vy = Math.abs(randy.vy);
  } else if (randy.y + RANDY_RADIUS >= HEIGHT) {
    randy.y = HEIGHT - RANDY_RADIUS;
    randy.vy = -Math.abs(randy.vy);
  }

  collideWithPaddle(state.playerY, PADDLE_MARGIN, true);
  collideWithPaddle(state.cpuY, WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, false);

  if (randy.x - RANDY_RADIUS < 0) {
    state.cpuScore += 1;
    cpuScoreEl.textContent = state.cpuScore;
    checkWin();
    resetRandy(1);
  } else if (randy.x + RANDY_RADIUS > WIDTH) {
    state.playerScore += 1;
    playerScoreEl.textContent = state.playerScore;
    checkWin();
    resetRandy(-1);
  }
}

function checkWin() {
  if (state.playerScore >= WIN_SCORE) {
    statusEl.textContent = "You win! Randy believes in you!";
    state.serving = true;
  } else if (state.cpuScore >= WIN_SCORE) {
    statusEl.textContent = "CPU wins. Randy needs a rematch.";
    state.serving = true;
  }
}

function draw() {
  drawCourt();
  drawPaddle(PADDLE_MARGIN, state.playerY, "#58a6ff");
  drawPaddle(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, state.cpuY, "#f85149");
  drawRandy(
    state.randy.x,
    state.randy.y,
    state.randy.spin,
    state.randy.limbPhase
  );

  if (state.serving && state.playerScore < WIN_SCORE && state.cpuScore < WIN_SCORE) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#f7c948";
    ctx.font = "600 18px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPACE to launch Randy →", WIDTH / 2, HEIGHT / 2 + 50);
  }
}

function update(dt) {
  updatePlayer(dt);
  updateCpu(dt);
  updateRandy(dt);
}

function loop(timestamp) {
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.032);
  state.lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW" || e.code === "ArrowUp") {
    keys.up = true;
    e.preventDefault();
  }
  if (e.code === "KeyS" || e.code === "ArrowDown") {
    keys.down = true;
    e.preventDefault();
  }
  if (e.code === "Space") {
    e.preventDefault();
    if (state.playerScore >= WIN_SCORE || state.cpuScore >= WIN_SCORE) {
      state.playerScore = 0;
      state.cpuScore = 0;
      playerScoreEl.textContent = "0";
      cpuScoreEl.textContent = "0";
      resetRandy(Math.random() > 0.5 ? 1 : -1);
    } else {
      serveRandy();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW" || e.code === "ArrowUp") keys.up = false;
  if (e.code === "KeyS" || e.code === "ArrowDown") keys.down = false;
});

resetRandy(1);
requestAnimationFrame(loop);
