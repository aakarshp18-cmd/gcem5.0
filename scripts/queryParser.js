// Intelligent Query Parser & Semantic Matcher for Plant Engineering CAD Search
// Deconstructs free-text queries into engineering specifications, capacities, geometries, materials, and tags.

class CADQueryParser {
  constructor() {
    this.equipmentKeywords = {
      tank: ["tank", "vessel", "storage", "silo", "container", "cistern", "reservoir"],
      pump: ["pump", "feedwater", "centrifugal", "slurry", "impeller", "casing", "motor"],
      exchanger: ["exchanger", "heat exchanger", "reboiler", "tema", "tube bundle", "cooler", "condenser"],
      column: ["column", "tower", "distillation", "fractionator", "trays", "stripper", "scrubber"],
      drum: ["drum", "knockout", "ko drum", "separator", "accumulator"],
      skid: ["skid", "metering", "dosing", "manifold", "package", "modular"],
      sphere: ["sphere", "horton", "spherical", "lpg ball", "gas ball"],
      cone: ["cone", "conical", "hopper", "silo"]
    };

    this.shapes = {
      vertical_cylinder: ["vertical", "vertical cylinder", "upright", "standpipe", "cylindrical"],
      horizontal_cylinder: ["horizontal", "horizontal cylinder", "drum", "saddle"],
      sphere: ["sphere", "spherical", "ball", "horton"],
      column: ["column", "tall", "slender", "tower"],
      cone: ["cone", "conical", "funnel", "hopper"],
      skid: ["skid", "baseplate", "frame", "modular"]
    };

    this.materials = [
      { key: "SS316L", match: ["ss316", "ss316l", "316l", "stainless", "stainless steel", "a240"] },
      { key: "Carbon Steel", match: ["carbon steel", "cs", "a516", "a516 gr 70", "a36", "mild steel"] },
      { key: "Hastelloy", match: ["hastelloy", "c276", "c-276", "alloy c276"] },
      { key: "Monel", match: ["monel", "monel 400", "b163"] },
      { key: "Alloy Clad", match: ["clad", "cladding", "ss410", "410s"] }
    ];

    this.codes = [
      { key: "API 650", match: ["api 650", "api650", "welded tank"] },
      { key: "ASME Sec VIII", match: ["asme", "asme viii", "asme sec viii", "div 1", "div 2", "pressure vessel"] },
      { key: "API 610", match: ["api 610", "api610", "centrifugal pump standard"] },
      { key: "TEMA", match: ["tema", "tema r", "tema aeu", "tema bku"] },
      { key: "DIN EN", match: ["din", "en 1993", "eurocode"] }
    ];
  }

