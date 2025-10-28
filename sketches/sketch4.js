registerSketch('sk4', function (p) {
  let lightOn = true;
  let bulb = { x: 0, y: 0, size: 80 };
  let sw = { x: 0, y: 0, w: 80, h: 40 };
  let table = { x: 0, y: 0, w: 0, h: 0 };
  let clock = { x: 0, y: 0, w: 0, h: 0, radius: 12 };

  p.setup = function () {
    p.createCanvas(800, 800);
    p.textFont('Helvetica, Arial, sans-serif');
    computeLayout();
    updateCursor();
  };

  p.windowResized = function () {
    p.resizeCanvas(800, 800);
    computeLayout();
  };

  function computeLayout() {
    bulb.x = p.width / 2;
    bulb.y = p.height * 0.18;

    sw.x = bulb.x + bulb.size * 1.3;
    sw.y = bulb.y - sw.h / 2;

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
    if (lightOn) drawSceneLightOn();
    else drawSceneLightOff();
    drawLightAndSwitch();
    updateCursor();
  };

  function drawSceneLightOn() {
    // Background gradient with a soft yellowish glow
    const bg = p.drawingContext.createRadialGradient(bulb.x, bulb.y, 30, bulb.x, bulb.y, p.height);
    bg.addColorStop(0, '#f5cf5b'); // light near bulb
    bg.addColorStop(1, '#e6e2c9'); // soft warm beige at bottom
    p.drawingContext.fillStyle = bg;
    p.rect(0, 0, p.width, p.height);

    // Table
    p.noStroke();
    p.fill(150, 110, 70);
    p.rect(table.x, table.y, table.w, table.h, 14);
    p.fill(0, 30);
    p.rect(table.x, table.y + table.h - 16, table.w, 16, 0, 0, 14, 14);

    // Label above clock
    p.fill(40);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(20);
    p.text("Current Time is:", clock.x + clock.w / 2, clock.y - 15);

    // Clock
    drawClockBody(true);
    drawDigitalTime(true);
    p.fill(0, 40);
    p.ellipse(clock.x + clock.w / 2, table.y + 8, clock.w * 0.7, 14);
  }

  function drawSceneLightOff() {
    // Dark background with slight gradient
    const bg = p.drawingContext.createRadialGradient(bulb.x, bulb.y, 10, bulb.x, bulb.y, p.height);
    bg.addColorStop(0, '#1a1a1a');
    bg.addColorStop(1, '#000');
    p.drawingContext.fillStyle = bg;
    p.rect(0, 0, p.width, p.height);

    // Hint text
    p.noStroke();
    p.fill(220);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
    p.text("It's dark... click the switch to turn on the light", p.width / 2, p.height * 0.8);

    // subtle hint of table outline
    p.stroke(255, 10);
    p.noFill();
    p.rect(table.x, table.y, table.w, table.h, 14);
  }

  function drawLightAndSwitch() {
    // Cord
    p.stroke(80);
    p.strokeWeight(3);
    p.line(bulb.x, 0, bulb.x, bulb.y - bulb.size * 0.6);

    // Bulb
    if (lightOn) {
      p.noStroke();
      p.fill(255, 245, 160); // softer yellow
      p.ellipse(bulb.x, bulb.y, bulb.size);

      // Outer glow
      for (let r = 0; r < 5; r++) {
        p.noFill();
        p.stroke(255, 245, 160, 60 - r * 12);
        p.strokeWeight(20 + r * 8);
        p.ellipse(bulb.x, bulb.y, bulb.size + r * 25);
      }
    } else {
      p.noFill();
      p.stroke(160);
      p.strokeWeight(2);
      p.ellipse(bulb.x, bulb.y, bulb.size);
    }

    // Switch box
    p.noStroke();
    p.fill(lightOn ? 240 : 50);
    p.rect(sw.x, sw.y, sw.w, sw.h, 8);

    // Toggle nub
    const nubPad = 6;
    const nubW = sw.w / 2 - nubPad;
    const nubH = sw.h - nubPad * 2;
    const nubX = lightOn ? sw.x + sw.w - nubW - nubPad : sw.x + nubPad;
    const nubY = sw.y + nubPad;
    p.fill(lightOn ? 255 : 200);
    p.rect(nubX, nubY, nubW, nubH, 8);

    // Label under switch
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(12);
    p.fill(lightOn ? 30 : 220);
    p.text(lightOn ? "ON" : "OFF", sw.x + sw.w / 2, sw.y + sw.h + 4);
  }

  function drawClockBody(lightMode) {
    p.strokeWeight(3);
    p.stroke(lightMode ? 30 : 210);
    p.fill(lightMode ? 25 : 230);
    p.rect(clock.x, clock.y, clock.w, clock.h, clock.radius);

    const pad = 12;
    const sx = clock.x + pad;
    const sy = clock.y + pad;
    const swidth = clock.w - pad * 2;
    const sheight = clock.h - pad * 2;

    p.noStroke();
    p.fill(lightMode ? 220 : 30);
    p.rect(sx, sy, swidth, sheight, 8);
  }

  function drawDigitalTime(lightMode) {
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
    p.noStroke();

    if (lightOn) {
      p.fill(0, 40);
      p.textSize(Math.min(swidth, sheight) * 0.42);
      p.text(timeStr, sx + swidth / 2 + 2, sy + sheight / 2 + 3);
    }

    p.fill(lightOn ? 20 : 235);
    p.textSize(Math.min(swidth, sheight) * 0.42);
    p.text(timeStr, sx + swidth / 2, sy + sheight / 2);
  }

  p.mousePressed = function () {
    if (isMouseInSwitch()) lightOn = !lightOn;
  };

  p.keyPressed = function () {
    if (p.key === 's' || p.key === 'S') lightOn = !lightOn;
  };

  function isMouseInSwitch() {
    return (
      p.mouseX >= sw.x &&
      p.mouseX <= sw.x + sw.w &&
      p.mouseY >= sw.y &&
      p.mouseY <= sw.y + sw.h
    );
  }

  function updateCursor() {
    if (isMouseInSwitch()) p.cursor('pointer');
    else p.cursor('default');
  }

  function nf(num, ndigits) {
    const s = String(num);
    return s.length >= ndigits ? s : '0'.repeat(ndigits - s.length) + s;
  }
});
