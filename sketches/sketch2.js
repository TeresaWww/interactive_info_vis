registerSketch('sk2', function (p) {
  let pancakes = [];
  let prevRemaining = -1;

  let isPaused = false;
  let pauseStart = 0;
  let pausedAccum = 0;
  let t0 = 0;

  // Pan lift animation
  let isLifted = false;
  let panLiftY = 0;
  let targetLiftY = 0;

  let plateW, plateH, plateCX, plateCY;
  let panW, panH, panCX, panCY;
  let countdownCX, countdownCY, countdownW, countdownH;
  let clockY;

  p.setup = function () {
    p.createCanvas(800, 800);
    p.canvas.style.display = 'block';
    p.angleMode(p.DEGREES);
    computeLayout();

    t0 = p.millis();
  };

  function computeLayout() {
    const minDim = Math.min(p.width, p.height);
    clockY = 40;

    // Plate
    plateW = p.width * 0.38;
    plateH = Math.min(p.height * 0.18, plateW * 0.45);
    plateCX = p.width / 2;
    plateCY = p.height - plateH * 0.65 - 20;

    // Countdown clock
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

    // Pan
    const aspect = plateH / plateW;
    const panBase = minDim * 0.36;
    panW = panBase; panH = panW * aspect;
    panCX = p.width / 2; panCY = (clockY + countdownCY) / 2 + 40;
  }

  function nowParts() {
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
  }

  function remainingInCycle240() {
    const nowMs = isPaused ? pauseStart : p.millis();
    const elapsedMs = Math.max(0, nowMs - t0 - pausedAccum);
    const elapsedSec = (elapsedMs / 1000) % 240;
    return 240 - elapsedSec; // 240 -> 0
  }

  function drawDigitalClock() {
    const { h, m, s } = nowParts();
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    const label = `${hh}:${mm}:${ss}`;
    p.noStroke(); p.fill(20); p.textAlign(p.CENTER, p.TOP); p.textSize(50);
    p.text(label, p.width / 2, clockY);
  }

  function drawRectClockFrame(cx, cy, w, h, label, progress01) {
    p.push(); p.translate(cx, cy); p.rectMode(p.CENTER);
    p.noFill(); p.stroke(50); p.strokeWeight(3); p.rect(0, 0, w, h, 10);

    const faceW = w * 0.96, faceH = h * 0.82;
    p.noStroke(); p.fill(255, 255, 255, 235); p.rect(0, 0, faceW, faceH, 8);

    const barPad = Math.max(4, h * 0.06);
    const barW = faceW - barPad * 2;
    const barH = Math.max(4, h * 0.12);
    const barY = faceH / 2 - barPad - barH / 2;

    p.fill(230); p.rect(0, barY, barW, barH, barH / 2);

    const fillW = p.constrain(barW * progress01, 0, barW);
    p.fill(80, 140, 255); p.rect(-barW / 2 + fillW / 2, barY, fillW, barH, barH / 2);

    p.fill(20);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.min(h * 0.52, w * 0.22));
    p.text(label, 0, -faceH * 0.1);
    p.pop();
  }

  function drawCountdownClock(remaining) {
    const secs = Math.floor(remaining);
    const mm = Math.floor(secs / 60);
    const ss = secs % 60;
    const label = p.nf(mm, 2) + ':' + p.nf(ss, 2);

    const consumed01 = 1 - (remaining / 240);
    drawRectClockFrame(countdownCX, countdownCY, countdownW, countdownH, label, consumed01);

    p.noStroke();
    p.fill(50);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(22);
    p.text(`Pancakes: ${pancakes.length} 🥞`, plateCX, plateCY + plateH * 0.6);

    p.textSize(14);
    p.fill(90);
    const status = isPaused ? 'Paused (click pan to resume)' : 'Running (click pan to pause)';
    p.text(status, countdownCX, countdownCY + countdownH * 0.65);
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
    p.pop();
    p.pop();
  }

  p.drawPlate = function (cx, cy, w, h) {
    p.push(); p.translate(cx, cy);
    p.noStroke(); p.fill(0, 0, 0, 25); p.ellipse(0, h * 0.15, w * 0.9, h * 0.35);
    p.fill(245); p.stroke(200); p.strokeWeight(2); p.ellipse(0, 0, w, h);
    p.noStroke(); p.fill(255); p.ellipse(0, 0, w * 0.8, h * 0.7);
    p.pop();
  };

  const batterCol = () => p.color(255, 235, 190);
  const goldenCol = () => p.color(222, 184, 135);
  const darkCol   = () => p.color(180, 140, 100);

  function tone(t01) {
    if (t01 <= 0) return batterCol();
    if (t01 >= 1) return darkCol();
    if (t01 < 0.5) return p.lerpColor(batterCol(), goldenCol(), t01 * 2);
    return p.lerpColor(goldenCol(), darkCol(), (t01 - 0.5) * 2);
  }

  function thatAspect(a){ return Math.max(0.0001, a); }

  function drawPanPancake(elapsedUp) {
    const aspect = plateH / plateW;
    const w = panW * 0.80;
    const h = w * thatAspect(aspect);

    const tHalf = (elapsedUp < 120) ? elapsedUp : (elapsedUp - 120);
    const fry01 = p.constrain(tHalf / 120, 0, 1);
    const colorTop = tone(fry01);

    const flipWindow = 0.6;
    let rot = 0, scaleY = 1;
    const tFromFlip = Math.abs(elapsedUp - 120);
    if (tFromFlip < flipWindow / 2) {
      const u = (elapsedUp - 120) / (flipWindow / 2);
      const k = (u + 1) / 2;
      rot = p.map(k, 0, 1, 0, 180);
      scaleY = 1 - 0.8 * Math.sin(k * p.PI);
    }

    p.push();
    p.translate(panCX, panCY + panLiftY);
    p.rotate(rot);
    p.scale(1, scaleY);

    p.noStroke();
    p.fill(colorTop);
    p.ellipse(0, 0, w, h);
    p.fill(255, 255, 255, 35);
    p.ellipse(-w * 0.18, -h * 0.22, w * 0.55, h * 0.35);
    p.pop();
  }

  function plateTopY() { return plateCY - plateH * 0.10; }
  function pancakeThickness(h) { return h * 0.3; }

  function spawnFallingPancake(finalDarknessStage = 2) {
    const w = plateW * 0.70;
    const h = plateH * 0.55;
    const pc = {
      x: panCX, y: panCY + panLiftY, w, h,
      rot: p.random(-0.12, 0.12),
      landed: false, vy: 0,
      colorStage: finalDarknessStage, targetY: 0
    };
    const idx = pancakes.length;
    pc.targetY = plateTopY() - idx * pancakeThickness(h);
    pancakes.push(pc);
  }

  function updateFallingPancake(pc) {
    if (pc.landed) return;
    const g = Math.max(0.25, p.height * 0.0012);
    pc.vy += g; pc.y += pc.vy; pc.rot += 0.3 * p.sin(p.frameCount * 2);
    if (pc.y >= pc.targetY) { pc.y = pc.targetY; pc.landed = true; pc.vy = 0; pc.rot = 0; }
  }

  function colorForStage(stage) { return [batterCol(), goldenCol(), darkCol()][p.constrain(stage, 0, 2)]; }

  function drawFallingPancake(pc) {
    let c = colorForStage(pc.colorStage);
    if (pc.landed) c = p.lerpColor(c, darkCol(), 0.15);
    p.push();
    p.translate(pc.x, pc.y);
    p.rotate(pc.rot);
    p.stroke(90, 60, 30);
    p.strokeWeight(1.5);
    p.fill(c);
    p.ellipse(0, 0, pc.w, pc.h);
    p.noStroke();
    p.fill(255, 255, 255, 35);
    p.ellipse(-pc.w * 0.18, -pc.h * 0.22, pc.w * 0.55, pc.h * 0.35);
    p.pop();
  }

  function maybeClearFullStack() {
    if (pancakes.length >= 10 && pancakes.every(pc => pc.landed)) {
      pancakes = [];
    }
  }

  function overPan(x, y) {
    const nx = (x - panCX);
    const ny = (y - (panCY + panLiftY));
    const rx = panW * 0.5;
    const ry = panH * 0.5;
    return (nx * nx) / (rx * rx) + (ny * ny) / (ry * ry) <= 1;
  }

  p.mousePressed = function () {
    if (overPan(p.mouseX, p.mouseY)) {
      isLifted = !isLifted;
      targetLiftY = isLifted ? -Math.min(30, panH * 0.2) : 0;

      if (!isPaused) {
        isPaused = true;
        pauseStart = p.millis();
      } else {
        isPaused = false;
        pausedAccum += (p.millis() - pauseStart);
        pauseStart = 0;
      }
    }
  };

  p.draw = function () {
    p.background(250);

    const ease = 0.12;
    panLiftY = p.lerp(panLiftY, targetLiftY, ease);

    drawDigitalClock();

    const remaining = remainingInCycle240();
    const elapsedUp = 240 - remaining;

    drawCountdownClock(remaining);

    drawPanEllipse(panCX, panCY + panLiftY, panW, panH);
    drawPanPancake(elapsedUp);

    p.drawPlate(plateCX, plateCY, plateW, plateH);
    pancakes.forEach(updateFallingPancake);
    pancakes.forEach(drawFallingPancake);
    maybeClearFullStack();

    if (!isPaused) {
      if (prevRemaining >= 0 && remaining > prevRemaining + 1) {

        spawnFallingPancake(2);
      }
      prevRemaining = remaining;
    } else {
      prevRemaining = remaining;
    }
  };
});
