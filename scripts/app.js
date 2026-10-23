// ==========================================================================
// AXIS // CAD — ChatGPT-style Engineering Retrieval Controller
// Dual-state: Editorial Landing Page with Chrome Sculpture -> CAD Workbench
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Views
  const landingView = document.getElementById("landingView");
  const workbenchView = document.getElementById("workbenchView");

  // 2. Landing Elements
  const landingSearchInput = document.getElementById("landingSearchInput");
  const landingSubmitBtn = document.getElementById("landingSubmitBtn");
  const landingChips = document.querySelectorAll(".landing-chip");

  // 3. Navigation Controls
  const btnBackToHome = document.getElementById("btnBackToHome");
  const btnNewSearch = document.getElementById("btnNewSearch");
  const btnToggleSidebar = document.getElementById("btnToggleSidebar");
  const appSidebar = document.getElementById("appSidebar");

  // 4. Workbench Search Elements
  const mainSearchInput = document.getElementById("mainSearchInput");
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");
  const matchStatusBadge = document.getElementById("matchStatusBadge");
  const quickExampleBtns = document.querySelectorAll(".btn-quick-example");
  const historyItems = document.querySelectorAll(".history-item");

  // 5. Asset & Specs Elements
  const assetTagBadge = document.getElementById("assetTagBadge");
  const assetRevBadge = document.getElementById("assetRevBadge");
  const assetTitleText = document.getElementById("assetTitleText");

  const tab3dBtn = document.getElementById("tab3dBtn");
  const tab2dBtn = document.getElementById("tab2dBtn");
  const tabSplitBtn = document.getElementById("tabSplitBtn");
  const dualStageBox = document.getElementById("dualStageBox");

  // 3D Controls
  const btnIso = document.getElementById("btnIso");
  const btnFront = document.getElementById("btnFront");
  const btnTop = document.getElementById("btnTop");
  const btnSpin = document.getElementById("btnSpin");
  const btnWire = document.getElementById("btnWire");
  const btnReset = document.getElementById("btnReset");

  // 2D Controls
  const btnZoomIn = document.getElementById("btnZoomIn");
  const btnZoomOut = document.getElementById("btnZoomOut");
  const btnReset2D = document.getElementById("btnReset2D");

  // Specs Elements
  const specCap = document.getElementById("specCap");
  const specDim = document.getElementById("specDim");
  const specMat = document.getElementById("specMat");
  const specPress = document.getElementById("specPress");
  const specCode = document.getElementById("specCode");

  // Files & Action Buttons
  const fileDwgName = document.getElementById("fileDwgName");
  const fileStepName = document.getElementById("fileStepName");
  const btnViewRedlines = document.getElementById("btnViewRedlines");

  // Modal Elements
  const redlineModal = document.getElementById("redlineModal");
  const closeDiffModalBtn = document.getElementById("closeDiffModalBtn");
  const diffModalTitle = document.getElementById("diffModalTitle");
  const diffCurrRevName = document.getElementById("diffCurrRevName");
  const diffCurrRevDate = document.getElementById("diffCurrRevDate");
  const diffPrevRevName = document.getElementById("diffPrevRevName");
  const diffPrevRevDate = document.getElementById("diffPrevRevDate");
  const diffChangesList = document.getElementById("diffChangesList");

  // State
  let threeViewer = null;
  let blueprintViewer = null;
  let currentItem = null;
  let isAutoSpinning = false;
  let isWireframeActive = false;
  let currentViewMode = "3d";

  // 6. Initialize CAD Viewers Lazy / Early
  function ensureViewers() {
    if (!threeViewer && window.CADThreeViewer && document.getElementById("threeStageContainer")) {
      try {
        threeViewer = new CADThreeViewer("threeStageContainer");
        window.threeViewer = threeViewer;
      } catch (err) {
        console.error("Failed to init 3D viewer:", err);
      }
    }

    if (!blueprintViewer && window.CADBlueprintViewer && document.getElementById("blueprintCanvas")) {
      try {
        blueprintViewer = new CADBlueprintViewer("blueprintCanvas");
        window.blueprintViewer = blueprintViewer;
      } catch (err) {
        console.error("Failed to init 2D viewer:", err);
      }
    }
  }

  // 7. Equipment Matching Logic
  function matchEquipment(query) {
    const q = (query || "").toLowerCase().trim();
    const db = window.CAD_DATABASE || [];
    if (!db.length) return null;

    // Direct matchers for 3 core examples
    if (q.includes("tank") || q.includes("50000") || q.includes("crude") || q.includes("floating") || q.includes("tk-104")) {
      return db.find(it => it.id === "TK-104A") || db[0];
    }
    if (q.includes("pump") || q.includes("boiler") || q.includes("feed") || q.includes("320") || q.includes("centrifugal") || q.includes("p-101") || q.includes("p101")) {
      return db.find(it => it.id === "P-101A") || db.find(it => it.category === "Rotating Equipment") || db[1];
    }
    if (q.includes("heat") || q.includes("exchanger") || q.includes("tube") || q.includes("42") || q.includes("tema") || q.includes("he-202") || q.includes("he202")) {
      return db.find(it => it.id === "HE-202") || db.find(it => it.category === "Heat Transfer") || db[3];
    }
    if (q.includes("sphere") || q.includes("horton") || q.includes("lpg") || q.includes("propane") || q.includes("2500") || q.includes("tk-501")) {
      return db.find(it => it.id === "TK-501") || db[2];
    }
    if (q.includes("5000") || q.includes("buffer") || q.includes("chemical") || q.includes("tk-202")) {
      return db.find(it => it.id === "TK-202B") || db[1];
    }

    // Generic keyword match
    const words = q.split(/\s+/).filter(w => w.length > 2);
    const found = db.find(it => {
      const text = `${it.id} ${it.tag} ${it.title} ${it.category} ${it.material} ${it.code} ${(it.tags || []).join(" ")}`.toLowerCase();
      return words.some(w => text.includes(w));
    });

    return found || db[0];
  }

  // 8. Display Equipment in Workbench
  function displayEquipment(item, queryText) {
    if (!item) return;
    currentItem = item;
    ensureViewers();

    // Update Header / Asset Banner
    if (assetTagBadge) assetTagBadge.textContent = item.tag || item.id;
    if (assetRevBadge) {
      assetRevBadge.textContent = `[${item.revision ? item.revision.rev : "REV 01"} • ${item.revision ? item.revision.status : "APPROVED"} • ${item.code || "API/ASME"}]`;
    }
    if (assetTitleText) assetTitleText.textContent = item.title;

    // Update Match Badge
    if (matchStatusBadge) {
      matchStatusBadge.textContent = `MATCH: ${item.tag} (100% RELEVANCE)`;
    }

    // Update Specs Matrix
    if (specCap) specCap.textContent = item.capacityDisplay || `${item.capacityValue || ""} ${item.capacityUnit || ""}`;
    if (specDim) {
      if (item.dimensions) {
        specDim.textContent = `${item.dimensions.diameter || ""} × ${item.dimensions.height || ""}`;
      } else {
        specDim.textContent = "Engineered Standard";
      }
    }
    if (specMat) specMat.textContent = item.material || "ASME Specified Alloy";
    if (specPress) specPress.textContent = `${item.pressure || "Atmospheric"} ${item.pressureUnit || "bar"}`;
    if (specCode) specCode.textContent = item.code || "Engineering Standard";

    // Update Files
    if (fileDwgName && item.files) {
      fileDwgName.textContent = `DWG: ${item.files.dwg || item.tag + ".dwg"}`;
    }
    if (fileStepName && item.files) {
      fileStepName.textContent = `• STEP: ${item.files.step || item.tag + ".step"}`;
    }

    // Highlight active example buttons & sidebar history items
    quickExampleBtns.forEach(btn => {
      const q = btn.dataset.query;
      const matchedForBtn = matchEquipment(q);
      btn.classList.toggle("active", matchedForBtn && matchedForBtn.id === item.id);
    });

    historyItems.forEach(hi => {
      const q = hi.dataset.query;
      const matchedForHi = matchEquipment(q);
      hi.classList.toggle("active", matchedForHi && matchedForHi.id === item.id);
    });

    // Load into 3D Viewer
    if (threeViewer) {
      try {
        threeViewer.loadEquipment(item);
        if (isWireframeActive) {
          threeViewer.toggleWireframe(true);
        }
      } catch (e) {
        console.warn("Error loading 3D model:", e);
      }
    }

    // Load into 2D Blueprint Viewer
    if (blueprintViewer) {
      try {
        blueprintViewer.loadEquipment(item);
      } catch (e) {
        console.warn("Error loading 2D blueprint:", e);
      }
    }

    // Audio feedback
    if (window.soundFX && window.soundFX.success) {
      window.soundFX.success();
    }
  }

  // 9. Transition from Landing Page to CAD Workbench
  function openWorkbench(query) {
    const q = (query || "").trim();
    if (!q) return;

    const match = matchEquipment(q);
    if (!match) return;

    // Switch views
    if (landingView) landingView.style.display = "none";
    if (workbenchView) workbenchView.style.display = "flex";

    // Populate workbench search bar
    if (mainSearchInput) mainSearchInput.value = q;

    // Display equipment
    displayEquipment(match, q);

    // Resize canvas viewports once elements have layout dimensions
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (threeViewer) threeViewer.onWindowResize();
        if (blueprintViewer) blueprintViewer.resize();
      }, 60);
    });
  }

  // 10. Return from Workbench to Landing Page
  function returnToLanding() {
    if (workbenchView) workbenchView.style.display = "none";
    if (landingView) {
      landingView.style.display = "flex";
      if (landingSearchInput) {
        landingSearchInput.value = "";
        landingSearchInput.focus();
      }
    }
  }

  // 11. Event Handlers: Landing Page
  if (landingSubmitBtn) {
    landingSubmitBtn.addEventListener("click", () => {
      openWorkbench(landingSearchInput.value);
    });
  }

  if (landingSearchInput) {
    landingSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        openWorkbench(landingSearchInput.value);
      }
    });
  }

  landingChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query;
      openWorkbench(q);
    });
  });

  // 12. Event Handlers: Navigation Back
  if (btnBackToHome) {
    btnBackToHome.addEventListener("click", returnToLanding);
  }
  if (btnNewSearch) {
    btnNewSearch.addEventListener("click", returnToLanding);
  }

  // 13. Event Handlers: Workbench Search
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener("click", () => {
      const q = mainSearchInput.value;
      const match = matchEquipment(q);
      if (match) displayEquipment(match, q);
    });
  }

  if (mainSearchInput) {
    mainSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = mainSearchInput.value;
        const match = matchEquipment(q);
        if (match) displayEquipment(match, q);
      }
    });
  }

  quickExampleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.query;
      if (mainSearchInput) mainSearchInput.value = q;
      const match = matchEquipment(q);
      if (match) displayEquipment(match, q);
    });
  });

  historyItems.forEach(item => {
    item.addEventListener("click", () => {
      const q = item.dataset.query;
      if (mainSearchInput) mainSearchInput.value = q;
      const match = matchEquipment(q);
      if (match) displayEquipment(match, q);
    });
  });

  // 14. View Mode Switching (3D, 2D, Split)
  function setViewMode(mode) {
    currentViewMode = mode;
    if (!dualStageBox) return;

    dualStageBox.classList.remove("mode-3d", "mode-2d", "mode-split");
    dualStageBox.classList.add(`mode-${mode}`);

    tab3dBtn.classList.toggle("active", mode === "3d");
    tab2dBtn.classList.toggle("active", mode === "2d");
    tabSplitBtn.classList.toggle("active", mode === "split");

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (threeViewer && (mode === "3d" || mode === "split")) {
          threeViewer.onWindowResize();
        }
        if (blueprintViewer && (mode === "2d" || mode === "split")) {
          blueprintViewer.resize();
        }
      }, 50);
    });
  }

  if (tab3dBtn) tab3dBtn.addEventListener("click", () => setViewMode("3d"));
  if (tab2dBtn) tab2dBtn.addEventListener("click", () => setViewMode("2d"));
  if (tabSplitBtn) tabSplitBtn.addEventListener("click", () => setViewMode("split"));

  // 15. 3D Viewport Controls
  if (btnIso) {
    btnIso.addEventListener("click", () => {
      if (threeViewer) threeViewer.setCameraPreset("iso");
      update3DPresetActive(btnIso);
    });
  }

  if (btnFront) {
    btnFront.addEventListener("click", () => {
      if (threeViewer) threeViewer.setCameraPreset("front");
      update3DPresetActive(btnFront);
    });
  }

  if (btnTop) {
    btnTop.addEventListener("click", () => {
      if (threeViewer) threeViewer.setCameraPreset("top");
      update3DPresetActive(btnTop);
    });
  }

  function update3DPresetActive(activeBtn) {
    [btnIso, btnFront, btnTop].forEach(btn => {
      if (btn) btn.classList.toggle("active", btn === activeBtn);
    });
  }

  if (btnSpin) {
    btnSpin.addEventListener("click", () => {
      isAutoSpinning = !isAutoSpinning;
      btnSpin.classList.toggle("active", isAutoSpinning);
      if (threeViewer) threeViewer.toggle360Spin(isAutoSpinning, 2.0);
    });
  }

  if (btnWire) {
    btnWire.addEventListener("click", () => {
      isWireframeActive = !isWireframeActive;
      btnWire.classList.toggle("active", isWireframeActive);
      if (threeViewer) threeViewer.toggleWireframe(isWireframeActive);
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (threeViewer) threeViewer.resetView();
      update3DPresetActive(btnIso);
    });
  }

  // 16. 2D Blueprint Controls
  if (btnZoomIn) {
    btnZoomIn.addEventListener("click", () => {
      if (blueprintViewer) blueprintViewer.zoom(1.25);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener("click", () => {
      if (blueprintViewer) blueprintViewer.zoom(0.8);
    });
  }

  if (btnReset2D) {
    btnReset2D.addEventListener("click", () => {
      if (blueprintViewer) blueprintViewer.resetView();
    });
  }

  // 17. Sidebar Toggle
  if (btnToggleSidebar && appSidebar) {
    btnToggleSidebar.addEventListener("click", () => {
      appSidebar.classList.toggle("collapsed");
      setTimeout(() => {
        if (threeViewer) threeViewer.onWindowResize();
        if (blueprintViewer) blueprintViewer.resize();
      }, 260);
    });
  }

  // 18. Revision Redlines Modal
  if (btnViewRedlines && redlineModal) {
    btnViewRedlines.addEventListener("click", () => {
      if (!currentItem) return;
      openRedlineModal(currentItem);
    });
  }

  function openRedlineModal(item) {
    if (!redlineModal) return;

    if (diffModalTitle) {
      diffModalTitle.textContent = `CAD Revision Redlines — ${item.tag}`;
    }

    if (diffCurrRevName) {
      diffCurrRevName.textContent = item.revision ? item.revision.rev : "Rev 04";
    }
    if (diffCurrRevDate) {
      diffCurrRevDate.textContent = `Date: ${item.revision ? item.revision.date : "2026-04-18"} • ${item.revision ? item.revision.status : "IFC"}`;
    }

    if (diffPrevRevName) {
      diffPrevRevName.textContent = item.previousRevision ? item.previousRevision.rev : "Rev 03";
    }
    if (diffPrevRevDate) {
      diffPrevRevDate.textContent = `Date: ${item.previousRevision ? item.previousRevision.date : "2025-11-12"} • ${item.previousRevision ? item.previousRevision.status : "Superseded"}`;
    }

    if (diffChangesList) {
      diffChangesList.innerHTML = "";
      const diffs = (item.previousRevision && item.previousRevision.diffNotes) || [
        { type: "modified", desc: "Updated nozzle schedule dimensions per client P&ID Rev D." },
        { type: "added", desc: "Added seismic tie-down anchorage calculations per ASCE 7-22." }
      ];

      diffs.forEach(note => {
        const li = document.createElement("li");
        li.className = `diff-item ${note.type || "modified"}`;
        li.innerHTML = `
          <strong style="text-transform: uppercase; font-family: var(--font-mono); font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 2px; background: rgba(0,0,0,0.06); margin-right: 0.4rem;">
            ${note.type || "MODIFIED"}
          </strong>
          <span>${note.desc}</span>
        `;
        diffChangesList.appendChild(li);
      });
    }

    redlineModal.classList.add("open");
  }

  function closeRedlineModal() {
    if (redlineModal) redlineModal.classList.remove("open");
  }

  if (closeDiffModalBtn) {
    closeDiffModalBtn.addEventListener("click", closeRedlineModal);
  }

  if (redlineModal) {
    redlineModal.addEventListener("click", (e) => {
      if (e.target === redlineModal) {
        closeRedlineModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeRedlineModal();
    }
  });

  // 19. Initial Focus on Landing Input
  if (landingSearchInput) {
    landingSearchInput.focus();
  }
});