  // Parse natural language query into structured tokens & filters
  parse(rawQuery) {
    if (!rawQuery || typeof rawQuery !== "string") {
      return {
        query: "",
        tokens: [],
        filters: {},
        parsedCapacity: null,
        parsedPressure: null,
        parsedEquipment: null,
        parsedShape: null,
        parsedCode: null,
        parsedMaterial: null,
        parsedTag: null
      };
    }

    const query = rawQuery.trim();
    const qLower = query.toLowerCase();
    const tokens = [];
    const filters = {};

    // 1. Direct Tag match (e.g. TK-104A, P-101A, HE-202, C-101, V-402, SK-404, TK-501)
    const tagRegex = /\b(TK-?\d+[A-Z]?|HE-?\d+[A-Z]?|P-?\d+[A-Z]?|C-?\d+[A-Z]?|V-?\d+[A-Z]?|SK-?\d+[A-Z]?)\b/i;
    const tagMatch = query.match(tagRegex);
    let parsedTag = null;
    if (tagMatch) {
      parsedTag = tagMatch[1].toUpperCase().replace(/^([A-Z]+)(\d)/, "$1-$2");
      tokens.push({ type: "tag", label: "Tag / Equipment ID", value: parsedTag, icon: "hash" });
      filters.tag = parsedTag;
    }

    // 2. Capacity & Numerical Extraction
    // Formats: "50000 m3", "5000 m³", "50,000 capacity", "50000 liters", "320 m3/h", "185 m2"
    let parsedCapacity = null;

    // A) Volume in m3 or cubic meters
    const m3Regex = /(\d+[\d,\.]*)\s*(?:m3|m³|cu\.?\s*m|cubic\s*meters?)\b/i;
    const m3Match = query.match(m3Regex);

    // B) Volume in liters / L
    const literRegex = /(\d+[\d,\.]*)\s*(?:liters?|litres?|l)\b/i;
    const literMatch = query.match(literRegex);

    // C) Flow rate in m3/h
    const flowRegex = /(\d+[\d,\.]*)\s*(?:m3\/h|m³\/h|cum\/hr)\b/i;
    const flowMatch = query.match(flowRegex);

    // D) Area in m2 / sq m
    const areaRegex = /(\d+[\d,\.]*)\s*(?:m2|m²|sq\.?\s*m|square\s*meters?)\b/i;
    const areaMatch = query.match(areaRegex);

    // E) Generic "capacity of XX" or "tank of XX capacity" or "XX capacity"
    const genericCapRegex = /(?:capacity(?:\s+of)?\s+(\d+[\d,\.]*)|(\d+[\d,\.]*)\s+capacity|(?:tank|vessel|silo)\s+of\s+(\d+[\d,\.]*))/i;
    const genericCapMatch = query.match(genericCapRegex);

    if (flowMatch) {
      const val = parseFloat(flowMatch[1].replace(/,/g, ""));
      parsedCapacity = { value: val, unit: "m³/h", type: "flow" };
      tokens.push({ type: "capacity", label: "Flow Rate", value: `${val.toLocaleString()} m³/h`, icon: "gauge" });
      filters.capacity = parsedCapacity;
    } else if (areaMatch) {
      const val = parseFloat(areaMatch[1].replace(/,/g, ""));
      parsedCapacity = { value: val, unit: "m²", type: "area" };
      tokens.push({ type: "capacity", label: "Surface Area", value: `${val.toLocaleString()} m²`, icon: "layers" });
      filters.capacity = parsedCapacity;
    } else if (m3Match) {
      const val = parseFloat(m3Match[1].replace(/,/g, ""));
      parsedCapacity = { value: val, unit: "m³", type: "volume_m3" };
      tokens.push({ type: "capacity", label: "Net Capacity", value: `${val.toLocaleString()} m³`, icon: "database" });
      filters.capacity = parsedCapacity;
    } else if (literMatch) {
      const val = parseFloat(literMatch[1].replace(/,/g, ""));
      const inM3 = val / 1000;
      parsedCapacity = { value: inM3, unit: "m³", rawValue: val, rawUnit: "L", type: "volume_liter" };
      tokens.push({ type: "capacity", label: "Net Capacity", value: `${val.toLocaleString()} L (${inM3.toLocaleString()} m³)`, icon: "database" });
      filters.capacity = parsedCapacity;
    } else if (genericCapMatch) {
      const numStr = genericCapMatch[1] || genericCapMatch[2] || genericCapMatch[3];
      const val = parseFloat(numStr.replace(/,/g, ""));
      // If user writes "tank of 5000 capacity", in plant engineering volume defaults to m3
      parsedCapacity = { value: val, unit: "m³", type: "volume_m3" };
      tokens.push({ type: "capacity", label: "Target Capacity", value: `${val.toLocaleString()} m³`, icon: "database" });
      filters.capacity = parsedCapacity;
    }

    // 3. Pressure Extraction (e.g. "42 bar", "18.0 bar g", "600 psi")
    const pressRegex = /(\d+[\d,\.]*)\s*(?:bar|barg|bar\s*g|psi)\b/i;
    const pressMatch = query.match(pressRegex);
    let parsedPressure = null;
    if (pressMatch) {
      const val = parseFloat(pressMatch[1].replace(/,/g, ""));
      parsedPressure = { value: val, unit: "bar" };
      tokens.push({ type: "pressure", label: "Design Pressure", value: `${val} bar`, icon: "gauge" });
      filters.pressure = parsedPressure;
    }

    // 4. Equipment Type Detection
    let parsedEquipment = null;
    for (const [eqType, keywords] of Object.entries(this.equipmentKeywords)) {
      if (keywords.some(kw => qLower.includes(kw))) {
        parsedEquipment = eqType;
        const labels = {
          tank: "Atmospheric / Storage Tank",
          pump: "Centrifugal Pump",
          exchanger: "Heat Exchanger",
          column: "Distillation Column",
          drum: "Pressure Knockout Drum",
          skid: "Modular Process Skid",
          sphere: "Spherical Gas Storage (Horton)",
          cone: "Conical Bottom Silo"
        };
        tokens.push({ type: "equipment", label: "Equipment Category", value: labels[eqType] || eqType, icon: "box" });
        filters.equipment = eqType;
        break;
      }
    }

    // 5. Shape / Geometry Detection
    let parsedShape = null;
    for (const [shapeKey, keywords] of Object.entries(this.shapes)) {
      if (keywords.some(kw => qLower.includes(kw))) {
        parsedShape = shapeKey;
        const shapeLabels = {
          vertical_cylinder: "Vertical Cylindrical",
          horizontal_cylinder: "Horizontal Cylindrical",
          sphere: "Spherical Envelope",
          column: "Slender Vertical Tower",
          cone: "Conical Bottom Geometry",
          skid: "Rectangular Skid Frame"
        };
        tokens.push({ type: "shape", label: "Geometric Shape", value: shapeLabels[shapeKey] || shapeKey, icon: "compass" });
        filters.shape = parsedShape;
        break;
      }
    }

    // 6. Material Detection
    let parsedMaterial = null;
    for (const mat of this.materials) {
      if (mat.match.some(m => qLower.includes(m))) {
        parsedMaterial = mat.key;
        tokens.push({ type: "material", label: "Metallurgy / Grade", value: mat.key, icon: "shield" });
        filters.material = mat.key;
        break;
      }
    }

    // 7. Design Code Detection
    let parsedCode = null;
    for (const code of this.codes) {
      if (code.match.some(c => qLower.includes(c))) {
        parsedCode = code.key;
        tokens.push({ type: "code", label: "Engineering Standard", value: code.key, icon: "file-check" });
        filters.code = parsedCode;
        break;
      }
    }

    return {
      query,
      tokens,
      filters,
      parsedCapacity,
      parsedPressure,
      parsedEquipment,
      parsedShape,
      parsedCode,
      parsedMaterial,
      parsedTag
    };
  }

