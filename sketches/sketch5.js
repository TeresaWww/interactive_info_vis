registerSketch('sk5', function (p) {
  // ===== CONFIG =====
  const CSV_PATH = 'mcdonalds_final.csv'; // adjust path if needed

  // ===== THEME =====
  const RED = p.color('#C8102E');
  const YELLOW = p.color('#FFC72C');
  const WHITE = p.color(255);

  // ===== CATEGORY COLORS =====
  const categoryColors = {
    'Breakfast': p.color('#F4A261'),
    'Beef & Pork': p.color('#E63946'),
    'Chicken & Fish': p.color('#F77F00'),
    'Salads': p.color('#2A9D8F'),
    'Snacks & Sides': p.color('#E9C46A'),
    'Desserts': p.color('#FFB4A2'),
    'Other': p.color('#F1FAEE')
  };

  // ===== STATE =====
  let items = [];
  let selectedKey = 'protein_g';
  let selector;
  let pinned = null;
  let hoverIdx = -1;

  // Layout
  const margin = 120;
  let plotX0, plotY0, plotX1, plotY1;
  let xMin, xMax, yMin, yMax, xMedian, yMedian;

  // CSV table
  let table = null;
  const num = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // ---- LOAD CSV ----
  p.preload = function () {
    table = p.loadTable(CSV_PATH, 'csv', 'header');
  };

  p.setup = function () {
    p.createCanvas(1080, 1080);
    p.textFont('Helvetica, Arial, sans-serif');

    // Map CSV to objects
    if (table && table.getRowCount() > 0) {
      const mapped = [];
      for (let r = 0; r < table.getRowCount(); r++) {
        mapped.push({
          name: table.getString(r, 'Item') ?? 'Item',
          calories: num(table.getString(r, 'Calories')),
          protein_g: num(table.getString(r, 'Protein')),
          fat_g: num(table.getString(r, 'Total Fat')),
          carbs_g: num(table.getString(r, 'Carbohydrates')),
          category: table.getString(r, 'Category') ?? 'Other'
        });
      }
      items = mapped.filter(d => Number.isFinite(d.calories) && d.calories > 0);
    }

    // Axis selector
    selector = p.createSelect();
    selector.parent(p._userNode || document.body);
    selector.option('Protein (g)', 'protein_g');
    selector.option('Fat (g)', 'fat_g');
    selector.option('Carbs (g)', 'carbs_g');
    selector.selected('protein_g');
    selector.changed(() => {
      selectedKey = selector.value();
      pinned = null;
    });
  };

  p.draw = function () {
    p.background(RED);

    plotX0 = margin;
    plotY0 = margin;
    plotX1 = p.width - margin;
    plotY1 = p.height - margin;

    // Move dropdown to top-right corner
    if (selector) {
      selector.style('font-size', '14px');
      selector.style('padding', '6px 10px');
      selector.style('border-radius', '8px');
      selector.style('border', '0');
      selector.style('background', '#FFC72C');
      selector.style('color', '#000');
      selector.position(p.width - margin - selector.elt.offsetWidth, margin * 0.5);
    }

    drawMcArches(margin * 0.45, margin * 0.55, 70);
    drawTitles();
    computeScales();
    drawGridAndAxes();
    drawQuadrantLabels();
    drawPoints();
    drawLegend();
    drawTooltip();
  };

  // ======== DRAW HELPERS ========
  function drawMcArches(x, y, s) {
    p.push();
    p.noFill();
    p.stroke(YELLOW);
    p.strokeWeight(12);
    p.arc(x - s * 0.3, y, s * 0.6, s, p.PI, 0);
    p.arc(x + s * 0.3, y, s * 0.6, s, p.PI, 0);
    p.line(x - s * 0.02, y, x + s * 0.02, y);
    p.pop();
  }

  function drawTitles() {
    p.push();
    p.fill(YELLOW);
    p.noStroke();
    p.textSize(28);
    p.textStyle(p.BOLD);
    p.text('McMenu Nutrition Explorer', margin, margin * 0.6);

    p.textSize(16);
    const xlabel = selectedKey === 'protein_g' ? 'Protein (g)'
                  : selectedKey === 'fat_g' ? 'Fat (g)' : 'Carbs (g)';
    p.text(`X: ${xlabel}`, margin, p.height - margin * 0.55);
    p.text('Y: Calories', margin, p.height - margin * 0.35);
    p.pop();
  }

  function computeScales() {
    if (items.length === 0) return;
    const xs = items.map(d => d[selectedKey]);
    const ys = items.map(d => d.calories);
    xMin = 0;
    xMax = Math.max(1, p.max(xs));
    yMin = 0;
    yMax = Math.max(1, p.max(ys));
    xMedian = median(xs);
    yMedian = median(ys);
  }

  function xScale(v) { return p.map(v, xMin, xMax, plotX0, plotX1); }
  function yScale(v) { return p.map(v, yMin, yMax, plotY1, plotY0); }

  function median(arr) {
    const a = arr.slice().sort((a, b) => a - b);
    const n = a.length;
    if (n === 0) return 0;
    return n % 2 === 1 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
  }

  function drawGridAndAxes() {
    p.push();
    p.stroke(YELLOW);
    p.strokeWeight(2);
    p.noFill();
    p.rect(plotX0, plotY0, plotX1 - plotX0, plotY1 - plotY0, 16);

    const xm = xScale(xMedian);
    const ym = yScale(yMedian);
    p.line(xm, plotY0, xm, plotY1);
    p.line(plotX0, ym, plotX1, ym);

    p.textSize(14);
    p.noStroke();
    p.fill(YELLOW);
    p.textAlign(p.CENTER, p.TOP);
    p.text(xMin.toFixed(0), xScale(xMin), plotY1 + 8);
    p.text(xMedian.toFixed(0), xm, plotY1 + 8);
    p.text(xMax.toFixed(0), xScale(xMax), plotY1 + 8);

    p.textAlign(p.RIGHT, p.CENTER);
    p.text(yMin.toFixed(0), plotX0 - 8, yScale(yMin));
    p.text(yMedian.toFixed(0), plotX0 - 8, yScale(yMedian));
    p.text(yMax.toFixed(0), plotX0 - 8, yScale(yMax));
    p.pop();
  }

  function drawQuadrantLabels() {
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(16);
    p.fill(WHITE);

    const xm = xScale(xMedian);
    const ym = yScale(yMedian);
    const cxTL = (plotX0 + xm) / 2, cyTL = (plotY0 + ym) / 2;
    const cxTR = (xm + plotX1) / 2, cyTR = (plotY0 + ym) / 2;
    const cxBL = (plotX0 + xm) / 2, cyBL = (ym + plotY1) / 2;
    const cxBR = (xm + plotX1) / 2, cyBR = (ym + plotY1) / 2;

    const axisLabel = selectedKey === 'protein_g' ? 'Protein'
                     : selectedKey === 'fat_g' ? 'Fat' : 'Carbs';

    p.text(`Low ${axisLabel}\nHigh Calories`, cxTL, cyTL);
    p.text(`High ${axisLabel}\nHigh Calories`, cxTR, cyTR);
    p.text(`Low ${axisLabel}\nLow Calories`, cxBL, cyBL);
    p.text(`High ${axisLabel}\nLow Calories`, cxBR, cyBR);

    if (selectedKey === 'protein_g') {
      p.fill(YELLOW);
      p.text(`High Protein\nLow Calories`, cxBR, cyBR);
    }
    p.pop();
  }

  function drawPoints() {
    hoverIdx = -1;
    const mouse = { x: p.mouseX, y: p.mouseY };

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const x = xScale(it[selectedKey]);
      const y = yScale(it.calories);
      if (x < plotX0 || x > plotX1 || y < plotY0 || y > plotY1) continue;

      const baseSize = 28;
      const hitR = 18;
      if (p.dist(mouse.x, mouse.y, x, y) < hitR) hoverIdx = i;
      const size = (i === hoverIdx || (pinned && pinned.index === i)) ? baseSize * 1.3 : baseSize;

      const c = categoryColors[it.category] || WHITE;
      p.push();
      p.fill(c);
      p.stroke(YELLOW);
      p.strokeWeight(2);
      p.circle(x, y, size);
      p.pop();
    }
  }

  function drawLegend() {
    const cats = Object.keys(categoryColors);
    const boxW = 160;
    const boxH = cats.length * 20 + 20;
    const x0 = p.width - margin - boxW;
    const y0 = p.height - margin - boxH - 20;

    p.push();
    p.noStroke();
    p.fill(255, 255, 255, 30);
    p.rect(x0 - 10, y0 - 10, boxW + 20, boxH + 20, 12);
    p.textSize(14);
    p.textAlign(p.LEFT, p.CENTER);

    cats.forEach((cat, i) => {
      const y = y0 + i * 20;
      p.fill(categoryColors[cat]);
      p.circle(x0, y, 12);
      p.fill(YELLOW);
      p.noStroke();
      p.text(cat, x0 + 18, y);
    });
    p.pop();
  }

  function drawTooltip() {
    let idx = hoverIdx;
    if (p.mouseIsPressed && hoverIdx !== -1) pinned = { index: hoverIdx };
    if (pinned) idx = pinned.index;
    if (idx === -1) return;

    const it = items[idx];
    const x = xScale(it[selectedKey]);
    const y = yScale(it.calories);
    const boxW = 280, boxH = 120;
    const bx = Math.min(Math.max(x + 16, plotX0), plotX1 - boxW);
    const by = Math.min(Math.max(y - boxH - 16, plotY0), plotY1 - boxH);

    p.push();
    p.noStroke();
    p.fill(0, 0, 0, 140);
    p.rect(bx, by, boxW, boxH, 12);

    p.fill(YELLOW);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.textAlign(p.LEFT, p.TOP);
    p.text(it.name, bx + 12, by + 10, boxW - 24);

    p.textStyle(p.NORMAL);
    const lines = [
      `Calories: ${it.calories}`,
      `Protein: ${it.protein_g} g`,
      `Fat: ${it.fat_g} g`,
      `Carbs: ${it.carbs_g} g`,
      `Category: ${it.category}`
    ];
    for (let i = 0; i < lines.length; i++) {
      p.text(lines[i], bx + 12, by + 38 + i * 16);
    }
    p.pop();
  }
});
