// 2D Vector CAD Blueprint & P&ID Viewer for Plant Engineering
// High-precision HTML5 Canvas vector engine with pan, zoom, layer controls, and clickable hotspot tags.

class CADBlueprintViewer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.cadItem = null;
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Layer flags
    this.showDimensions = true;
    this.showCenterlines = true;
    this.showNozzleTags = true;
    this.showGrid = true;

    // Measurement tool
    this.measureMode = false;
    this.measurePointA = null;
    this.measurePointB = null;

    // Hotspots
    this.hotspots = [];
    this.hoveredHotspot = null;

    this.onHotspotClick = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Mouse drag for pan
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("mouseup", () => this.onMouseUp());

    // Wheel for zoom
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });

    // Click for hotspots or measurement
    this.canvas.addEventListener("click", (e) => this.onClick(e));
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const w = (parent && parent.clientWidth > 50) ? parent.clientWidth : (this.canvas.clientWidth || 600);
    const h = (parent && parent.clientHeight > 50) ? parent.clientHeight : (this.canvas.clientHeight || 380);

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
    this.resetView();
  }

  loadEquipment(cadItem) {
    this.cadItem = cadItem;
    this.resetView();
  }

  loadModel(cadItem) {
    this.loadEquipment(cadItem);
  }

  resetView() {
    const dpr = window.devicePixelRatio || 1;
    const w = (this.canvas.width / dpr) || 600;
    const h = (this.canvas.height / dpr) || 380;
    this.scale = Math.min(w / 700, h / 600) * 0.95;
    if (!this.scale || this.scale <= 0.05 || isNaN(this.scale)) {
      this.scale = 0.8;
    }
    this.panX = w / 2;
    this.panY = h / 2 - 10;
    this.measurePointA = null;
    this.measurePointB = null;
    this.render();
  }

  zoom(factor) {
    this.scale = Math.max(0.2, Math.min(6.0, this.scale * factor));
    this.render();
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX - this.panX;
    this.startY = e.clientY - this.panY;
    this.canvas.style.cursor = "grabbing";
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.isDragging) {
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.render();
      return;
    }

    if (this.measureMode && this.measurePointA) {
      this.measurePointB = { x: mouseX, y: mouseY };
      this.render();
      return;
    }

    // Check hotspot hover
    let found = null;
    for (const spot of this.hotspots) {
      const dist = Math.hypot(mouseX - spot.screenX, mouseY - spot.screenY);
      if (dist <= spot.radius) {
        found = spot;
        break;
      }
    }

    if (found !== this.hoveredHotspot) {
      this.hoveredHotspot = found;
      this.canvas.style.cursor = found ? "pointer" : "default";
      this.render();
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.canvas.style.cursor = this.hoveredHotspot ? "pointer" : "default";
  }

  onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    this.zoom(zoomFactor);
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.measureMode) {
      if (!this.measurePointA) {
        this.measurePointA = { x: mouseX, y: mouseY };
      } else {
        this.measurePointB = { x: mouseX, y: mouseY };
      }
      this.render();
      return;
    }

    if (this.hoveredHotspot && this.onHotspotClick) {
      if (window.soundFX) window.soundFX.click();
      this.onHotspotClick(this.hoveredHotspot.data);
    }
  }

  // Master Render Method
  render() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width / window.devicePixelRatio;
    const h = this.canvas.height / window.devicePixelRatio;

    // Blueprint background
    this.ctx.fillStyle = "#12141a"; // Clean grayish-black engineering slate
    this.ctx.fillRect(0, 0, w, h);

    // 1. Grid
    if (this.showGrid) {
      this.drawGrid(w, h);
    }

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.scale, this.scale);

    this.hotspots = [];

    // 2. Equipment Schematic
    if (this.cadItem) {
      this.drawEquipmentSchematic();
    }

    this.ctx.restore();

    // 3. Title Block (fixed on bottom right)
    this.drawTitleBlock(w, h);

    // 4. Caliper Measurement overlay
    if (this.measurePointA && this.measurePointB) {
      this.drawMeasurementOverlay();
    }
  }

  // Draw CAD Coordinate Grid
  drawGrid(w, h) {
    const gridSize = 40 * this.scale;
    const subGrid = gridSize / 4;

    this.ctx.lineWidth = 0.5;

    // Minor grid
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
    this.ctx.beginPath();
    const startX = this.panX % subGrid;
    const startY = this.panY % subGrid;

    for (let x = startX; x < w; x += subGrid) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
    }
    for (let y = startY; y < h; y += subGrid) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
    }
    this.ctx.stroke();

    // Major grid
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    this.ctx.beginPath();
    const mStartX = this.panX % gridSize;
    const mStartY = this.panY % gridSize;

    for (let x = mStartX; x < w; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
    }
    for (let y = mStartY; y < h; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
    }
    this.ctx.stroke();
  }

  // Convert model space coordinate to canvas screen coordinate
  modelToScreen(mx, my) {
    return {
      x: this.panX + mx * this.scale,
      y: this.panY + my * this.scale
    };
  }

  // Add an interactive clickable nozzle/component hotspot
  addHotspot(mx, my, label, data) {
    const screen = this.modelToScreen(mx, my);
    const radius = 16;
    this.hotspots.push({
      mx,
      my,
      screenX: screen.x,
      screenY: screen.y,
      radius,
      label,
      data
    });

    const isHovered = this.hoveredHotspot && this.hoveredHotspot.label === label;

    // Draw hotspot marker on canvas
    this.ctx.save();
    this.ctx.fillStyle = isHovered ? "#f59e0b" : "#3b82f6";
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1.2;

    this.ctx.beginPath();
    this.ctx.arc(mx, my, 7 / this.scale, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    if (this.showNozzleTags) {
      this.ctx.fillStyle = isHovered ? "#fbbf24" : "#93c5fd";
      this.ctx.font = `500 ${10 / this.scale}px 'JetBrains Mono', monospace`;
      this.ctx.fillText(`[${label}]`, mx + 10 / this.scale, my + 4 / this.scale);
    }

    this.ctx.restore();
  }

  // Draw 2D Vector CAD Equipment Schematics
  drawEquipmentSchematic() {
    const item = this.cadItem;
    const shape = item.shape || "vertical_cylinder";

    this.ctx.lineWidth = 2 / this.scale;
    this.ctx.strokeStyle = "#e2e8f0";
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.7)";

    // A) Storage Tank Schematic
    if (shape === "vertical_cylinder" || item.modelType === "storage_tank") {
      const w = 220;
      const h = 280;

      // Shell Outline
      this.ctx.strokeRect(-w / 2, -h / 2, w, h);
      this.ctx.fillRect(-w / 2, -h / 2, w, h);

      // Torispherical / Conical Roof
      this.ctx.beginPath();
      this.ctx.moveTo(-w / 2, -h / 2);
      this.ctx.quadraticCurveTo(0, -h / 2 - 45, w / 2, -h / 2);
      this.ctx.stroke();

      // Bottom plate
      this.ctx.beginPath();
      this.ctx.moveTo(-w / 2 - 15, h / 2);
      this.ctx.lineTo(w / 2 + 15, h / 2);
      this.ctx.lineWidth = 4 / this.scale;
      this.ctx.stroke();
      this.ctx.lineWidth = 2 / this.scale;

      // Centerline
      if (this.showCenterlines) {
        this.drawCenterline(0, -h / 2 - 60, 0, h / 2 + 30);
      }

      // Nozzle Hotspots
      this.addHotspot(-w / 2, -40, "N1", { tag: "N1", size: "24\" 150#", service: "Crude Filling" });
      this.addHotspot(w / 2, 70, "N2", { tag: "N2", size: "24\" 150#", service: "Pump Suction" });
      this.addHotspot(0, -h / 2 - 45, "N4", { tag: "N4", size: "16\" 150#", service: "Radar Gauge" });
      this.addHotspot(-w / 2 + 40, h / 2 - 20, "M1", { tag: "M1", size: "36\" Manhole", service: "Shell Access" });

      // Dimension Leaders
      if (this.showDimensions) {
        this.drawDimensionLine(-w / 2, h / 2 + 40, w / 2, h / 2 + 40, `Ø ${item.dimensions.diameter}`);
        this.drawDimensionLine(w / 2 + 45, -h / 2, w / 2 + 45, h / 2, `H = ${item.dimensions.height}`);
      }
    }

    // B) Heat Exchanger / Horizontal Drum Schematic
    else if (shape === "horizontal_cylinder" || item.modelType === "heat_exchanger") {
      const len = 340;
      const dia = 130;

      // Shell Barrel
      this.ctx.strokeRect(-len / 2, -dia / 2, len, dia);
      this.ctx.fillRect(-len / 2, -dia / 2, len, dia);

      // Channel Head & Rear Head Domes
      this.ctx.beginPath();
      this.ctx.arc(-len / 2, 0, dia / 2, Math.PI / 2, -Math.PI / 2);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(len / 2, 0, dia / 2, -Math.PI / 2, Math.PI / 2);
      this.ctx.stroke();

      // Tubesheet Flange Ring
      this.ctx.strokeRect(-len / 2 - 8, -dia / 2 - 10, 16, dia + 20);

      // Saddles
      this.ctx.strokeRect(-len * 0.3 - 15, dia / 2, 30, 25);
      this.ctx.strokeRect(len * 0.3 - 15, dia / 2, 30, 25);

      // Internal Tubesheet lines
      this.ctx.setLineDash([4 / this.scale, 4 / this.scale]);
      this.ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      for (let y = -dia / 2 + 20; y <= dia / 2 - 20; y += 18) {
        this.ctx.beginPath();
        this.ctx.moveTo(-len / 2 + 10, y);
        this.ctx.lineTo(len / 2 - 15, y);
        this.ctx.stroke();
      }
      this.ctx.setLineDash([]);
      this.ctx.strokeStyle = "#e2e8f0";

      // Centerline
      if (this.showCenterlines) {
        this.drawCenterline(-len / 2 - 45, 0, len / 2 + 45, 0);
      }

      // Nozzles
      this.addHotspot(-len * 0.25, -dia / 2, "S1", { tag: "S1", size: "8\" 300#", service: "Shell Inlet" });
      this.addHotspot(len * 0.25, dia / 2, "S2", { tag: "S2", size: "8\" 300#", service: "Shell Outlet" });
      this.addHotspot(-len / 2 - 30, -dia / 2 + 15, "T1", { tag: "T1", size: "6\" 600#", service: "Tube Inlet" });

      if (this.showDimensions) {
        this.drawDimensionLine(-len / 2, dia / 2 + 50, len / 2, dia / 2 + 50, `L = ${item.dimensions.height || "6,200 mm"}`);
        this.drawDimensionLine(-len / 2 - 50, -dia / 2, -len / 2 - 50, dia / 2, `Ø ${item.dimensions.diameter || "900 mm"}`);
      }
    }

    // C) Distillation Column Schematic
    else if (shape === "column" || item.modelType === "distillation_column") {
      const w = 70;
      const h = 420;

      this.ctx.strokeRect(-w / 2, -h / 2, w, h);
      this.ctx.fillRect(-w / 2, -h / 2, w, h);

      // Ellipsoidal Top Head
      this.ctx.beginPath();
      this.ctx.arc(0, -h / 2, w / 2, Math.PI, 0);
      this.ctx.stroke();

      // Skirt Base
      this.ctx.strokeRect(-w / 2 - 6, h / 2, w + 12, 45);

      // Tray level rings
      this.ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
      for (let y = -h / 2 + 30; y < h / 2 - 20; y += 22) {
        this.ctx.beginPath();
        this.ctx.moveTo(-w / 2, y);
        this.ctx.lineTo(w / 2, y);
        this.ctx.stroke();
      }
      this.ctx.strokeStyle = "#e2e8f0";

      if (this.showCenterlines) {
        this.drawCenterline(0, -h / 2 - 50, 0, h / 2 + 65);
      }

      this.addHotspot(0, -h / 2 - 15, "OVHD", { tag: "N_OVHD", size: "30\" 150#", service: "Vapor Exit" });
      this.addHotspot(-w / 2, -20, "FEED", { tag: "N_FEED", size: "20\" 300#", service: "Crude Transfer Feed" });
      this.addHotspot(w / 2, 80, "DIESEL", { tag: "N_DIESEL", size: "8\" 150#", service: "Side Draw" });

      if (this.showDimensions) {
        this.drawDimensionLine(w / 2 + 40, -h / 2, w / 2 + 40, h / 2, `T/T = ${item.dimensions.height}`);
      }
    }

    // D) Centrifugal Pump Schematic
    else if (item.modelType === "centrifugal_pump") {
      const skidW = 340;
      const skidH = 40;

      // Baseplate Skid
      this.ctx.strokeRect(-skidW / 2, 40, skidW, skidH);
      this.ctx.fillRect(-skidW / 2, 40, skidW, skidH);

      // Motor Box
      this.ctx.fillStyle = "rgba(5, 150, 105, 0.3)";
      this.ctx.strokeRect(-skidW / 2 + 30, -70, 140, 110);
      this.ctx.fillRect(-skidW / 2 + 30, -70, 140, 110);

      // Volute Casing Circle
      this.ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
      this.ctx.beginPath();
      this.ctx.arc(80, -10, 55, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.fill();

      // Suction & Discharge Nozzles
      this.addHotspot(80, -75, "DISC", { tag: "DISC", size: "6\" 600#", service: "Discharge Out" });
      this.addHotspot(145, -10, "SUC", { tag: "SUC", size: "8\" 300#", service: "Suction In" });

      if (this.showDimensions) {
        this.drawDimensionLine(-skidW / 2, 100, skidW / 2, 100, `Skid Length = 3,400 mm`);
      }
    }

    // E) Horton Sphere Schematic
    else if (shape === "sphere" || item.modelType === "horton_sphere") {
      const radius = 140;

      // Sphere Circle
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.fill();

      // Equator weld line
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, radius, 30, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Legs
      [-radius * 0.8, -radius * 0.3, radius * 0.3, radius * 0.8].forEach(x => {
        this.ctx.beginPath();
        this.ctx.moveTo(x, Math.sqrt(radius * radius - x * x));
        this.ctx.lineTo(x, radius + 55);
        this.ctx.stroke();
      });

      if (this.showCenterlines) {
        this.drawCenterline(-radius - 30, 0, radius + 30, 0);
        this.drawCenterline(0, -radius - 30, 0, radius + 70);
      }

      this.addHotspot(0, -radius - 10, "PSV", { tag: "PSV", size: "4\"x6\" 600#", service: "Thermal Relief" });
      this.addHotspot(0, radius + 20, "DRAIN", { tag: "N1", size: "8\" 600#", service: "Bottom Drain" });

      if (this.showDimensions) {
        this.drawDimensionLine(-radius, radius + 75, radius, radius + 75, `OD = ${item.dimensions.diameter}`);
      }
    }
  }

  // Draw Centerline Dash-Dot
  drawCenterline(x1, y1, x2, y2) {
    this.ctx.save();
    this.ctx.strokeStyle = "#ef4444";
    this.ctx.lineWidth = 1 / this.scale;
    this.ctx.setLineDash([20 / this.scale, 4 / this.scale, 4 / this.scale, 4 / this.scale]);
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  // Draw Dimension Line with Dual Arrowheads & Text
  drawDimensionLine(x1, y1, x2, y2, text) {
    this.ctx.save();
    this.ctx.strokeStyle = "#00f0ff";
    this.ctx.fillStyle = "#00f0ff";
    this.ctx.lineWidth = 1.2 / this.scale;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    // Arrows
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLen = 8 / this.scale;

    this.drawArrowhead(x1, y1, angle + Math.PI, arrowLen);
    this.drawArrowhead(x2, y2, angle, arrowLen);

    // Dimension text
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    this.ctx.font = `500 ${11 / this.scale}px 'JetBrains Mono', monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    this.ctx.fillText(text, midX, midY - 4 / this.scale);

    this.ctx.restore();
  }

  drawArrowhead(x, y, angle, length) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-length, -length * 0.4);
    this.ctx.lineTo(-length, length * 0.4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  // Professional Engineering Title Block in bottom right corner
  drawTitleBlock(w, h) {
    if (!this.cadItem) return;
    const blockW = 340;
    const blockH = 100;
    const x = w - blockW - 15;
    const y = h - blockH - 15;

    this.ctx.save();
    this.ctx.fillStyle = "rgba(10, 16, 29, 0.92)";
    this.ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    this.ctx.lineWidth = 1.5;

    this.ctx.fillRect(x, y, blockW, blockH);
    this.ctx.strokeRect(x, y, blockW, blockH);

    // Grid divider
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 32);
    this.ctx.lineTo(x + blockW, y + 32);
    this.ctx.moveTo(x + 180, y + 32);
    this.ctx.lineTo(x + 180, y + blockH);
    this.ctx.stroke();

    // Title Block Text
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    this.ctx.fillText(`PLANT-ENG // ${this.cadItem.tag}`, x + 12, y + 21);

    this.ctx.fillStyle = "#00f0ff";
    this.ctx.font = "bold 11px 'JetBrains Mono', monospace";
    this.ctx.fillText(this.cadItem.revision.status, x + blockW - 145, y + 21);

    this.ctx.fillStyle = "#94a3b8";
    this.ctx.font = "10px 'JetBrains Mono', monospace";
    this.ctx.fillText(`DWG: ${this.cadItem.id}-GA-01`, x + 12, y + 50);
    this.ctx.fillText(`CODE: ${this.cadItem.code.slice(0, 16)}`, x + 12, y + 68);
    this.ctx.fillText(`REV: ${this.cadItem.revision.rev}`, x + 12, y + 86);

    this.ctx.fillText(`SCALE: 1:50`, x + 192, y + 50);
    this.ctx.fillText(`ENG: ${this.cadItem.revision.engineer.slice(0, 14)}`, x + 192, y + 68);
    this.ctx.fillText(`DATE: ${this.cadItem.revision.date}`, x + 192, y + 86);

    this.ctx.restore();
  }

  // Measurement Caliper Line Overlay
  drawMeasurementOverlay() {
    const a = this.measurePointA;
    const b = this.measurePointB;
    const distPx = Math.hypot(b.x - a.x, b.y - a.y);
    const mmVal = Math.round((distPx / this.scale) * 65); // Scale conversion to mm

    this.ctx.save();
    this.ctx.strokeStyle = "#ffaa00";
    this.ctx.fillStyle = "#ffaa00";
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.stroke();

    // End tics
    this.ctx.beginPath();
    this.ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
    this.ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Measurement badge
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;

    this.ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    this.ctx.fillRect(midX - 55, midY - 24, 110, 22);
    this.ctx.strokeRect(midX - 55, midY - 24, 110, 22);

    this.ctx.fillStyle = "#ffaa00";
    this.ctx.font = "bold 11px 'JetBrains Mono', monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`${mmVal.toLocaleString()} mm`, midX, midY - 9);

    this.ctx.restore();
  }
}

window.CADBlueprintViewer = CADBlueprintViewer;
