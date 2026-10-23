// Main Application Controller for PlantCAD Synapse
// Connects AI search bot, Three.js 3D engine, 2D blueprint canvas, revision diffs, and conversational drawer.

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Viewers
  const threeViewer = new CADThreeViewer("three-container");
  const blueprintViewer = new CADBlueprintViewer("blueprint-canvas");

  // Keep references globally accessible
  window.threeViewer = threeViewer;
  window.blueprintViewer = blueprintViewer;

  let currentItem = window.CAD_DATABASE[0]; // Default: TK-104A
  let activeViewMode = "3d"; // "3d" or "2d"
  let activeShapeFilter = "all";

  // Elements
  const searchInput = document.getElementById("mainSearchInput");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");
  const parserTokensContainer = document.getElementById("parserTokensContainer");
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsCount = document.getElementById("resultsCount");
  const currentAssetTag = document.getElementById("currentAssetTag");
  const currentAssetMeta = document.getElementById("currentAssetMeta");

  // Viewport Tab Buttons
  const tab3dBtn = document.getElementById("tab3dBtn");
  const tab2dBtn = document.getElementById("tab2dBtn");
  const threeContainer = document.getElementById("three-container");
  const blueprintContainer = document.getElementById("blueprint-container");

  // Viewport Tools
  const btnExplodeSlider = document.getElementById("explodeSlider");
  const explodeVal = document.getElementById("explodeVal");
  const btnWireframe = document.getElementById("btnWireframe");
  const btnSectionClip = document.getElementById("btnSectionClip");
  const clipSlider = document.getElementById("clipSlider");
  const clipVal = document.getElementById("clipVal");
  const clipSliderGroup = document.getElementById("clipSliderGroup");
  const btnAutoRotate = document.getElementById("btnAutoRotate");
  const btnResetView = document.getElementById("btnResetView");
  const btnMeasure = document.getElementById("btnMeasure");
  const btnAudioMute = document.getElementById("btnAudioMute");

  // Inspection Toast
  const inspectionToast = document.getElementById("inspectionToast");
  const toastTag = document.getElementById("toastTag");
  const toastTitle = document.getElementById("toastTitle");
  const toastDetails = document.getElementById("toastDetails");
  const toastCloseBtn = document.getElementById("toastCloseBtn");

  // Conversational Drawer
  const botTriggerBtn = document.getElementById("botTriggerBtn");
  const chatDrawer = document.getElementById("chatDrawer");
  const closeChatBtn = document.getElementById("closeChatBtn");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendChatBtn = document.getElementById("sendChatBtn");

  // Revision Modal
  const btnDiffRev = document.getElementById("btnDiffRev");
  const revisionModal = document.getElementById("revisionModal");
  const closeDiffModalBtn = document.getElementById("closeDiffModalBtn");
  const diffModalTitle = document.getElementById("diffModalTitle");
  const diffCurrRevName = document.getElementById("diffCurrRevName");
  const diffCurrRevDate = document.getElementById("diffCurrRevDate");
  const diffPrevRevName = document.getElementById("diffPrevRevName");
  const diffPrevRevDate = document.getElementById("diffPrevRevDate");
  const diffChangesList = document.getElementById("diffChangesList");

  // Shape Sketch Modal
  const btnSketchSearch = document.getElementById("btnSketchSearch");
  const sketchModal = document.getElementById("sketchModal");
  const closeSketchModalBtn = document.getElementById("closeSketchModalBtn");
  const sketchCanvas = document.getElementById("sketchCanvas");
  const btnClearSketch = document.getElementById("btnClearSketch");
  const btnMatchSketch = document.getElementById("btnMatchSketch");

  // Load Initial Model
  loadItem(currentItem);
  renderResults(window.CAD_DATABASE);

  // -------------------------------------------------------------
  // Load & Switch Selected Equipment Item
  // -------------------------------------------------------------
  function loadItem(item) {
    if (!item) return;
    currentItem = item;

    // Update 3D Model
    threeViewer.loadEquipment(item);

    // Update 2D Blueprint
    blueprintViewer.loadEquipment(item);

    // Update HUD
    if (currentAssetTag) currentAssetTag.textContent = `${item.tag} // ${item.id}`;
    if (currentAssetMeta) currentAssetMeta.textContent = `${item.category.toUpperCase()} • ${item.code} • ${item.revision.status}`;

    // Update Active Card in Results List
    document.querySelectorAll(".cad-card").forEach(c => {
      if (c.dataset.id === item.id) {
        c.classList.add("active");
        c.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        c.classList.remove("active");
      }
    });

    // Reset Sliders
    if (btnExplodeSlider) {
      btnExplodeSlider.value = 0;
      if (explodeVal) explodeVal.textContent = "0%";
    }
    if (clipSlider) {
      clipSlider.value = 0;
      if (clipVal) clipVal.textContent = "0 mm";
    }

    // Populate Specs & BOM Tabs
    renderSpecsSection(item);
  }

  // -------------------------------------------------------------
  // Render Search Results List
  // -------------------------------------------------------------
  function renderResults(listWithScores) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "";

    const items = listWithScores.map(res => (res.item ? res : { item: res, score: 100, matches: [] }));
    if (resultsCount) resultsCount.textContent = `${items.length} MODELS FOUND`;

    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--accent-amber);">⚠️</div>
          <p style="font-weight: 600; color: #ffffff;">No CAD models matched this query specification.</p>
          <p style="font-size: 0.75rem; margin-top: 0.35rem;">Try relaxing capacity tolerances or search for "tank", "pump", "exchanger", or "column".</p>
        </div>
      `;
      return;
    }

    items.forEach(({ item, score, matches }) => {
      const card = document.createElement("div");
      card.className = `cad-card ${item.id === currentItem.id ? "active" : ""}`;
      card.dataset.id = item.id;

      card.innerHTML = `
        <div class="card-top-row">
          <span class="card-tag">${item.tag}</span>
          <span class="card-match-score">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            ${score}% MATCH
          </span>
        </div>
        <div class="card-title">${item.title}</div>
        <div class="card-spec-grid">
          <div class="card-spec-item">Capacity: <strong>${item.capacityDisplay}</strong></div>
          <div class="card-spec-item">Pressure: <strong>${item.pressure} ${item.pressureUnit}</strong></div>
          <div class="card-spec-item">Code: <strong>${item.code.split(" ")[0]}</strong></div>
          <div class="card-spec-item">Rev: <strong>${item.revision.rev} (${item.revision.status.split(" ")[0]})</strong></div>
        </div>
        <div class="card-footer-row">
          <span>${item.plantUnit.split(" ")[0]}</span>
          <div class="card-action-btns">
            <button class="btn-card-act view-btn" title="Inspect CAD in 3D">Inspect 3D</button>
            <button class="btn-card-act diff-btn" title="View Revision Diff">Diff Rev</button>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (window.soundFX) window.soundFX.click();
        loadItem(item);
      });

      const diffBtn = card.querySelector(".diff-btn");
      if (diffBtn) {
        diffBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openRevisionDiff(item);
        });
      }

      resultsContainer.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Search Engine & Real-Time Token Visualizer
  // -------------------------------------------------------------
  function performSearch() {
    const query = searchInput ? searchInput.value.trim() : "";
    if (searchClearBtn) {
      searchClearBtn.style.display = query ? "block" : "none";
    }

    if (window.soundFX) window.soundFX.scan();

    const { parsed, results } = window.cadQueryParser.search(query, window.CAD_DATABASE);

    // Filter by shape if active
    let filteredResults = results;
    if (activeShapeFilter !== "all") {
      filteredResults = results.filter(r => r.item.shape === activeShapeFilter);
    }

    renderTokenChips(parsed.tokens);
    renderResults(filteredResults);

    // Automatically load top match if there are results
    if (filteredResults.length > 0 && query.length > 2) {
      loadItem(filteredResults[0].item);
    }
  }

  function renderTokenChips(tokens) {
    if (!parserTokensContainer) return;
    parserTokensContainer.innerHTML = "";

    if (!tokens || tokens.length === 0) {
      parserTokensContainer.innerHTML = `<span style="font-size: 0.72rem; color: var(--text-faint); font-style: italic;">Enter keywords, capacities (e.g. "50000 m3"), or equipment tags to inspect parsed entity tokens.</span>`;
      return;
    }

    tokens.forEach(tok => {
      const chip = document.createElement("span");
      let typeClass = "";
      if (tok.type === "capacity") typeClass = "chip-capacity";
      else if (tok.type === "tag") typeClass = "chip-tag";
      else if (tok.type === "shape") typeClass = "chip-shape";

      chip.className = `token-chip ${typeClass}`;
      chip.innerHTML = `<strong>${tok.label}:</strong> ${tok.value}`;
      parserTokensContainer.appendChild(chip);
    });
  }

  // Event Listeners for Search Input
  if (searchInput) {
    searchInput.addEventListener("input", performSearch);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener("click", performSearch);
  }
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      performSearch();
      searchInput.focus();
    });
  }

  // Quick Queries Chips
  document.querySelectorAll(".quick-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = chip.dataset.query;
        performSearch();
      }
    });
  });

  // Shape Filter Icons Matrix
  document.querySelectorAll(".btn-shape-icon").forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.soundFX) window.soundFX.click();
      document.querySelectorAll(".btn-shape-icon").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeShapeFilter = btn.dataset.shape;
      performSearch();
    });
  });

  // -------------------------------------------------------------
  // Viewport Tab Switching (3D WebGL vs 2D CAD Blueprint)
  // -------------------------------------------------------------
  function setViewMode(mode) {
    activeViewMode = mode;
    if (window.soundFX) window.soundFX.whoosh();

    if (mode === "3d") {
      tab3dBtn.classList.add("active");
      tab2dBtn.classList.remove("active");
      threeContainer.style.display = "block";
      blueprintContainer.style.display = "none";
      if (btnExplodeSlider) btnExplodeSlider.parentElement.style.display = "flex";
      threeViewer.onWindowResize();
    } else {
      tab2dBtn.classList.add("active");
      tab3dBtn.classList.remove("active");
      threeContainer.style.display = "none";
      blueprintContainer.style.display = "block";
      if (btnExplodeSlider) btnExplodeSlider.parentElement.style.display = "none";
      blueprintViewer.resize();
      blueprintViewer.loadEquipment(currentItem);
    }
  }

  if (tab3dBtn) tab3dBtn.addEventListener("click", () => setViewMode("3d"));
  if (tab2dBtn) tab2dBtn.addEventListener("click", () => setViewMode("2d"));

  // -------------------------------------------------------------
  // Viewport 3D / 2D Tools & Sliders
  // -------------------------------------------------------------
  if (btnExplodeSlider) {
    btnExplodeSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      threeViewer.setExplode(val);
      if (explodeVal) explodeVal.textContent = `${Math.round(val * 100)}%`;
      if (window.soundFX) window.soundFX.tick();
    });
  }

  if (btnWireframe) {
    btnWireframe.addEventListener("click", () => {
      const isActive = btnWireframe.classList.toggle("active");
      threeViewer.toggleWireframe(isActive);
      if (window.soundFX) window.soundFX.click();
    });
  }

  if (btnSectionClip) {
    btnSectionClip.addEventListener("click", () => {
      const isActive = btnSectionClip.classList.toggle("active");
      threeViewer.toggleClipping(isActive);
      if (clipSliderGroup) clipSliderGroup.style.display = isActive ? "flex" : "none";
      if (window.soundFX) window.soundFX.click();
    });
  }

  if (clipSlider) {
    clipSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      threeViewer.setClipDistance(val);
      if (clipVal) clipVal.textContent = `${Math.round(val * 100)} mm`;
    });
  }

  if (btnAutoRotate) {
    btnAutoRotate.addEventListener("click", () => {
      const isActive = btnAutoRotate.classList.toggle("active");
      threeViewer.toggleAutoRotate(isActive);
      if (window.soundFX) window.soundFX.click();
    });
  }

  if (btnResetView) {
    btnResetView.addEventListener("click", () => {
      threeViewer.resetView();
      blueprintViewer.resetView();
      if (window.soundFX) window.soundFX.click();
    });
  }

  if (btnMeasure) {
    btnMeasure.addEventListener("click", () => {
      const isActive = btnMeasure.classList.toggle("active");
      blueprintViewer.measureMode = isActive;
      if (!isActive) {
        blueprintViewer.measurePointA = null;
        blueprintViewer.measurePointB = null;
        blueprintViewer.render();
      }
      if (window.soundFX) window.soundFX.click();
    });
  }

  if (btnAudioMute) {
    btnAudioMute.addEventListener("click", () => {
      if (window.soundFX) {
        const isMuted = window.soundFX.toggleMute();
        btnAudioMute.textContent = isMuted ? "🔇 Audio OFF" : "🔊 Audio FX";
        btnAudioMute.classList.toggle("active", !isMuted);
      }
    });
  }

  // Component Click Inspection Callback
  threeViewer.onComponentClick = (userData) => {
    showInspectionToast(userData);
  };
  blueprintViewer.onHotspotClick = (data) => {
    showInspectionToast({
      name: `Hotspot ${data.tag}`,
      info: {
        tag: data.tag,
        size: data.size,
        service: data.service,
        spec: "ASME B16.5 Piping Class"
      }
    });
  };

  function showInspectionToast(userData) {
    if (!inspectionToast) return;
    const info = userData.info || {};
    toastTag.textContent = info.tag || "TAG-INSPECT";
    toastTitle.textContent = userData.name || "Component Detail";

    let rowsHtml = "";
    for (const [k, v] of Object.entries(info)) {
      if (k !== "tag") {
        rowsHtml += `
          <div class="toast-row">
            <span>${k.toUpperCase()}:</span>
            <span>${v}</span>
          </div>
        `;
      }
    }
    toastDetails.innerHTML = rowsHtml;
    inspectionToast.style.display = "block";
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener("click", () => {
      if (inspectionToast) inspectionToast.style.display = "none";
    });
  }

  // -------------------------------------------------------------
  // Engineering Specifications & Bill of Materials (BOM) Section
  // -------------------------------------------------------------
  function renderSpecsSection(item) {
    const specsContent = document.getElementById("specsTabContent");
    if (!specsContent) return;

    // Render Nozzle Schedule by default
    renderNozzlesTable(item);
  }

  function renderNozzlesTable(item) {
    const container = document.getElementById("specsTabContent");
    if (!container) return;

    let html = `
      <table class="cad-data-table">
        <thead>
          <tr>
            <th>Nozzle Tag</th>
            <th>Nominal Size</th>
            <th>Flange Rating</th>
            <th>Service Function</th>
            <th>Elevation</th>
          </tr>
        </thead>
        <tbody>
    `;

    (item.nozzles || []).forEach(noz => {
      html += `
        <tr>
          <td><span class="tag-badge">${noz.tag}</span></td>
          <td class="mono"><strong>${noz.size}</strong></td>
          <td class="mono">${noz.rating}</td>
          <td>${noz.service}</td>
          <td class="mono">${noz.elevation}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  function renderBOMTable(item) {
    const container = document.getElementById("specsTabContent");
    if (!container) return;

    let html = `
      <table class="cad-data-table">
        <thead>
          <tr>
            <th>Component Item</th>
            <th>Qty</th>
            <th>Material Specification</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
    `;

    (item.bom || []).forEach(part => {
      html += `
        <tr>
          <td><strong>${part.item}</strong></td>
          <td class="mono">${part.qty}</td>
          <td class="mono">${part.material}</td>
          <td class="mono">${part.weightKg.toLocaleString()} kg</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  function renderFilesTable(item) {
    const container = document.getElementById("specsTabContent");
    if (!container) return;

    const files = item.files || {};
    let html = `
      <table class="cad-data-table">
        <thead>
          <tr>
            <th>File Format</th>
            <th>File Name & Size</th>
            <th>Revision Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="tag-badge">DWG</span></td>
            <td class="mono">${files.dwg || "N/A"}</td>
            <td>${item.revision.status}</td>
            <td><button class="btn-card-act" onclick="alert('Downloading ${files.dwg}...')">Download</button></td>
          </tr>
          <tr>
            <td><span class="tag-badge">STEP</span></td>
            <td class="mono">${files.step || "N/A"}</td>
            <td>3D Solid Model</td>
            <td><button class="btn-card-act" onclick="alert('Downloading ${files.step}...')">Download</button></td>
          </tr>
          <tr>
            <td><span class="tag-badge">P&ID</span></td>
            <td class="mono">${files.pid || "N/A"}</td>
            <td>Engineering Schematic</td>
            <td><button class="btn-card-act" onclick="alert('Opening ${files.pid}...')">View PDF</button></td>
          </tr>
          <tr>
            <td><span class="tag-badge">IFC</span></td>
            <td class="mono">${files.ifc || "N/A"}</td>
            <td>BIM Plant Model</td>
            <td><button class="btn-card-act" onclick="alert('Downloading ${files.ifc}...')">Download</button></td>
          </tr>
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  }

  // Spec Tab Buttons
  document.querySelectorAll(".spec-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".spec-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      if (tab === "nozzles") renderNozzlesTable(currentItem);
      else if (tab === "bom") renderBOMTable(currentItem);
      else if (tab === "files") renderFilesTable(currentItem);
    });
  });

  // -------------------------------------------------------------
  // Revision Redline Diff Modal
  // -------------------------------------------------------------
  function openRevisionDiff(item) {
    if (!revisionModal) return;
    diffModalTitle.textContent = `Revision Comparison — ${item.tag}`;
    diffCurrRevName.textContent = item.revision.rev;
    diffCurrRevDate.textContent = `Approved: ${item.revision.date} (${item.revision.status})`;

    const prev = item.previousRevision || { rev: "Rev 01", date: "Initial Draft", diffNotes: [] };
    diffPrevRevName.textContent = prev.rev;
    diffPrevRevDate.textContent = `Date: ${prev.date} (${prev.status})`;

    let notesHtml = "";
    (prev.diffNotes || []).forEach(note => {
      let icon = "✓";
      if (note.type === "added") icon = "+";
      else if (note.type === "modified") icon = "Δ";
      else if (note.type === "relocated") icon = "↻";

      notesHtml += `
        <li class="diff-item ${note.type}">
          <strong>[${note.type.toUpperCase()}]</strong> ${note.desc}
        </li>
      `;
    });

    diffChangesList.innerHTML = notesHtml || "<li class='diff-item'>No redline modifications recorded between these revisions.</li>";
    revisionModal.classList.add("open");
    if (window.soundFX) window.soundFX.whoosh();
  }

  if (btnDiffRev) {
    btnDiffRev.addEventListener("click", () => openRevisionDiff(currentItem));
  }
  if (closeDiffModalBtn) {
    closeDiffModalBtn.addEventListener("click", () => revisionModal.classList.remove("open"));
  }

  // -------------------------------------------------------------
  // Conversational AI Search Bot Drawer
  // -------------------------------------------------------------
  if (botTriggerBtn) {
    botTriggerBtn.addEventListener("click", () => {
      chatDrawer.classList.toggle("open");
      if (window.soundFX) window.soundFX.whoosh();
      if (chatDrawer.classList.contains("open")) {
        chatInput.focus();
      }
    });
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener("click", () => {
      chatDrawer.classList.remove("open");
    });
  }

  function handleSendChat() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.textContent = text;
    chatMessages.appendChild(userBubble);
    chatInput.value = "";

    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (window.soundFX) window.soundFX.click();

    // AI Thinking & Answering
    setTimeout(() => {
      const { parsed, results } = window.cadQueryParser.search(text, window.CAD_DATABASE);
      const botBubble = document.createElement("div");
      botBubble.className = "chat-bubble bot";

      let responseText = "";
      if (results.length > 0) {
        const top = results[0].item;
        responseText = `Found <strong>${results.length} CAD drawings and models</strong> matching your criteria.<br><br>
        Top Match: <strong>${top.tag}</strong> (${top.title}) with capacity <strong>${top.capacityDisplay}</strong> at ${top.pressure} bar.<br>
        <span style="color: var(--accent-cyan);">Would you like to inspect its 3D model or nozzle schedule?</span>`;
        loadItem(top);
      } else {
        responseText = `I couldn't locate an exact match for "${text}". Try searching with terms like "tank of 50000 capacity", "boiler feed pump", "185 m2 exchanger", or "distillation column".`;
      }

      botBubble.innerHTML = responseText;
      chatMessages.appendChild(botBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (window.soundFX) window.soundFX.scan();
    }, 450);
  }

  if (sendChatBtn) sendChatBtn.addEventListener("click", handleSendChat);
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSendChat();
    });
  }

  // -------------------------------------------------------------
  // Interactive Shape Sketch Search Modal (Draw on Canvas)
  // -------------------------------------------------------------
  let isSketching = false;
  let sketchCtx = null;

  if (sketchCanvas) {
    sketchCtx = sketchCanvas.getContext("2d");
    sketchCtx.strokeStyle = "#00f0ff";
    sketchCtx.lineWidth = 4;
    sketchCtx.lineCap = "round";

    sketchCanvas.addEventListener("mousedown", (e) => {
      isSketching = true;
      sketchCtx.beginPath();
      sketchCtx.moveTo(e.offsetX, e.offsetY);
    });

    sketchCanvas.addEventListener("mousemove", (e) => {
      if (isSketching) {
        sketchCtx.lineTo(e.offsetX, e.offsetY);
        sketchCtx.stroke();
      }
    });

    window.addEventListener("mouseup", () => {
      isSketching = false;
    });
  }

  if (btnClearSketch && sketchCtx) {
    btnClearSketch.addEventListener("click", () => {
      sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    });
  }

  if (btnSketchSearch) {
    btnSketchSearch.addEventListener("click", () => {
      if (sketchModal) sketchModal.classList.add("open");
      if (btnClearSketch) btnClearSketch.click();
    });
  }

  if (closeSketchModalBtn) {
    closeSketchModalBtn.addEventListener("click", () => {
      if (sketchModal) sketchModal.classList.remove("open");
    });
  }

  if (btnMatchSketch) {
    btnMatchSketch.addEventListener("click", () => {
      if (sketchModal) sketchModal.classList.remove("open");
      // Analyze bounding box of drawn pixels to classify cylinder vs horizontal drum vs sphere
      const imgData = sketchCtx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height).data;
      let minX = sketchCanvas.width, maxX = 0, minY = sketchCanvas.height, maxY = 0;
      let pixelCount = 0;

      for (let y = 0; y < sketchCanvas.height; y++) {
        for (let x = 0; x < sketchCanvas.width; x++) {
          const idx = (y * sketchCanvas.width + x) * 4;
          if (imgData[idx + 3] > 50) { // non-transparent
            pixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (pixelCount > 20) {
        const drawnWidth = maxX - minX;
        const drawnHeight = maxY - minY;
        const aspect = drawnWidth / drawnHeight;

        let detectedShape = "vertical_cylinder";
        if (aspect > 1.6) {
          detectedShape = "horizontal_cylinder"; // wide shape -> Heat exchanger / Horizontal drum
        } else if (Math.abs(aspect - 1.0) < 0.25) {
          detectedShape = "sphere"; // 1:1 round aspect -> Horton sphere
        } else if (aspect < 0.35) {
          detectedShape = "column"; // very tall slender -> Column
        }

        // Apply filter
        activeShapeFilter = detectedShape;
        document.querySelectorAll(".btn-shape-icon").forEach(b => {
          b.classList.toggle("active", b.dataset.shape === detectedShape);
        });
        if (searchInput) {
          searchInput.value = `${detectedShape.replace("_", " ")}`;
        }
        performSearch();
      }
    });
  }
});
