// 🕒 Simple Egg Clock (fixed)
// Rings: Hours (🐔), Minutes (🐣), Seconds (🥚)

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background(250);

  drawClockRings();
  drawDigitalClock();
}

function drawClockRings() {
  const cx = width / 2;
  const cy = height / 2;
  const R_HOURS = 180;
  const R_MIN = 130;
  const R_SEC = 80;

  const h = hour() % 12;
  const m = minute();
  const s = second();

  // Hours ring
  textSize(28);
  for (let i = 0; i < 12; i++) {
    const angle = map(i, 0, 12, 0, TWO_PI) - HALF_PI;
    const x = cx + cos(angle) * R_HOURS;
    const y = cy + sin(angle) * R_HOURS;
    text(i === h ? "🐔" : "·", x, y);
  }

  // Minutes ring
  textSize(22);
  for (let i = 0; i < 60; i++) {
    const angle = map(i, 0, 60, 0, TWO_PI) - HALF_PI;
    const x = cx + cos(angle) * R_MIN;
    const y = cy + sin(angle) * R_MIN;
    text(i === m ? "🐣" : "·", x, y);
  }

  // Seconds ring
  textSize(18);
  for (let i = 0; i < 60; i++) {
    const angle = map(i, 0, 60, 0, TWO_PI) - HALF_PI;
    const x = cx + cos(angle) * R_SEC;
    const y = cy + sin(angle) * R_SEC;
    text(i === s ? "🥚" : ".", x, y);
  }
}

