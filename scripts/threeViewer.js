// WebGL 3D CAD Engine for Plant Engineering Equipment
// Powered by Three.js with procedural geometry, exploded view, section clipping, and raycast inspection.

class CADThreeViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentModelGroup = null;
    this.subMeshes = [];
    this.explodeFactor = 0;
    this.isWireframe = false;
    this.autoRotate = false;
    this.clippingEnabled = false;
    this.clipPlane = null;
    this.clipDistance = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMesh = null;
    this.selectedMesh = null;
    this.dimensionsVisible = true;
    this.dimensionLinesGroup = null;

    this.onComponentClick = null; // Callback for UI inspection

    this.init();
  }

  init() {
    if (!this.container) return;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 550;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);

    // Subtle atmospheric fog for engineering depth
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(30, 22, 35);

    // 3. Renderer with local clipping enabled
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;

    this.container.appendChild(this.renderer.domElement);

    // 4. Controls with full 360-degree spherical orbit freedom
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      // Allow full 360-degree pitch (top down to directly underneath foundation)
      this.controls.maxPolarAngle = Math.PI - 0.02;
      this.controls.minPolarAngle = 0.02;
      this.controls.minDistance = 3;
      this.controls.maxDistance = 240;
      this.controls.target.set(0, 8, 0);
      this.controls.autoRotate = false;
      this.controls.autoRotateSpeed = 2.0;
    }

    this.onAzimuthChange = null;
    this.skylineGroup = null;
    this.showSkyline = true;

    // 5. Lighting
    this.setupLighting();

    // 6. Ground Grid & Coordinate Axis
    this.setupGround();

    // 7. Clipping plane (default cutting along X axis)
    this.clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 100);

    // 8. Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    this.renderer.domElement.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.renderer.domElement.addEventListener("click", (e) => this.onClick(e));

    // Start animation loop
    this.animate();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.65);
    this.scene.add(ambientLight);

    // Main directional sunlight (key light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(40, 60, 40);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 150;
    keyLight.shadow.camera.left = -40;
    keyLight.shadow.camera.right = 40;
    keyLight.shadow.camera.top = 40;
    keyLight.shadow.camera.bottom = -40;
    this.scene.add(keyLight);

    // Secondary cyber-cyan fill light
    const fillLight = new THREE.DirectionalLight(0x00e5ff, 0.45);
    fillLight.position.set(-30, 20, -30);
    this.scene.add(fillLight);

    // Warm amber rim light for industrial contrast
    const rimLight = new THREE.DirectionalLight(0xffaa00, 0.35);
    rimLight.position.set(20, -10, -30);
    this.scene.add(rimLight);
  }

  setupGround() {
    // High-tech blueprint grid
    const gridHelper = new THREE.GridHelper(90, 90, 0x00f0ff, 0x1e2d4a);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Coordinate compass axis
    const axesHelper = new THREE.AxesHelper(6);
    axesHelper.position.set(-35, 0.1, -35);
    this.scene.add(axesHelper);

    // Circular foundation pad shadow receiver
    const padGeo = new THREE.CylinderGeometry(25, 26, 0.4, 48);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x11192b,
      roughness: 0.85,
      metalness: 0.1
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = -0.2;
    pad.receiveShadow = true;
    this.scene.add(pad);

    // 360-degree Azimuth Ground Compass Ring
    const ringGeo = new THREE.TorusGeometry(32, 0.18, 8, 72);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45 });
    const compassRing = new THREE.Mesh(ringGeo, ringMat);
    compassRing.rotation.x = Math.PI / 2;
    compassRing.position.y = 0.05;
    this.scene.add(compassRing);

    // Cardinal 360 Direction Ray Lines (N, E, S, W)
    const cardLineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 });
    const rayPoints = [
      new THREE.Vector3(0, 0.06, 26), new THREE.Vector3(0, 0.06, 36), // North (0 deg)
      new THREE.Vector3(26, 0.06, 0), new THREE.Vector3(36, 0.06, 0), // East (90 deg)
      new THREE.Vector3(0, 0.06, -26), new THREE.Vector3(0, 0.06, -36), // South (180 deg)
      new THREE.Vector3(-26, 0.06, 0), new THREE.Vector3(-36, 0.06, 0) // West (270 deg)
    ];
    for (let i = 0; i < rayPoints.length; i += 2) {
      const geo = new THREE.BufferGeometry().setFromPoints([rayPoints[i], rayPoints[i + 1]]);
      this.scene.add(new THREE.Line(geo, cardLineMat));
    }

    // 360 Industrial Plant Surroundings (Distant skyline of refinery towers & flare stacks)
    this.setup360PlantEnvironment();
  }

  setup360PlantEnvironment() {
    this.skylineGroup = new THREE.Group();
    this.skylineGroup.name = "360-plant-skyline";

    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1a263d,
      roughness: 0.9,
      metalness: 0.2
    });
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x141f33,
      roughness: 0.8,
      metalness: 0.4
    });

    // 1. Distant Distillation Column (North-West, 315 deg)
    const colGeo = new THREE.CylinderGeometry(2.5, 2.5, 45, 16);
    const col = new THREE.Mesh(colGeo, towerMat);
    col.position.set(-65, 22.5, -60);
    this.skylineGroup.add(col);

    // 2. Flare Stack with blinking flame tip (North-East, 45 deg)
    const flareGeo = new THREE.CylinderGeometry(0.8, 1.4, 60, 12);
    const flare = new THREE.Mesh(flareGeo, towerMat);
    flare.position.set(70, 30, -55);
    this.skylineGroup.add(flare);

    // Flare Flame PointLight
    const flareLight = new THREE.PointLight(0xff5500, 1.5, 80);
    flareLight.position.set(70, 62, -55);
    this.skylineGroup.add(flareLight);

    // 3. Spherical Gas Tank Horizon (South-East, 135 deg)
    const sphGeo = new THREE.SphereGeometry(12, 16, 16);
    const sph = new THREE.Mesh(sphGeo, towerMat);
    sph.position.set(65, 14, 65);
    this.skylineGroup.add(sph);

    // 4. Elevated Piperack Bridge (South, 180 deg)
    const rackGeo = new THREE.BoxGeometry(70, 3, 4);
    const rack = new THREE.Mesh(rackGeo, pipeMat);
    rack.position.set(0, 12, 85);
    this.skylineGroup.add(rack);

    // 5. Vertical Storage Tanks Group (West, 270 deg)
    const t1Geo = new THREE.CylinderGeometry(10, 10, 22, 24);
    const t1 = new THREE.Mesh(t1Geo, towerMat);
    t1.position.set(-85, 11, 15);
    this.skylineGroup.add(t1);

    const t2Geo = new THREE.CylinderGeometry(8, 8, 18, 24);
    const t2 = new THREE.Mesh(t2Geo, towerMat);
    t2.position.set(-75, 9, 38);
    this.skylineGroup.add(t2);

    this.scene.add(this.skylineGroup);
  }

  toggleSkyline(enabled) {
    this.showSkyline = enabled;
    if (this.skylineGroup) {
      this.skylineGroup.visible = enabled;
    }
  }

  // Load and display a model from the CAD database item
  loadEquipment(cadItem) {
    if (this.currentModelGroup) {
      this.scene.remove(this.currentModelGroup);
      this.disposeGroup(this.currentModelGroup);
    }
    if (this.dimensionLinesGroup) {
      this.scene.remove(this.dimensionLinesGroup);
      this.disposeGroup(this.dimensionLinesGroup);
    }

    this.subMeshes = [];
    this.currentModelGroup = new THREE.Group();
    this.currentModelGroup.name = cadItem.tag;

    // Reset controls & settings
    this.explodeFactor = 0;
    this.clipDistance = 0;
    this.clippingEnabled = false;
    this.clipPlane.constant = 100;

    // Build model geometry based on modelType
    const modelType = cadItem.modelType || "storage_tank";
    if (modelType === "storage_tank") {
      this.buildStorageTank(cadItem);
    } else if (modelType === "heat_exchanger") {
      this.buildHeatExchanger(cadItem);
    } else if (modelType === "centrifugal_pump") {
      this.buildCentrifugalPump(cadItem);
    } else if (modelType === "distillation_column") {
      this.buildDistillationColumn(cadItem);
    } else if (modelType === "horton_sphere") {
      this.buildHortonSphere(cadItem);
    } else if (modelType === "skid_package") {
      this.buildSkidPackage(cadItem);
    } else {
      this.buildStorageTank(cadItem);
    }

    this.scene.add(this.currentModelGroup);

    // Build 3D measurement dimension annotations
    this.buildDimensions(cadItem);

    // Frame camera to look at the new model
    this.fitCameraToModel();

    if (window.soundFX) {
      window.soundFX.success();
    }
  }

  // Common materials helper
  createMaterials() {
    return {
      steel: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.28,
        clippingPlanes: this.clippingEnabled ? [this.clipPlane] : [],
        clipShadows: true
      }),
      stainless: new THREE.MeshStandardMaterial({
        color: 0xdde7f0,
        metalness: 0.92,
        roughness: 0.18,
        clippingPlanes: this.clippingEnabled ? [this.clipPlane] : [],
        clipShadows: true
      }),
      flange: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.75,
        roughness: 0.35,
        clippingPlanes: this.clippingEnabled ? [this.clipPlane] : []
      }),
      brassTubes: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        clippingPlanes: this.clippingEnabled ? [this.clipPlane] : []
      }),
      copper: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.88,
        roughness: 0.25,
        clippingPlanes: this.clippingEnabled ? [this.clipPlane] : []
      }),
      skidFrame: new THREE.MeshStandardMaterial({
        color: 0x1e3a8a, // Industrial Navy
        metalness: 0.5,
        roughness: 0.5
      }),
      motorGreen: new THREE.MeshStandardMaterial({
        color: 0x059669, // Emerald Industrial Motor
        metalness: 0.6,
        roughness: 0.4
      }),
      valveRed: new THREE.MeshStandardMaterial({
        color: 0xef4444,
        metalness: 0.4,
        roughness: 0.3
      }),
      accentCyan: new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.25
      })
    };
  }

  // Register a submesh with original position & exploded vector for smooth animation
  registerSubMesh(mesh, name, info, explodeVector = new THREE.Vector3(0, 0, 0)) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      name,
      info,
      origPosition: mesh.position.clone(),
      explodeVector: explodeVector.clone(),
      origMaterial: mesh.material
    };
    this.subMeshes.push(mesh);
    this.currentModelGroup.add(mesh);
  }

  // 1. Storage Tank Builder (TK-104A, TK-202B, TK-808)
  buildStorageTank(item) {
    const mats = this.createMaterials();
    const isStainless = item.material && item.material.includes("316");
    const shellMat = isStainless ? mats.stainless : mats.steel;

    const radius = 10;
    const height = 18;

    // Shell Cylinder
    const shellGeo = new THREE.CylinderGeometry(radius, radius, height, 48, 1, false);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.y = height / 2;
    this.registerSubMesh(shell, "Cylindrical Tank Shell", {
      tag: "SHELL-1",
      spec: `${item.material} / ASME Sec VIII`,
      thickness: item.dimensions.shellThickness,
      service: "Product Containment Pressure Boundary"
    }, new THREE.Vector3(0, 0, 0));

    // Bottom annular ring / base plate
    const baseGeo = new THREE.CylinderGeometry(radius + 0.6, radius + 0.8, 0.5, 48);
    const base = new THREE.Mesh(baseGeo, mats.flange);
    base.position.y = 0.25;
    this.registerSubMesh(base, "Bottom Annular Chime Plate", {
      tag: "BASE-CHIME",
      spec: "API 650 Annular Ring Section",
      thickness: "14 mm with 50mm foundation projection"
    }, new THREE.Vector3(0, -4, 0));

    // Roof: Floating or Dished or Conical
    if (item.shape === "cone") {
      // Conical Silo Roof
      const coneGeo = new THREE.ConeGeometry(radius, 4, 36);
      const roof = new THREE.Mesh(coneGeo, shellMat);
      roof.position.y = height + 2;
      this.registerSubMesh(roof, "Conical Weather Roof", {
        tag: "ROOF-CONE",
        spec: "Self-supporting cone roof 1:5 slope",
        thickness: "8 mm plate"
      }, new THREE.Vector3(0, 8, 0));

      // Bottom Hopper Cone
      const botConeGeo = new THREE.ConeGeometry(radius, 6, 36);
      const botCone = new THREE.Mesh(botConeGeo, shellMat);
      botCone.rotation.x = Math.PI;
      botCone.position.y = 3;
      this.registerSubMesh(botCone, "60° Bottom Discharge Cone", {
        tag: "CONE-DISCHARGE",
        spec: "Hardox wear-resistant liner",
        thickness: "16 mm steel plate"
      }, new THREE.Vector3(0, -6, 0));
    } else {
      // Dished Head or Floating Roof
      const domeGeo = new THREE.SphereGeometry(radius, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.35);
      const dome = new THREE.Mesh(domeGeo, shellMat);
      dome.position.y = height;
      this.registerSubMesh(dome, "Torispherical Head / Floating Deck", {
        tag: "DECK-ROOF",
        spec: "API 650 Annex C Pontoon Floating Roof",
        thickness: "10 mm deck plate with liquid seal"
      }, new THREE.Vector3(0, 10, 0));

      // Top Safety Handrail Ring
      const railGeo = new THREE.TorusGeometry(radius - 0.4, 0.1, 8, 48);
      const rail = new THREE.Mesh(railGeo, mats.accentCyan);
      rail.rotation.x = Math.PI / 2;
      rail.position.y = height + 0.9;
      this.registerSubMesh(rail, "Top Perimeter Safety Handrail", {
        tag: "RAIL-01",
        spec: "OSHA 1910 Compliant Galvanized Handrail",
        height: "1,100 mm with toe-board"
      }, new THREE.Vector3(0, 12, 0));
    }

    // Inlet Nozzle N1
    const n1StubGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 24);
    const n1Stub = new THREE.Mesh(n1StubGeo, mats.flange);
    n1Stub.rotation.z = Math.PI / 2;
    n1Stub.position.set(radius + 1.5, 4, 0);
    this.registerSubMesh(n1Stub, "Inlet Nozzle N1 [DN600 150# RF]", {
      tag: "N1",
      spec: "ASME B16.5 Weld Neck Flange",
      size: "24\" (DN600) Class 150# RF",
      elevation: "+1,200 mm"
    }, new THREE.Vector3(6, 0, 0));

    // Outlet Nozzle N2
    const n2StubGeo = new THREE.CylinderGeometry(0.7, 0.7, 3, 24);
    const n2Stub = new THREE.Mesh(n2StubGeo, mats.flange);
    n2Stub.rotation.x = Math.PI / 2;
    n2Stub.position.set(0, 2.5, radius + 1.5);
    this.registerSubMesh(n2Stub, "Outlet Nozzle N2 [DN400 150# RF]", {
      tag: "N2",
      spec: "Pump Suction Connection",
      size: "16\" (DN400) Class 150# RF",
      elevation: "+850 mm"
    }, new THREE.Vector3(0, 0, 6));

    // Manhole M1
    const manholeGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 24);
    const manhole = new THREE.Mesh(manholeGeo, mats.flange);
    manhole.rotation.z = -Math.PI / 2;
    manhole.position.set(-(radius + 1), 3, 0);
    this.registerSubMesh(manhole, "Shell Inspection Manway M1 [DN900]", {
      tag: "M1",
      spec: "36\" (DN900) API 650 Shell Access",
      bolts: "24x 1\" stud bolts, spiral wound gasket",
      elevation: "+900 mm"
    }, new THREE.Vector3(-6, 0, 0));

    // Spiral Staircase Wrap
    this.buildSpiralStairs(radius, height, mats.flange);
  }

  // Spiral stairs procedural generator
  buildSpiralStairs(radius, height, material) {
    const steps = 32;
    const totalAngle = Math.PI * 1.5;
    for (let i = 0; i < steps; i++) {
      const frac = i / steps;
      const angle = frac * totalAngle;
      const y = frac * height;
      const stepGeo = new THREE.BoxGeometry(2.2, 0.1, 0.8);
      const step = new THREE.Mesh(stepGeo, material);
      const r = radius + 1.1;
      step.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      step.rotation.y = -angle;
      this.currentModelGroup.add(step);
    }
  }

  // 2. Shell & Tube Heat Exchanger (HE-202, HE-305, V-402)
  buildHeatExchanger(item) {
    const mats = this.createMaterials();
    const length = 20;
    const radius = 3.8;

    // Main Shell Cylinder (horizontal)
    const shellGeo = new THREE.CylinderGeometry(radius, radius, length, 36, 1, true);
    const shell = new THREE.Mesh(shellGeo, mats.steel);
    shell.rotation.z = Math.PI / 2;
    shell.position.set(0, radius + 2, 0);
    this.registerSubMesh(shell, "Exchanger Main Shell Barrel", {
      tag: "SHELL-HE",
      spec: "SA-516 Gr. 70 Carbon Steel",
      rating: "28 bar design pressure @ 280°C",
      thickness: "22 mm wall"
    }, new THREE.Vector3(0, 0, 0));

    // Channel Head Barrel (front)
    const chGeo = new THREE.CylinderGeometry(radius, radius, 4, 36);
    const chHead = new THREE.Mesh(chGeo, mats.steel);
    chHead.rotation.z = Math.PI / 2;
    chHead.position.set(-(length / 2 + 2), radius + 2, 0);
    this.registerSubMesh(chHead, "TEMA Channel Head Barrel & Cover", {
      tag: "CHAN-HEAD",
      spec: "Removable Channel Cover with Pass Partition",
      rating: "42 bar Tube Side Design"
    }, new THREE.Vector3(-10, 0, 0));

    // Tube Sheet (forged plate)
    const tsGeo = new THREE.CylinderGeometry(radius + 0.6, radius + 0.6, 1.2, 36);
    const tsMesh = new THREE.Mesh(tsGeo, mats.flange);
    tsMesh.rotation.z = Math.PI / 2;
    tsMesh.position.set(-length / 2, radius + 2, 0);
    this.registerSubMesh(tsMesh, "Stationary Forged Tubesheet", {
      tag: "TUBESHEET",
      spec: "SA-182 F316L Clad on SA-105",
      tubes: "384 Holes 3/4\" OD Triangular Pitch"
    }, new THREE.Vector3(-5, 0, 0));

    // Internal U-Tube Bundle (slides out in exploded view!)
    const bundleGroup = new THREE.Group();
    const tubeMat = mats.brassTubes;
    const numTubes = 24;
    for (let i = 0; i < numTubes; i++) {
      const angle = (i / numTubes) * Math.PI * 2;
      const r = (radius - 1.2) * (0.3 + 0.65 * (i % 3) / 2);
      const tubeY = Math.sin(angle) * r;
      const tubeZ = Math.cos(angle) * r;

      const tLength = length * 0.85;
      const tGeo = new THREE.CylinderGeometry(0.12, 0.12, tLength, 12);
      const tube = new THREE.Mesh(tGeo, tubeMat);
      tube.rotation.z = Math.PI / 2;
      tube.position.set(0, tubeY, tubeZ);
      bundleGroup.add(tube);
    }
    bundleGroup.position.set(0, radius + 2, 0);
    this.registerSubMesh(bundleGroup, "Internal U-Tube Bundle Assembly", {
      tag: "TUBE-BUNDLE",
      spec: "SA-213 TP316L Seamless Tubes",
      area: item.capacityDisplay,
      passes: "2-Pass Tube Side"
    }, new THREE.Vector3(12, 0, 0));

    // Saddle Supports (2 cradles)
    [-length * 0.3, length * 0.3].forEach((xPos, idx) => {
      const saddleGeo = new THREE.BoxGeometry(1.6, radius + 2, radius * 2.2);
      const saddle = new THREE.Mesh(saddleGeo, mats.flange);
      saddle.position.set(xPos, (radius + 2) / 2, 0);
      this.registerSubMesh(saddle, `Twin Saddle Support #${idx + 1}`, {
        tag: `SADDLE-0${idx + 1}`,
        spec: "ASTM A36 with Slotted Baseplate",
        expansion: "Slotted for 18mm thermal glide"
      }, new THREE.Vector3(0, -3, 0));
    });

    // Shell Nozzles (Inlet & Outlet)
    const s1Geo = new THREE.CylinderGeometry(0.7, 0.7, 2.5, 24);
    const s1 = new THREE.Mesh(s1Geo, mats.flange);
    s1.position.set(length * 0.25, radius * 2 + 3, 0);
    this.registerSubMesh(s1, "Shell Inlet Nozzle S1 [8\" 300#]", {
      tag: "S1",
      spec: "ASME B16.5 300# RF",
      elevation: "+1,650 mm"
    }, new THREE.Vector3(0, 5, 0));

    const s2Geo = new THREE.CylinderGeometry(0.7, 0.7, 2.5, 24);
    const s2 = new THREE.Mesh(s2Geo, mats.flange);
    s2.position.set(-length * 0.25, 0.8, 0);
    this.registerSubMesh(s2, "Shell Outlet Drain S2 [8\" 300#]", {
      tag: "S2",
      spec: "ASME B16.5 300# RF",
      elevation: "+450 mm"
    }, new THREE.Vector3(0, -4, 0));
  }

  // 3. Centrifugal Process Pump (P-101A, P-304)
  buildCentrifugalPump(item) {
    const mats = this.createMaterials();

    // Heavy Skid Baseplate (I-Beams)
    const skidGeo = new THREE.BoxGeometry(22, 1.4, 11);
    const skid = new THREE.Mesh(skidGeo, mats.skidFrame);
    skid.position.set(0, 0.7, 0);
    this.registerSubMesh(skid, "Fabricated Steel Baseplate Skid", {
      tag: "SKID-BASE",
      spec: "Rigid Structural Channel with Grout Holes",
      vibration: "API 610 Dynamic Balance Certified"
    }, new THREE.Vector3(0, -3, 0));

    // Electric Drive Motor
    const motorRadius = 3.4;
    const motorLen = 8;
    const motorGeo = new THREE.CylinderGeometry(motorRadius, motorRadius, motorLen, 24);
    const motor = new THREE.Mesh(motorGeo, mats.motorGreen);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-5, 5, 0);
    this.registerSubMesh(motor, "Siemens 250 kW Explosion-Proof Motor", {
      tag: "MTR-101",
      spec: "3-Phase 400V 50Hz 2950 RPM",
      rating: "Ex d IIB T4 / IP66 Enclosure"
    }, new THREE.Vector3(-8, 2, 0));

    // Shaft Coupling Guard
    const cGuardGeo = new THREE.CylinderGeometry(2.0, 2.0, 2.8, 24);
    const cGuard = new THREE.Mesh(cGuardGeo, mats.accentCyan);
    cGuard.rotation.z = Math.PI / 2;
    cGuard.position.set(0.6, 5, 0);
    this.registerSubMesh(cGuard, "Flexible Spacer Coupling Guard", {
      tag: "CPL-GUARD",
      spec: "Non-sparking Aluminum Guard"
    }, new THREE.Vector3(0, 4, 0));

    // Pump Volute Casing
    const voluteGeo = new THREE.TorusGeometry(3.2, 1.4, 16, 32);
    const volute = new THREE.Mesh(voluteGeo, mats.steel);
    volute.position.set(5.5, 5, 0);
    this.registerSubMesh(volute, "Dual Volute Heavy Cast Casing", {
      tag: "VOLUTE-CASING",
      spec: `${item.material} / API 610 BB2`,
      pressure: `${item.pressure} bar discharge rating`
    }, new THREE.Vector3(6, 0, 0));

    // Suction Nozzle (Axial)
    const sucGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.5, 24);
    const suc = new THREE.Mesh(sucGeo, mats.flange);
    suc.rotation.z = Math.PI / 2;
    suc.position.set(9.5, 5, 0);
    this.registerSubMesh(suc, "Axial Suction Nozzle [8\" 300#]", {
      tag: "SUCTION-IN",
      spec: "ASME B16.5 300# RF Flange",
      size: "8\" (DN200)"
    }, new THREE.Vector3(6, 0, 0));

    // Discharge Nozzle (Radial Top)
    const discGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.8, 24);
    const disc = new THREE.Mesh(discGeo, mats.flange);
    disc.position.set(5.5, 9.5, 0);
    this.registerSubMesh(disc, "Top Radial Discharge Nozzle [6\" 600#]", {
      tag: "DISCHARGE-OUT",
      spec: "ASME B16.5 600# RF Flange",
      size: "6\" (DN150)"
    }, new THREE.Vector3(0, 5, 0));
  }

  // 4. Distillation Fractionation Column (C-101)
  buildDistillationColumn(item) {
    const mats = this.createMaterials();
    const height = 36;
    const radius = 3.2;

    // Tower Shell Cylinder
    const shellGeo = new THREE.CylinderGeometry(radius, radius, height, 36);
    const shell = new THREE.Mesh(shellGeo, mats.stainless);
    shell.position.y = height / 2 + 4;
    this.registerSubMesh(shell, "Column Vessel Shell (Flash Zone)", {
      tag: "COL-SHELL",
      spec: "SA-516 Gr. 70 + SS410S Clad (3mm)",
      height: item.dimensions.height,
      trays: "36 Valve Trays Internally"
    }, new THREE.Vector3(0, 0, 0));

    // Skirt Support Base
    const skirtGeo = new THREE.CylinderGeometry(radius + 0.4, radius + 0.8, 4, 36);
    const skirt = new THREE.Mesh(skirtGeo, mats.flange);
    skirt.position.y = 2;
    this.registerSubMesh(skirt, "Cylindrical Anchor Skirt Support", {
      tag: "COL-SKIRT",
      spec: "Structural Carbon Steel with 32x Foundation Bolts",
      access: "Dual inspection manways"
    }, new THREE.Vector3(0, -4, 0));

    // Top Overhead Dished Head
    const topDomeGeo = new THREE.SphereGeometry(radius, 36, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const topDome = new THREE.Mesh(topDomeGeo, mats.stainless);
    topDome.position.y = height + 4;
    this.registerSubMesh(topDome, "Top Overhead Crown Dished Head", {
      tag: "TOP-DOME",
      spec: "ASME 2:1 Ellipsoidal Head"
    }, new THREE.Vector3(0, 8, 0));

    // 16 External Tray Level Stiffener Rings
    for (let i = 1; i <= 12; i++) {
      const ringGeo = new THREE.TorusGeometry(radius + 0.15, 0.12, 8, 36);
      const ring = new THREE.Mesh(ringGeo, mats.accentCyan);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 6 + (i * 2.2);
      this.currentModelGroup.add(ring);
    }

    // Overhead Vapor Nozzle
    const ovhdGeo = new THREE.CylinderGeometry(1.4, 1.4, 3, 24);
    const ovhd = new THREE.Mesh(ovhdGeo, mats.flange);
    ovhd.position.y = height + 6.5;
    this.registerSubMesh(ovhd, "Overhead Vapor Exit Nozzle [30\" 150#]", {
      tag: "N_OVHD",
      spec: "30\" (DN750) Class 150# RF",
      elevation: "+42,200 mm"
    }, new THREE.Vector3(0, 10, 0));

    // Caged Vertical Ladder running up the side
    const ladderHeight = height + 2;
    const ladderGeo = new THREE.BoxGeometry(0.1, ladderHeight, 0.8);
    const ladder = new THREE.Mesh(ladderGeo, mats.flange);
    ladder.position.set(radius + 0.8, ladderHeight / 2 + 2, 0);
    this.currentModelGroup.add(ladder);
  }

  // 5. Horton Gas Storage Sphere (TK-501)
  buildHortonSphere(item) {
    const mats = this.createMaterials();
    const radius = 9;

    // Main Sphere
    const sphereGeo = new THREE.SphereGeometry(radius, 48, 36);
    const sphere = new THREE.Mesh(sphereGeo, mats.stainless);
    sphere.position.y = radius + 4;
    this.registerSubMesh(sphere, "Horton Pressurized Spherical Shell", {
      tag: "SPHERE-SHELL",
      spec: "SA-537 Class 1 Carbon Manganese Steel",
      rating: `${item.pressure} bar design pressure`,
      volume: item.capacityDisplay
    }, new THREE.Vector3(0, 5, 0));

    // 8 Tubular Support Columns
    const numLegs = 8;
    for (let i = 0; i < numLegs; i++) {
      const angle = (i / numLegs) * Math.PI * 2;
      const legX = Math.cos(angle) * (radius * 0.95);
      const legZ = Math.sin(angle) * (radius * 0.95);

      const legGeo = new THREE.CylinderGeometry(0.5, 0.6, radius + 4, 16);
      const leg = new THREE.Mesh(legGeo, mats.flange);
      leg.position.set(legX, (radius + 4) / 2, legZ);
      this.registerSubMesh(leg, `Support Column Leg #${i + 1}`, {
        tag: `COL-LEG-0${i + 1}`,
        spec: "ASTM A500 Gr. C Heavy Wall Tubular Column",
        anchors: "High-tensile anchor bolts"
      }, new THREE.Vector3(legX * 0.5, -3, legZ * 0.5));
    }

    // Top Dual Relief Safety Valves (PSV)
    const psvGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.5, 24);
    const psv = new THREE.Mesh(psvGeo, mats.valveRed);
    psv.position.set(0, radius * 2 + 5.5, 0);
    this.registerSubMesh(psv, "Dual Thermal Safety Relief Valves [PSV-A/B]", {
      tag: "PSV-TOP",
      spec: "ASME VIII 600# x 300# Safety Valve Manifold",
      elevation: "+17,200 mm"
    }, new THREE.Vector3(0, 8, 0));
  }

  // 6. Modular Metering & Dosing Skid Package (SK-404)
  buildSkidPackage(item) {
    const mats = this.createMaterials();

    // Skid Frame (I-Beam perimeter + Grating)
    const frameGeo = new THREE.BoxGeometry(22, 1.2, 12);
    const frame = new THREE.Mesh(frameGeo, mats.skidFrame);
    frame.position.set(0, 0.6, 0);
    this.registerSubMesh(frame, "Structural Galvanized Skid Base Frame", {
      tag: "SKID-FRAME",
      spec: "ASTM A36 HDG with Serrated Grating & Drip Lip",
      rating: "Class 1 Div 2 Hazardous Area Compliant"
    }, new THREE.Vector3(0, -3, 0));

    // 4" Main Manifold Pipe Run
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 20, 24);
    const pipe = new THREE.Mesh(pipeGeo, mats.stainless);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 3.5, 0);
    this.registerSubMesh(pipe, "Process Piping Header Manifold", {
      tag: "PIPE-HEADER",
      spec: "ASTM A312 TP316L Schedule 80S",
      rating: "Class 600# Flanged"
    }, new THREE.Vector3(0, 4, 0));

    // Dual Coriolis Flow Meters (Micro Motion)
    [-4, 4].forEach((xPos, idx) => {
      const meterGeo = new THREE.BoxGeometry(2.4, 3.5, 1.8);
      const meter = new THREE.Mesh(meterGeo, mats.accentCyan);
      meter.position.set(xPos, 5, 0);
      this.registerSubMesh(meter, `Coriolis Mass Flow Meter Unit #${idx + 1}`, {
        tag: `FT-0${idx + 1}`,
        spec: "Micro Motion ELITE Mass Flow Sensor",
        accuracy: "±0.05% Liquid Mass Flow Accuracy"
      }, new THREE.Vector3(0, 6, (idx === 0 ? -4 : 4)));
    });

    // Control Valve with Red Handwheel
    const vGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const valve = new THREE.Mesh(vGeo, mats.valveRed);
    valve.position.set(7.5, 3.5, 0);
    this.registerSubMesh(valve, "Pneumatic Control Valve with Digital Positioner", {
      tag: "FCV-401",
      spec: "Fisher Globe Body Class 600# CF8M",
      actuator: "Fail-Closed Air Diaphragm"
    }, new THREE.Vector3(4, 3, 0));
  }

  // 3D Measurement Dimension Overlay Lines
  buildDimensions(item) {
    this.dimensionLinesGroup = new THREE.Group();
    this.dimensionLinesGroup.name = "dimensions";

    const dimMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });

    // Dimension helper line (Vertical Height)
    const points = [];
    points.push(new THREE.Vector3(-14, 0, 0));
    points.push(new THREE.Vector3(-14, 20, 0));

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, dimMat);
    this.dimensionLinesGroup.add(line);

    // Cross tics
    const ticGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15, 0, 0), new THREE.Vector3(-13, 0, 0)]);
    const ticGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15, 20, 0), new THREE.Vector3(-13, 20, 0)]);
    this.dimensionLinesGroup.add(new THREE.Line(ticGeo1, dimMat));
    this.dimensionLinesGroup.add(new THREE.Line(ticGeo2, dimMat));

    this.dimensionLinesGroup.visible = this.dimensionsVisible;
    this.scene.add(this.dimensionLinesGroup);
  }

  // Exploded View Slider (0.0 = assembled, 1.0 = fully exploded)
  setExplode(val) {
    this.explodeFactor = Math.max(0, Math.min(1, val));
    this.subMeshes.forEach(mesh => {
      const orig = mesh.userData.origPosition;
      const vec = mesh.userData.explodeVector;
      if (orig && vec) {
        mesh.position.copy(orig).addScaledVector(vec, this.explodeFactor);
      }
    });
  }

  // Cross-section clipping plane distance (-20 to +20)
  setClipDistance(val) {
    this.clipDistance = val;
    if (this.clipPlane) {
      this.clipPlane.constant = val;
    }
  }

  toggleClipping(enabled) {
    this.clippingEnabled = enabled;
    this.renderer.localClippingEnabled = enabled;
    const planes = enabled ? [this.clipPlane] : [];
    this.subMeshes.forEach(mesh => {
      if (mesh.material) {
        mesh.material.clippingPlanes = planes;
        mesh.material.needsUpdate = true;
      }
    });
  }

  // Toggle CAD Wireframe mode
  toggleWireframe(enabled) {
    this.isWireframe = enabled;
    this.subMeshes.forEach(mesh => {
      if (mesh.material) {
        mesh.material.wireframe = this.isWireframe;
        if (this.isWireframe) {
          mesh.material.color.setHex(0x00f0ff);
        } else if (mesh.userData.origMaterial) {
          mesh.material = mesh.userData.origMaterial;
        }
      }
    });
  }

  toggleDimensions(enabled) {
    this.dimensionsVisible = enabled;
    if (this.dimensionLinesGroup) {
      this.dimensionLinesGroup.visible = enabled;
    }
  }

  toggleAutoRotate(enabled) {
    this.autoRotate = enabled;
  }

  // Mouse move for Raycast Hover Highlight
  onMouseMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.subMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredMesh !== hit) {
        this.resetHover();
        this.hoveredMesh = hit;
        if (hit.material && hit.material.emissive) {
          hit.material.emissive.setHex(0x00e5ff);
          hit.material.emissiveIntensity = 0.4;
        }
        this.renderer.domElement.style.cursor = "pointer";
      }
    } else {
      this.resetHover();
    }
  }

  resetHover() {
    if (this.hoveredMesh) {
      if (this.hoveredMesh !== this.selectedMesh) {
        if (this.hoveredMesh.material && this.hoveredMesh.material.emissive) {
          this.hoveredMesh.material.emissive.setHex(0x000000);
          this.hoveredMesh.material.emissiveIntensity = 0;
        }
      }
      this.hoveredMesh = null;
      this.renderer.domElement.style.cursor = "default";
    }
  }

  // Click on component to inspect
  onClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.subMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      this.selectedMesh = hit;

      if (window.soundFX) {
        window.soundFX.click();
      }

      if (this.onComponentClick && hit.userData) {
        this.onComponentClick(hit.userData);
      }
    }
  }

  fitCameraToModel() {
    if (!this.currentModelGroup) return;
    const box = new THREE.Box3().setFromObject(this.currentModelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (this.controls) {
      this.controls.target.copy(center);
      this.camera.position.set(center.x + maxDim * 1.4, center.y + maxDim * 0.9, center.z + maxDim * 1.4);
      this.controls.update();
    }
  }

  resetView() {
    this.fitCameraToModel();
    this.setExplode(0);
    this.toggleClipping(false);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  disposeGroup(group) {
    group.traverse(child => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  setAzimuth(degrees) {
    if (!this.controls || !this.camera) return;
    const rad = (degrees * Math.PI) / 180;
    const target = this.controls.target;
    const dx = this.camera.position.x - target.x;
    const dz = this.camera.position.z - target.z;
    const radius = Math.sqrt(dx * dx + dz * dz) || 45;
    const currentY = this.camera.position.y;

    this.camera.position.x = target.x + Math.sin(rad) * radius;
    this.camera.position.z = target.z + Math.cos(rad) * radius;
    this.camera.position.y = currentY;
    this.controls.update();
  }

  getAzimuth() {
    if (!this.controls || !this.camera) return 0;
    const target = this.controls.target;
    const dx = this.camera.position.x - target.x;
    const dz = this.camera.position.z - target.z;
    let angle = Math.atan2(dx, dz) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.round(angle);
  }

  getElevation() {
    if (!this.controls || !this.camera) return 0;
    const target = this.controls.target;
    const distXZ = Math.hypot(this.camera.position.x - target.x, this.camera.position.z - target.z);
    const dy = this.camera.position.y - target.y;
    return Math.round(Math.atan2(dy, distXZ) * (180 / Math.PI));
  }

  setCameraPreset(name) {
    if (!this.controls || !this.camera) return;
    const target = this.controls.target;
    const dist = 50;
    const elev = target.y;

    switch (name) {
      case "front": // North elevation (0 deg)
        this.animateCameraTo(target.x, elev + 4, target.z + dist);
        break;
      case "right": // East profile (90 deg)
        this.animateCameraTo(target.x + dist, elev + 4, target.z);
        break;
      case "back": // South elevation (180 deg)
        this.animateCameraTo(target.x, elev + 4, target.z - dist);
        break;
      case "left": // West profile (270 deg)
        this.animateCameraTo(target.x - dist, elev + 4, target.z);
        break;
      case "top": // Plan view (90 deg pitch)
        this.animateCameraTo(target.x, elev + dist * 1.3, target.z + 0.1);
        break;
      case "bottom": // Direct underside 360 foundation perspective
        this.animateCameraTo(target.x, elev - dist * 0.9, target.z + 0.1);
        break;
      case "iso": // Isometric 3D Axonometric
      default:
        this.animateCameraTo(target.x + dist * 0.7, elev + dist * 0.5, target.z + dist * 0.7);
        break;
    }
  }

  animateCameraTo(targetX, targetY, targetZ) {
    if (!this.camera || !this.controls) return;
    const startPos = this.camera.position.clone();
    const endPos = new THREE.Vector3(targetX, targetY, targetZ);
    const startTime = performance.now();
    const duration = 450; // ms

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      this.camera.position.lerpVectors(startPos, endPos, t);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  toggle360Spin(enabled, speed = 2.0, direction = 1) {
    this.autoRotate = enabled;
    if (this.controls) {
      this.controls.autoRotate = enabled;
      this.controls.autoRotateSpeed = speed * direction;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();

      // Report live azimuth angle for 360 HUD
      if (this.onAzimuthChange) {
        const az = this.getAzimuth();
        const el = this.getElevation();
        this.onAzimuthChange(az, el);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.CADThreeViewer = CADThreeViewer;
