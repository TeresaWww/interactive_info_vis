registerSketch('sk4', function (p) {
  let table = { x: 0, y: 0, w: 0, h: 0 };
  let clock = { x: 0, y: 0, w: 0, h: 0, radius: 12 };

  p.setup = function () {
    p.createCanvas(800, 800);
    p.textFont('Helvetica, Arial, sans-serif');
    computeLayout();
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    computeLayout();
  };

  function computeLayout() {
    table.w = p.width * 0.9;
    table.h = p.height * 0.25;
    table.x = (p.width - table.w) / 2;
    table.y = p.height - table.h - 20;

    clock.w = table.w * 0.28;
    clock.h = table.h * 0.42;
    clock.x = table.x + table.w * 0.36;
    clock.y = table.y - clock.h - 18;
  }

  p.draw = function () {
    p.background('#e6e2c9');

    drawClockBody(true);
    drawDigitalTime(true);
  };

  function drawClockBody(lightMode) {
    p.strokeWeight(3);
    p.stroke(30);
    p.fill(25);
    p.rect(clock.x, clock.y, clock.w, clock.h, clock.radius);

    const pad = 12;
    p.noStroke();
    p.fill(220);
    p.rect(clock.x + pad, clock.y + pad, clock.w - pad * 2, clock.h - pad * 2, 8);
  }

  function drawDigitalTime() {
    const now = new Date();
    const hh = nf(now.getHours(), 2);
    const mm = nf(now.getMinutes(), 2);
    const ss = nf(now.getSeconds(), 2);
    const timeStr = `${hh}:${mm}:${ss}`;

    const pad = 12;
    const sx = clock.x + pad;
    const sy = clock.y + pad;
    const swidth = clock.w - pad * 2;
    const sheight = clock.h - pad * 2;

    p.textAlign(p.CENTER, p.CENTER);
    p.fill(20);
    p.textSize(Math.min(swidth, sheight) * 0.42);
    p.text(timeStr, sx + swidth / 2, sy + sheight / 2);
  }

  function nf(num, ndigits) {
    const s = String(num);
    return s.length >= ndigits ? s : '0'.repeat(ndigits - s.length) + s;
  }
});
