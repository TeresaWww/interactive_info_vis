function setup() {
  createCanvas(800, 800);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(250);

  drawClockRings();
  drawDigitalClock();
}

function drawClockRings() {
  const cx = width / 2;
  const cy = height / 2;
  const R_HOURS = 280;
  const R_MIN = 200;
  const R_SEC = 120;

  const h = hour() % 12;
  const m = minute();
  const s = second();

  // Hours ring
  textSize(32);
  for (let i = 0; i < 12; i++) {
    const angle = map(i, 0, 12, 0, TWO_PI) - HALF_PI;
    const x = cx + cos(angle) * R_HOURS;
    const y = cy + sin(angle) * R_HOURS;
    text(i === h ? "🐔" : "·", x, y);
  }

  // Minutes ring
  textSize(26);
  for (let i = 0; i < 60; i++) {
    const angle = map(i, 0, 60, 0, TWO_PI) - HALF_PI;
    const x = cx + cos(angle) * R_MIN;
    const y = cy + sin(angle) * R_MIN;
    text(i === m ? "🐣" : "·", x, y);
  }

  // Seconds ring
  textSize(22);
  for (let i = 0; i < 60; i++) {
    const angle = map(i, 0, 60, 0, TWO_PI) - HALF_PI;
    const x = cx + cos(angle) * R_SEC;
    const y = cy + sin(angle) * R_SEC;
    text(i === s ? "🥚" : ".", x, y);
  }
}

function drawDigitalClock() {
  let h = hour();
  let m = nf(minute(), 2);
  let s = nf(second(), 2);
  let ampm = h < 12 ? "AM" : "PM";
  h = h % 12;
  if (h === 0) h = 12;

  push();
  fill(40);
  textSize(40);
  text(`${h}:${m}:${s} ${ampm}`, width / 2, height / 2);
  pop();
}
