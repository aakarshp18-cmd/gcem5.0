// Plant Engineering CAD Model and Drawing Master Database
// Contains realistic engineering parameters, ASME/API design codes, nozzle schedules, revisions, and BOMs.

window.CAD_DATABASE = [
  {
    id: "TK-104A",
    tag: "TK-104A",
    title: "50,000 m³ External Floating Roof Crude Oil Storage Tank",
    category: "Storage Tanks",
    shape: "vertical_cylinder",
    modelType: "storage_tank",
    capacityValue: 50000,
    capacityUnit: "m³",
    capacityLiter: 50000000,
    capacityDisplay: "50,000 m³ (314,500 bbl)",
    pressure: 0.05,
    pressureUnit: "bar (Atmospheric)",
    temperature: 65,
    tempUnit: "°C",
    material: "ASTM A516 Gr. 70 / High Strength Steel",
    code: "API 650 13th Edition",
    plantUnit: "Tank Farm Area 08 (Crude Storage)",
    dimensions: {
      diameter: "60.0 m (196.8 ft)",
      height: "18.5 m (60.7 ft)",
      shellThickness: "12 mm - 34 mm (tapered courses)",
      emptyWeight: "1,140 Metric Tons",
      operatingWeight: "44,600 Metric Tons"
    },
    revision: {
      rev: "Rev 04",
      date: "2026-04-18",
      status: "IFC (Issued for Construction)",
      engineer: "Dr. K. S. Vance (Lead Mechanical)",
      checker: "M. R. Thornton (Chief PE)"
    },
    previousRevision: {
      rev: "Rev 03",
      date: "2025-11-12",
      status: "Engineering Review",
      diffNotes: [
        { type: "added", desc: "Added 2x DN250 Secondary Foam Dam Fire Protection Nozzles (N8, N9)" },
        { type: "modified", desc: "Increased Course 1 shell plate thickness from 30mm to 34mm per seismic re-calc" },
        { type: "relocated", desc: "Relocated Manway M2 by 45° azimuth to clear spiral stairway landing" }
      ]
    },
    nozzles: [
      { tag: "N1", size: "24\" (DN600)", rating: "150# RF", service: "Crude Oil Filling / Inlet", elevation: "+1,200 mm" },
      { tag: "N2", size: "24\" (DN600)", rating: "150# RF", service: "Pump Suction / Product Outlet", elevation: "+850 mm" },
      { tag: "N3", size: "12\" (DN300)", rating: "150# RF", service: "Water Draw-off Sump Drain", elevation: "+250 mm" },
      { tag: "N4", size: "16\" (DN400)", rating: "150# RF", service: "Automatic Tank Gauge (Radar)", elevation: "+18,500 mm" },
      { tag: "M1", size: "36\" (DN900)", rating: "API 650", service: "Shell Access Manway 01", elevation: "+900 mm" },
      { tag: "M2", size: "36\" (DN900)", rating: "API 650", service: "Shell Access Manway 02", elevation: "+900 mm" }
    ],
    bom: [
      { item: "Shell Plates (Courses 1-8)", qty: 72, material: "ASTM A516 Gr. 70", weightKg: 820000 },
      { item: "Annular Bottom Bottom Plates", qty: 28, material: "ASTM A131 Gr. A", weightKg: 145000 },
      { item: "Pontoon Floating Roof Deck", qty: 1, material: "ASTM A36", weightKg: 125000 },
      { item: "Wind Girder & Top Stiffener", qty: 2, material: "Structural Carbon Steel", weightKg: 32000 },
      { item: "Spiral Stairway & Safety Handrails", qty: 1, material: "Galvanized Steel", weightKg: 18000 }
    ],
    files: {
      dwg: "TK-104A-GA-REV04.dwg (42.8 MB)",
      step: "TK-104A-SOLID-3D.step (84.1 MB)",
      dxf: "TK-104A-PROFILE.dxf (18.2 MB)",
      pid: "PID-TK-08-104.pdf (4.5 MB)",
      ifc: "TK-104A-BIM.ifc (96.0 MB)"
    },
    tags: ["tank", "crude", "50000", "50000m3", "api650", "floating roof", "large capacity", "oil"]
  },

  {
    id: "TK-202B",
    tag: "TK-202B",
    title: "5,000 m³ Chemical Buffer Storage Vessel with Dished Heads",
    category: "Storage Tanks",
    shape: "vertical_cylinder",
    modelType: "storage_tank",
    capacityValue: 5000,
    capacityUnit: "m³",
    capacityLiter: 5000000,
    capacityDisplay: "5,000 m³ (5,000,000 L)",
    pressure: 4.5,
    pressureUnit: "bar g",
    temperature: 95,
    tempUnit: "°C",
    material: "SS316L / ASTM A240 316L Stainless Steel",
    code: "ASME Sec VIII Div 1 Edition 2025",
    plantUnit: "Chemical Intermediate Buffer Unit 03",
    dimensions: {
      diameter: "14.0 m (45.9 ft)",
      height: "33.5 m (110.0 ft)",
      shellThickness: "18 mm uniform",
      emptyWeight: "168 Metric Tons",
      operatingWeight: "5,420 Metric Tons"
    },
    revision: {
      rev: "Rev 03",
      date: "2026-03-02",
      status: "IFC (Issued for Construction)",
      engineer: "P. R. Sharma (Senior Vessel Specialist)",
      checker: "J. L. Martinez (Chief Engineer)"
    },
    previousRevision: {
      rev: "Rev 02",
      date: "2025-08-14",
      status: "Preliminary Design",
      diffNotes: [
        { type: "modified", desc: "Upgraded shell material from Carbon Steel + PTFE lining to solid SS316L" },
        { type: "added", desc: "Added internal vortex breaker on DN200 bottom outlet nozzle N2" },
        { type: "modified", desc: "Re-rated design pressure from 3.0 bar to 4.5 bar g" }
      ]
    },
    nozzles: [
      { tag: "N1", size: "8\" (DN200)", rating: "300# RF", service: "Chemical Feed Inlet", elevation: "+32,000 mm" },
      { tag: "N2", size: "10\" (DN250)", rating: "300# RF", service: "Bottom Drain & Suction", elevation: "+400 mm" },
      { tag: "N3", size: "4\" (DN100)", rating: "300# RF", service: "Nitrogen Blanketing Purge", elevation: "+33,200 mm" },
      { tag: "PSV-1", size: "3\"x4\" (DN80x100)", rating: "300#x150#", service: "Safety Relief Valve", elevation: "+33,500 mm" },
      { tag: "M1", size: "24\" (DN600)", rating: "300# RF", service: "Lower Inspection Manway", elevation: "+1,200 mm" }
    ],
    bom: [
      { item: "SS316L Cylindrical Shell Rings", qty: 6, material: "ASTM A240 316L", weightKg: 112000 },
      { item: "2:1 Semi-Ellipsoidal Dished Heads", qty: 2, material: "ASTM A240 316L", weightKg: 38000 },
      { item: "Skirt Support & Base Ring", qty: 1, material: "ASTM A516 Gr. 70", weightKg: 14000 },
      { item: "Internal Vortex Breaker & Baffle", qty: 1, material: "SS316L", weightKg: 4000 }
    ],
    files: {
      dwg: "TK-202B-PRESSURE-VESSEL.dwg (34.2 MB)",
      step: "TK-202B-ASME-SOLID.step (62.4 MB)",
      dxf: "TK-202B-SECTIONS.dxf (12.7 MB)",
      pid: "PID-CHEM-202B.pdf (3.8 MB)",
      ifc: "TK-202B-MODEL.ifc (71.0 MB)"
    },
    tags: ["tank", "5000", "5000m3", "5000000l", "ss316l", "stainless steel", "buffer tank", "asme viii", "vertical"]
  },

  {
    id: "TK-501",
    tag: "TK-501",
    title: "2,500 m³ Spherical LPG Horton Gas Storage Sphere",
    category: "Storage Tanks",
    shape: "sphere",
    modelType: "horton_sphere",
    capacityValue: 2500,
    capacityUnit: "m³",
    capacityLiter: 2500000,
    capacityDisplay: "2,500 m³ (LPG / Propane)",
    pressure: 18.0,
    pressureUnit: "bar g",
    temperature: 45,
    tempUnit: "°C",
    material: "SA-537 Class 1 Carbon Manganese Silicon Steel",
    code: "ASME Sec VIII Div 2 / PD 5500",
    plantUnit: "Pressurized Gas Liquefaction Offsites Unit 05",
    dimensions: {
      diameter: "16.8 m (55.1 ft) Outer Diameter",
      height: "22.5 m (73.8 ft) Top of Vent",
      shellThickness: "46 mm post-weld heat treated",
      emptyWeight: "385 Metric Tons",
      operatingWeight: "1,760 Metric Tons"
    },
    revision: {
      rev: "Rev 05",
      date: "2026-02-19",
      status: "IFC (Issued for Construction)",
      engineer: "G. V. Holtz (Pressure Equipment Lead)",
      checker: "E. S. Lindqvist (Global Safety Chief)"
    },
    previousRevision: {
      rev: "Rev 04",
      date: "2025-09-30",
      status: "Approved with Comments",
      diffNotes: [
        { type: "added", desc: "Added deluge water spray cooling ring manifold around sphere equator" },
        { type: "modified", desc: "Increased support column diameter from 800mm to 914mm for seismic Zone 4" },
        { type: "modified", desc: "Dual PSV arrangement with 3-way changeover valve installed on top nozzle" }
      ]
    },
    nozzles: [
      { tag: "N1", size: "8\" (DN200)", rating: "600# RTJ", service: "Liquid Propane Fill/Discharge", elevation: "+350 mm" },
      { tag: "N2", size: "6\" (DN150)", rating: "600# RTJ", service: "Vapor Return Equalization", elevation: "+16,500 mm" },
      { tag: "PSV-A/B", size: "4\"x6\" (DN100x150)", rating: "600#x300#", service: "Dual Thermal/Pressure Safety Relief", elevation: "+17,200 mm" },
      { tag: "M1", size: "20\" (DN500)", rating: "600# RTJ", service: "Top Crown Access Manway", elevation: "+16,800 mm" },
      { tag: "M2", size: "20\" (DN500)", rating: "600# RTJ", service: "Bottom Hemisphere Manway", elevation: "+1,200 mm" }
    ],
    bom: [
      { item: "Pressed Spherical Petal Plates", qty: 32, material: "SA-537 Class 1 (Normalized)", weightKg: 310000 },
      { item: "Tubular Support Columns (8 Legs)", qty: 8, material: "ASTM A500 Gr. C", weightKg: 52000 },
      { item: "Diagonal Cross-Bracing Rods & Turnbuckles", qty: 16, material: "High Tensile Alloy Steel", weightKg: 12000 },
      { item: "Equatorial Deluge Water Piping Rings", qty: 3, material: "Galvanized Schedule 40 CS", weightKg: 11000 }
    ],
    files: {
      dwg: "TK-501-HORTON-SPHERE.dwg (51.0 MB)",
      step: "TK-501-SPHERE-3D.step (98.4 MB)",
      dxf: "TK-501-FOUNDATION.dxf (15.5 MB)",
      pid: "PID-LPG-TK-501.pdf (6.2 MB)",
      ifc: "TK-501-PLANT3D.ifc (105.0 MB)"
    },
    tags: ["sphere", "horton", "spherical", "tank", "lpg", "gas", "2500", "2500m3", "18bar", "high pressure"]
  },

  {
    id: "HE-202",
    tag: "HE-202",
    title: "185 m² TEMA AEU Shell & Tube Heat Exchanger with U-Tube Bundle",
    category: "Heat Transfer",
    shape: "horizontal_cylinder",
    modelType: "heat_exchanger",
    capacityValue: 185,
    capacityUnit: "m² Area",
    capacityLiter: 4200,
    capacityDisplay: "185 m² Heat Transfer Area",
    pressure: 42.0,
    pressureUnit: "bar g (Tube side) / 28 bar (Shell)",
    temperature: 285,
    tempUnit: "°C",
    material: "Shell: SA-516 Gr.70 | Tubes: SA-213 TP316L Seamless",
    code: "ASME Sec VIII Div 1 / TEMA Class R",
    plantUnit: "Crude Pre-Heat Train Unit 01",
    dimensions: {
      diameter: "900 mm (35.4 in) Shell ID",
      height: "6,200 mm (20.3 ft) Overall Length",
      shellThickness: "22 mm Shell / 32 mm Channel",
      emptyWeight: "14.8 Metric Tons",
      operatingWeight: "19.2 Metric Tons"
    },
    revision: {
      rev: "Rev 04",
      date: "2026-03-22",
      status: "IFC (Issued for Construction)",
      engineer: "N. T. Dubois (Thermal Rating Specialist)",
      checker: "K. L. Zhang (Engineering Manager)"
    },
    previousRevision: {
      rev: "Rev 03",
      date: "2025-10-10",
      status: "Vendor Drawing",
      diffNotes: [
        { type: "modified", desc: "Changed tube pitch from 25.4mm square to 31.75mm triangular for fouling reduction" },
        { type: "added", desc: "Added impingement baffle plate beneath shell-side vapor inlet nozzle S1" },
        { type: "modified", desc: "Increased saddle support baseplate slot length to allow thermal expansion of 18mm" }
      ]
    },
    nozzles: [
      { tag: "T1", size: "6\" (DN150)", rating: "600# RF", service: "Tube Side Fluid Inlet", elevation: "+1,450 mm" },
      { tag: "T2", size: "6\" (DN150)", rating: "600# RF", service: "Tube Side Fluid Outlet", elevation: "+650 mm" },
      { tag: "S1", size: "8\" (DN200)", rating: "300# RF", service: "Shell Side Hot Stream Inlet", elevation: "+1,650 mm" },
      { tag: "S2", size: "8\" (DN200)", rating: "300# RF", service: "Shell Side Cooled Stream Outlet", elevation: "+450 mm" }
    ],
    bom: [
      { item: "Seamless U-Tubes 3/4\" OD x 16 BWG", qty: 384, material: "SA-213 TP316L", weightKg: 3800 },
      { item: "Stationary Forged Tube Sheet", qty: 1, material: "SA-182 F316L Clad on SA-105", weightKg: 1950 },
      { item: "Fabricated Shell Cylinder with Flanges", qty: 1, material: "SA-516 Gr. 70", weightKg: 4600 },
      { item: "Segmental Baffle Plates (25% cut)", qty: 14, material: "SS304", weightKg: 680 },
      { item: "Channel Head Barrel & Cover", qty: 1, material: "SA-516 Gr. 70", weightKg: 2800 }
    ],
    files: {
      dwg: "HE-202-TEMA-AEU.dwg (28.4 MB)",
      step: "HE-202-TUBE-BUNDLE-3D.step (76.5 MB)",
      dxf: "HE-202-TUBE-SHEET-PUNCH.dxf (9.8 MB)",
      pid: "PID-HEAT-TRAIN-202.pdf (3.2 MB)",
      ifc: "HE-202-MODEL.ifc (58.0 MB)"
    },
    tags: ["exchanger", "heat exchanger", "tema", "u-tube", "185m2", "42bar", "shell and tube", "asme viii", "horizontal"]
  },

  {
    id: "HE-305",
    tag: "HE-305",
    title: "Kettle Type Reboiler with Large Vapor Disengagement Dome",
    category: "Heat Transfer",
    shape: "horizontal_cylinder",
    modelType: "heat_exchanger",
    capacityValue: 310,
    capacityUnit: "m² Area",
    capacityLiter: 12000,
    capacityDisplay: "310 m² Kettle Reboiler",
    pressure: 25.0,
    pressureUnit: "bar g",
    temperature: 240,
    tempUnit: "°C",
    material: "SA-516 Gr. 65 / Monel Clad Tubesheet",
    code: "TEMA Class B / ASME Sec VIII",
    plantUnit: "Stabilizer Column Reboiler Unit 02",
    dimensions: {
      diameter: "1,600 mm Kettle Shell / 750 mm Port ID",
      height: "7,800 mm Overall Length",
      shellThickness: "28 mm Kettle Section",
      emptyWeight: "22.5 Metric Tons",
      operatingWeight: "36.8 Metric Tons"
    },
    revision: {
      rev: "Rev 02",
      date: "2026-01-15",
      status: "IFC (Issued for Construction)",
      engineer: "F. J. O'Connor",
      checker: "M. R. Thornton"
    },
    previousRevision: {
      rev: "Rev 01",
      date: "2025-06-18",
      status: "Bid Proposal",
      diffNotes: [
        { type: "modified", desc: "Enlarged vapor dome diameter to reduce droplet carryover velocity below 0.35 m/s" },
        { type: "added", desc: "Integrated stainless mesh demister pad in vapor outlet nozzle V1" }
      ]
    },
    nozzles: [
      { tag: "V1", size: "16\" (DN400)", rating: "300# RF", service: "Vapor Return to Column", elevation: "+2,200 mm" },
      { tag: "L1", size: "10\" (DN250)", rating: "300# RF", service: "Liquid Bottoms Feed", elevation: "+600 mm" },
      { tag: "O1", size: "8\" (DN200)", rating: "300# RF", service: "Liquid Overflow Weir Draw", elevation: "+900 mm" }
    ],
    bom: [
      { item: "Eccentric Reducer Kettle Shell", qty: 1, material: "SA-516 Gr. 65", weightKg: 8500 },
      { item: "Removable U-Tube Bundle", qty: 1, material: "SB-163 Monel 400", weightKg: 6400 },
      { item: "Internal Overflow Liquid Weir", qty: 1, material: "SS316", weightKg: 450 }
    ],
    files: {
      dwg: "HE-305-KETTLE-REBOILER.dwg (31.1 MB)",
      step: "HE-305-SOLID.step (81.0 MB)",
      dxf: "HE-305-FAB.dxf (11.0 MB)",
      pid: "PID-REBOILER-305.pdf (3.9 MB)",
      ifc: "HE-305-3D.ifc (64.0 MB)"
    },
    tags: ["reboiler", "kettle", "exchanger", "heat transfer", "vapor dome", "310m2", "column"]
  },

  {
    id: "P-101A",
    tag: "P-101A/B",
    title: "Heavy Duty High-Pressure Boiler Feedwater Centrifugal Pump",
    category: "Rotating Equipment",
    shape: "skid",
    modelType: "centrifugal_pump",
    capacityValue: 320,
    capacityUnit: "m³/h",
    capacityLiter: 5333,
    capacityDisplay: "320 m³/h @ 145 m Head",
    pressure: 64.0,
    pressureUnit: "bar discharge",
    temperature: 160,
    tempUnit: "°C",
    material: "Casing: ASTM A216 WCB / Impeller: CA15 (13Cr)",
    code: "API 610 12th Edition / Type BB2 (Between Bearings)",
    plantUnit: "High Pressure Steam & Power Utilities Unit 04",
    dimensions: {
      diameter: "Suction 8\" (DN200) / Discharge 6\" (DN150)",
      height: "Skid: 3,400 mm L x 1,600 mm W x 1,850 mm H",
      shellThickness: "45 mm pressure casing wall",
      emptyWeight: "6.8 Metric Tons with 250 kW Motor",
      operatingWeight: "7.4 Metric Tons"
    },
    revision: {
      rev: "Rev 04",
      date: "2026-03-30",
      status: "IFC (Issued for Construction)",
      engineer: "S. K. Raman (Rotating Equipment Lead)",
      checker: "J. L. Martinez (Chief Engineer)"
    },
    previousRevision: {
      rev: "Rev 03",
      date: "2025-12-05",
      status: "FAT Approved",
      diffNotes: [
        { type: "modified", desc: "Upgraded mechanical seal flushing plan from API Plan 11 to Plan 23 with cooler" },
        { type: "modified", desc: "Upgraded driver to Siemens 250 kW Ex d IIB T4 explosion-proof motor" },
        { type: "added", desc: "Installed dual proximity vibration probes on drive-end and non-drive-end bearings" }
      ]
    },
    nozzles: [
      { tag: "SUC", size: "8\" (DN200)", rating: "300# RF", service: "Suction Nozzle (Axial/Top)", elevation: "+620 mm" },
      { tag: "DISC", size: "6\" (DN150)", rating: "600# RF", service: "Discharge Nozzle (Top Radial)", elevation: "+1,120 mm" },
      { tag: "DRN", size: "1\" (DN25)", rating: "600# Socket Weld", service: "Casing High-Pressure Drain", elevation: "+150 mm" }
    ],
    bom: [
      { item: "Dual Volute Heavy Cast Casing", qty: 1, material: "ASTM A216 WCB", weightKg: 2400 },
      { item: "Enclosed Radial Impellers (2-stage)", qty: 2, material: "ASTM A743 CA6NM (13Cr-4Ni)", weightKg: 380 },
      { item: "Heavy Duty Shaft & Sleeves", qty: 1, material: "AISI 4140 Alloy Steel", weightKg: 290 },
      { item: "Rigid Structural Skid Base with Drip Rim", qty: 1, material: "Structural Carbon Steel", weightKg: 1650 },
      { item: "Electric Drive Motor 250 kW 2950 RPM", qty: 1, material: "Cast Iron Frame", weightKg: 1950 }
    ],
    files: {
      dwg: "P-101A-PUMP-SKID-GA.dwg (38.7 MB)",
      step: "P-101A-CENTRIFUGAL-3D.step (89.2 MB)",
      dxf: "P-101A-BASEPLATE.dxf (8.4 MB)",
      pid: "PID-BFW-PUMP-101.pdf (3.1 MB)",
      ifc: "P-101A-SKID.ifc (74.0 MB)"
    },
    tags: ["pump", "centrifugal", "boiler feed", "320m3/h", "api 610", "145m head", "motor", "rotating equipment", "skid"]
  },

  {
    id: "P-304",
    tag: "P-304",
    title: "Chemical Slurry Cantilever Process Pump in Hastelloy C-276",
    category: "Rotating Equipment",
    shape: "skid",
    modelType: "centrifugal_pump",
    capacityValue: 120,
    capacityUnit: "m³/h",
    capacityLiter: 2000,
    capacityDisplay: "120 m³/h @ 48 m Head",
    pressure: 16.0,
    pressureUnit: "bar g",
    temperature: 110,
    tempUnit: "°C",
    material: "All Wetted Parts: Hastelloy C-276 / Alloy C276",
    code: "API 610 Type OH2 / ISO 13709",
    plantUnit: "Acid Regeneration & Scrubber Unit 06",
    dimensions: {
      diameter: "Suction 4\" (DN100) / Discharge 3\" (DN80)",
      height: "Skid: 2,200 mm L x 1,100 mm W x 1,350 mm H",
      shellThickness: "28 mm corrosion resistant casing",
      emptyWeight: "1.9 Metric Tons",
      operatingWeight: "2.1 Metric Tons"
    },
    revision: {
      rev: "Rev 03",
      date: "2026-02-11",
      status: "IFC (Issued for Construction)",
      engineer: "S. K. Raman",
      checker: "K. L. Zhang"
    },
    previousRevision: {
      rev: "Rev 02",
      date: "2025-07-22",
      status: "Detailed Design",
      diffNotes: [
        { type: "modified", desc: "Upgraded casing wear ring material to silicon carbide for abrasive slurry handling" },
        { type: "modified", desc: "Added dynamic balance test report per ISO 1940 Grade G1.0" }
      ]
    },
    nozzles: [
      { tag: "SUC", size: "4\" (DN100)", rating: "300# RF", service: "Acid Slurry Suction", elevation: "+480 mm" },
      { tag: "DISC", size: "3\" (DN80)", rating: "300# RF", service: "Acid Slurry Discharge", elevation: "+880 mm" }
    ],
    bom: [
      { item: "Overhung Volute Casing", qty: 1, material: "ASTM B574 Hastelloy C-276", weightKg: 620 },
      { item: "Semi-Open Slurry Impeller", qty: 1, material: "ASTM B574 Hastelloy C-276", weightKg: 115 },
      { item: "Baseplate & Coupling Guard", qty: 1, material: "Carbon Steel Epoxy Coated", weightKg: 480 }
    ],
    files: {
      dwg: "P-304-ACID-PUMP.dwg (21.5 MB)",
      step: "P-304-HASTELLOY-3D.step (49.0 MB)",
      dxf: "P-304-PROFILE.dxf (6.1 MB)",
      pid: "PID-ACID-REGEN-304.pdf (2.4 MB)",
      ifc: "P-304-MODEL.ifc (42.0 MB)"
    },
    tags: ["pump", "slurry", "hastelloy", "acid", "120m3/h", "corrosion", "oh2"]
  },

  {
    id: "C-101",
    tag: "C-101",
    title: "Atmospheric Crude Distillation Fractionation Column (36 Trays)",
    category: "Mass Transfer Columns",
    shape: "column",
    modelType: "distillation_column",
    capacityValue: 1200,
    capacityUnit: "m³ Internal Volume",
    capacityLiter: 1200000,
    capacityDisplay: "1,200 m³ (42 m Height, 36 Valve Trays)",
    pressure: 3.8,
    pressureUnit: "bar g",
    temperature: 365,
    tempUnit: "°C (Flash Zone)",
    material: "Clad Plate: 3 mm SS410S on SA-516 Gr. 70 Base",
    code: "ASME Sec VIII Div 1 / API 510",
    plantUnit: "Crude Distillation Unit (CDU-01)",
    dimensions: {
      diameter: "3,600 mm (11.8 ft) ID Flash Zone / 2,800 mm Upper",
      height: "42,500 mm (139.4 ft) Tangent-to-Tangent",
      shellThickness: "24 mm - 38 mm + 3 mm Alloy Cladding",
      emptyWeight: "310 Metric Tons",
      operatingWeight: "680 Metric Tons"
    },
    revision: {
      rev: "Rev 05",
      date: "2026-04-05",
      status: "IFC (Issued for Construction)",
      engineer: "Dr. K. S. Vance (Lead Process & Vessel)",
      checker: "J. L. Martinez"
    },
    previousRevision: {
      rev: "Rev 04",
      date: "2025-11-28",
      status: "Vendor Review",
      diffNotes: [
        { type: "modified", desc: "Optimized tray active area from Trays 14 to 22 with high-capacity BDH-4 valves" },
        { type: "added", desc: "Added 4x vortex breakers on side-stream draw-off sumps (Kerosene & Diesel draws)" },
        { type: "modified", desc: "Extended skirt height by 1,200 mm to provide required NPSH for bottoms booster pump" }
      ]
    },
    nozzles: [
      { tag: "N_FEED", size: "20\" (DN500)", rating: "300# RF", service: "Crude Transfer Line Feed", elevation: "+8,200 mm" },
      { tag: "N_OVHD", size: "30\" (DN750)", rating: "150# RF", service: "Overhead Vapor Line", elevation: "+42,200 mm" },
      { tag: "N_REFLX", size: "8\" (DN200)", rating: "150# RF", service: "Top Reflux Liquid Return", elevation: "+41,100 mm" },
      { tag: "N_KERO", size: "6\" (DN150)", rating: "150# RF", service: "Kerosene Draw to Stripper", elevation: "+26,500 mm" },
      { tag: "N_DIESEL", size: "8\" (DN200)", rating: "150# RF", service: "Diesel Side Draw to Stripper", elevation: "+18,400 mm" },
      { tag: "N_BOT", size: "16\" (DN400)", rating: "300# RF", service: "Atmospheric Residue Bottoms", elevation: "+1,200 mm" }
    ],
    bom: [
      { item: "Tower Shell Sections (5 rings)", qty: 5, material: "SA-516 Gr. 70 + SS410S Clad", weightKg: 210000 },
      { item: "Koch-Glitsch BDH-4 Valve Trays", qty: 36, material: "SS410S Stainless", weightKg: 38000 },
      { item: "Conical Transition Section", qty: 1, material: "SA-516 Gr. 70", weightKg: 14500 },
      { item: "Cylindrical Skirt Support with Access Openings", qty: 1, material: "Structural Carbon Steel", weightKg: 28000 },
      { item: "Full-Height External Caged Ladder & Rest Platforms", qty: 1, material: "Galvanized Steel", weightKg: 19000 }
    ],
    files: {
      dwg: "C-101-CRUDE-COLUMN-GA.dwg (64.2 MB)",
      step: "C-101-3D-FULL-TOWER.step (142.0 MB)",
      dxf: "C-101-TRAYS-LAYOUT.dxf (22.5 MB)",
      pid: "PID-CDU-01-C101.pdf (7.8 MB)",
      ifc: "C-101-PLANT-BIM.ifc (165.0 MB)"
    },
    tags: ["column", "distillation", "tower", "36 trays", "c-101", "crude", "fractionation", "vertical", "42m height"]
  },

  {
    id: "V-402",
    tag: "V-402",
    title: "High Pressure Flare Knockout Drum with Wire Mesh Demister",
    category: "Pressure Vessels",
    shape: "horizontal_cylinder",
    modelType: "heat_exchanger",
    capacityValue: 85,
    capacityUnit: "m³",
    capacityLiter: 85000,
    capacityDisplay: "85 m³ (Horiz. Knockout Drum)",
    pressure: 24.5,
    pressureUnit: "bar g",
    temperature: 120,
    tempUnit: "°C",
    material: "SA-516 Gr. 70 HIC Tested (NACE MR0175)",
    code: "ASME Sec VIII Div 1 / API 521",
    plantUnit: "Flare & Relief System Offsites Unit 07",
    dimensions: {
      diameter: "3,200 mm (10.5 ft) ID",
      height: "11,500 mm (37.7 ft) Tangent-to-Tangent",
      shellThickness: "32 mm Shell / 34 mm Heads",
      emptyWeight: "48.5 Metric Tons",
      operatingWeight: "112.0 Metric Tons"
    },
    revision: {
      rev: "Rev 03",
      date: "2026-01-28",
      status: "IFC (Issued for Construction)",
      engineer: "G. V. Holtz",
      checker: "Dr. K. S. Vance"
    },
    previousRevision: {
      rev: "Rev 02",
      date: "2025-08-30",
      status: "Detailed Review",
      diffNotes: [
        { type: "modified", desc: "Added NACE sour gas compliance testing requirements for wet H2S service" },
        { type: "modified", desc: "Upsized flare gas exit nozzle V1 from 24\" to 30\" to reduce backpressure" }
      ]
    },
    nozzles: [
      { tag: "IN", size: "24\" (DN600)", rating: "300# RF", service: "Relief Header Inlet Line", elevation: "+3,100 mm" },
      { tag: "VAP_OUT", size: "30\" (DN750)", rating: "300# RF", service: "Vapor Exit to Flare Stack", elevation: "+3,600 mm" },
      { tag: "LIQ_OUT", size: "8\" (DN200)", rating: "300# RF", service: "Pumped Hydrocarbon Liquid Out", elevation: "+300 mm" }
    ],
    bom: [
      { item: "HIC Resistant Shell Courses", qty: 3, material: "SA-516 Gr. 70 HIC", weightKg: 32000 },
      { item: "2:1 Ellipsoidal Heads", qty: 2, material: "SA-516 Gr. 70 HIC", weightKg: 11000 },
      { item: "Stainless Mesh Mist Eliminator Demister", qty: 1, material: "SS316", weightKg: 1800 },
      { item: "Twin Saddle Supports with Rib Stiffeners", qty: 2, material: "Carbon Steel", weightKg: 3700 }
    ],
    files: {
      dwg: "V-402-FLARE-KO-DRUM.dwg (32.0 MB)",
      step: "V-402-HORIZONTAL-3D.step (68.0 MB)",
      dxf: "V-402-SADDLE-DETAILS.dxf (8.2 MB)",
      pid: "PID-FLARE-SYS-402.pdf (4.1 MB)",
      ifc: "V-402-MODEL.ifc (52.0 MB)"
    },
    tags: ["drum", "knockout", "vessel", "horizontal", "flare", "85m3", "24bar", "asme viii", "demister"]
  },

  {
    id: "SK-404",
    tag: "SK-404",
    title: "Class 1 Div 2 Modular Automated Metering & Chemical Dosing Skid",
    category: "Skid Packages",
    shape: "skid",
    modelType: "skid_package",
    capacityValue: 15,
    capacityUnit: "m³/h Metering Rate",
    capacityLiter: 250,
    capacityDisplay: "15 m³/h Dual Coriolis Meter Skid",
    pressure: 50.0,
    pressureUnit: "bar g",
    temperature: 80,
    tempUnit: "°C",
    material: "Piping: ASTM A312 TP316L / Frame: HDG Structural I-Beams",
    code: "ASME B31.3 Process Piping / API MPMS",
    plantUnit: "Custody Transfer & Product Blending Unit 09",
    dimensions: {
      diameter: "Manifold 4\" (DN100) Class 600#",
      height: "Skid: 4,500 mm L x 2,400 mm W x 2,600 mm H",
      shellThickness: "Schedule 80S Seamless Stainless",
      emptyWeight: "4.8 Metric Tons",
      operatingWeight: "5.4 Metric Tons"
    },
    revision: {
      rev: "Rev 04",
      date: "2026-03-14",
      status: "IFC (Issued for Construction)",
      engineer: "P. R. Sharma",
      checker: "M. R. Thornton"
    },
    previousRevision: {
      rev: "Rev 03",
      date: "2025-10-18",
      status: "Module Review",
      diffNotes: [
        { type: "modified", desc: "Installed redundant Micro Motion Coriolis mass flow meter in parallel loop" },
        { type: "added", desc: "Integrated explosion-proof local control panel (LCP) with ATEX/IECEx certification" }
      ]
    },
    nozzles: [
      { tag: "IN", size: "4\" (DN100)", rating: "600# RF", service: "Skid Fluid Inlet Header", elevation: "+450 mm" },
      { tag: "OUT", size: "4\" (DN100)", rating: "600# RF", service: "Metered Fluid Outlet", elevation: "+450 mm" },
      { tag: "CAL", size: "3\" (DN80)", rating: "600# RF", service: "Prover Loop Calibration Nozzle", elevation: "+750 mm" }
    ],
    bom: [
      { item: "Micro Motion Elite Coriolis Flow Meters", qty: 2, material: "SS316L Wetted", weightKg: 180 },
      { item: "Fisher Control Valve with Digital Positioner", qty: 2, material: "CF8M Stainless", weightKg: 240 },
      { item: "Class 600# Flanged Pipe Spools & Headers", qty: 8, material: "A312 TP316L Sch 80", weightKg: 1200 },
      { item: "Galvanized Heavy Steel Skid Base with Grating", qty: 1, material: "ASTM A36 HDG", weightKg: 3100 }
    ],
    files: {
      dwg: "SK-404-METERING-SKID.dwg (44.6 MB)",
      step: "SK-404-SKID-3D.step (94.0 MB)",
      dxf: "SK-404-ISO-SPOOLS.dxf (14.2 MB)",
      pid: "PID-CUSTODY-SK-404.pdf (5.0 MB)",
      ifc: "SK-404-BIM.ifc (88.0 MB)"
    },
    tags: ["skid", "metering", "coriolis", "dosing", "modular", "piping", "class 600", "ss316l"]
  },

  {
    id: "TK-808",
    tag: "TK-808",
    title: "1,200 m³ Conical Bottom Lime & Catalyst Storage Silo",
    category: "Storage Tanks",
    shape: "cone",
    modelType: "storage_tank",
    capacityValue: 1200,
    capacityUnit: "m³",
    capacityLiter: 1200000,
    capacityDisplay: "1,200 m³ (60° Conical Bottom Silo)",
    pressure: 0.2,
    pressureUnit: "bar g",
    temperature: 50,
    tempUnit: "°C",
    material: "Carbon Steel ASTM A36 with Epoxy Internal Lining",
    code: "DIN EN 1993-4-1 / API 650 Annex V",
    plantUnit: "Effluent Treatment & Neutralization Plant 04",
    dimensions: {
      diameter: "8,500 mm (27.9 ft) ID",
      height: "26,000 mm (85.3 ft) Total Height",
      shellThickness: "10 mm - 16 mm Wall",
      emptyWeight: "64 Metric Tons",
      operatingWeight: "1,520 Metric Tons with Bulk Solids"
    },
    revision: {
      rev: "Rev 02",
      date: "2026-02-04",
      status: "IFC (Issued for Construction)",
      engineer: "F. J. O'Connor",
      checker: "J. L. Martinez"
    },
    previousRevision: {
      rev: "Rev 01",
      date: "2025-07-15",
      status: "Preliminary",
      diffNotes: [
        { type: "modified", desc: "Steepened hopper cone angle from 45° to 60° to eliminate material rat-holing" },
        { type: "added", desc: "Added 6-point pneumatic fluidizing aeration pads around discharge throat" }
      ]
    },
    nozzles: [
      { tag: "N_FILL", size: "6\" (DN150)", rating: "150# RF", service: "Pneumatic Truck Fill Line", elevation: "+25,500 mm" },
      { tag: "N_VENT", size: "12\" (DN300)", rating: "150# RF", service: "Pulse Jet Reverse Air Bag Filter", elevation: "+26,000 mm" },
      { tag: "N_DISC", size: "16\" (DN400)", rating: "150# RF", service: "Conical Rotary Airlock Feeder", elevation: "+1,200 mm" }
    ],
    bom: [
      { item: "Upper Cylindrical Silo Shell", qty: 1, material: "ASTM A36 Carbon Steel", weightKg: 38000 },
      { item: "60-Degree Steep Bottom Cone", qty: 1, material: "ASTM A36 Hardox Lined", weightKg: 14000 },
      { item: "Support Columns & Wind Bracing", qty: 6, material: "Wide Flange HEA 300", weightKg: 12000 }
    ],
    files: {
      dwg: "TK-808-CONICAL-SILO.dwg (29.0 MB)",
      step: "TK-808-SILO-3D.step (56.0 MB)",
      dxf: "TK-808-CONE-DEVELOPMENT.dxf (7.5 MB)",
      pid: "PID-ETP-LIME-808.pdf (2.8 MB)",
      ifc: "TK-808-SOLID.ifc (48.0 MB)"
    },
    tags: ["silo", "cone", "conical", "tank", "lime", "1200", "1200m3", "solids", "hopper"]
  }
];
