registerSketch('sk2', function (p) {
  let pancakes = [];
  let prevCycle = -1;

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

    const rectW = Math.min(plateW * 0.7, minDim * 0.42);
    const rectH = Math.max(24, rectW * 0.16);
    const estPancakeH = plateH * 0.55;
    const estThickness = estPancakeH * 0.3;
    const maxStack = 10;
    const safeGap = 16;
    countdownCX = plateCX;
    countdownW = rectW; countdownH = rectH;
    const topSurfaceY = (plateCY - plateH * 0.10);
    countdownCY = topSurfaceY - estThickness * maxStack - rectH * 0.8 - safeGap;

    const aspect = plateH / plateW;
    const panBase = minDim * 0.36;
    panW = panBase; panH = panW * aspect;
    panCX = p.width / 2; panCY = (clockY + countdownCY) / 2 + 40;
  }

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); computeLayout(); };

  function nowParts(){ const d=new Date(); return {s:d.getSeconds(), ms:d.getMilliseconds()}; }

  function drawDigitalClock() {
    const d = new Date(); const h=d.getHours(), m=d.getMinutes(), s=d.getSeconds();
    const label = p.nf(h,2)+':'+p.nf(m,2)+':'+p.nf(s,2);
    p.noStroke(); p.fill(20); p.textAlign(p.CENTER, p.TOP); p.textSize(50);
    p.text(label, p.width/2, clockY);
  }

  function drawRectClockFrame(cx, cy, w, h, label, progress01) {
    p.push(); p.translate(cx, cy); p.rectMode(p.CENTER);
    p.noFill(); p.stroke(50); p.strokeWeight(3); p.rect(0, 0, w, h, 10);
    const faceW = w*0.96, faceH = h*0.82;
    p.noStroke(); p.fill(255,255,255,235); p.rect(0, 0, faceW, faceH, 8);
    const barPad = Math.max(4, h*0.06), barW = faceW - barPad*2, barH = Math.max(4, h*0.12);
    const barY = faceH/2 - barPad - barH/2;
    p.fill(230); p.rect(0, barY, barW, barH, barH/2);
    const fillW = p.constrain(barW*progress01, 0, barW);
    p.fill(80,140,255); p.rect(-barW/2 + fillW/2, barY, fillW, barH, barH/2);
    p.fill(20); p.textAlign(p.CENTER,p.CENTER); p.textSize(Math.min(h*0.52,w*0.22)); p.text(label, 0, -faceH*0.1);
    p.pop();
  }

  function drawCountdownClock() {
    const {s, ms} = nowParts();
    const cycle = (s % 30) + ms/1000;
    const label = '00:' + p.nf(Math.floor(cycle), 2);
    drawRectClockFrame(countdownCX, countdownCY, countdownW, countdownH, label, cycle/30);
    return cycle;
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
    p.noStroke(); p.fill(0,0,0,25); p.ellipse(0, h*0.15, w*0.9, h*0.35);
    p.fill(245); p.stroke(200); p.strokeWeight(2); p.ellipse(0, 0, w, h);
    p.noStroke(); p.fill(255); p.ellipse(0, 0, w*0.8, h*0.7);
    p.pop();
  };

  const batterCol = () => p.color(255, 235, 190);
  const goldenCol = () => p.color(222, 184, 135);
  const darkCol   = () => p.color(180, 140, 100);
  function colorForStage(stage) { return [batterCol(), goldenCol(), darkCol()][p.constrain(stage,0,2)]; }
  function drawPanPancake(cycleFloor) {
    const aspect = plateH / plateW;
    const w = panW * 0.80;
    const h = w * aspect;
    const stage = Math.floor(cycleFloor / 10);
    const c = colorForStage(stage);
    p.push(); p.translate(panCX, panCY);
    p.noStroke(); p.fill(c); p.ellipse(0, 0, w, h);
    p.fill(255, 255, 255, 35); p.ellipse(-w*0.18, -h*0.22, w*0.55, h*0.35);
    p.pop();
  }

  function plateTopY() { return plateCY - plateH * 0.10; }
  function pancakeThickness(h) { return h * 0.3; }

  function spawnFallingPancake(initialStage) {
    const w = plateW * 0.70;
    const h = plateH * 0.55;
    const pc = { x: panCX, y: panCY, w, h, rot: p.random(-0.12, 0.12), landed: false, vy: 0, colorStage: initialStage, targetY: 0 };
    const idx = pancakes.length;
    pc.targetY = plateTopY() - idx * pancakeThickness(h);
    pancakes.push(pc);
  }

  function updateFalling(p) {
    if (p.landed) return;
    const g = Math.max(0.25, p.height * 0.0012);
    p.vy += g; p.y += p.vy; p.rot += 0.3 * p.sin(p.frameCount * 2);
    if (p.y >= p.targetY) { p.y = p.targetY; p.landed = true; p.vy = 0; p.rot = 0; }
  }

  function drawFalling(p) {
    let c = colorForStage(p.colorStage);
    if (p.landed) c = p.lerpColor(c, darkCol(), 0.15);
    p.push(); p.translate(p.x, p.y); p.rotate(p.rot);
    p.stroke(90, 60, 30); p.strokeWeight(1.5);
    p.fill(c); p.ellipse(0, 0, p.w, p.h);
    p.noStroke(); p.fill(255,255,255,35); p.ellipse(-p.w*0.18, -p.h*0.22, p.w*0.55, p.h*0.35);
    p.pop();
  }

  function maybeClearFullStack() {
    if (pancakes.length >= 15 && pancakes.every(pc => pc.landed)) {
      pancakes = [];
    }
  }

  p.draw = function () {
    p.background(250);

    drawDigitalClock();

    const cycle = drawCountdownClock();
    const cycleFloor = Math.floor(cycle);

    drawPanEllipse(panCX, panCY, panW, panH);
    drawPanPancake(cycleFloor);
    p.drawPlate(plateCX, plateCY, plateW, plateH);

    if (prevCycle !== -1 && Math.floor(prevCycle) === 29 && Math.floor(cycle) === 0) {
      spawnFallingPancake(2);
    }
    prevCycle = cycle;

    pancakes.forEach(updateFalling);
    pancakes.forEach(drawFalling);

    maybeClearFullStack();
  };
});
