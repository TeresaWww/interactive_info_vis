registerSketch('sk2', function (p) {
  let plateW, plateH, plateCX, plateCY;
  let panW, panH, panCX, panCY;
  let countdownCX, countdownCY, countdownW, countdownH;
  let clockY;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.angleMode(p.DEGREES);
    computeLayout();
  };

  function computeLayout() {
    const minDim = Math.min(p.width, p.height);
    clockY = 40;

    plateW = p.width * 0.38;
    plateH = Math.min(p.height * 0.18, plateW * 0.45);
    plateCX = p.width / 2;
    plateCY = p.height - plateH * 0.65 - 20;

    const aspect = plateH / plateW;
    const panBase = minDim * 0.36;
    panW = panBase; panH = panW * aspect;
    panCX = p.width / 2; panCY = (clockY + (plateCY - plateH * 1.05)) / 2 + 40;

    const rectW = Math.min(plateW * 0.7, minDim * 0.42);
    const rectH = Math.max(24, rectW * 0.16);
    countdownW = rectW; countdownH = rectH;
    countdownCX = plateCX; countdownCY = plateCY - plateH * 1.05;
  }

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); computeLayout(); };

  function drawDigitalClock() {
    const d = new Date(); const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    const label = p.nf(h, 2) + ':' + p.nf(m, 2) + ':' + p.nf(s, 2);
    p.noStroke(); p.fill(20); p.textAlign(p.CENTER, p.TOP); p.textSize(50);
    p.text(label, p.width / 2, clockY);
  }

  function drawPanEllipse(cx, cy, w, h) {
    p.push(); p.translate(cx, cy); p.noStroke();
    p.fill(60); p.ellipse(0, 0, w, h);
    p.fill(30); p.ellipse(0, 0, w * 0.92, h * 0.92);
    p.push(); p.rotate(-30);
    p.fill(40); p.rectMode(p.CENTER);
    const handleL = Math.max(60, w * 0.55), handleT = Math.max(10, h * 0.14);
    p.rect(w * 0.35, 0, handleL, handleT, Math.min(18, handleT * 0.5));
    p.fill(20); p.circle(w * 0.6, 0, Math.min(16, handleT * 0.8));
    p.pop(); p.pop();
  }

  p.drawPlate = function (cx, cy, w, h) {
    p.push(); p.translate(cx, cy);
    p.noStroke(); p.fill(0, 0, 0, 25); p.ellipse(0, h * 0.15, w * 0.9, h * 0.35);
    p.fill(245); p.stroke(200); p.strokeWeight(2); p.ellipse(0, 0, w, h);
    p.noStroke(); p.fill(255); p.ellipse(0, 0, w * 0.8, h * 0.7);
    p.pop();
  };

  p.draw = function () {
    p.background(250);
    drawDigitalClock();
    drawPanEllipse(panCX, panCY, panW, panH);
    p.drawPlate(plateCX, plateCY, plateW, plateH);
  };
});
