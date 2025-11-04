registerSketch('sk5', function (p) {
  // ===== CONFIG =====
  const CSV_PATH = 'mcdonalds_final.csv';
  const LOGO_PATH = 'mc_logo.png'; 

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
  };

  // ===== GROUPS (for selection) =====
  const GROUPS = {
    'Breakfast only': ['Breakfast'],
    'Burgers & Sandwiches': ['Beef & Pork', 'Chicken & Fish'],
    'Sides': ['Salads', 'Snacks & Sides', 'Desserts']
  };
  const GROUP_LABELS = Object.keys(GROUPS);

  // ===== STATE =====
  let items = [];
  let filtered = [];
  const selectedKey = 'protein_g'; // fix X-axis to Protein (g) per your request
  let groupSelector;               // dropdown for the 3 groups
  let pinned = null;
  let hoverIdx = -1;

  // Layout
  const margin = 120;
  let plotX0, plotY0, plotX1, plotY1;
  let xMin = 0, xMax = 1, yMin = 0, yMax = 1, xMedian = 0.5, yMedian = 0.5;

  // CSV
  let table = null;
  const num = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // ---- LOAD CSV ----
  p.preload = function () {
    table = p.loadTable(CSV_PATH, 'csv', 'header');
    logoImg = p.loadImage(LOGO_PATH, () => console.log("Logo loaded ✅"));
  };

  p.setup = function () {
    p.createCanvas(1080, 1080);
    p.textFont('Helvetica, Arial, sans-serif');

    // Map CSV -> items
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

    // Group selector (3 options)
    groupSelector = p.createSelect();
    groupSelector.parent(p._userNode || document.body);
    GROUP_LABELS.forEach(lbl => groupSelector.option(lbl, lbl));
    groupSelector.selected(GROUP_LABELS[0]);
    groupSelector.changed(() => applyFilter());
    applyFilter(); // initial

    // style will be set/positioned in draw()
  };

  function applyFilter() {
    const choice = groupSelector.value();
    const allowed = GROUPS[choice] || [];
    filtered = items.filter(d => allowed.includes(d.category));
    pinned = null;
    hoverIdx = -1;
  }

  p.draw = function () {
    p.background(RED);

    plotX0 = margin;
    plotY0 = margin;
    plotX1 = p.width - margin;
    plotY1 = p.height - margin;

    // Move dropdown to top-right
    if (groupSelector) {
      groupSelector.style('font-size', '16px');
      groupSelector.style('padding', '6px 10px');
      groupSelector.style('border-radius', '8px');
      groupSelector.style('border', '0');
      groupSelector.style('outline', 'none');
      groupSelector.style('background', '#FFC72C');
      groupSelector.style('color', '#000');
      groupSelector.position(p.width - margin - groupSelector.elt.offsetWidth, margin * 0.8);
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
    if (logoImg) {
      // Draw PNG logo
      p.push();
      p.imageMode(p.CENTER);
      const logoSize = s * 1; // scale up a bit
      p.image(logoImg, x, y, logoSize, logoSize);
      p.pop();
    } else {
      // Fallback to drawn arches if PNG not loaded
      p.push();
      p.noFill();
      p.stroke(YELLOW);
      p.strokeWeight(12);
      p.arc(x - s * 0.3, y, s * 0.6, s, p.PI, 0);
      p.arc(x + s * 0.3, y, s * 0.6, s, p.PI, 0);
      p.line(x - s * 0.02, y, x + s * 0.02, y);
      p.pop();
    }
  }

  function drawTitles() {
    p.push();
    p.fill(YELLOW);
    p.noStroke();
    p.textSize(29);
    p.textStyle(p.BOLD);
    p.text('McProtein: Spot the Strongest Picks on the Menu', margin, margin * 0.6);

    p.textSize(20);
    p.text('X: Protein (g)', margin, p.height - margin * 0.55);
    p.text('Y: Calories',    margin, p.height - margin * 0.35);

    // current group label
    p.textSize(20);
    p.textStyle(p.NORMAL);
    const glabel = groupSelector ? groupSelector.value() : '';
    p.text(`Group: ${glabel}`, margin * 1.5, margin * 0.9);
    p.pop();
  }

  function computeScales() {
    const data = filtered.length ? filtered : items;
    if (data.length === 0) {
      xMin = 0; xMax = 1; yMin = 0; yMax = 1; xMedian = 0.5; yMedian = 0.5;
      return;
    }
    const xs = data.map(d => d[selectedKey]);
    const ys = data.map(d => d.calories);
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

    p.textSize(20);
    p.noStroke();
    p.fill(YELLOW);
    p.textAlign(p.CENTER, p.TOP);
    p.text(xMin.toFixed(0), xScale(xMin), plotY1 + 8);
    p.text(xMedian.toFixed(0), xm,        plotY1 + 8);
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
    p.textSize(32);
    p.fill(WHITE);

    const xm = xScale(xMedian);
    const ym = yScale(yMedian);
    const cxTL = (plotX0 + xm) / 2, cyTL = (plotY0 + ym) / 2;
    const cxTR = (xm + plotX1) / 2,  cyTR = (plotY0 + ym) / 2;
    const cxBL = (plotX0 + xm) / 2,  cyBL = (ym + plotY1) / 2;
    const cxBR = (xm + plotX1) / 2,  cyBR = (ym + plotY1) / 2;

    p.text(`Low Protein\nHigh Calories`, cxTL, cyTL);
    p.text(`High Protein\nHigh Calories`, cxTR, cyTR);
    p.text(`Low Protein\nLow Calories`,  cxBL, cyBL);
    p.text(`High Protein\nLow Calories`, cxBR, cyBR);

    // emphasize "healthy" narrative quadrant
    p.fill(YELLOW);
    p.text(`High Protein\nLow Calories`, cxBR, cyBR);
    p.pop();
  }

  function drawPoints() {
    hoverIdx = -1;
    const mouse = { x: p.mouseX, y: p.mouseY };
    const data = filtered;

    for (let i = 0; i < data.length; i++) {
      const it = data[i];
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
    // show only the categories in the current group
    const glabel = groupSelector ? groupSelector.value() : GROUP_LABELS[0];
    const cats = GROUPS[glabel] || [];
    const boxW = 150;
    const boxH = cats.length * 22 + 24;
    const x0 = p.width - margin - boxW - 20;
    const y0 = p.height - margin - boxH - 20;

    p.push();
    p.noStroke();
    p.fill(255, 255, 255, 30);
    p.rect(x0 - 10, y0 - 10, boxW + 20, boxH + 20, 12);

    p.textSize(18);
    p.textAlign(p.LEFT, p.CENTER);
    p.fill(YELLOW);
    p.text('Categories', x0, y0 - 4);

    cats.forEach((cat, i) => {
      const yy = y0 + 18 + i * 22;
      p.fill(categoryColors[cat] || WHITE);
      p.circle(x0, yy, 12);
      p.fill(YELLOW);
      p.noStroke();
      p.text(cat, x0 + 18, yy);
    });
    p.pop();
  }

  function drawTooltip() {
    let idx = hoverIdx;
    if (p.mouseIsPressed && hoverIdx !== -1) pinned = { index: hoverIdx };
    if (pinned) idx = pinned.index;
    if (idx === -1) return;

    const it = filtered[idx];
    const x = xScale(it[selectedKey]);
    const y = yScale(it.calories);
    const boxW = 300, boxH = 130;
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
      `Category: ${it.category}`,
      `Calories: ${it.calories}`,
      `Protein: ${it.protein_g} g`,
      `Fat: ${it.fat_g} g`,
      `Carbs: ${it.carbs_g} g`
    ];
    for (let i = 0; i < lines.length; i++) {
      p.text(lines[i], bx + 12, by + 38 + i * 16);
    }
    p.pop();
  }
});