  // Score and rank database items based on the parsed query
  search(rawQuery, database = window.CAD_DATABASE) {
    const parsed = this.parse(rawQuery);
    if (!rawQuery || rawQuery.trim() === "") {
      return {
        parsed,
        results: database.map(item => ({ item, score: 100, matches: ["Default all models"] }))
      };
    }

    const qLower = rawQuery.toLowerCase().trim();
    const scoredList = [];

    database.forEach(item => {
      let score = 0;
      const matches = [];

      // A) Direct ID/Tag match
      if (parsed.parsedTag) {
        if (item.tag.toLowerCase().includes(parsed.parsedTag.toLowerCase())) {
          score += 100;
          matches.push(`Exact Tag Match: ${item.tag}`);
        }
      }

      // B) Equipment Type Match
      if (parsed.parsedEquipment) {
        const itemCat = item.category.toLowerCase();
        const itemTags = item.tags || [];
        const isMatch = itemCat.includes(parsed.parsedEquipment) ||
                        itemTags.includes(parsed.parsedEquipment) ||
                        (parsed.parsedEquipment === "tank" && item.modelType === "storage_tank") ||
                        (parsed.parsedEquipment === "pump" && item.modelType === "centrifugal_pump") ||
                        (parsed.parsedEquipment === "exchanger" && item.modelType === "heat_exchanger") ||
                        (parsed.parsedEquipment === "column" && item.modelType === "distillation_column") ||
                        (parsed.parsedEquipment === "sphere" && item.modelType === "horton_sphere") ||
                        (parsed.parsedEquipment === "skid" && item.modelType === "skid_package");
        if (isMatch) {
          score += 40;
          matches.push(`Equipment Type: ${item.category}`);
        }
      }

      // C) Shape Match
      if (parsed.parsedShape) {
        if (item.shape === parsed.parsedShape) {
          score += 25;
          matches.push(`Shape Envelope: ${item.shape.replace("_", " ")}`);
        }
      }

      // D) Capacity Match (with intelligent numerical proximity tolerance)
      if (parsed.parsedCapacity) {
        const target = parsed.parsedCapacity.value;
        const actual = item.capacityValue;

        // Proximity calculation
        const ratio = target > actual ? actual / target : target / actual;
        if (ratio >= 0.95) {
          // Exact or within 5%
          score += 50;
          matches.push(`Target Capacity Exact Match: ${item.capacityDisplay}`);
        } else if (ratio >= 0.7) {
          // Within 30%
          score += 35;
          matches.push(`Capacity within ±30%: ${item.capacityDisplay}`);
        } else if (ratio >= 0.4) {
          score += 15;
          matches.push(`Capacity range: ${item.capacityDisplay}`);
        }
      }

      // E) Pressure Match
      if (parsed.parsedPressure) {
        const targetP = parsed.parsedPressure.value;
        const actualP = item.pressure;
        const pRatio = targetP > actualP ? actualP / targetP : targetP / actualP;
        if (pRatio >= 0.8) {
          score += 25;
          matches.push(`Pressure Rating Match: ${item.pressure} ${item.pressureUnit}`);
        }
      }

      // F) Material Match
      if (parsed.parsedMaterial) {
        if (item.material.toLowerCase().includes(parsed.parsedMaterial.toLowerCase())) {
          score += 20;
          matches.push(`Material Grade: ${item.material}`);
        }
      }

      // G) Design Code Match
      if (parsed.parsedCode) {
        if (item.code.toLowerCase().includes(parsed.parsedCode.toLowerCase())) {
          score += 20;
          matches.push(`Standard Code: ${item.code}`);
        }
      }

      // H) General keyword fallback search
      const textToSearch = `${item.title} ${item.description || ""} ${item.category} ${item.material} ${item.code} ${item.plantUnit} ${(item.tags || []).join(" ")}`.toLowerCase();
      const words = qLower.split(/\s+/).filter(w => w.length > 2);
      let keywordHits = 0;
      words.forEach(w => {
        if (textToSearch.includes(w)) {
          keywordHits++;
        }
      });
      if (keywordHits > 0) {
        score += Math.min(keywordHits * 8, 30);
      }

      if (score > 0) {
        scoredList.push({
          item,
          score: Math.min(score, 100),
          matches
        });
      }
    });

    // Sort by highest score first
    scoredList.sort((a, b) => b.score - a.score);

    return {
      parsed,
      results: scoredList
    };
  }
}

window.cadQueryParser = new CADQueryParser();
