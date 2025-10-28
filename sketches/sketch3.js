registerSketch('sk3', function (p) {
  p.setup = function () {
    p.createCanvas(800, 800);
    p.canvas.style.display = 'block';

    p.textAlign(p.CENTER, p.CENTER);
    p.noStroke();
  };

  p.draw = function () {
    p.background(250);
    drawClockRings();
    drawDigitalClock();
  };

  function drawClockRings() {
    const cx = p.width / 2;
    const cy = p.height / 2;
    const R_HOURS = 280;
    const R_MIN   = 200;
    const R_SEC   = 120;

    const h = p.hour() % 12;
    const m = p.minute();
    const s = p.second();

    // Hours ring
    p.textSize(32);
    for (let i = 0; i < 12; i++) {
      const angle = p.map(i, 0, 12, 0, p.TWO_PI) - p.HALF_PI;
      const x = cx + p.cos(angle) * R_HOURS;
      const y = cy + p.sin(angle) * R_HOURS;
      p.text(i === h ? "🐔" : "·", x, y);
    }

    // Minutes ring
    p.textSize(26);
    for (let i = 0; i < 60; i++) {
      const angle = p.map(i, 0, 60, 0, p.TWO_PI) - p.HALF_PI;
      const x = cx + p.cos(angle) * R_MIN;
      const y = cy + p.sin(angle) * R_MIN;
      p.text(i === m ? "🐣" : "·", x, y);
    }

    // Seconds ring
    p.textSize(22);
    for (let i = 0; i < 60; i++) {
      const angle = p.map(i, 0, 60, 0, p.TWO_PI) - p.HALF_PI;
      const x = cx + p.cos(angle) * R_SEC;
      const y = cy + p.sin(angle) * R_SEC;
      p.text(i === s ? "🥚" : ".", x, y);
    }
  }

  function drawDigitalClock() {
    let h = p.hour();
    let m = p.nf(p.minute(), 2);
    let s = p.nf(p.second(), 2);
    let ampm = h < 12 ? "AM" : "PM";
    h = h % 12;
    if (h === 0) h = 12;

    p.push();
    p.fill(40);
    p.textSize(40);
    p.text(`${h}:${m}:${s} ${ampm}`, p.width / 2, p.height / 2);
    p.pop();
  }
});
