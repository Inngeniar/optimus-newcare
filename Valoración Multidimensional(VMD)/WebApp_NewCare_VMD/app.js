/**
 * PROGRAMA NEW CARE - VALORACIÓN MULTIDIMENSIONAL (VMD)
 * Optimus Health IPS & Fundación NewHealth
 * Lógica de Negocio, Algoritmo Oficial New Care y Suite de Riesgo Clínico
 */

// -------------------------------------------------------------
// 1. STATE & STORAGE MANAGEMENT
// -------------------------------------------------------------
const STORAGE_KEY = "NEWCARE_VMD_PATIENTS_DB_V2";
const USER_KEY = "NEWCARE_CURRENT_USER_V2";

let currentUser = {
  name: "Dr. Carlos Restrepo",
  reg: "RM-12345",
  role: "MED" // MED, ENF, TS, COORD
};

let patients = [];
let currentPatientId = null;

// Demo patients matching NewCare methodology
const defaultPatients = [
  {
    id: "1020304050",
    name: "GÓMEZ PÉREZ, CARLOS ALBERTO",
    birthdate: "1950-05-12",
    age: 74,
    vmdDate: "2026-11-05",
    vmdType: "VMD inicial",
    eps: "Sura",
    provider: "Optimus Health IPS",
    ambit: "Domiciliario",
    nyha: "CLASE III",
    nyhaObs: "FEVI 35%, BNP 850 pg/mL, disnea a mínimos esfuerzos",
    gold: "GOLD II",
    goldObs: "FEV1 55%, mMRC 2, O2 nocturno 2L",
    cp: "No aplica",
    cpObs: "",
    erc: "G3b",
    ercObs: "Creatinina 1.8 mg/dL, TFGe 36.2 ml/min",
    barthel: 55,
    lawton: 3,
    mnaSf: 9,
    mnaC: "No Aplica",
    pfeiffer: 3,
    mmse: "No Aplica",
    gijon: 12,
    zarit: 48,
    red: { hijos: 2, nietos: 1, hermanos: 0, amigos: 1, padres: 0, otrosFam: 0, vecinos: 1, amigosLej: 0, farmacia: 1, tienda: 1, otrosExt: 0, asoc: 0, centrodia: 0, volunt: 0, parroquia: 1, obs: "Hija es cuidadora única con riesgo temprano de claudicación (Zarit 48)." },
    risk: { scr: 1.8, bili: 1.2, inr: 1.1, na: 138, imc: 21, fev1: 55, mmrc: 2, exac: 1, laceDays: 4, laceEd: 2 },
    pai: {
      sanitarias: "Optimización de diuréticos de asa, control estricto de ingesta de líquidos, titulación de betabloqueadores.",
      nutricionales: "Dieta hiposódica estricta, suplementación proteica por riesgo en MNA-SF (9 pts), restricción a 1200 ml.",
      psicologicas: "Manejo de la ansiedad asociada a disnea nocturna, apoyo en afrontamiento de cronicidad.",
      sociales: "Programa de relevo de cuidador formal para la hija, adaptación de ducha con barras de sujeción."
    }
  },
  {
    id: "1030405060",
    name: "RODRÍGUEZ SILVA, MARÍA ELENA",
    birthdate: "1948-11-20",
    age: 76,
    vmdDate: "2026-11-04",
    vmdType: "VMD tras hospitalización",
    eps: "Nueva EPS",
    provider: "Optimus Health IPS",
    ambit: "Domiciliario",
    nyha: "No aplica",
    nyhaObs: "",
    gold: "GOLD III",
    goldObs: "FEV1 38%, oxigenodependiente 16h/día, mMRC 3",
    cp: "No aplica",
    cpObs: "",
    erc: "No aplica",
    ercObs: "",
    barthel: 40,
    lawton: 2,
    mnaSf: 6,
    mnaC: "15",
    pfeiffer: 6,
    mmse: "No Aplica",
    gijon: 16,
    zarit: 60,
    red: { hijos: 1, nietos: 0, hermanos: 1, amigos: 0, padres: 0, otrosFam: 0, vecinos: 0, amigosLej: 0, farmacia: 1, tienda: 0, otrosExt: 0, asoc: 0, centrodia: 0, volunt: 0, parroquia: 0, obs: "Red de cuidados muy frágil. Hija única sobrecargada severamente (Zarit 60)." },
    risk: { scr: 1.1, bili: 0.9, inr: 1.0, na: 139, imc: 18.5, fev1: 38, mmrc: 3, exac: 3, laceDays: 7, laceEd: 3 },
    pai: {
      sanitarias: "Rehabilitación pulmonar domiciliaria, educación en uso de inhaladores y oxigenoterapia continua.",
      nutricionales: "MNA bajo (<17). Suplemento hiperproteico e hipercalórico diario.",
      psicologicas: "Soporte psicológico por depresión reactiva e insomnio.",
      sociales: "Intervención urgente de Trabajo Social para activar subsidio de cuidador y red comunitaria."
    }
  },
  {
    id: "1040506070",
    name: "MARTÍNEZ LÓPEZ, HERNANDO",
    birthdate: "1955-08-04",
    age: 69,
    vmdDate: "2026-11-03",
    vmdType: "VMD inicial",
    eps: "Sanitas",
    provider: "Optimus Health IPS",
    ambit: "Ambulatorio",
    nyha: "CLASE II",
    nyhaObs: "FEVI 48%, disnea en pendientes",
    gold: "No aplica",
    goldObs: "",
    cp: "GRADO B",
    cpObs: "Cirrosis compensada Child B (7 pts), ascitis leve",
    erc: "No aplica",
    ercObs: "",
    barthel: 85,
    lawton: 5,
    mnaSf: 11,
    mnaC: "No Aplica",
    pfeiffer: 2,
    mmse: "No Aplica",
    gijon: 8,
    zarit: 30,
    red: { hijos: 3, nietos: 2, hermanos: 1, amigos: 2, padres: 0, otrosFam: 1, vecinos: 2, amigosLej: 1, farmacia: 1, tienda: 1, otrosExt: 0, asoc: 1, centrodia: 0, volunt: 0, parroquia: 1, obs: "Buena red de apoyo familiar y vecinal. Esposa e hijos activos." },
    risk: { scr: 1.3, bili: 2.2, inr: 1.6, na: 135, imc: 24, fev1: 85, mmrc: 1, exac: 0, laceDays: 2, laceEd: 1 },
    pai: {
      sanitarias: "Control ambulatorio trimestral con hepatología y medicina interna, ecografía y alfafetoproteína.",
      nutricionales: "Dieta normoproteica con colación nocturna para prevenir sarcopenia.",
      psicologicas: "Adherencia al plan de autocuidado y abstinencia alcohólica absoluta.",
      sociales: "Mantener activa la participación en grupo comunitario de la parroquia."
    }
  },
  {
    id: "1050607080",
    name: "TORRES CASTRO, LUZ MARINA",
    birthdate: "1942-01-15",
    age: 82,
    vmdDate: "2026-11-02",
    vmdType: "VMD inicial",
    eps: "Sura",
    provider: "Optimus Health IPS",
    ambit: "Domiciliario",
    nyha: "CLASE IV",
    nyhaObs: "Insuficiencia Cardíaca terminal en reposo",
    gold: "GOLD IV",
    goldObs: "EPOC muy grave, oxigenoterapia continua 3L",
    cp: "No aplica",
    cpObs: "",
    erc: "G4",
    ercObs: "TFGe 18 ml/min, anemia de origen renal",
    barthel: 20,
    lawton: 0,
    mnaSf: 5,
    mnaC: "12",
    pfeiffer: 8,
    mmse: "18",
    gijon: 18,
    zarit: 70,
    red: { hijos: 1, nietos: 0, hermanos: 0, amigos: 0, padres: 0, otrosFam: 0, vecinos: 1, amigosLej: 0, farmacia: 1, tienda: 0, otrosExt: 0, asoc: 0, centrodia: 0, volunt: 0, parroquia: 0, obs: "Situación crítica. Dependiente total con demencia avanzada y claudicación severa del cuidador." },
    risk: { scr: 2.6, bili: 1.4, inr: 1.3, na: 131, imc: 17.8, fev1: 25, mmrc: 4, exac: 4, laceDays: 10, laceEd: 4 },
    pai: {
      sanitarias: "Adecuación del esfuerzo terapéutico, manejo paliativo de disnea y dolor, atención domiciliaria prioritaria.",
      nutricionales: "Alimentación por confort, prevención de broncoaspiración.",
      psicologicas: "Acompañamiento en el final de la vida y duelo anticipado familiar.",
      sociales: "Soporte social intensivo, gestión de cama hospitalaria domiciliaria y pañales."
    }
  },
  {
    id: "1060708090",
    name: "DÍAZ MORALES, JUAN CARLOS",
    birthdate: "1960-09-30",
    age: 64,
    vmdDate: "2026-11-01",
    vmdType: "VMD de seguimiento",
    eps: "Sura",
    provider: "Optimus Health IPS",
    ambit: "Ambulatorio",
    nyha: "CLASE I",
    nyhaObs: "Sin limitación en actividad ordinaria",
    gold: "No aplica",
    goldObs: "",
    cp: "No aplica",
    cpObs: "",
    erc: "G2",
    ercObs: "TFGe 75 ml/min, microalbuminuria leve",
    barthel: 100,
    lawton: 8,
    mnaSf: 13,
    mnaC: "No Aplica",
    pfeiffer: 1,
    mmse: "No Aplica",
    gijon: 6,
    zarit: 20,
    red: { hijos: 2, nietos: 1, hermanos: 2, amigos: 3, padres: 0, otrosFam: 2, vecinos: 2, amigosLej: 2, farmacia: 1, tienda: 1, otrosExt: 1, asoc: 0, centrodia: 0, volunt: 0, parroquia: 0, obs: "Paciente plenamente autónomo, excelente red de apoyo familiar." },
    risk: { scr: 1.0, bili: 0.8, inr: 1.0, na: 140, imc: 25.2, fev1: 90, mmrc: 0, exac: 0, laceDays: 0, laceEd: 0 },
    pai: {
      sanitarias: "Manejo preventivo en atención primaria, control anual de función renal y presión arterial.",
      nutricionales: "Estilo de vida saludable, dieta mediterránea y ejercicio regular.",
      psicologicas: "Mantener actividades recreativas e intelectuales.",
      sociales: "Sin necesidades sociales prioritarias."
    }
  }
];

function initApp() {
  loadFromStorage();
  loadProfessionals();
  populateEvaluatorDropdowns();
  updateUserHeader();
  renderPatientsTable();
  if (patients.length > 0) {
    loadPatient(patients[0].id);
  }
  buildQuestionnaires();
  runRiskCalculators();
  initSupabase();
  if (window.lucide) {
    lucide.createIcons();
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      patients = JSON.parse(raw);
    } else {
      patients = JSON.parse(JSON.stringify(defaultPatients));
      saveToStorage();
    }
    const rawUser = localStorage.getItem(USER_KEY);
    if (rawUser) {
      currentUser = JSON.parse(rawUser);
    }
  } catch (e) {
    console.error("Error loading localStorage", e);
    patients = JSON.parse(JSON.stringify(defaultPatients));
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
}

// -------------------------------------------------------------
// 2. USER ROLE MANAGEMENT
// -------------------------------------------------------------
function updateUserHeader() {
  const nameEl = document.getElementById("header-user-name");
  const badgeEl = document.getElementById("header-user-role-badge");
  if (nameEl) nameEl.textContent = currentUser.name;
  
  if (badgeEl) {
    badgeEl.className = "badge-role " + 
      (currentUser.role === "MED" ? "badge-med" : 
       currentUser.role === "ENF" ? "badge-enf" : 
       currentUser.role === "TS" ? "badge-ts" : "badge-coord");
    
    const roleLabels = {
      MED: "Médico Internista / Geriatra",
      ENF: "Enfermera(o) Jefe",
      TS: "Trabajador(a) Social",
      COORD: "Coordinador(a) / Junta de Cronicidad"
    };
    badgeEl.textContent = roleLabels[currentUser.role] || "Profesional de Salud";
  }
}

function openRoleModal() {
  document.getElementById("prof-name-input").value = currentUser.name;
  document.getElementById("prof-reg-input").value = currentUser.reg;
  document.getElementById("prof-role-input").value = currentUser.role;
  openModal("modal-role");
}

function saveUserRole() {
  currentUser.name = document.getElementById("prof-name-input").value.trim() || "Profesional de Salud";
  currentUser.reg = document.getElementById("prof-reg-input").value.trim() || "R-00000";
  currentUser.role = document.getElementById("prof-role-input").value;
  saveToStorage();
  updateUserHeader();
  closeModal("modal-role");
}

// -------------------------------------------------------------
// 3. NAVIGATION TABS
// -------------------------------------------------------------
function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = "block";
  }
  
  // Resaltado dinámico y robusto de la pestaña activa en la barra de navegación
  document.querySelectorAll(".nav-tab").forEach(t => {
    const clickAttr = t.getAttribute("onclick") || "";
    if (clickAttr.includes(`'${tabId}'`) || clickAttr.includes(`"${tabId}"`)) {
      t.classList.add("active");
    } else {
      t.classList.remove("active");
    }
  });

  if (tabId === "tab-seguimiento") {
    renderSeguimientoTab();
  }
  if (tabId === "tab-ruta-pizarra") {
    renderRutaYPizarraTab();
  }
  if (tabId === "tab-pai") {
    renderPrintablePAI();
  }
  if (tabId === "tab-equipo") {
    renderTeamDirectory();
  }

  if (window.lucide) lucide.createIcons();
}

function switchVmdSub(subIdx) {
  for (let i = 1; i <= 5; i++) {
    const p = document.getElementById(`vmd-subpanel-${i}`);
    const b = document.getElementById(`vmd-sub-${i}`);
    if (p) p.style.display = (i === subIdx) ? "block" : "none";
    if (b) {
      b.className = (i === subIdx) ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
    }
  }
  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// 4. NEWCARE OFFICIAL SCORING & COMPLEXITY ALGORITHM
// -------------------------------------------------------------
function getScoreNYHA(val) {
  if (val === "CLASE I") return 0;
  if (val === "CLASE II") return 1;
  if (val === "CLASE III" || val === "CLASE IV") return 2;
  return 0;
}

function getScoreGOLD(val) {
  if (val === "GOLD I") return 0;
  if (val === "GOLD II") return 1;
  if (val === "GOLD III" || val === "GOLD IV") return 2;
  return 0;
}

function getScoreCP(val) {
  if (val === "GRADO A") return 0;
  if (val === "GRADO B") return 1;
  if (val === "GRADO C") return 2;
  return 0;
}

function getScoreERC(val) {
  if (val === "G1" || val === "G2") return 0;
  if (val === "G3a" || val === "G3b") return 1;
  if (val === "G4" || val === "G5") return 2;
  return 0;
}

function getScoreBarthel(b) {
  if (b === "" || b === null || isNaN(b)) return 0;
  b = Number(b);
  if (b >= 95) return 0;
  if (b >= 65) return 1;
  return 2;
}

function getScoreLawton(l) {
  if (l === "" || l === null || isNaN(l)) return 0;
  l = Number(l);
  if (l >= 6) return 0;
  if (l >= 4) return 1;
  return 2;
}

function getScoreMNA_SF(m) {
  if (m === "" || m === null || isNaN(m)) return 0;
  m = Number(m);
  if (m >= 12) return 0;
  if (m >= 8) return 1;
  return 2;
}

function getScoreMNA_C(val) {
  if (val === "No Aplica" || !val) return 0;
  const num = Number(val);
  if (num >= 24) return 0;
  if (num >= 17) return 1;
  return 2;
}

function getScorePfeiffer(err) {
  if (err === "" || err === null || isNaN(err)) return 0;
  err = Number(err);
  if (err <= 4) return 0;
  if (err <= 7) return 1;
  return 2;
}

function getScoreMMSE(val) {
  if (val === "No Aplica" || !val) return 0;
  const num = Number(val);
  return num >= 24 ? 0 : 2;
}

function getScoreGijon(g) {
  if (g === "" || g === null || isNaN(g)) return 0;
  g = Number(g);
  if (g <= 9) return 0;
  if (g <= 15) return 1;
  return 2;
}

function getScoreZarit(z) {
  if (z === "" || z === null || isNaN(z)) return 0;
  z = Number(z);
  if (z <= 46) return 0;
  if (z <= 55) return 1;
  return 2;
}

/**
 * Computes all multidimensional dimensions and executes NewCare algorithm
 */
function evaluatePatient(p) {
  // 1. Severidad T = MAX(NYHA, GOLD, ChildPugh, ERC)
  const sNYHA = getScoreNYHA(p.nyha);
  const sGOLD = getScoreGOLD(p.gold);
  const sCP = getScoreCP(p.cp);
  const sERC = getScoreERC(p.erc);
  const T = Math.max(sNYHA, sGOLD, sCP, sERC);

  // 2. Funcionalidad Z = MAX(Barthel, Lawton)
  const sBarthel = getScoreBarthel(p.barthel);
  const sLawton = getScoreLawton(p.lawton);
  const Z = Math.max(sBarthel, sLawton);

  // 3. Nutrición AL = MAX(MNA-SF, MNA)
  const sMnaSf = getScoreMNA_SF(p.mnaSf);
  const sMnaC = getScoreMNA_C(p.mnaC);
  const AL = (p.mnaC === "No Aplica" || !p.mnaC) ? sMnaSf : Math.max(sMnaSf, sMnaC);

  // 4. Cognitividad AF = MAX(Pfeiffer, MMSE)
  const sPfeiffer = getScorePfeiffer(p.pfeiffer);
  const sMmse = getScoreMMSE(p.mmse);
  const AF = (p.mmse === "No Aplica" || !p.mmse) ? sPfeiffer : Math.max(sPfeiffer, sMmse);

  // 5. Social AR = MAX(Gijón, Zarit)
  const sGijon = getScoreGijon(p.gijon);
  const sZarit = getScoreZarit(p.zarit);
  const AR = Math.max(sGijon, sZarit);

  // 6. ALGORITMO OFICIAL NEW CARE:
  // Si cualquiera de Z, AF, AL, AR == 2 => Valor Final = Math.min(2, T + 1) else T
  let finalScore;
  let aggravated = false;
  if (Z === 2 || AF === 2 || AL === 2 || AR === 2) {
    finalScore = Math.min(2, T + 1);
    aggravated = true;
  } else {
    finalScore = T;
  }

  let complexityText = "Baja Complejidad";
  if (finalScore === 1) complexityText = "Media Complejidad";
  if (finalScore >= 2) complexityText = "Alta Complejidad";

  // Criterio de ingreso New Care
  const isEligible = finalScore >= 1; // Media o Alta Complejidad

  // Modalidad PAI recomendada
  let modalidad = "ATENCIÓN PRIMARIA / PREVENTIVO";
  let cadencia = "Control anual preventivo en centro de salud.";
  
  if (finalScore >= 2) {
    // Si es Alta Complejidad y Barthel <= 60 => Domiciliario
    if (p.barthel <= 60 || Z === 2) {
      modalidad = "DOMICILIARIO (Dependencia Funcional Severa)";
      cadencia = "Mínimo MENSUAL: Visita presencial médica, enfermería y trabajo social en domicilio.\nLlamada de seguimiento QUINCENAL.";
    } else {
      modalidad = "AMBULATORIO (Alta Complejidad con Movilidad)";
      cadencia = "Mínimo TRIMESTRAL: Consulta presencial médica y enfermera.\nLlamada de seguimiento MENSUAL.";
    }
  } else if (finalScore === 1) {
    modalidad = "AMBULATORIO (Media Complejidad)";
    cadencia = "Consulta presencial cada 4-6 MESES.\nLlamada de seguimiento cada 2-3 MESES.";
  }

  return {
    T, Z, AL, AF, AR,
    sNYHA, sGOLD, sCP, sERC,
    sBarthel, sLawton, sMnaSf, sMnaC,
    sPfeiffer, sMmse, sGijon, sZarit,
    finalScore,
    aggravated,
    complexityText,
    isEligible,
    modalidad,
    cadencia
  };
}

// -------------------------------------------------------------
// 5. PATIENTS TABLE RENDERING & ACTIONS
// -------------------------------------------------------------
function renderPatientsTable() {
  const tbody = document.getElementById("patients-table-body");
  if (!tbody) return;

  const search = document.getElementById("search-input")?.value.toLowerCase().trim() || "";
  const filterComp = document.getElementById("filter-complexity")?.value || "ALL";
  const filterAdm = document.getElementById("filter-admission")?.value || "ALL";

  let filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search) || p.id.includes(search);
    const evalRes = evaluatePatient(p);
    
    let matchComp = true;
    if (filterComp !== "ALL") {
      matchComp = evalRes.complexityText === filterComp;
    }

    let matchAdm = true;
    if (filterAdm === "ELEGIBLE") matchAdm = evalRes.isEligible;
    if (filterAdm === "NO_ELEGIBLE") matchAdm = !evalRes.isEligible;

    return matchSearch && matchComp && matchAdm;
  });

  // Update Stats
  const total = patients.length;
  const high = patients.filter(p => evaluatePatient(p).finalScore >= 2).length;
  const med = patients.filter(p => evaluatePatient(p).finalScore === 1).length;
  const low = patients.filter(p => evaluatePatient(p).finalScore === 0).length;
  const statsEl = document.getElementById("padron-stats");
  if (statsEl) {
    statsEl.innerHTML = `Total: <strong>${total}</strong> | Alta: <span style="color:#dc2626;">${high}</span> | Media: <span style="color:#d97706;">${med}</span> | Baja: <span style="color:#16a34a;">${low}</span>`;
  }

  tbody.innerHTML = "";
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align: center; color: #94a3b8; padding: 20px;">No se encontraron pacientes con los filtros seleccionados.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const res = evaluatePatient(p);
    
    // List IOCC
    const ioccList = [];
    if (p.nyha && p.nyha !== "No aplica") ioccList.push("IC (" + p.nyha + ")");
    if (p.gold && p.gold !== "No aplica") ioccList.push("EPOC (" + p.gold + ")");
    if (p.cp && p.cp !== "No aplica") ioccList.push("Hepática (" + p.cp + ")");
    if (p.erc && p.erc !== "No aplica") ioccList.push("ERC (" + p.erc + ")");
    const ioccText = ioccList.length > 0 ? ioccList.join(", ") : "Sin IOCC activa";

    const compBadgeClass = res.finalScore >= 2 ? "complex-alta" : (res.finalScore === 1 ? "complex-media" : "complex-baja");
    const admBadge = res.isEligible ? 
      `<span class="badge-role" style="background:#dcfce7; color:#166534; border:1px solid #86efac;">ELEGIBLE (Ingresa)</span>` : 
      `<span class="badge-role" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">Atención Primaria</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.id}</strong></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.age || "--"}</td>
      <td style="font-size: 11px;">${ioccText}</td>
      <td style="text-align: center; font-weight: 700;">${res.T}</td>
      <td style="text-align: center; font-weight: 700;">${res.Z}</td>
      <td style="text-align: center; font-weight: 700;">${res.AF}</td>
      <td style="text-align: center; font-weight: 700;">${res.AL}</td>
      <td style="text-align: center; font-weight: 700;">${res.AR}</td>
      <td><span class="badge-complex ${compBadgeClass}">${res.complexityText}</span></td>
      <td>${admBadge}</td>
      <td style="font-size: 11px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${res.modalidad}">${res.modalidad}</td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-primary btn-sm" onclick="loadPatient('${p.id}'); switchTab('tab-vmd');" title="Editar Ficha VMD">
          <i data-lucide="edit-3" style="width: 12px; height: 12px;"></i> Valorar
        </button>
        <button class="btn btn-secondary btn-sm" onclick="loadPatient('${p.id}'); switchTab('tab-pai');" title="Ver PAI">
          <i data-lucide="file-text" style="width: 12px; height: 12px;"></i> PAI
        </button>
        <button class="btn btn-danger btn-sm" onclick="deletePatient('${p.id}')" title="Eliminar">
          <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function createNewPatient() {
  const newId = prompt("Ingrese el número de cédula / identificación del afiliado:", "10" + Math.floor(10000000 + Math.random() * 90000000));
  if (!newId) return;

  const exists = patients.find(p => p.id === newId.trim());
  if (exists) {
    alert("Ya existe un paciente con esta cédula. Se abrirá su ficha.");
    loadPatient(exists.id);
    switchTab("tab-vmd");
    return;
  }

  const newP = {
    id: newId.trim(),
    name: "NUEVO PACIENTE IOCC",
    birthdate: "1954-01-01",
    age: 72,
    vmdDate: new Date().toISOString().split("T")[0],
    vmdType: "VMD inicial",
    eps: "Sura",
    provider: "Optimus Health IPS",
    ambit: "Domiciliario",
    nyha: "CLASE II",
    nyhaObs: "",
    gold: "No aplica",
    goldObs: "",
    cp: "No aplica",
    cpObs: "",
    erc: "G3a",
    ercObs: "",
    barthel: 75,
    lawton: 5,
    mnaSf: 12,
    mnaC: "No Aplica",
    pfeiffer: 2,
    mmse: "No Aplica",
    gijon: 8,
    zarit: 35,
    red: { hijos: 1, nietos: 0, hermanos: 0, amigos: 1, padres: 0, otrosFam: 0, vecinos: 1, amigosLej: 0, farmacia: 1, tienda: 0, otrosExt: 0, asoc: 0, centrodia: 0, volunt: 0, parroquia: 0, obs: "" },
    risk: { scr: 1.4, bili: 1.0, inr: 1.0, na: 138, imc: 23, fev1: 70, mmrc: 1, exac: 0, laceDays: 2, laceEd: 1 },
    pai: { sanitarias: "", nutricionales: "", psicologicas: "", sociales: "" }
  };

  patients.unshift(newP);
  saveToStorage();
  renderPatientsTable();
  loadPatient(newP.id);
  switchTab("tab-vmd");
}

function deletePatient(id) {
  if (confirm(`¿Está seguro de eliminar el registro del paciente con identificación ${id}?`)) {
    patients = patients.filter(p => p.id !== id);
    saveToStorage();
    renderPatientsTable();
    if (currentPatientId === id) {
      if (patients.length > 0) loadPatient(patients[0].id);
      else currentPatientId = null;
    }
  }
}

// -------------------------------------------------------------
// 6. PATIENT FORM BINDING & CALCULATION
// -------------------------------------------------------------
function loadPatient(id) {
  const p = patients.find(item => item.id === id);
  if (!p) return;
  currentPatientId = id;

  // Banner
  document.getElementById("banner-patient-name").textContent = p.name;
  document.getElementById("banner-patient-id").textContent = p.id;
  document.getElementById("banner-patient-age").textContent = (p.age || "--") + " años";
  document.getElementById("banner-patient-eps").textContent = p.eps || "No registrada";
  document.getElementById("banner-patient-amb").textContent = p.ambit || "Domiciliario";

  // Form Fields
  document.getElementById("vmd-id").value = p.id;
  document.getElementById("vmd-name").value = p.name;
  document.getElementById("vmd-birthdate").value = p.birthdate || "";
  document.getElementById("vmd-age").value = p.age || "";
  document.getElementById("vmd-date").value = p.vmdDate || "";
  document.getElementById("vmd-type").value = p.vmdType || "VMD inicial";
  document.getElementById("vmd-eps").value = p.eps || "";
  document.getElementById("vmd-provider").value = p.provider || "Optimus Health IPS";
  document.getElementById("vmd-ambit").value = p.ambit || "Domiciliario";

  // Severidad
  document.getElementById("vmd-nyha").value = p.nyha || "No aplica";
  document.getElementById("vmd-nyha-obs").value = p.nyhaObs || "";
  document.getElementById("vmd-gold").value = p.gold || "No aplica";
  document.getElementById("vmd-gold-obs").value = p.goldObs || "";
  document.getElementById("vmd-cp").value = p.cp || "No aplica";
  document.getElementById("vmd-cp-obs").value = p.cpObs || "";
  document.getElementById("vmd-erc").value = p.erc || "No aplica";
  document.getElementById("vmd-erc-obs").value = p.ercObs || "";

  // Funcionalidad & Nutrición
  document.getElementById("vmd-barthel").value = p.barthel !== undefined ? p.barthel : 100;
  document.getElementById("vmd-lawton").value = p.lawton !== undefined ? p.lawton : 8;
  document.getElementById("vmd-mna-sf").value = p.mnaSf !== undefined ? p.mnaSf : 14;
  document.getElementById("vmd-mna-c").value = p.mnaC || "No Aplica";

  // Cognitivo & Social
  document.getElementById("vmd-pfeiffer").value = p.pfeiffer !== undefined ? p.pfeiffer : 0;
  document.getElementById("vmd-mmse").value = p.mmse || "No Aplica";
  document.getElementById("vmd-gijon").value = p.gijon !== undefined ? p.gijon : 5;
  document.getElementById("vmd-zarit").value = p.zarit !== undefined ? p.zarit : 20;

  // Red
  if (p.red) {
    document.getElementById("red-hijos").value = p.red.hijos || 0;
    document.getElementById("red-nietos").value = p.red.nietos || 0;
    document.getElementById("red-hermanos").value = p.red.hermanos || 0;
    document.getElementById("red-amigos").value = p.red.amigos || 0;
    document.getElementById("red-padres").value = p.red.padres || 0;
    document.getElementById("red-otros-fam").value = p.red.otrosFam || 0;
    document.getElementById("red-vecinos").value = p.red.vecinos || 0;
    document.getElementById("red-amigos-lej").value = p.red.amigosLej || 0;
    document.getElementById("red-farmacia").value = p.red.farmacia || 0;
    document.getElementById("red-tienda").value = p.red.tienda || 0;
    document.getElementById("red-otros-ext").value = p.red.otrosExt || 0;
    document.getElementById("red-asoc").value = p.red.asoc || 0;
    document.getElementById("red-centrodia").value = p.red.centrodia || 0;
    document.getElementById("red-volunt").value = p.red.volunt || 0;
    document.getElementById("red-parroquia").value = p.red.parroquia || 0;
    document.getElementById("red-observaciones").value = p.red.obs || "";
  }

  // PAI
  if (p.pai) {
    document.getElementById("pai-sanitarias").value = p.pai.sanitarias || "";
    document.getElementById("pai-nutricionales").value = p.pai.nutricionales || "";
    document.getElementById("pai-psicologicas").value = p.pai.psicologicas || "";
    document.getElementById("pai-sociales").value = p.pai.sociales || "";
  }

  // Risk inputs sync
  if (p.risk) {
    if (document.getElementById("calc-scr")) document.getElementById("calc-scr").value = p.risk.scr || 1.4;
    if (document.getElementById("calc-age")) document.getElementById("calc-age").value = p.age || 70;
    if (document.getElementById("calc-bili")) document.getElementById("calc-bili").value = p.risk.bili || 1.2;
    if (document.getElementById("calc-inr")) document.getElementById("calc-inr").value = p.risk.inr || 1.1;
    if (document.getElementById("calc-creat")) document.getElementById("calc-creat").value = p.risk.scr || 1.4;
    if (document.getElementById("calc-na")) document.getElementById("calc-na").value = p.risk.na || 138;
    if (document.getElementById("calc-bode-imc")) document.getElementById("calc-bode-imc").value = p.risk.imc || 22;
    if (document.getElementById("calc-bode-fev1")) document.getElementById("calc-bode-fev1").value = p.risk.fev1 || 60;
    if (document.getElementById("calc-bode-mmrc")) document.getElementById("calc-bode-mmrc").value = p.risk.mmrc || 1;
    if (document.getElementById("calc-bode-exac")) document.getElementById("calc-bode-exac").value = p.risk.exac || 0;
    if (document.getElementById("calc-lace-days")) document.getElementById("calc-lace-days").value = p.risk.laceDays || 3;
    if (document.getElementById("calc-lace-ed")) document.getElementById("calc-lace-ed").value = p.risk.laceEd || 1;
  }

  calcVMD();
  calcRedTotal();
  runRiskCalculators();
}

function updateCurrentFromForm() {
  if (!currentPatientId) return;
  const p = patients.find(item => item.id === currentPatientId);
  if (!p) return;

  p.name = document.getElementById("vmd-name").value.trim() || p.name;
  p.birthdate = document.getElementById("vmd-birthdate").value;
  p.age = Number(document.getElementById("vmd-age").value) || p.age;
  p.vmdDate = document.getElementById("vmd-date").value;
  p.vmdType = document.getElementById("vmd-type").value;
  p.eps = document.getElementById("vmd-eps").value.trim();
  p.provider = document.getElementById("vmd-provider").value.trim();
  p.ambit = document.getElementById("vmd-ambit").value;

  p.nyha = document.getElementById("vmd-nyha").value;
  p.nyhaObs = document.getElementById("vmd-nyha-obs").value;
  p.gold = document.getElementById("vmd-gold").value;
  p.goldObs = document.getElementById("vmd-gold-obs").value;
  p.cp = document.getElementById("vmd-cp").value;
  p.cpObs = document.getElementById("vmd-cp-obs").value;
  p.erc = document.getElementById("vmd-erc").value;
  p.ercObs = document.getElementById("vmd-erc-obs").value;

  p.barthel = Number(document.getElementById("vmd-barthel").value);
  p.lawton = Number(document.getElementById("vmd-lawton").value);
  p.mnaSf = Number(document.getElementById("vmd-mna-sf").value);
  p.mnaC = document.getElementById("vmd-mna-c").value;

  p.pfeiffer = Number(document.getElementById("vmd-pfeiffer").value);
  p.mmse = document.getElementById("vmd-mmse").value;
  p.gijon = Number(document.getElementById("vmd-gijon").value);
  p.zarit = Number(document.getElementById("vmd-zarit").value);

  p.pai = {
    sanitarias: document.getElementById("pai-sanitarias").value,
    nutricionales: document.getElementById("pai-nutricionales").value,
    psicologicas: document.getElementById("pai-psicologicas").value,
    sociales: document.getElementById("pai-sociales").value
  };

  calcVMD();
}

function calculateAge() {
  const bdate = document.getElementById("vmd-birthdate").value;
  if (!bdate) return;
  const birth = new Date(bdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  document.getElementById("vmd-age").value = age;
}

function calcVMD() {
  if (!currentPatientId) return;
  const p = patients.find(item => item.id === currentPatientId);
  if (!p) return;

  // Sync inputs
  p.nyha = document.getElementById("vmd-nyha").value;
  p.gold = document.getElementById("vmd-gold").value;
  p.cp = document.getElementById("vmd-cp").value;
  p.erc = document.getElementById("vmd-erc").value;
  p.barthel = Number(document.getElementById("vmd-barthel").value);
  p.lawton = Number(document.getElementById("vmd-lawton").value);
  p.mnaSf = Number(document.getElementById("vmd-mna-sf").value);
  p.mnaC = document.getElementById("vmd-mna-c").value;
  p.pfeiffer = Number(document.getElementById("vmd-pfeiffer").value);
  p.mmse = document.getElementById("vmd-mmse").value;
  p.gijon = Number(document.getElementById("vmd-gijon").value);
  p.zarit = Number(document.getElementById("vmd-zarit").value);

  const res = evaluatePatient(p);

  // Update Badges & Labels in Ficha
  document.getElementById("score-nyha").textContent = "Valor: " + res.sNYHA;
  document.getElementById("score-gold").textContent = "Valor: " + res.sGOLD;
  document.getElementById("score-cp").textContent = "Valor: " + res.sCP;
  document.getElementById("score-erc").textContent = "Valor: " + res.sERC;
  
  document.getElementById("vmd-t-score").textContent = res.T;
  document.getElementById("vmd-t-desc").textContent = res.T === 2 ? "Alta Severidad Clínica (Base 2)" : (res.T === 1 ? "Media Severidad Clínica (Base 1)" : "Baja Severidad Clínica (Base 0)");

  document.getElementById("badge-barthel").textContent = "Valor: " + res.sBarthel;
  document.getElementById("desc-barthel").textContent = res.sBarthel === 2 ? "≤ 60 pts: Baja Funcionalidad / Severa (2)" : (res.sBarthel === 1 ? "65-90 pts: Media Funcionalidad (1)" : "95-100 pts: Alta Funcionalidad (0)");

  document.getElementById("badge-lawton").textContent = "Valor: " + res.sLawton;
  document.getElementById("desc-lawton").textContent = res.sLawton === 2 ? "0-3 pts: Baja Funcionalidad (2)" : (res.sLawton === 1 ? "4-5 pts: Media Funcionalidad (1)" : "6-8 pts: Alta Funcionalidad (0)");

  document.getElementById("vmd-z-score").textContent = res.Z;
  document.getElementById("vmd-z-desc").textContent = res.Z === 2 ? "Baja Funcionalidad / Severa (2) [Alerta NewCare]" : (res.Z === 1 ? "Media Funcionalidad (1)" : "Alta Funcionalidad (0)");

  document.getElementById("badge-mna-sf").textContent = "Valor: " + res.sMnaSf;
  document.getElementById("desc-mna-sf").textContent = res.sMnaSf === 2 ? "0-7 pts: Malnutrición Confirmada (2)" : (res.sMnaSf === 1 ? "8-11 pts: Riesgo Malnutrición (1)" : "12-14 pts: Normal (0)");

  document.getElementById("badge-mna-c").textContent = "Valor: " + res.sMnaC;
  document.getElementById("vmd-al-score").textContent = res.AL;
  document.getElementById("vmd-al-desc").textContent = res.AL === 2 ? "Malnutrición / Alta Complejidad (2)" : (res.AL === 1 ? "Riesgo Nutricional (1)" : "Normal (0)");

  document.getElementById("badge-pfeiffer").textContent = "Valor: " + res.sPfeiffer;
  document.getElementById("desc-pfeiffer").textContent = res.sPfeiffer === 2 ? "> 7 errores: Deterioro Severo (2)" : (res.sPfeiffer === 1 ? "5-7 errores: Deterioro Moderado (1)" : "0-4 errores: Función Normal (0)");

  document.getElementById("badge-mmse").textContent = "Valor: " + res.sMmse;
  document.getElementById("vmd-af-score").textContent = res.AF;
  document.getElementById("vmd-af-desc").textContent = res.AF === 2 ? "Deterioro Severo / Alta Complejidad (2)" : (res.AF === 1 ? "Deterioro Moderado (1)" : "Normal (0)");

  document.getElementById("badge-gijon").textContent = "Valor: " + res.sGijon;
  document.getElementById("desc-gijon").textContent = res.sGijon === 2 ? "> 15 pts: Problema Social Severo (2)" : (res.sGijon === 1 ? "10-15 pts: Riesgo Social (1)" : "5-9 pts: Buena Situación (0)");

  document.getElementById("badge-zarit").textContent = "Valor: " + res.sZarit;
  document.getElementById("desc-zarit").textContent = res.sZarit === 2 ? "≥ 56 pts: Sobrecarga Intensa (2)" : (res.sZarit === 1 ? "47-55 pts: Sobrecarga Ligera (1)" : "≤ 46 pts: Sin Sobrecarga (0)");

  document.getElementById("vmd-ar-score").textContent = res.AR;
  document.getElementById("vmd-ar-desc").textContent = res.AR === 2 ? "Problema Social / Sobrecarga Intensa (2)" : (res.AR === 1 ? "Riesgo Social (1)" : "Buena Situación (0)");

  // KPI Header Cards (Tab 5)
  document.getElementById("card-t").textContent = res.T;
  document.getElementById("card-z").textContent = res.Z;
  document.getElementById("card-al").textContent = res.AL;
  document.getElementById("card-af").textContent = res.AF;
  document.getElementById("card-ar").textContent = res.AR;
  document.getElementById("card-final").textContent = res.finalScore;

  // Banner Dictamen
  const banner = document.getElementById("dictamen-banner");
  const titleComp = document.getElementById("dictamen-complexity");
  const decEl = document.getElementById("dictamen-decision");
  const expEl = document.getElementById("dictamen-formula-explanation");

  titleComp.textContent = res.complexityText.toUpperCase();
  if (res.finalScore >= 2) {
    banner.style.background = "#fee2e2";
    banner.style.borderColor = "#fca5a5";
    titleComp.style.color = "#991b1b";
    decEl.style.color = "#b91c1c";
    decEl.textContent = "CANDIDATO ELEGIBLE - INGRESO APROBADO A PROGRAMA NEW CARE (ALTA COMPLEJIDAD)";
  } else if (res.finalScore === 1) {
    banner.style.background = "#fef9c3";
    banner.style.borderColor = "#fde047";
    titleComp.style.color = "#854d0e";
    decEl.style.color = "#a16207";
    decEl.textContent = "CANDIDATO ELEGIBLE - INGRESO APROBADO A PROGRAMA NEW CARE (MEDIA COMPLEJIDAD)";
  } else {
    banner.style.background = "#dcfce7";
    banner.style.borderColor = "#86efac";
    titleComp.style.color = "#14532d";
    decEl.style.color = "#166534";
    decEl.textContent = "NO CUMPLE CRITERIOS DE INGRESO A NEW CARE - MANEJO EN ATENCIÓN PRIMARIA";
  }

  if (res.aggravated) {
    expEl.innerHTML = `<strong>Algoritmo Oficial New Care:</strong> Severidad Clínica Base T = ${res.T}. Debido a que existe al menos una dimensión en <strong>Alta Complejidad (Valor = 2)</strong> (Z=${res.Z}, AF=${res.AF}, AL=${res.AL}, AR=${res.AR}), la complejidad se incrementa automáticamente a: <strong>Valor Final = T + 1 = ${res.finalScore}</strong>.`;
  } else {
    expEl.innerHTML = `<strong>Algoritmo Oficial New Care:</strong> Severidad Clínica Base T = ${res.T}. Ninguna dimensión asociada puntúa en alta complejidad (2). <strong>Valor Final = T = ${res.finalScore}</strong>.`;
  }

  // PAI Fields
  document.getElementById("pai-modalidad").value = res.modalidad;
  document.getElementById("pai-cadencia").value = res.cadencia;
  
  const vmdDate = new Date(p.vmdDate || new Date());
  const deadline = new Date(vmdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  document.getElementById("pai-deadline").value = "Máximo 30 días calendario tras asignación (Límite: " + deadline.toLocaleDateString("es-CO") + ")";
}

function saveCurrentPatient() {
  updateCurrentFromForm();
  saveToStorage();
  renderPatientsTable();
  alert("Los datos de la valoración del afiliado fueron guardados exitosamente.");
}

// -------------------------------------------------------------
// 7. CLINICAL RISK CALCULATORS SUITE
// -------------------------------------------------------------
function runRiskCalculators() {
  // 1. CKD-EPI 2021 (TFGe)
  const scr = Math.max(0.2, Number(document.getElementById("calc-scr")?.value || 1.8));
  const age = Math.max(18, Number(document.getElementById("calc-age")?.value || 74));
  const sex = document.getElementById("calc-sex")?.value || "male";

  const isFemale = sex === "female";
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const minRatio = Math.min(scr / kappa, 1);
  const maxRatio = Math.max(scr / kappa, 1);
  let gfr = 142 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.200) * Math.pow(0.9938, age);
  if (isFemale) gfr *= 1.012;
  gfr = Math.round(gfr * 10) / 10;

  let gfrStage = "G1 (≥90)";
  let gfrDesc = "Normal o elevado";
  let gfrBadgeClass = "complex-baja";
  if (gfr < 90) { gfrStage = "G2 (60-89)"; gfrDesc = "Ligeramente disminuido"; gfrBadgeClass = "complex-baja"; }
  if (gfr < 60) { gfrStage = "G3a (45-59)"; gfrDesc = "Ligera a moderadamente disminuida"; gfrBadgeClass = "complex-media"; }
  if (gfr < 45) { gfrStage = "G3b (30-44)"; gfrDesc = "Moderada a gravemente disminuida"; gfrBadgeClass = "complex-media"; }
  if (gfr < 30) { gfrStage = "G4 (15-29)"; gfrDesc = "Gravemente disminuida"; gfrBadgeClass = "complex-alta"; }
  if (gfr < 15) { gfrStage = "G5 (<15)"; gfrDesc = "Fallo renal terminal o diálisis"; gfrBadgeClass = "complex-alta"; }

  if (document.getElementById("res-ckdepi-val")) {
    document.getElementById("res-ckdepi-val").textContent = gfr + " ml/min";
    document.getElementById("res-ckdepi-desc").innerHTML = `Estadio ${gfrStage}<br><span style="font-size:10px; font-weight:400;">${gfrDesc}</span>`;
    const b = document.getElementById("badge-risk-ckdepi");
    if (b) { b.textContent = "Estadio " + gfrStage.split(" ")[0]; b.className = "badge-complex " + gfrBadgeClass; }
  }

  // 2. MELD-Na
  const bili = Math.max(1, Number(document.getElementById("calc-bili")?.value || 2.4));
  const inr = Math.max(1, Number(document.getElementById("calc-inr")?.value || 1.8));
  const creat = Math.max(1, Number(document.getElementById("calc-creat")?.value || 1.5));
  let na = Number(document.getElementById("calc-na")?.value || 132);
  na = Math.min(137, Math.max(125, na));

  let meld = Math.round(9.57 * Math.log(creat) + 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 6.43);
  let meldNa = meld;
  if (meld > 11) {
    meldNa = Math.round(meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na));
  }

  let meldDesc = "Riesgo Bajo (~1.9% mortalidad 3m)";
  let meldBadge = "complex-baja";
  if (meldNa >= 10) { meldDesc = "Riesgo Moderado (~6.0% mortalidad 3m)"; meldBadge = "complex-media"; }
  if (meldNa >= 20) { meldDesc = "Riesgo Alto (~19.6% mortalidad 3m)"; meldBadge = "complex-alta"; }
  if (meldNa >= 30) { meldDesc = "Riesgo Muy Severo (>50% mortalidad 3m)"; meldBadge = "complex-alta"; }

  if (document.getElementById("res-meld-val")) {
    document.getElementById("res-meld-val").textContent = meldNa + " pts";
    document.getElementById("res-meld-desc").innerHTML = `${meldDesc.split("(")[0]}<br><span style="font-size:10px; font-weight:400;">Mortalidad 3 meses: ${meldDesc.split("(")[1] || ""}</span>`;
    const b = document.getElementById("badge-risk-meld");
    if (b) { b.textContent = meldDesc.split(" ")[1]; b.className = "badge-complex " + meldBadge; }
  }

  // 3. BODEx
  const imc = Number(document.getElementById("calc-bode-imc")?.value || 20.5);
  const fev1 = Number(document.getElementById("calc-bode-fev1")?.value || 48);
  const mmrc = Number(document.getElementById("calc-bode-mmrc")?.value || 2);
  const exac = Number(document.getElementById("calc-bode-exac")?.value || 1);

  let pB = (imc <= 21) ? 1 : 0;
  let pO = (fev1 >= 65) ? 0 : (fev1 >= 50 ? 1 : (fev1 >= 36 ? 2 : 3));
  let pD = (mmrc <= 1) ? 0 : (mmrc === 2 ? 1 : (mmrc === 3 ? 2 : 3));
  let pEx = (exac === 0) ? 0 : (exac <= 2 ? 1 : 2);
  const bodex = pB + pO + pD + pEx;

  let bodexCuartil = "Cuartil 1: Leve (~19% mort 4a)";
  let bodexBadge = "complex-baja";
  if (bodex >= 3) { bodexCuartil = "Cuartil 2: Moderado (~32% mort 4a)"; bodexBadge = "complex-media"; }
  if (bodex >= 5) { bodexCuartil = "Cuartil 3: Alto (~40% mort 4a)"; bodexBadge = "complex-alta"; }
  if (bodex >= 7) { bodexCuartil = "Cuartil 4: Muy Alto (>80% mort 4a)"; bodexBadge = "complex-alta"; }

  if (document.getElementById("res-bodex-val")) {
    document.getElementById("res-bodex-val").textContent = bodex + " pts";
    document.getElementById("res-bodex-desc").innerHTML = `${bodexCuartil.split("(")[0]}<br><span style="font-size:10px; font-weight:400;">Mortalidad 4 años: ${bodexCuartil.split("(")[1] || ""}</span>`;
    const b = document.getElementById("badge-risk-bodex");
    if (b) { b.textContent = "Score " + bodex; b.className = "badge-complex " + bodexBadge; }
  }

  // 4. Downton (Caídas)
  let downton = 0;
  if (document.getElementById("dt-falls")?.checked) downton++;
  if (document.getElementById("dt-meds")?.checked) downton++;
  if (document.getElementById("dt-sensory")?.checked) downton++;
  if (document.getElementById("dt-mental")?.checked) downton++;
  if (document.getElementById("dt-gait")?.checked) downton++;

  const isHighFalls = downton > 2;
  if (document.getElementById("res-downton-val")) {
    document.getElementById("res-downton-val").textContent = downton + " pts";
    document.getElementById("res-downton-desc").innerHTML = isHighFalls ? 
      `<span style="color:#dc2626;">ALTO RIESGO DE CAÍDAS (>2 pts)</span><br><span style="font-size:10px; font-weight:400;">Activar medidas de prevención en PAI</span>` :
      `<span style="color:#16a34a;">BAJO RIESGO DE CAÍDAS (≤2 pts)</span><br><span style="font-size:10px; font-weight:400;">Vigilancia habitual</span>`;
    const b = document.getElementById("badge-risk-downton");
    if (b) { b.textContent = isHighFalls ? "Alto Riesgo" : "Bajo Riesgo"; b.className = "badge-complex " + (isHighFalls ? "complex-alta" : "complex-baja"); }
  }

  // 5. Braden (UPP)
  const bSens = Number(document.getElementById("calc-braden-sens")?.value || 3);
  const bHum = Number(document.getElementById("calc-braden-hum")?.value || 3);
  const bAct = Number(document.getElementById("calc-braden-act")?.value || 2);
  const bMov = Number(document.getElementById("calc-braden-mov")?.value || 2);
  const bNut = Number(document.getElementById("calc-braden-nut")?.value || 2);
  const bFric = Number(document.getElementById("calc-braden-fric")?.value || 2);
  const braden = bSens + bHum + bAct + bMov + bNut + bFric;

  let bradenDesc = "Sin Riesgo / Bajo (≥15 pts)";
  let bradenBadge = "complex-baja";
  if (braden <= 14) { bradenDesc = "Riesgo Moderado (13-14 pts)"; bradenBadge = "complex-media"; }
  if (braden <= 12) { bradenDesc = "Alto Riesgo / Muy Alto (≤12 pts)"; bradenBadge = "complex-alta"; }

  if (document.getElementById("res-braden-val")) {
    document.getElementById("res-braden-val").textContent = braden + " pts";
    document.getElementById("res-braden-desc").innerHTML = `${bradenDesc}<br><span style="font-size:10px; font-weight:400;">Pautar colchón antiescaras / cambios</span>`;
    const b = document.getElementById("badge-risk-braden");
    if (b) { b.textContent = bradenDesc.split(" ")[0] + " Riesgo"; b.className = "badge-complex " + bradenBadge; }
  }

  // 6. LACE (Reingreso a 30 días)
  const lDays = Number(document.getElementById("calc-lace-days")?.value || 5);
  const lAcute = Number(document.getElementById("calc-lace-acute")?.value || 3);
  const lCharlson = Number(document.getElementById("calc-lace-charlson")?.value || 3);
  const lEd = Number(document.getElementById("calc-lace-ed")?.value || 2);

  let pDays = (lDays <= 1) ? 1 : (lDays <= 2 ? 2 : (lDays <= 3 ? 3 : (lDays <= 6 ? 4 : (lDays <= 13 ? 5 : 7))));
  let pEd = Math.min(4, lEd);
  let pCharl = Math.min(5, lCharlson);
  const lace = pDays + lAcute + pCharl + pEd;

  let laceDesc = "Bajo Riesgo (<5 pts)";
  let laceBadge = "complex-baja";
  if (lace >= 5) { laceDesc = "Riesgo Moderado (5-9 pts)"; laceBadge = "complex-media"; }
  if (lace >= 10) { laceDesc = "Alto Riesgo de Reingreso (≥10 pts)"; laceBadge = "complex-alta"; }

  if (document.getElementById("res-lace-val")) {
    document.getElementById("res-lace-val").textContent = lace + " pts";
    document.getElementById("res-lace-desc").innerHTML = `${laceDesc}<br><span style="font-size:10px; font-weight:400;">Seguimiento telefónico < 48-72h</span>`;
    const b = document.getElementById("badge-risk-lace");
    if (b) { b.textContent = laceDesc.split(" ")[0] + " Riesgo"; b.className = "badge-complex " + laceBadge; }
  }
}

// -------------------------------------------------------------
// 8. RED DE CUIDADOS CALCULATION
// -------------------------------------------------------------
function calcRedTotal() {
  const ids = [
    "red-hijos", "red-nietos", "red-hermanos", "red-amigos", "red-padres", "red-otros-fam",
    "red-vecinos", "red-amigos-lej", "red-farmacia", "red-tienda", "red-otros-ext",
    "red-asoc", "red-centrodia", "red-volunt", "red-parroquia"
  ];

  let sum = 0;
  ids.forEach(id => {
    sum += Number(document.getElementById(id)?.value || 0);
  });

  const totEl = document.getElementById("red-total-val");
  if (totEl) totEl.textContent = sum;

  if (currentPatientId) {
    const p = patients.find(item => item.id === currentPatientId);
    if (p) {
      if (!p.red) p.red = {};
      ids.forEach(id => {
        const key = id.replace("red-", "");
        p.red[key] = Number(document.getElementById(id)?.value || 0);
      });
      p.red.obs = document.getElementById("red-observaciones")?.value || "";
    }
  }
}

// -------------------------------------------------------------
// 9. MODALS & QUESTIONNAIRES BUILDER
// -------------------------------------------------------------
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

const barthelItemsDef = [
  { name: "Comer", options: [{ label: "Independiente: capaz de usar cubiertos, cortar carne, etc.", pts: 10 }, { label: "Necesita ayuda: para cortar la carne, untar mantequilla, etc.", pts: 5 }, { label: "Incapaz: dependiente", pts: 0 }] },
  { name: "Lavarse / Bañarse", options: [{ label: "Independiente: entra y sale solo del baño, se lava sin ayuda", pts: 5 }, { label: "Dependiente: necesita ayuda", pts: 0 }] },
  { name: "Vestirse", options: [{ label: "Independiente: se viste, abotona, ata cordones sin ayuda", pts: 10 }, { label: "Necesita ayuda: pero realiza al menos la mitad de la tarea", pts: 5 }, { label: "Dependiente: incapaz", pts: 0 }] },
  { name: "Arreglarse", options: [{ label: "Independiente: se peina, lava la cara, manos, afeita o maquilla", pts: 5 }, { label: "Dependiente: necesita ayuda para alguna tarea de higiene personal", pts: 0 }] },
  { name: "Deposiciones (Continencia fecal)", options: [{ label: "Continente: ningún episodio de incontinencia", pts: 10 }, { label: "Accidente ocasional: menos de una vez por semana", pts: 5 }, { label: "Incontinente: frecuente o necesita enemas", pts: 0 }] },
  { name: "Micción (Continencia urinaria)", options: [{ label: "Continente: control total, seco día y noche", pts: 10 }, { label: "Accidente ocasional: máximo un episodio en 24h", pts: 5 }, { label: "Incontinente: o sondado incapaz de manejarse solo", pts: 0 }] },
  { name: "Uso del retrete", options: [{ label: "Independiente: entra, se sienta, se limpia y se pone la ropa", pts: 10 }, { label: "Necesita ayuda: para mantener el equilibrio o limpiarse", pts: 5 }, { label: "Dependiente: incapaz", pts: 0 }] },
  { name: "Traslado cama - sillón", options: [{ label: "Independiente: sin ayuda", pts: 15 }, { label: "Mínima ayuda: física o supervisión", pts: 10 }, { label: "Gran ayuda: precisa persona fuerte o dos personas", pts: 5 }, { label: "Incapaz: no se mantiene sentado", pts: 0 }] },
  { name: "Deambulación / Marcha", options: [{ label: "Independiente: camina al menos 50 metros sin ayuda ni bastón", pts: 15 }, { label: "Necesita ayuda: física o verbal, o camina con andador/muletas", pts: 10 }, { label: "En silla de ruedas: se desplaza solo 50 metros", pts: 5 }, { label: "Incapaz / encamado", pts: 0 }] },
  { name: "Subir y bajar escaleras", options: [{ label: "Independiente: sube y baja pisos sin supervisión ni barandilla obligatoria", pts: 10 }, { label: "Necesita ayuda: física o supervisión verbal", pts: 5 }, { label: "Incapaz", pts: 0 }] }
];

const lawtonItemsDef = [
  { name: "Capacidad para usar el teléfono", options: [{ label: "Utiliza el teléfono por iniciativa propia, busca y marca números", pts: 1 }, { label: "No es capaz de usar el teléfono o solo contesta llamadas", pts: 0 }] },
  { name: "Hacer compras", options: [{ label: "Realiza todas las compras necesarias con total independencia", pts: 1 }, { label: "Necesita ser acompañado para cualquier compra o no participa", pts: 0 }] },
  { name: "Preparación de la comida", options: [{ label: "Organiza, prepara y sirve las comidas por sí solo adecuadamente", pts: 1 }, { label: "Incapaz de cocinar, necesita que le preparen la comida", pts: 0 }] },
  { name: "Cuidado de la casa", options: [{ label: "Mantiene la casa solo o con ayuda liviana (hace la cama, lava platos)", pts: 1 }, { label: "No participa en las labores de la casa o necesita ayuda total", pts: 0 }] },
  { name: "Lavado de ropa", options: [{ label: "Lava por sí mismo toda su ropa personal", pts: 1 }, { label: "Todo el lavado de ropa lo realizan otras personas", pts: 0 }] },
  { name: "Uso de medios de transporte", options: [{ label: "Viaja solo en transporte público o conduce su vehículo", pts: 1 }, { label: "Solo viaja en taxi o vehículo con acompañante o está confinado", pts: 0 }] },
  { name: "Responsabilidad respecto a su medicación", options: [{ label: "Toma su medicación a la hora y dosis correctas por iniciativa propia", pts: 1 }, { label: "No es capaz de administrarse la medicación sin supervisión ajena", pts: 0 }] },
  { name: "Capacidad para manejar asuntos económicos", options: [{ label: "Maneja sus asuntos financieros, banco, presupuestos y compras solo", pts: 1 }, { label: "Incapaz de manejar dinero, otra persona gestiona sus finanzas", pts: 0 }] }
];

const pfeifferItemsDef = [
  "1. ¿Qué fecha es hoy? (Día, mes y año)",
  "2. ¿Qué día de la semana es hoy?",
  "3. ¿Dónde estamos ahora? (Nombre del lugar, hospital o casa)",
  "4. ¿Cuál es su número de teléfono o dirección de residencia?",
  "5. ¿Cuántos años tiene?",
  "6. ¿Cuál es su fecha de nacimiento completa?",
  "7. ¿Quién es el presidente actual del país?",
  "8. ¿Quién fue el presidente anterior?",
  "9. ¿Cuál era el primer apellido de su madre?",
  "10. Reste de 3 en 3 desde 20 hasta 2 (20, 17, 14, 11, 8, 5, 2)"
];

const mnaItemsDef = [
  { name: "A. ¿Ha disminuido su ingesta de alimentos en los últimos 3 meses?", options: [{ label: "0: Disminución severa del apetito", pts: 0 }, { label: "1: Disminución moderada", pts: 1 }, { label: "2: Sin disminución", pts: 2 }] },
  { name: "B. ¿Pérdida reciente de peso (< 3 meses)?", options: [{ label: "0: Pérdida superior a 3 kg", pts: 0 }, { label: "1: No sabe", pts: 1 }, { label: "2: Pérdida entre 1 y 3 kg", pts: 2 }, { label: "3: Sin pérdida de peso", pts: 3 }] },
  { name: "C. Movilidad", options: [{ label: "0: De la cama al sillón / encamado", pts: 0 }, { label: "1: Autonomía en el interior de la casa", pts: 1 }, { label: "2: Sale del domicilio", pts: 2 }] },
  { name: "D. ¿Ha tenido estrés psicológico o enfermedad aguda en últimos 3 meses?", options: [{ label: "0: Sí", pts: 0 }, { label: "2: No", pts: 2 }] },
  { name: "E. Problemas neuropsicológicos", options: [{ label: "0: Demencia o depresión severa", pts: 0 }, { label: "1: Demencia o depresión leve", pts: 1 }, { label: "2: Sin problemas psicológicos", pts: 2 }] },
  { name: "F. Índice de Masa Corporal (IMC)", options: [{ label: "0: IMC < 19", pts: 0 }, { label: "1: 19 ≤ IMC < 21", pts: 1 }, { label: "2: 21 ≤ IMC < 23", pts: 2 }, { label: "3: IMC ≥ 23", pts: 3 }] }
];

const gijonItemsDef = [
  { name: "1. Situación Familiar", options: [{ label: "1: Vive con pareja y/o familia sin conflictos", pts: 1 }, { label: "2: Vive con pareja de edad similar", pts: 2 }, { label: "3: Con otros familiares o hijos", pts: 3 }, { label: "4: Vive solo", pts: 4 }, { label: "5: Aislamiento geográfico o social", pts: 5 }] },
  { name: "2. Situación Económica", options: [{ label: "1: Ingresos superiores a 1.5 salario mínimo", pts: 1 }, { label: "2: Desde salario mínimo hasta 1.5 SM", pts: 2 }, { label: "3: Pensión mínima no contributiva", pts: 3 }, { label: "4: Ingresos inferiores a pensión mínima", pts: 4 }, { label: "5: Sin ningún ingreso regular", pts: 5 }] },
  { name: "3. Vivienda", options: [{ label: "1: Adecuada y adaptada a sus necesidades", pts: 1 }, { label: "2: Barreras leves (ej. escalones de entrada)", pts: 2 }, { label: "3: Barreras importantes en interior (ducha, baño)", pts: 3 }, { label: "4: Inadecuada / humedades / sin ascensor alto piso", pts: 4 }, { label: "5: Infravivienda o sin hogar", pts: 5 }] },
  { name: "4. Relaciones Sociales", options: [{ label: "1: Relaciones sociales fluidas y activas", pts: 1 }, { label: "2: Solo relación con familia y vecinos cercanos", pts: 2 }, { label: "3: Solo sale a recados indispensables", pts: 3 }, { label: "4: Confinamiento permanente en el domicilio", pts: 4 }, { label: "5: Aislamiento absoluto / no recibe visitas", pts: 5 }] },
  { name: "5. Apoyo de la Red Social", options: [{ label: "1: Apoyo familiar y vecinal constante", pts: 1 }, { label: "2: Apoyo solo de la familia", pts: 2 }, { label: "3: Apoyo solo de vecinos o amigos", pts: 3 }, { label: "4: Apoyo deficitario o muy esporádico", pts: 4 }, { label: "5: Ausencia total de apoyo / desamparo", pts: 5 }] }
];

function buildQuestionnaires() {
  // Barthel
  const bContainer = document.getElementById("barthel-questions-container");
  if (bContainer) {
    bContainer.innerHTML = barthelItemsDef.map((item, idx) => `
      <div class="q-item">
        <div class="q-title">${idx + 1}. ${item.name}</div>
        <div class="q-options">
          ${item.options.map((opt, oIdx) => `
            <label class="q-option">
              <input type="radio" name="b_q_${idx}" value="${opt.pts}" ${oIdx === 0 ? "checked" : ""} onchange="updateBarthelModalTotal()">
              <span><strong>(${opt.pts} pts)</strong> ${opt.label}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // Lawton
  const lContainer = document.getElementById("lawton-questions-container");
  if (lContainer) {
    lContainer.innerHTML = lawtonItemsDef.map((item, idx) => `
      <div class="q-item">
        <div class="q-title">${idx + 1}. ${item.name}</div>
        <div class="q-options">
          ${item.options.map((opt, oIdx) => `
            <label class="q-option">
              <input type="radio" name="l_q_${idx}" value="${opt.pts}" ${oIdx === 0 ? "checked" : ""} onchange="updateLawtonModalTotal()">
              <span><strong>(${opt.pts} pto)</strong> ${opt.label}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // Pfeiffer
  const pContainer = document.getElementById("pfeiffer-questions-container");
  if (pContainer) {
    pContainer.innerHTML = pfeifferItemsDef.map((q, idx) => `
      <div class="q-item" style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; font-weight:600; color:#334155;">${q}</span>
        <div style="display:flex; gap:10px;">
          <label style="cursor:pointer; font-size:12px;"><input type="radio" name="p_q_${idx}" value="0" checked onchange="updatePfeifferModalTotal()"> Acierto (0)</label>
          <label style="cursor:pointer; font-size:12px; color:#dc2626;"><input type="radio" name="p_q_${idx}" value="1" onchange="updatePfeifferModalTotal()"> Error (+1)</label>
        </div>
      </div>
    `).join("");
  }

  // MNA-SF
  const mContainer = document.getElementById("mna-questions-container");
  if (mContainer) {
    mContainer.innerHTML = mnaItemsDef.map((item, idx) => `
      <div class="q-item">
        <div class="q-title">${item.name}</div>
        <div class="q-options">
          ${item.options.map((opt, oIdx) => `
            <label class="q-option">
              <input type="radio" name="m_q_${idx}" value="${opt.pts}" ${oIdx === (item.options.length - 1) ? "checked" : ""} onchange="updateMnaModalTotal()">
              <span>${opt.label}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // Gijón
  const gContainer = document.getElementById("gijon-questions-container");
  if (gContainer) {
    gContainer.innerHTML = gijonItemsDef.map((item, idx) => `
      <div class="q-item">
        <div class="q-title">${item.name}</div>
        <div class="q-options">
          ${item.options.map((opt, oIdx) => `
            <label class="q-option">
              <input type="radio" name="g_q_${idx}" value="${opt.pts}" ${oIdx === 0 ? "checked" : ""} onchange="updateGijonModalTotal()">
              <span>${opt.label}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  // Zarit 22 questions (summary slider / items)
  const zContainer = document.getElementById("zarit-questions-container");
  if (zContainer) {
    const zaritShortQuestions = [
      "1. ¿Siente que su familiar le pide más ayuda de la que realmente necesita?",
      "2. ¿Siente que por dedicar tiempo a su familiar no tiene suficiente tiempo para usted?",
      "3. ¿Se siente agobiado por intentar compatibilizar el cuidado con otras responsabilidades?",
      "4. ¿Siente vergüenza por la conducta de su familiar?",
      "5. ¿Se siente enfadado cuando está cerca de su familiar?",
      "6. ¿Cree que el cuidado afecta negativamente a sus relaciones con otros miembros de la familia?",
      "7. ¿Teme por el futuro que le espera a su familiar?",
      "8. ¿Siente que su familiar depende exclusivamente de usted?",
      "9. ¿Se siente tenso o agotado cuando está cerca de su familiar?",
      "10. ¿Cree que su salud ha empeorado a causa de tener que cuidar a su familiar?",
      "11. ¿Siente que no tiene tanta intimidad como le gustaría?",
      "12. ¿Cree que su vida social se ha visto afectada negativamente?",
      "13. ¿Se siente incómodo por distanciarse de sus amigos?",
      "14. ¿Cree que su familiar espera que usted sea la única persona que le cuide?",
      "15. ¿Cree que no tiene suficientes ingresos económicos para costear los gastos del cuidado?",
      "16. ¿Siente que no será capaz de cuidar a su familiar por mucho más tiempo?",
      "17. ¿Siente que ha perdido el control de su propia vida desde la enfermedad?",
      "18. ¿Desearía poder encargar el cuidado de su familiar a otra persona?",
      "19. ¿Se siente inseguro acerca de lo que debe hacer con su familiar?",
      "20. ¿Siente que debería hacer más por su familiar?",
      "21. ¿Cree que podría cuidar mejor a su familiar?",
      "22. En general, ¿se siente sobrecargado por tener que cuidar a su familiar?"
    ];

    zContainer.innerHTML = zaritShortQuestions.map((q, idx) => `
      <div class="q-item" style="padding: 8px 12px; margin-bottom: 8px;">
        <div style="font-size:12px; font-weight:600; margin-bottom: 4px;">${q}</div>
        <div style="display:flex; justify-content:space-between; gap:4px; font-size:11px;">
          <label><input type="radio" name="z_q_${idx}" value="1" checked onchange="updateZaritModalTotal()"> Nunca (1)</label>
          <label><input type="radio" name="z_q_${idx}" value="2" onchange="updateZaritModalTotal()"> Rara vez (2)</label>
          <label><input type="radio" name="z_q_${idx}" value="3" onchange="updateZaritModalTotal()"> A veces (3)</label>
          <label><input type="radio" name="z_q_${idx}" value="4" onchange="updateZaritModalTotal()"> Bastantes veces (4)</label>
          <label><input type="radio" name="z_q_${idx}" value="5" onchange="updateZaritModalTotal()"> Casi siempre (5)</label>
        </div>
      </div>
    `).join("");
  }
}

// Modal update helpers
function updateBarthelModalTotal() {
  let tot = 0;
  barthelItemsDef.forEach((_, idx) => {
    const sel = document.querySelector(`input[name="b_q_${idx}"]:checked`);
    if (sel) tot += Number(sel.value);
  });
  document.getElementById("modal-barthel-total").textContent = tot;
}
function applyBarthelScore() {
  const tot = Number(document.getElementById("modal-barthel-total").textContent);
  document.getElementById("vmd-barthel").value = tot;
  closeModal("modal-barthel");
  calcVMD();
}

function updateLawtonModalTotal() {
  let tot = 0;
  lawtonItemsDef.forEach((_, idx) => {
    const sel = document.querySelector(`input[name="l_q_${idx}"]:checked`);
    if (sel) tot += Number(sel.value);
  });
  document.getElementById("modal-lawton-total").textContent = tot;
}
function applyLawtonScore() {
  const tot = Number(document.getElementById("modal-lawton-total").textContent);
  document.getElementById("vmd-lawton").value = tot;
  closeModal("modal-lawton");
  calcVMD();
}

function updatePfeifferModalTotal() {
  let errors = 0;
  pfeifferItemsDef.forEach((_, idx) => {
    const sel = document.querySelector(`input[name="p_q_${idx}"]:checked`);
    if (sel) errors += Number(sel.value);
  });
  document.getElementById("modal-pfeiffer-total").textContent = errors;
}
function applyPfeifferScore() {
  const errors = Number(document.getElementById("modal-pfeiffer-total").textContent);
  document.getElementById("vmd-pfeiffer").value = errors;
  closeModal("modal-pfeiffer");
  calcVMD();
}

function updateMnaModalTotal() {
  let tot = 0;
  mnaItemsDef.forEach((_, idx) => {
    const sel = document.querySelector(`input[name="m_q_${idx}"]:checked`);
    if (sel) tot += Number(sel.value);
  });
  document.getElementById("modal-mna-total").textContent = tot;
}
function applyMnaScore() {
  const tot = Number(document.getElementById("modal-mna-total").textContent);
  document.getElementById("vmd-mna-sf").value = tot;
  closeModal("modal-mna-sf");
  calcVMD();
}

function updateGijonModalTotal() {
  let tot = 0;
  gijonItemsDef.forEach((_, idx) => {
    const sel = document.querySelector(`input[name="g_q_${idx}"]:checked`);
    if (sel) tot += Number(sel.value);
  });
  document.getElementById("modal-gijon-total").textContent = tot;
}
function applyGijonScore() {
  const tot = Number(document.getElementById("modal-gijon-total").textContent);
  document.getElementById("vmd-gijon").value = tot;
  closeModal("modal-gijon");
  calcVMD();
}

function updateZaritModalTotal() {
  let tot = 0;
  for (let idx = 0; idx < 22; idx++) {
    const sel = document.querySelector(`input[name="z_q_${idx}"]:checked`);
    if (sel) tot += Number(sel.value);
  }
  document.getElementById("modal-zarit-total").textContent = tot;
}
function applyZaritScore() {
  const tot = Number(document.getElementById("modal-zarit-total").textContent);
  document.getElementById("vmd-zarit").value = tot;
  closeModal("modal-zarit");
  calcVMD();
}

function calcModalCP() {
  const bili = Number(document.getElementById("cp-m-bili").value);
  const alb = Number(document.getElementById("cp-m-alb").value);
  const inr = Number(document.getElementById("cp-m-inr").value);
  const asc = Number(document.getElementById("cp-m-asc").value);
  const enc = Number(document.getElementById("cp-m-enc").value);
  const tot = bili + alb + inr + asc + enc;

  document.getElementById("cp-m-total").textContent = tot + " pts";
  const descEl = document.getElementById("cp-m-class");
  if (tot <= 6) {
    descEl.textContent = "GRADO A (5-6 puntos) - Compensada (0)";
    descEl.style.color = "#166534";
  } else if (tot <= 9) {
    descEl.textContent = "GRADO B (7-9 puntos) - Compromiso funcional (1)";
    descEl.style.color = "#854d0e";
  } else {
    descEl.textContent = "GRADO C (10-15 puntos) - Descompensada (2)";
    descEl.style.color = "#991b1b";
  }
}

function applyCPScore() {
  const totText = document.getElementById("cp-m-class").textContent;
  let grade = "GRADO A";
  if (totText.includes("GRADO B")) grade = "GRADO B";
  if (totText.includes("GRADO C")) grade = "GRADO C";
  
  document.getElementById("vmd-cp").value = grade;
  closeModal("modal-cp");
  calcVMD();
}

// -------------------------------------------------------------
// 10. PRINTABLE PAI REPORT POPULATION
// -------------------------------------------------------------
function renderPrintablePAI() {
  if (!currentPatientId) return;
  const p = patients.find(item => item.id === currentPatientId);
  if (!p) return;

  const res = evaluatePatient(p);

  document.getElementById("rep-date").textContent = new Date().toLocaleDateString("es-CO");
  document.getElementById("rep-code").textContent = "VMD-" + p.id + "-" + new Date().getFullYear();

  document.getElementById("rep-name").textContent = p.name;
  document.getElementById("rep-id").textContent = p.id;
  document.getElementById("rep-age").textContent = p.age || "--";
  document.getElementById("rep-eps").textContent = p.eps || "Sura / EPS";
  document.getElementById("rep-type").textContent = p.vmdType || "VMD inicial";
  document.getElementById("rep-ambit").textContent = res.modalidad.split("(")[0].trim();
  document.getElementById("rep-provider").textContent = p.provider || "Optimus Health IPS";

  // Dim T
  const ioccItems = [];
  if (p.nyha !== "No aplica") ioccItems.push(`NYHA: ${p.nyha} (${res.sNYHA})`);
  if (p.gold !== "No aplica") ioccItems.push(`GOLD: ${p.gold} (${res.sGOLD})`);
  if (p.cp !== "No aplica") ioccItems.push(`Child-Pugh: ${p.cp} (${res.sCP})`);
  if (p.erc !== "No aplica") ioccItems.push(`ERC: ${p.erc} (${res.sERC})`);
  document.getElementById("rep-dim-t-scales").textContent = ioccItems.join(", ") || "No aplica";
  document.getElementById("rep-dim-t-val").textContent = res.T;
  document.getElementById("rep-dim-t-desc").textContent = res.T === 2 ? "Alta Severidad" : (res.T === 1 ? "Media Severidad" : "Baja Severidad");

  // Dim Z
  document.getElementById("rep-dim-z-scales").textContent = `Barthel: ${p.barthel} pts (${res.sBarthel}) | Lawton: ${p.lawton} pts (${res.sLawton})`;
  document.getElementById("rep-dim-z-val").textContent = res.Z;
  document.getElementById("rep-dim-z-desc").textContent = res.Z === 2 ? "Baja Funcionalidad (Dependencia Severa)" : (res.Z === 1 ? "Media Funcionalidad" : "Alta Funcionalidad");

  // Dim AL
  document.getElementById("rep-dim-al-scales").textContent = `MNA-SF: ${p.mnaSf} pts (${res.sMnaSf}) | MNA: ${p.mnaC}`;
  document.getElementById("rep-dim-al-val").textContent = res.AL;
  document.getElementById("rep-dim-al-desc").textContent = res.AL === 2 ? "Malnutrición Confirmada" : (res.AL === 1 ? "Riesgo de Malnutrición" : "Estado Nutricional Normal");

  // Dim AF
  document.getElementById("rep-dim-af-scales").textContent = `Pfeiffer: ${p.pfeiffer} errores (${res.sPfeiffer}) | MMSE: ${p.mmse}`;
  document.getElementById("rep-dim-af-val").textContent = res.AF;
  document.getElementById("rep-dim-af-desc").textContent = res.AF === 2 ? "Deterioro Cognitivo Severo" : (res.AF === 1 ? "Deterioro Moderado" : "Función Cognitiva Normal");

  // Dim AR
  document.getElementById("rep-dim-ar-scales").textContent = `Gijón: ${p.gijon} pts (${res.sGijon}) | Zarit: ${p.zarit} pts (${res.sZarit})`;
  document.getElementById("rep-dim-ar-val").textContent = res.AR;
  document.getElementById("rep-dim-ar-desc").textContent = res.AR === 2 ? "Problema Social / Sobrecarga Intensa" : (res.AR === 1 ? "Riesgo Social / Sobrecarga Leve" : "Buena Situación Social");

  // Risk profile summary
  document.getElementById("rep-risk-renal").textContent = (document.getElementById("res-ckdepi-val")?.textContent || "36.2 ml/min") + " (" + (document.getElementById("badge-risk-ckdepi")?.textContent || "G3b") + ")";
  document.getElementById("rep-risk-hepatic").textContent = (document.getElementById("res-meld-val")?.textContent || "21 pts") + " (" + (document.getElementById("badge-risk-meld")?.textContent || "Riesgo Alto") + ")";
  document.getElementById("rep-risk-bode").textContent = (document.getElementById("res-bodex-val")?.textContent || "5 pts") + " (" + (document.getElementById("badge-risk-bodex")?.textContent || "Cuartil 3") + ")";
  document.getElementById("rep-risk-falls").textContent = (document.getElementById("res-downton-val")?.textContent || "4 pts") + " (" + (document.getElementById("badge-risk-downton")?.textContent || "Alto Riesgo") + ")";
  document.getElementById("rep-risk-braden").textContent = (document.getElementById("res-braden-val")?.textContent || "13 pts") + " (" + (document.getElementById("badge-risk-braden")?.textContent || "Riesgo Moderado") + ")";
  document.getElementById("rep-risk-lace").textContent = (document.getElementById("res-lace-val")?.textContent || "12 pts") + " (" + (document.getElementById("badge-risk-lace")?.textContent || "Alto Riesgo") + ")";

  // Dictamen
  document.getElementById("rep-complexity-title").textContent = res.complexityText.toUpperCase() + ` (VALOR FINAL: ${res.finalScore})`;
  document.getElementById("rep-decision-text").textContent = res.isEligible ? 
    "CANDIDATO ELEGIBLE - INGRESO APROBADO A PROGRAMA NEW CARE" : 
    "NO CUMPLE CRITERIOS DE INGRESO - MANEJO EN ATENCIÓN PRIMARIA";
  document.getElementById("rep-modalidad-badge").textContent = res.modalidad.toUpperCase();

  document.getElementById("rep-explanation-text").innerHTML = res.aggravated ? 
    `La severidad clínica de base es <strong>T = ${res.T}</strong>. Al verificarse afectación severa en las esferas multidimensionales (Z=${res.Z}, AL=${res.AL}, AF=${res.AF}, AR=${res.AR}), el algoritmo New Care incrementa la complejidad final a <strong>${res.complexityText} (${res.finalScore})</strong>.` :
    `La severidad clínica es <strong>T = ${res.T}</strong>, determinando el nivel de <strong>${res.complexityText} (${res.finalScore})</strong> sin requerir escalamiento por afectación multidimensional.`;

  // PAI
  document.getElementById("rep-pai-visitas").textContent = res.cadencia.split("\n")[0] || "-";
  document.getElementById("rep-pai-llamadas").textContent = res.cadencia.split("\n")[1] || "Seguimiento telefónico pautado";

  document.getElementById("rep-pai-san").textContent = p.pai?.sanitarias || "Control periódico de síntomas y adherencia farmacológica.";
  document.getElementById("rep-pai-nut").textContent = p.pai?.nutricionales || "Recomendaciones nutricionales según patología.";
  document.getElementById("rep-pai-psi").textContent = p.pai?.psicologicas || "Apoyo emocional y educación al paciente y familia.";
  document.getElementById("rep-pai-soc").textContent = p.pai?.sociales || "Acompañamiento social y articulación con red comunitaria.";

  // Signatures
  if (currentUser.role === "MED") {
    document.getElementById("rep-sig-med").textContent = currentUser.name;
  } else if (currentUser.role === "ENF") {
    document.getElementById("rep-sig-enf").textContent = currentUser.name;
  } else if (currentUser.role === "TS") {
    document.getElementById("rep-sig-ts").textContent = currentUser.name;
  }
}

// -------------------------------------------------------------
// 11. EXPORT / IMPORT (JSON & EXCEL CSV)
// -------------------------------------------------------------
function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patients, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `NewCare_VMD_Pacientes_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function triggerImportJSON() {
  document.getElementById("import-json-file").click();
}

function handleImportJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        patients = imported;
        saveToStorage();
        renderPatientsTable();
        if (patients.length > 0) loadPatient(patients[0].id);
        alert(`Se importaron exitosamente ${patients.length} pacientes.`);
      } else {
        alert("El archivo no tiene el formato de lista de pacientes válido.");
      }
    } catch (err) {
      alert("Error al leer el archivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

function exportDataCSV() {
  // Compatible with 51 official columns
  const headers = [
    "Id_usuario", "Nombre y Apellidos", "Fecha Nacimiento", "Fecha Inicio Valoración", "Tipo Valoración",
    "Fecha Evaluación Severidad", "Insuf_cardiaca (NYHA)", "Valor NYHA", "Insuf_respiratoria-EPOC (GOLD)", "Valor Gold",
    "Insuf_hepática (CHILD-PUGH)", "Valor Child-Pugh", "CP Ascitis", "CP Albumina", "CP Bilirrubina", "CP Protombina", "CP Encefalopatía",
    "Insuf_Renal (ERC)", "Valor ERC", "Valor Severidad",
    "Fecha Evaluación Funcionalidad", "Barthel", "Valor Barthel", "Lawton Brody", "Valor Lawton Brody", "Valor Funcionalidad",
    "Fecha Evaluación Cognitividad", "Test de PFEIFFER", "Valor Pfeiffer", "MINIMENTAL TEST", "Valor Minimental", "Valor Cognitividad",
    "Fecha Evaluación Nutricional", "MNA-SF Cribaje", "Valor MNA-SF", "MNA Completo", "Valor MNA", "Valor Nutricional",
    "Fecha Evaluación Social", "Gijón", "Valor Gijón", "Zarit", "Valor Zarit", "Valor Social",
    "Valor Final", "Tipo Complejidad",
    "SANITARIAS", "NUTRICIONALES", "PSICOLÓGICAS", "SOCIALES", "OBSERVACIONES GENERALES"
  ];

  const rows = [headers.join(";")];

  patients.forEach(p => {
    const res = evaluatePatient(p);
    const row = [
      p.id,
      `"${p.name}"`,
      p.birthdate || "",
      p.vmdDate || "",
      `"${p.vmdType || "VMD inicial"}"`,
      p.vmdDate || "",
      p.nyha || "No aplica",
      res.sNYHA,
      p.gold || "No aplica",
      res.sGOLD,
      p.cp || "No aplica",
      res.sCP,
      "", "", "", "", "", // CP subitems
      p.erc || "No aplica",
      res.sERC,
      res.T,
      p.vmdDate || "",
      p.barthel || 100,
      res.sBarthel,
      p.lawton || 8,
      res.sLawton,
      res.Z,
      p.vmdDate || "",
      p.pfeiffer || 0,
      res.sPfeiffer,
      p.mmse || "No Aplica",
      res.sMmse,
      res.AF,
      p.vmdDate || "",
      p.mnaSf || 14,
      res.sMnaSf,
      p.mnaC || "No Aplica",
      res.sMnaC,
      res.AL,
      p.vmdDate || "",
      p.gijon || 5,
      res.sGijon,
      p.zarit || 20,
      res.sZarit,
      res.AR,
      res.finalScore,
      `"${res.complexityText}"`,
      `"${p.pai?.sanitarias || ""}"`,
      `"${p.pai?.nutricionales || ""}"`,
      `"${p.pai?.psicologicas || ""}"`,
      `"${p.pai?.sociales || ""}"`,
      `"${p.nyhaObs || ""} ${p.goldObs || ""} ${p.ercObs || ""}"`
    ];
    rows.push(row.join(";"));
  });

  const csvContent = "\uFEFF" + rows.join("\n"); // Add BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `Plantilla_VMD_NewCare_51Columnas_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Global bootstrap

// ============================================================================
// MODULO: EQUIPO DE SALUD INTERDISCIPLINARIO & GESTION DE ROLES DINÁMICOS
// ============================================================================
const STORAGE_PROF_KEY = "newcare_vmd_profesionales_v1";
const STORAGE_ROLES_KEY = "newcare_vmd_roles_v2";

// Catálogo Base de Roles Oficiales New Care (Personalizable y Extensible)
const defaultRoles = [
  { id: "ROLE-001", name: "Médico Internista / Geriatra", category: "MED" },
  { id: "ROLE-002", name: "Médico General de Cronicidad", category: "MED" },
  { id: "ROLE-003", name: "Enfermera(o) de Práctica Avanzada (EPA)", category: "ENF" },
  { id: "ROLE-004", name: "Enfermera(o) Jefe de Cronicidad", category: "ENF" },
  { id: "ROLE-005", name: "Trabajador(a) Social Sociosanitaria", category: "TS" },
  { id: "ROLE-006", name: "Nutricionista Clínico(a)", category: "NUT" },
  { id: "ROLE-007", name: "Psicólogo(a) Clínico(a)", category: "PSI" },
  { id: "ROLE-008", name: "Fisioterapeuta / Terapia Respiratoria", category: "TERAP" },
  { id: "ROLE-009", name: "Coordinador(a) / Junta de Cronicidad", category: "COORD" }
];

let stateRoles = [];

function loadRoles() {
  try {
    const raw = localStorage.getItem(STORAGE_ROLES_KEY);
    if (raw) {
      stateRoles = JSON.parse(raw);
    } else {
      stateRoles = JSON.parse(JSON.stringify(defaultRoles));
      saveRoles();
    }
  } catch (e) {
    console.error("Error loading roles", e);
    stateRoles = JSON.parse(JSON.stringify(defaultRoles));
  }
}

function saveRoles() {
  try {
    localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(stateRoles));
  } catch (e) {
    console.error("Error saving roles", e);
  }
}

function getRoleBadgeClass(categoryOrName) {
  const cat = (categoryOrName || "").toUpperCase();
  if (cat.includes("MED")) return "badge-med";
  if (cat.includes("ENF")) return "badge-enf";
  if (cat.includes("TS") || cat.includes("SOC")) return "badge-ts";
  if (cat.includes("NUT")) return "badge-nut";
  if (cat.includes("PSI")) return "badge-psi";
  if (cat.includes("TERAP") || cat.includes("FISIO")) return "badge-terap";
  if (cat.includes("COORD") || cat.includes("JUNTA")) return "badge-coord";
  return "badge-gen";
}

const defaultProfesionales = [
  {
    id: "EQ-001",
    nombre: "Dr. Carlos Restrepo Mendoza",
    rol: "MED",
    rolNombre: "Médico Internista / Geriatra",
    cedula: "71234567",
    registro: "RM-98432-COL",
    especialidad: "Medicina Interna y Cronicidad IOCC",
    telefono: "+57 310 456 7890",
    email: "carlos.restrepo@optimushealth.co",
    estado: "Activo"
  },
  {
    id: "EQ-002",
    nombre: "Dra. Valentina Gómez",
    rol: "MED",
    rolNombre: "Médica General / Gestora de Casos",
    cedula: "1023456789",
    registro: "RM-112345-COL",
    especialidad: "Atención Primaria y Enlace Ambulatorio",
    telefono: "+57 311 234 5678",
    email: "valentina.gomez@optimushealth.co",
    estado: "Activo"
  },
  {
    id: "EQ-003",
    nombre: "Enf. Laura Restrepo",
    rol: "ENF",
    rolNombre: "Enfermera de Práctica Avanzada (EPA)",
    cedula: "43567890",
    registro: "TE-54321-COL",
    especialidad: "Cuidados Continuos, Fragilidad y Adherencia",
    telefono: "+57 315 876 5432",
    email: "laura.restrepo@optimushealth.co",
    estado: "Activo"
  },
  {
    id: "EQ-004",
    nombre: "Lic. Diana Patricia Morales",
    rol: "TS",
    rolNombre: "Trabajadora Social Sociosanitaria",
    cedula: "32456781",
    registro: "TS-33211-COL",
    especialidad: "Redes de Apoyo y Sobrecarga del Cuidador",
    telefono: "+57 318 654 3210",
    email: "diana.morales@optimushealth.co",
    estado: "Activo"
  },
  {
    id: "EQ-005",
    nombre: "Dr. Roberto Mejía",
    rol: "COORD",
    rolNombre: "Coordinador Junta de Cronicidad New Care",
    cedula: "9876543",
    registro: "RM-44332-COL",
    especialidad: "Dirección Médica y Aseguramiento de Calidad",
    telefono: "+57 300 112 2334",
    email: "roberto.mejia@optimushealth.co",
    estado: "Activo"
  }
];

let stateProfesionales = [];

function loadProfessionals() {
  loadRoles();
  try {
    const raw = localStorage.getItem(STORAGE_PROF_KEY);
    if (raw) {
      stateProfesionales = JSON.parse(raw);
      // Sanitización: si algún profesional tiene el texto antiguo "Evaluador Senior", corregirlo
      stateProfesionales.forEach(p => {
        if (p.rolNombre === "Médico Internista / Evaluador Senior") {
          p.rolNombre = "Médico Internista / Geriatra";
        }
      });
      saveProfessionals();
    } else {
      stateProfesionales = JSON.parse(JSON.stringify(defaultProfesionales));
      saveProfessionals();
    }
  } catch (e) {
    console.error("Error loading professionals", e);
    stateProfesionales = JSON.parse(JSON.stringify(defaultProfesionales));
  }
}

function saveProfessionals() {
  try {
    localStorage.setItem(STORAGE_PROF_KEY, JSON.stringify(stateProfesionales));
    if (window.supabaseClient) {
      syncProfessionalsToSupabase();
    }
  } catch (e) {
    console.error("Error saving professionals", e);
  }
}

function populateEvaluatorDropdowns() {
  const sel = document.getElementById("active-evaluator-select");
  if (!sel) return;
  
  sel.innerHTML = "";
  stateProfesionales.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.nombre} (${p.rolNombre || p.rol})`;
    opt.style.backgroundColor = "#0f172a";
    opt.style.color = "#ffffff";
    sel.appendChild(opt);
  });

  const activeId = localStorage.getItem("newcare_active_evaluator_id") || (stateProfesionales[0] ? stateProfesionales[0].id : "");
  if (activeId) {
    sel.value = activeId;
    updateActiveEvaluatorBadge(activeId);
  }
}

function onEvaluatorChange(profId) {
  localStorage.setItem("newcare_active_evaluator_id", profId);
  updateActiveEvaluatorBadge(profId);
}

function updateActiveEvaluatorBadge(profId) {
  const prof = stateProfesionales.find(p => p.id === profId);
  if (!prof) return;

  const badge = document.getElementById("header-user-role-badge");
  if (badge) {
    badge.textContent = prof.rolNombre || prof.rol;
    badge.className = "badge-role " + getRoleBadgeClass(prof.rol);
  }

  // Actualizar objeto currentUser para trazabilidad de auditoría
  currentUser = {
    name: prof.nombre,
    role: prof.rol,
    rolNombre: prof.rolNombre,
    reg: prof.registro,
    doc: prof.cedula
  };
}

function renderTeamDirectory() {
  const tbody = document.getElementById("equipo-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  stateProfesionales.forEach(p => {
    const tr = document.createElement("tr");
    const roleBadgeClass = getRoleBadgeClass(p.rol);
    const statusColor = p.estado === "Activo" ? "#16a34a" : "#94a3b8";

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: #1e293b;">${p.nombre}</div>
        <div style="font-size: 11px; color: #64748b;">ID: ${p.id}</div>
      </td>
      <td>
        <span class="badge-role ${roleBadgeClass}">${p.rolNombre || p.rol}</span>
      </td>
      <td>${p.cedula || "N/A"}</td>
      <td><strong>${p.registro || "Pendiente"}</strong></td>
      <td>${p.especialidad || "General"}</td>
      <td>
        <div style="font-size: 12px;">${p.telefono || "Sin tel."}</div>
        <div style="font-size: 11px; color: #2563eb;">${p.email || ""}</div>
      </td>
      <td>
        <span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600; font-size: 12px; color: ${statusColor};">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: ${statusColor};"></span>
          ${p.estado || "Activo"}
        </span>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-secondary btn-sm" onclick="editProfessionalRecord('${p.id}')" title="Editar profesional">
          <i data-lucide="edit-2" style="width: 13px; height: 13px;"></i>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="deleteProfessionalRecord('${p.id}')" title="Eliminar profesional" style="color: #ef4444;">
          <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

// ----------------------------------------------------------------------------
// GESTIÓN DINÁMICA DE ROLES EN MODAL DE PROFESIONAL
// ----------------------------------------------------------------------------
function populateRoleSelectOptions(selectedRoleIdOrName) {
  const sel = document.getElementById("edit-prof-role");
  if (!sel) return;

  sel.innerHTML = "";
  stateRoles.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.name}`;
    sel.appendChild(opt);
  });

  // Opción especial para crear nuevo rol
  const optNew = document.createElement("option");
  optNew.value = "__NEW_CUSTOM_ROLE__";
  optNew.textContent = "➕ Agregar / Definir Nuevo Rol...";
  optNew.style.color = "#2563eb";
  optNew.style.fontWeight = "700";
  sel.appendChild(optNew);

  // Seleccionar rol adecuado
  if (selectedRoleIdOrName) {
    const byId = stateRoles.find(r => r.id === selectedRoleIdOrName);
    const byName = stateRoles.find(r => r.name.toLowerCase() === selectedRoleIdOrName.toLowerCase());
    if (byId) {
      sel.value = byId.id;
    } else if (byName) {
      sel.value = byName.id;
    } else {
      sel.selectedIndex = 0;
    }
  } else {
    sel.selectedIndex = 0;
  }

  onModalRoleChange(sel.value);
}

function onModalRoleChange(val) {
  const box = document.getElementById("inline-custom-role-box");
  if (!box) return;

  if (val === "__NEW_CUSTOM_ROLE__") {
    box.style.display = "block";
    const nameInput = document.getElementById("inline-custom-role-name");
    if (nameInput) {
      nameInput.value = "";
      nameInput.focus();
    }
  } else {
    box.style.display = "none";
  }
}

function openNewProfessionalModal() {
  document.getElementById("edit-prof-id").value = "";
  document.getElementById("edit-prof-name").value = "";
  document.getElementById("edit-prof-doc").value = "";
  document.getElementById("edit-prof-reg").value = "";
  document.getElementById("edit-prof-spec").value = "";
  document.getElementById("edit-prof-phone").value = "";
  document.getElementById("edit-prof-email").value = "";
  document.getElementById("modal-new-prof-title").textContent = "Registrar Nuevo Miembro del Equipo de Salud";
  
  populateRoleSelectOptions("ROLE-001"); // Por defecto: Médico Internista / Geriatra
  openModal("modal-new-prof");
}

function editProfessionalRecord(id) {
  const p = stateProfesionales.find(x => x.id === id);
  if (!p) return;

  document.getElementById("edit-prof-id").value = p.id;
  document.getElementById("edit-prof-name").value = p.nombre || "";
  document.getElementById("edit-prof-doc").value = p.cedula || "";
  document.getElementById("edit-prof-reg").value = p.registro || "";
  document.getElementById("edit-prof-spec").value = p.especialidad || "";
  document.getElementById("edit-prof-phone").value = p.telefono || "";
  document.getElementById("edit-prof-email").value = p.email || "";
  document.getElementById("modal-new-prof-title").textContent = "Editar Miembro del Equipo de Salud";

  populateRoleSelectOptions(p.rolNombre || p.rol);
  openModal("modal-new-prof");
}

function saveProfessionalRecord() {
  const idField = document.getElementById("edit-prof-id").value;
  const nombre = document.getElementById("edit-prof-name").value.trim();
  const cedula = document.getElementById("edit-prof-doc").value.trim();
  const registro = document.getElementById("edit-prof-reg").value.trim();
  const especialidad = document.getElementById("edit-prof-spec").value.trim();
  const telefono = document.getElementById("edit-prof-phone").value.trim();
  const email = document.getElementById("edit-prof-email").value.trim();
  const roleSelectVal = document.getElementById("edit-prof-role").value;

  if (!nombre) {
    alert("Por favor ingrese los nombres y apellidos del profesional.");
    return;
  }

  let finalRolNombre = "";
  let finalRolCat = "MED";

  if (roleSelectVal === "__NEW_CUSTOM_ROLE__") {
    const customName = document.getElementById("inline-custom-role-name").value.trim();
    const customCat = document.getElementById("inline-custom-role-cat").value;
    if (!customName) {
      alert("Por favor ingrese el nombre del nuevo rol personalizado.");
      return;
    }
    // Registrar el nuevo rol en el catálogo
    const newRoleId = "ROLE-" + Date.now();
    stateRoles.push({ id: newRoleId, name: customName, category: customCat });
    saveRoles();
    finalRolNombre = customName;
    finalRolCat = customCat;
  } else {
    const foundRole = stateRoles.find(r => r.id === roleSelectVal);
    if (foundRole) {
      finalRolNombre = foundRole.name;
      finalRolCat = foundRole.category || "MED";
    } else {
      finalRolNombre = roleSelectVal;
      finalRolCat = "MED";
    }
  }

  if (idField) {
    // Editar profesional existente
    const idx = stateProfesionales.findIndex(x => x.id === idField);
    if (idx !== -1) {
      stateProfesionales[idx] = {
        ...stateProfesionales[idx],
        nombre,
        rol: finalRolCat,
        rolNombre: finalRolNombre,
        cedula,
        registro,
        especialidad,
        telefono,
        email
      };
    }
  } else {
    // Crear nuevo profesional
    const newId = "EQ-" + String(stateProfesionales.length + 1).padStart(3, "0");
    stateProfesionales.push({
      id: newId,
      nombre,
      rol: finalRolCat,
      rolNombre: finalRolNombre,
      cedula,
      registro,
      especialidad,
      telefono,
      email,
      estado: "Activo"
    });
  }

  saveProfessionals();
  populateEvaluatorDropdowns();
  renderTeamDirectory();
  closeModal("modal-new-prof");
  alert(`✅ Profesional guardado exitosamente:

• Nombre: ${nombre}
• Rol Asignado: ${finalRolNombre}`);
}

function deleteProfessionalRecord(id) {
  if (stateProfesionales.length <= 1) {
    alert("Debe existir al menos un profesional registrado en el equipo.");
    return;
  }
  if (!confirm("¿Está seguro de eliminar este profesional del directorio?")) return;

  stateProfesionales = stateProfesionales.filter(p => p.id !== id);
  saveProfessionals();
  populateEvaluatorDropdowns();
  renderTeamDirectory();
}

// ----------------------------------------------------------------------------
// MODAL GESTOR DE CATÁLOGO DE ROLES (CREAR, EDITAR, RENOMBRAR, ELIMINAR)
// ----------------------------------------------------------------------------
function openRolesManagementModal() {
  resetRoleForm();
  renderRolesManagerList();
  openModal("modal-manage-roles");
}

function renderRolesManagerList() {
  const container = document.getElementById("roles-manager-list");
  const countLabel = document.getElementById("roles-count-label");
  if (!container) return;

  if (countLabel) countLabel.textContent = `${stateRoles.length} roles`;
  container.innerHTML = "";

  stateRoles.forEach(r => {
    const item = document.createElement("div");
    item.style.padding = "10px 14px";
    item.style.borderBottom = "1px solid #f1f5f9";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.justifyContent = "space-between";
    item.style.gap = "10px";

    const badgeClass = getRoleBadgeClass(r.category);

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="badge-role ${badgeClass}">${r.category}</span>
        <span style="font-weight: 700; color: #1e293b; font-size: 13px;">${r.name}</span>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary btn-sm" onclick="editRoleInManager('${r.id}')" title="Modificar denominación del rol">
          <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="deleteRoleInManager('${r.id}')" title="Eliminar rol" style="color: #ef4444;">
          <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
        </button>
      </div>
    `;
    container.appendChild(item);
  });

  if (window.lucide) lucide.createIcons();
}

function editRoleInManager(roleId) {
  const r = stateRoles.find(x => x.id === roleId);
  if (!r) return;

  document.getElementById("manage-role-edit-id").value = r.id;
  document.getElementById("manage-role-name").value = r.name;
  document.getElementById("manage-role-cat").value = r.category || "MED";
  document.getElementById("manage-role-form-title").textContent = "✏️ Modificar / Renombrar Rol";
  document.getElementById("btn-cancel-edit-role").style.display = "inline-flex";
}

function resetRoleForm() {
  document.getElementById("manage-role-edit-id").value = "";
  document.getElementById("manage-role-name").value = "";
  document.getElementById("manage-role-cat").value = "MED";
  document.getElementById("manage-role-form-title").textContent = "+ Agregar Nuevo Rol al Catálogo";
  document.getElementById("btn-cancel-edit-role").style.display = "none";
}

function saveRoleFromManager() {
  const editId = document.getElementById("manage-role-edit-id").value;
  const name = document.getElementById("manage-role-name").value.trim();
  const category = document.getElementById("manage-role-cat").value;

  if (!name) {
    alert("Por favor ingrese la denominación del rol.");
    return;
  }

  if (editId) {
    // Actualizar rol existente
    const idx = stateRoles.findIndex(x => x.id === editId);
    if (idx !== -1) {
      const oldName = stateRoles[idx].name;
      stateRoles[idx].name = name;
      stateRoles[idx].category = category;

      // Actualizar en cascada a los profesionales que tenían el nombre antiguo
      stateProfesionales.forEach(p => {
        if (p.rolNombre === oldName) {
          p.rolNombre = name;
          p.rol = category;
        }
      });
      saveProfessionals();
    }
  } else {
    // Crear nuevo rol
    const newId = "ROLE-" + Date.now();
    stateRoles.push({ id: newId, name, category });
  }

  saveRoles();
  resetRoleForm();
  renderRolesManagerList();
  renderTeamDirectory();
  populateEvaluatorDropdowns();
  alert("Rol guardado exitosamente en el catálogo New Care.");
}

function deleteRoleInManager(roleId) {
  if (stateRoles.length <= 1) {
    alert("Debe existir al menos un rol en el catálogo.");
    return;
  }
  const r = stateRoles.find(x => x.id === roleId);
  if (!r) return;

  // Verificar si hay profesionales usando este rol
  const inUse = stateProfesionales.some(p => p.rolNombre === r.name);
  if (inUse) {
    alert(`No se puede eliminar el rol "${r.name}" porque actualmente está asignado a miembros activos del equipo de salud.`);
    return;
  }

  if (!confirm(`¿Está seguro de eliminar el rol "${r.name}"?`)) return;

  stateRoles = stateRoles.filter(x => x.id !== roleId);
  saveRoles();
  renderRolesManagerList();
}
// MODULO: CONEXION NUBE SUPABASE (POSTGRESQL & REALTIME SYNC)
// ============================================================================
const SUPABASE_URL_KEY = "newcare_supabase_url";
const SUPABASE_ANON_KEY = "newcare_supabase_anon_key";
const DEFAULT_SUPABASE_URL = "https://anradajzsjjrolmfzepv.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_2A-62cNjZl9ktbJSW90pVw_kjoxWPO_";

window.supabaseClient = null;

function openSupabaseModal() {
  const urlInput = document.getElementById("supabase-url-input");
  const keyInput = document.getElementById("supabase-key-input");
  const fb = document.getElementById("supabase-status-feedback");
  if (fb) fb.style.display = "none";

  if (urlInput) {
    urlInput.value = localStorage.getItem(SUPABASE_URL_KEY) || DEFAULT_SUPABASE_URL;
  }
  if (keyInput) {
    keyInput.value = localStorage.getItem(SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_KEY;
  }
  openModal("modal-supabase");
}

function initSupabase() {
  let url = localStorage.getItem(SUPABASE_URL_KEY) || DEFAULT_SUPABASE_URL;
  if (url.includes("sijj")) { url = DEFAULT_SUPABASE_URL; localStorage.setItem(SUPABASE_URL_KEY, url); }
  const key = localStorage.getItem(SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_KEY;

  if (!key) {
    updateCloudStatusUI(false, "Modo Local (Offline)");
    return;
  }

  // Esperar activamente al script del CDN si aún no ha terminado de parsear
  let attempts = 0;
  function attemptConnection() {
    attempts++;
    if (window.supabase) {
      try {
        window.supabaseClient = window.supabase.createClient(url, key);
        updateCloudStatusUI(true, "Supabase Nube Activa");
        syncAllWithSupabase();
      } catch (e) {
        console.error("Error al inicializar cliente Supabase", e);
        updateCloudStatusUI(false, "Error en credenciales Supabase");
      }
    } else if (attempts < 30) {
      setTimeout(attemptConnection, 150); // Reintenta cada 150ms hasta 4.5 segundos
    } else {
      console.warn("CDN de Supabase no respondió a tiempo");
      updateCloudStatusUI(false, "Modo Local (Offline)");
    }
  }

  attemptConnection();
}

function updateCloudStatusUI(connected, text) {
  const dot = document.getElementById("supabase-indicator-dot");
  const label = document.getElementById("supabase-status-text");
  if (dot) dot.style.background = connected ? "#22c55e" : "#38bdf8";
  if (label) label.textContent = text;
}

async function testSupabaseConnectionUI() {
  const url = document.getElementById("supabase-url-input").value.trim() || DEFAULT_SUPABASE_URL;
  const key = document.getElementById("supabase-key-input").value.trim() || DEFAULT_SUPABASE_KEY;
  const fb = document.getElementById("supabase-status-feedback");

  if (!key) {
    fb.style.display = "block";
    fb.style.background = "#fee2e2";
    fb.style.color = "#991b1b";
    fb.textContent = "Por favor ingrese la Anon / Publishable Key.";
    return;
  }

  fb.style.display = "block";
  fb.style.background = "#e0f2fe";
  fb.style.color = "#0369a1";
  fb.textContent = "Probando conexión con Supabase...";

  // Si window.supabase no está listo, esperar un momento
  if (!window.supabase) {
    await new Promise(r => setTimeout(r, 600));
  }

  if (!window.supabase) {
    fb.style.background = "#fee2e2";
    fb.style.color = "#991b1b";
    fb.textContent = "El cliente Supabase aún no se ha cargado en el navegador. Espere unos segundos y reintente.";
    return;
  }

  try {
    const testClient = window.supabase.createClient(url, key);
    const { data, error } = await testClient.from("profesionales").select("id").limit(1);

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // AUTO-GUARDADO: Si la prueba fue exitosa, guardar inmediatamente en memoria persistente
    localStorage.setItem(SUPABASE_URL_KEY, url);
    localStorage.setItem(SUPABASE_ANON_KEY, key);
    window.supabaseClient = testClient;
    updateCloudStatusUI(true, "Supabase Nube Activa");
    syncAllWithSupabase();

    fb.style.background = "#dcfce7";
    fb.style.color = "#15803d";
    fb.innerHTML = "<strong>¡Conexión exitosa con Supabase!</strong> Guardado automáticamente. La nube está activa.";
  } catch (err) {
    console.error("Test connection failed", err);
    fb.style.background = "#fee2e2";
    fb.style.color = "#991b1b";
    fb.innerHTML = `<strong>Error de conexión:</strong> ${err.message || "No se pudo comunicar con el proyecto. Verifique que ejecutó el schema_supabase.sql."}`;
  }
}

async function saveSupabaseConfigUI() {
  const url = document.getElementById("supabase-url-input").value.trim() || DEFAULT_SUPABASE_URL;
  const key = document.getElementById("supabase-key-input").value.trim() || DEFAULT_SUPABASE_KEY;

  if (!key) {
    alert("Por favor ingrese la Anon Key de Supabase.");
    return;
  }

  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_ANON_KEY, key);
  initSupabase();
  closeModal("modal-supabase");
  alert("Configuración guardada exitosamente. Supabase Nube Activa.");
}

function disconnectSupabaseUI() {
  if (confirm("¿Desea desconectar la nube de Supabase y volver a almacenamiento local?")) {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY);
    window.supabaseClient = null;
    updateCloudStatusUI(false, "Modo Local (Offline)");
    closeModal("modal-supabase");
    alert("Desconectado de Supabase. El sistema seguirá guardando localmente.");
  }
}

async function syncAllWithSupabase() {
  if (!window.supabaseClient) return;

  try {
    // 1. Cargar profesionales de Supabase
    const { data: profs, error: errP } = await window.supabaseClient.from("profesionales").select("*");
    if (!errP && profs && profs.length > 0) {
      stateProfesionales = profs.map(p => ({ ...p, rolNombre: p.rol_nombre || p.rolNombre || p.rol }));
      localStorage.setItem(STORAGE_PROF_KEY, JSON.stringify(stateProfesionales));
      populateEvaluatorDropdowns();
      renderTeamDirectory();
    } else {
      // Si la tabla está vacía en Supabase, poblarla con los locales
      syncProfessionalsToSupabase();
    }

    // 2. Cargar pacientes de Supabase
    const { data: pacs, error: errPac } = await window.supabaseClient.from("pacientes").select("*");
    if (!errPac && pacs && pacs.length > 0) {
      // Reensamblar formato local
      patients = pacs.map(p => ({
        ...p.datos_completos,
        id: p.id,
        nombre: p.nombre,
        documento: p.documento
      }));

      // 3. Hidratar tabla relacional de seguimientos (multi-dispositivo)
      try {
        const { data: segs, error: errSeg } = await window.supabaseClient
          .from("seguimientos")
          .select("*")
          .order("numero_seguimiento", { ascending: true });
        if (!errSeg && segs && segs.length > 0) {
          const byPac = {};
          segs.forEach(s => {
            const pid = s.paciente_id;
            if (!byPac[pid]) byPac[pid] = [];
            byPac[pid].push(s.datos_completos || {
              id: s.id,
              numero: s.numero_seguimiento,
              fecha: s.fecha_seguimiento,
              motivo: s.motivo_seguimiento,
              evaluadorId: s.evaluador_id,
              evaluadorNombre: s.evaluador_nombre,
              evaluadorRol: s.evaluador_rol,
              score_t: s.score_t,
              score_z: s.score_z,
              score_al: s.score_al,
              score_af: s.score_af,
              score_ar: s.score_ar,
              finalScore: s.score_final,
              complejidad: s.complejidad,
              modalidad: s.modalidad_sugerida,
              metas_pai: s.metas_pai
            });
          });
          patients.forEach(pt => {
            const remoteSegs = byPac[pt.id] || byPac[pt.doc];
            if (remoteSegs && remoteSegs.length > 0) {
              const existingIds = new Set((pt.seguimientos || []).map(x => x.id));
              pt.seguimientos = pt.seguimientos || [];
              remoteSegs.forEach(rs => {
                if (!existingIds.has(rs.id)) pt.seguimientos.push(rs);
              });
              pt.seguimientos.sort((a, b) => (a.numero || 0) - (b.numero || 0));
            }
          });
        }
      } catch (eSeg) {
        console.warn("Tabla seguimientos aún no inicializada en Supabase:", eSeg);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
      renderPatientsTable();
      if (patients.length > 0) loadPatient(patients[0].id);
    } else {
      // Si la nube está vacía, subir pacientes iniciales
      syncPatientsToSupabase();
    }
  } catch (err) {
    console.warn("Sincronización en segundo plano con Supabase diferida:", err);
  }
}

async function syncProfessionalsToSupabase() {
  if (!window.supabaseClient) return;
  try {
    for (const p of stateProfesionales) {
      await window.supabaseClient.from("profesionales").upsert({
        id: p.id,
        nombre: p.nombre,
        rol: p.rol,
        rol_nombre: p.rolNombre,
        cedula: p.cedula,
        registro: p.registro,
        especialidad: p.especialidad,
        telefono: p.telefono,
        email: p.email,
        estado: p.estado,
        updated_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Error sincronizando profesionales en Supabase", e);
  }
}

async function syncPatientsToSupabase() {
  if (!window.supabaseClient) return;
  try {
    for (const p of patients) {
      await window.supabaseClient.from("pacientes").upsert({
        id: p.id,
        documento: p.doc || p.id,
        nombre: p.name || "Sin nombre",
        edad: parseInt(p.age) || null,
        sexo: p.sex || null,
        criterio_primario: p.crit || null,
        score_final: p.res?.finalScore || null,
        complejidad: p.res?.complexityText || null,
        admite_programa: p.res?.admitsProgram ? true : false,
        datos_completos: p,
        updated_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Error sincronizando pacientes en Supabase", e);
  }
}

// Hook saveToStorage to also sync to Supabase
const originalSaveToStorage = saveToStorage;
saveToStorage = function() {
  originalSaveToStorage();
  if (window.supabaseClient) {
    syncPatientsToSupabase();
  }
};


// ============================================================================
// MODULO: IMPORTACIÓN Y EXPORTACIÓN MASIVA (EXCEL .XLSX / CSV)
// ============================================================================

function triggerImportExcelCSV() {
  const fileInput = document.getElementById("import-excel-file");
  if (fileInput) {
    fileInput.value = "";
    fileInput.click();
  }
}

function downloadImportTemplate() {
  if (typeof XLSX === "undefined") {
    alert("La librería de procesamiento Excel aún se está cargando. Espere un segundo y vuelva a intentar.");
    return;
  }

  // Estructura de Campos Clave para Importación Masiva
  // NOTA: Para enrolar pacientes basta con diligenciar hasta la Columna H (Criterio_Primario).
  // Los campos de escalas VMD (I a S) se pueden dejar en blanco para ser evaluados en la WebApp.
  const templateData = [
    {
      "Documento": "1020304050",
      "Nombre_Completo": "Juan Alberto Gómez Pérez",
      "Edad": 72,
      "Sexo": "M",
      "EPS": "Sura EPS",
      "Telefono": "3104567890",
      "Direccion": "Calle 45 # 23-10 Sincelejo",
      "Criterio_Primario": "IC",
      "NYHA": "",
      "GOLD": "",
      "Child_Pugh": "",
      "Estadio_ERC": "",
      "Barthel": "",
      "Lawton_Brody": "",
      "Pfeiffer": "",
      "MNA_SF": "",
      "Gijon": "",
      "Zarit": "",
      "Observaciones": "Enrolamiento masivo inicial. Pendiente valoración VMD por equipo."
    },
    {
      "Documento": "43567891",
      "Nombre_Completo": "María Elena Restrepo Cárdenas",
      "Edad": 68,
      "Sexo": "F",
      "EPS": "Nueva EPS",
      "Telefono": "3156781234",
      "Direccion": "Cra 18 # 12-40 Corozal",
      "Criterio_Primario": "EPOC",
      "NYHA": "",
      "GOLD": "",
      "Child_Pugh": "",
      "Estadio_ERC": "",
      "Barthel": "",
      "Lawton_Brody": "",
      "Pfeiffer": "",
      "MNA_SF": "",
      "Gijon": "",
      "Zarit": "",
      "Observaciones": "Paciente candidato a programa New Care."
    },
    {
      "Documento": "98765432",
      "Nombre_Completo": "Roberto Carlos Mendoza",
      "Edad": 64,
      "Sexo": "M",
      "EPS": "Sanitas",
      "Telefono": "3001122334",
      "Direccion": "Barrio Boston Sincelejo",
      "Criterio_Primario": "CIRROSIS",
      "NYHA": "",
      "GOLD": "",
      "Child_Pugh": "Grado B",
      "Estadio_ERC": "",
      "Barthel": 80,
      "Lawton_Brody": 6,
      "Pfeiffer": 1,
      "MNA_SF": 11,
      "Gijon": 9,
      "Zarit": 25,
      "Observaciones": "Ejemplo de paciente que ya traía valoración previa completa."
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Pacientes_NewCare");

  // Anchos automáticos de columnas
  ws["!cols"] = [
    { wch: 14 }, // Documento
    { wch: 32 }, // Nombre
    { wch: 8 },  // Edad
    { wch: 8 },  // Sexo
    { wch: 14 }, // EPS
    { wch: 14 }, // Telefono
    { wch: 28 }, // Direccion
    { wch: 18 }, // Criterio_Primario
    { wch: 12 }, // NYHA
    { wch: 12 }, // GOLD
    { wch: 12 }, // Child_Pugh
    { wch: 14 }, // Estadio_ERC
    { wch: 10 }, // Barthel
    { wch: 12 }, // Lawton
    { wch: 10 }, // Pfeiffer
    { wch: 10 }, // MNA_SF
    { wch: 10 }, // Gijon
    { wch: 10 }, // Zarit
    { wch: 35 }  // Observaciones
  ];

  XLSX.writeFile(wb, `Plantilla_Carga_Masiva_Pacientes_NewCare.xlsx`);
}

function handleImportExcelCSV(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (typeof XLSX === "undefined") {
    alert("Error: Librería de lectura Excel no disponible. Verifique su conexión a internet.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rawRows || rawRows.length === 0) {
        alert("El archivo importado no contiene filas de datos.");
        return;
      }

      let importedCount = 0;
      let updatedCount = 0;

      rawRows.forEach((row, idx) => {
        // Normalizar nombres de columnas ignorando mayúsculas, espacios y tildes
        const normalized = {};
        for (const k in row) {
          const normKey = k.trim().toLowerCase()
            .normalize("NFD").replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]/g, "_");
          normalized[normKey] = String(row[k]).trim();
        }

        // Buscar campos clave
        const doc = normalized["documento"] || normalized["cedula"] || normalized["id"] || normalized["identificacion"] || normalized["identificacion_del_paciente"] || ("PAC-IMP-" + (idx + 1));
        const nombre = normalized["nombre_completo"] || normalized["nombre"] || normalized["paciente"] || normalized["nombres_y_apellidos"] || "Paciente Importado";
        const edad = parseInt(normalized["edad"]) || 65;
        const sexo = (normalized["sexo"] || "M").toUpperCase().startsWith("F") ? "F" : "M";
        const eps = normalized["eps"] || normalized["aseguradora"] || "Optimus Salud";
        const telefono = normalized["telefono"] || normalized["celular"] || "";
        const direccion = normalized["direccion"] || "";
        const obs = normalized["observaciones"] || normalized["notas"] || "";

        // Criterio Primario (IC, EPOC, CIRROSIS, ERC)
        let crit = (normalized["criterio_primario"] || normalized["criterio"] || normalized["diagnostico"] || "IC").toUpperCase();
        if (crit.includes("CARD")) crit = "IC";
        else if (crit.includes("PULM") || crit.includes("EPOC") || crit.includes("RESP")) crit = "EPOC";
        else if (crit.includes("HEPAT") || crit.includes("CIRR") || crit.includes("HIG")) crit = "CIRROSIS";
        else if (crit.includes("REN") || crit.includes("ERC")) crit = "ERC";

        // Subcriterios de Severidad
        const nyha = normalized["nyha"] || "Clase II";
        const gold = normalized["gold"] || "Grupo B";
        const cp = normalized["child_pugh"] || normalized["childpugh"] || "Grado B";
        const erc = normalized["estadio_erc"] || normalized["erc"] || "Estadio 3a";

        // Verificar si el archivo trae escalas diligenciadas (Col I en adelante)
        // o si es una carga masiva basal (solo hasta Columna H: Criterio Primario)
        const hasScales = Boolean(
          normalized["barthel"] || normalized["pfeiffer"] || normalized["mna_sf"] ||
          normalized["gijon"] || normalized["zarit"] || normalized["nyha"] ||
          normalized["gold"] || normalized["child_pugh"] || normalized["estadio_erc"]
        );

        let barthel = normalized["barthel"] !== "" ? parseInt(normalized["barthel"]) : 100;
        let lawton = normalized["lawton_brody"] !== "" ? parseInt(normalized["lawton_brody"]) : 8;
        let pfeiffer = normalized["pfeiffer"] !== "" ? parseInt(normalized["pfeiffer"]) : 0;
        let mna = normalized["mna_sf"] !== "" ? parseInt(normalized["mna_sf"]) : 14;
        let gijon = normalized["gijon"] !== "" ? parseInt(normalized["gijon"]) : 5;
        let zarit = normalized["zarit"] !== "" ? parseInt(normalized["zarit"]) : 22;

        let scores;
        let vmdDate = "";
        let paiPlan = {};

        if (hasScales) {
          scores = calculateImportedScores(crit, nyha, gold, cp, erc, barthel, lawton, pfeiffer, mna, gijon, zarit);
          vmdDate = new Date().toISOString().split("T")[0];
          paiPlan = {
            sanitarias: scores.admitsProgram ? "Ingreso a Programa New Care. Visitas clínicas interdisciplinarias y control de polimedicación." : "Control en Atención Primaria.",
            nutricionales: mna < 11 ? "Evaluación por Nutrición Clínica. Dieta hiperproteica y suplementación calórica." : "Mantenimiento nutricional preventivo.",
            psicologicas: pfeiffer >= 3 ? "Taller de estimulación neurocognitiva y apoyo al cuidador principal." : "Acompañamiento básico.",
            sociales: zarit >= 47 ? "Intervención urgente de Trabajo Social por sobrecarga del cuidador. Respiro familiar." : "Monitoreo de red de apoyo comunitaria."
          };
        } else {
          // CARGA HASTA COLUMNA H: Paciente enrolado listo para valoración VMD en la app
          scores = {
            T: 0, Z: 0, AF: 0, AL: 0, AR: 0,
            finalScore: 0,
            complexityText: "Pendiente de Valoración VMD",
            admitsProgram: false,
            isPending: true,
            sNyha: 0, sGold: 0, sCp: 0, sErc: 0,
            sBarthel: 0, sLawton: 0, sPfeiffer: 0, sMnaSf: 0, sGijon: 0, sZarit: 0
          };
          vmdDate = ""; // Sin fecha de VMD aún
          paiPlan = {
            sanitarias: "Paciente pendiente de realización de Valoración Multidimensional (VMD) por equipo interdisciplinario.",
            nutricionales: "Pendiente de valoración MNA.",
            psicologicas: "Pendiente de evaluación cognitiva.",
            sociales: "Pendiente de valoración de riesgo social (Gijón/Zarit)."
          };
        }

        const newPat = {
          id: doc,
          name: nombre,
          doc: doc,
          age: edad,
          sex: sexo,
          eps: eps,
          tel: telefono,
          dir: direccion,
          crit: crit,
          nyha: hasScales ? nyha : "CLASE I",
          gold: hasScales ? gold : "No aplica",
          childPugh: hasScales ? cp : "No aplica",
          ercStage: hasScales ? erc : "G1",
          barthel: barthel,
          lawton: lawton,
          pfeiffer: pfeiffer,
          mnaSf: mna,
          gijon: gijon,
          zarit: zarit,
          res: scores,
          isPending: !hasScales,
          vmdDate: vmdDate,
          pai: paiPlan,
          observaciones: obs
        };

        // Upsert en arreglo de pacientes
        const existingIdx = patients.findIndex(p => p.id === doc || (p.doc && p.doc === doc));
        if (existingIdx !== -1) {
          patients[existingIdx] = { ...patients[existingIdx], ...newPat };
          updatedCount++;
        } else {
          patients.push(newPat);
          importedCount++;
        }
      });

      // Guardar y sincronizar
      saveToStorage();
      renderPatientsTable();
      if (patients.length > 0) loadPatient(patients[0].id);

      alert(`✅ ¡Importación Masiva Completada con Éxito!\n\n` +
            `• Total registros procesados: ${importedCount + updatedCount}\n` +
            `• Nuevos pacientes incorporados: ${importedCount}\n` +
            `• Pacientes actualizados: ${updatedCount}\n\n` +
            `La base de datos y Supabase Nube han sido sincronizados en tiempo real.`);

    } catch (err) {
      console.error("Error al procesar archivo Excel / CSV:", err);
      alert("Error al importar el archivo: " + (err.message || "Estructura de archivo inválida."));
    }
  };

  reader.readAsArrayBuffer(file);
}

function calculateImportedScores(crit, nyha, gold, cp, erc, barthel, lawton, pfeiffer, mna, gijon, zarit) {
  // 1. T (Severidad)
  let sNyha = 0;
  if (nyha.includes("II") && !nyha.includes("III")) sNyha = 1;
  else if (nyha.includes("III") || nyha.includes("IV")) sNyha = 2;

  let sGold = 0;
  if (gold.includes("B")) sGold = 1;
  else if (gold.includes("C") || gold.includes("D")) sGold = 2;

  let sCp = 0;
  if (cp.includes("B")) sCp = 1;
  else if (cp.includes("C")) sCp = 2;

  let sErc = 0;
  if (erc.includes("3a") || erc.includes("3b")) sErc = 1;
  else if (erc.includes("4") || erc.includes("5")) sErc = 2;

  let T = 0;
  if (crit === "IC") T = sNyha;
  else if (crit === "EPOC") T = sGold;
  else if (crit === "CIRROSIS") T = sCp;
  else if (crit === "ERC") T = sErc;

  // 2. Z (Funcionalidad)
  let sBarthel = barthel >= 90 ? 0 : (barthel >= 60 ? 1 : 2);
  let sLawton = lawton >= 6 ? 0 : (lawton >= 4 ? 1 : 2);
  let Z = Math.max(sBarthel, sLawton);

  // 3. AF (Cognitivo)
  let AF = pfeiffer <= 2 ? 0 : (pfeiffer <= 4 ? 1 : 2);

  // 4. AL (Nutricional)
  let AL = mna >= 12 ? 0 : (mna >= 8 ? 1 : 2);

  // 5. AR (Social)
  let sGijon = gijon <= 9 ? 0 : (gijon <= 14 ? 1 : 2);
  let sZarit = zarit < 47 ? 0 : (zarit <= 55 ? 1 : 2);
  let AR = Math.max(sGijon, sZarit);

  // 6. Complejidad Final New Care
  let finalScore = T;
  const hasAgravante = (Z === 2 || AF === 2 || AL === 2 || AR === 2);
  if (hasAgravante) {
    finalScore = Math.min(2, T + 1);
  }

  const complexityText = finalScore === 2 ? "Alta Complejidad" : (finalScore === 1 ? "Media Complejidad" : "Baja Complejidad");
  const admitsProgram = finalScore >= 1;

  return {
    T, Z, AF, AL, AR,
    finalScore,
    complexityText,
    admitsProgram,
    sNyha, sGold, sCp, sErc,
    sBarthel, sLawton, sPfeiffer: AF, sMnaSf: AL, sGijon, sZarit
  };
}

window.addEventListener("DOMContentLoaded", initApp);


// ============================================================================
// FUNCIONES DE INTERACTIVIDAD PARA EL MANUAL TÉCNICO ASISTENCIAL
// ============================================================================
function filterTechManual(category, btnElement) {
  // Actualizar botones activos
  document.querySelectorAll(".filter-tech-btn").forEach(b => {
    b.className = "btn btn-secondary btn-sm filter-tech-btn";
  });
  if (btnElement) {
    btnElement.className = "btn btn-primary btn-sm filter-tech-btn";
  }

  const cards = document.querySelectorAll(".tech-card");
  cards.forEach(c => {
    if (category === "ALL" || c.getAttribute("data-category") === category) {
      c.style.display = "block";
    } else {
      c.style.display = "none";
    }
  });
}

function searchTechManual(query) {
  const q = (query || "").toLowerCase().trim();
  const cards = document.querySelectorAll(".tech-card");
  cards.forEach(c => {
    const text = (c.textContent + " " + (c.getAttribute("data-keywords") || "")).toLowerCase();
    if (!q || text.includes(q)) {
      c.style.display = "block";
    } else {
      c.style.display = "none";
    }
  });
}


function openTechManualScale(keyword) {
  switchTab("tab-manual-tecnico");
  const searchInput = document.getElementById("tech-manual-search");
  if (searchInput) {
    searchInput.value = keyword;
    searchTechManual(keyword);
  }
}


// ============================================================================
// MÓDULO DE SEGUIMIENTO LONGITUDINAL, DELTAS Y TRAZABILIDAD (NEW CARE)
// ============================================================================

/**
 * Normaliza y garantiza que cada paciente tenga estructura de Ingreso y Seguimientos
 */
function safeNum(val, fallback) {
  if (val === undefined || val === null || val === "") return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function ensurePatientTrackingStructure(p) {
  if (!p) return;
  
  // Garantizar ingreso basal (preservando estrictamente valores 0 clínicos como Barthel=0)
  if (!p.ingreso) {
    const res = evaluatePatient(p);
    p.ingreso = {
      id: "ING-" + (p.id || p.doc || "000"),
      tipo: "INGRESO",
      fecha: p.vmdDate || "2026-11-05",
      crit: p.crit || "IC",
      nyha: p.nyha || "No aplica",
      gold: p.gold || "No aplica",
      cp: p.cp || "No aplica",
      erc: p.erc || "No aplica",
      score_t: res.T,
      barthel: safeNum(p.barthel, 100),
      lawton: safeNum(p.lawton, 8),
      score_z: res.Z,
      mnaSf: safeNum(p.mnaSf, 14),
      score_al: res.AL,
      pfeiffer: safeNum(p.pfeiffer, 0),
      score_af: res.AF,
      gijon: safeNum(p.gijon, 5),
      zarit: safeNum(p.zarit, 22),
      score_ar: res.AR,
      finalScore: res.finalScore,
      complejidad: res.complexityText,
      modalidad: res.modalidad,
      pai: p.pai ? { ...p.pai } : {}
    };
  }

  // Garantizar Estado Oficial del Paciente (Apartado 5.3.2) y Ruta (5.6)
  if (!p.estadoPrograma) {
    p.estadoPrograma = (p.ingreso?.finalScore >= 1) ? "ACTIVO" : "SOSPECHOSO";
  }
  if (!p.rutaFase) {
    p.rutaFase = (p.seguimientos && p.seguimientos.length > 0) ? 6 : (p.estadoPrograma === "ACTIVO" ? 5 : 4);
  }
  if (!Array.isArray(p.descompensaciones)) p.descompensaciones = [];
  if (!Array.isArray(p.derivaciones)) p.derivaciones = [];

  // Garantizar arreglo de seguimientos
  if (!Array.isArray(p.seguimientos)) {
    p.seguimientos = [];
    
    // Si es el primer paciente demo (Carlos Alberto), creamos 1 seguimiento previo para demostración inmediata
    if (p.id === "1020304050") {
      p.seguimientos.push({
        id: "SEG-1020304050-001",
        numero: 1,
        fecha: "2027-05-04",
        motivo: "PERIODICO_6M",
        motivoTexto: "Control Periódico Semestral (6 Meses)",
        evaluadorNombre: "Enf. Laura Restrepo",
        evaluadorRol: "Enfermera de Práctica Avanzada (EPA)",
        crit: "IC",
        score_t: 1, // Mejoró de NYHA III a NYHA II
        barthel: 70, // Ganó 15 pts
        score_z: 1,
        lawton: 4,
        mnaSf: 12, // Recuperó nutrición
        score_al: 0,
        pfeiffer: 2,
        score_af: 0,
        gijon: 9,
        zarit: 36, // Redujo sobrecarga de 48 a 36 pts
        score_ar: 0,
        finalScore: 1,
        complejidad: "Media Complejidad",
        modalidad: "AMBULATORIO",
        metas_pai: {
          sanitarias: "LOGRADA",
          nutricionales: "LOGRADA",
          psicologicas: "EN_PROGRESO",
          sociales: "LOGRADA"
        },
        observaciones: "Notable mejoría funcional y clínica. La hija reporta alivio del estrés gracias al relevo de cuidador de la parroquia. Menor disnea en reposo."
      });
    }
  }
}

/**
 * Calcula los Deltas de avance entre la Línea Base y una Evaluación de Seguimiento
 */
function calculateDeltas(baseline, current) {
  const b = baseline || {};
  const c = current || {};

  const bT = b.score_t !== undefined ? b.score_t : 0;
  const cT = c.score_t !== undefined ? c.score_t : 0;
  const deltaT = cT - bT; // Negativo = Menor severidad (Mejoría)

  const bBarthel = Number(b.barthel) || 0;
  const cBarthel = Number(c.barthel) || 0;
  const deltaBarthel = cBarthel - bBarthel; // Positivo = Mayor independencia (Mejoría)

  const bLawton = Number(b.lawton) || 0;
  const cLawton = Number(c.lawton) || 0;
  const deltaLawton = cLawton - bLawton;

  const bMna = Number(b.mnaSf) || 0;
  const cMna = Number(c.mnaSf) || 0;
  const deltaMna = cMna - bMna; // Positivo = Mejor nutrición (Mejoría)

  const bPfeiffer = Number(b.pfeiffer) || 0;
  const cPfeiffer = Number(c.pfeiffer) || 0;
  const deltaPfeiffer = cPfeiffer - bPfeiffer; // Negativo = Menos errores (Mejoría)

  const bGijon = Number(b.gijon) || 0;
  const cGijon = Number(c.gijon) || 0;
  const deltaGijon = cGijon - bGijon;

  const bZarit = Number(b.zarit) || 0;
  const cZarit = Number(c.zarit) || 0;
  const deltaZarit = cZarit - bZarit; // Negativo = Menor sobrecarga (Mejoría)

  const bFinal = Number(b.finalScore) || 0;
  const cFinal = Number(c.finalScore) || 0;
  const deltaFinal = cFinal - bFinal;

  // Estado global cualitativo de la evolución (Principio de Seguridad Clínica: Alert-First)
  const alerts = [];
  if (deltaFinal > 0) alerts.push(`Aumento de complejidad global (+${deltaFinal})`);
  if (deltaT > 0) alerts.push(`Descompensación orgánica (ΔT=+${deltaT})`);
  if (deltaBarthel <= -15) alerts.push(`Pérdida funcional severa (ΔBarthel=${deltaBarthel} pts)`);
  if (deltaMna <= -3) alerts.push(`Deterioro nutricional agudo (ΔMNA=${deltaMna} pts)`);
  if (deltaPfeiffer >= 2) alerts.push(`Deterioro cognitivo / sospecha delirium (ΔPfeiffer=+${deltaPfeiffer} err)`);
  if (deltaZarit >= 12 || (cZarit >= 56 && bZarit < 56)) alerts.push(`Claudicación del cuidador (Zarit=${cZarit} pts)`);

  const hasDeterioro = alerts.length > 0;
  const hasMejoria = (deltaFinal < 0 || deltaT < 0 || deltaBarthel >= 10 || deltaZarit <= -10 || deltaMna >= 3);

  let globalStatus = "ESTABILIDAD";
  let statusText = "🟡 Estabilidad Clínica";
  let badgeClass = "delta-estabilidad";

  if (hasDeterioro && hasMejoria) {
    globalStatus = "DETERIORO_MIXTO";
    statusText = "🟠 Alerta Mixta (Deterioro Clínico + Alivio Parcial)";
    badgeClass = "delta-deterioro";
  } else if (hasDeterioro) {
    globalStatus = "DETERIORO";
    statusText = "🔴 Alerta Clínica (Deterioro)";
    badgeClass = "delta-deterioro";
  } else if (hasMejoria) {
    globalStatus = "MEJORIA";
    statusText = "🟢 Avance Favorable (Mejoría)";
    badgeClass = "delta-mejoria";
  }

  return {
    deltaT,
    deltaBarthel,
    deltaLawton,
    deltaMna,
    deltaPfeiffer,
    deltaGijon,
    deltaZarit,
    deltaFinal,
    globalStatus,
    statusText,
    badgeClass,
    alerts
  };
}

/**
 * Motor Predictivo de Trayectorias Longitudinales (30-90 días)
 * Detecta deterioro progresivo escalonado, cruce de umbral domiciliario y riesgo de claudicación.
 */
function analyzePatientTrajectory(p) {
  const series = [p.ingreso, ...(p.seguimientos || [])].filter(Boolean);
  const signals = [];
  if (series.length < 2) {
    return { riskLevel: "BAJO", signals: ["Sin seguimientos suficientes para análisis de tendencia."] };
  }

  const first = series[0];
  const last = series[series.length - 1];
  const cumDeltaBarthel = safeNum(last.barthel, 0) - safeNum(first.barthel, 0);

  // 1. Detección de caída funcional consecutiva (deterioro escalonado silencioso)
  let consecutiveBarthelDrops = 0;
  for (let i = 1; i < series.length; i++) {
    if (safeNum(series[i].barthel, 0) < safeNum(series[i - 1].barthel, 0)) {
      consecutiveBarthelDrops++;
    } else {
      consecutiveBarthelDrops = 0;
    }
  }
  if (consecutiveBarthelDrops >= 2) {
    signals.push(`Tendencia descendente sostenida en Barthel (${consecutiveBarthelDrops} controles consecutivos; acumulado ${cumDeltaBarthel} pts).`);
  }

  // 2. Cruce de umbral de modalidad asistencial (<= 60 pts Barthel)
  if (safeNum(first.barthel, 100) > 60 && safeNum(last.barthel, 100) <= 60) {
    signals.push("Cruce crítico de umbral funcional (Barthel ≤ 60): requiere escalamiento a Modalidad Domiciliaria.");
  }

  // 3. Tendencia de sobrecarga del cuidador
  if (safeNum(last.zarit, 0) >= 56) {
    signals.push(`Sobrecarga intensa del cuidador (Zarit = ${last.zarit} pts): alto riesgo de claudicación familiar y reingreso.`);
  }

  // 4. Deterioro nutricional o cognitivo acumulado
  const cumDeltaMna = safeNum(last.mnaSf, 14) - safeNum(first.mnaSf, 14);
  if (cumDeltaMna <= -3 || safeNum(last.mnaSf, 14) <= 7) {
    signals.push(`Riesgo nutricional crítico acumulado (MNA-SF = ${last.mnaSf}, Δ=${cumDeltaMna}).`);
  }
  const cumDeltaPfeiffer = safeNum(last.pfeiffer, 0) - safeNum(first.pfeiffer, 0);
  if (cumDeltaPfeiffer >= 2) {
    signals.push(`Progresión de deterioro cognitivo / delirium (+${cumDeltaPfeiffer} errores en Pfeiffer).`);
  }

  const riskLevel = signals.length >= 2 ? "ALTO" : (signals.length === 1 ? "MODERADO" : "BAJO");
  return { riskLevel, signals };
}

/**
 * Renderiza la pestaña completa de Seguimiento & Trazabilidad
 */
function renderSeguimientoTab() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) {
    alert("Por favor seleccione un paciente en el padrón para consultar o registrar seguimientos.");
    switchTab("tab-padron");
    return;
  }

  ensurePatientTrackingStructure(p);

  // 1. Banner
  const nameEl = document.getElementById("seg-patient-name");
  const idEl = document.getElementById("seg-patient-id");
  const ageEl = document.getElementById("seg-patient-age");
  const epsEl = document.getElementById("seg-patient-eps");
  const ingresoDateEl = document.getElementById("seg-patient-ingreso-date");
  const countBadgeEl = document.getElementById("seg-patient-count-badge");
  const statusBadgeEl = document.getElementById("seg-status-badge");

  if (nameEl) nameEl.textContent = p.name;
  if (idEl) idEl.textContent = p.doc || p.id;
  if (ageEl) ageEl.textContent = (p.age || "-") + " años";
  if (epsEl) epsEl.textContent = p.eps || "Optimus Salud";
  if (ingresoDateEl) ingresoDateEl.textContent = p.ingreso?.fecha || p.vmdDate || "No definida";
  if (countBadgeEl) countBadgeEl.textContent = `${p.seguimientos.length} controles`;

  const baseline = p.ingreso;
  const hasSeg = p.seguimientos.length > 0;
  const latest = hasSeg ? p.seguimientos[p.seguimientos.length - 1] : baseline;
  const deltas = calculateDeltas(baseline, latest);

  if (statusBadgeEl) {
    statusBadgeEl.textContent = hasSeg ? deltas.statusText : "Línea Base Inicial (Ingreso)";
    statusBadgeEl.className = "badge-complex " + (
      deltas.globalStatus === "MEJORIA" ? "complex-baja" :
      ((deltas.globalStatus === "DETERIORO" || deltas.globalStatus === "DETERIORO_MIXTO") ? "complex-alta" : "complex-media")
    );
  }

  // Sincronizar Estado Oficial del Programa (5.3.2 / 5.3.5)
  const estadoBadge = document.getElementById("seg-estado-programa-badge");
  const estadoSelect = document.getElementById("seg-estado-programa-select");
  const altaSelect = document.getElementById("seg-motivo-alta-select");
  const estMeta = ESTADOS_PROGRAMA_NEWCARE[p.estadoPrograma] || ESTADOS_PROGRAMA_NEWCARE.ACTIVO;
  if (estadoBadge) {
    estadoBadge.textContent = `Estado: ${estMeta.label}`;
    estadoBadge.className = `badge-estado-programa ${estMeta.cssClass}`;
  }
  if (estadoSelect) estadoSelect.value = p.estadoPrograma || "ACTIVO";
  if (altaSelect) {
    altaSelect.style.display = p.estadoPrograma === "ALTA" ? "inline-block" : "none";
    altaSelect.value = p.motivoAlta || "";
  }

  // 2. KPIs de Deltas
  const kpiDeltaT = document.getElementById("kpi-delta-t");
  const kpiDeltaBarthel = document.getElementById("kpi-delta-barthel");
  const kpiDeltaMna = document.getElementById("kpi-delta-mna");
  const kpiDeltaZarit = document.getElementById("kpi-delta-zarit");

  if (kpiDeltaT) {
    kpiDeltaT.innerHTML = deltas.deltaT < 0 ? `<span style="color:#16a34a;">-${Math.abs(deltas.deltaT)} grado (Mejoría)</span>` : (deltas.deltaT > 0 ? `<span style="color:#dc2626;">+${deltas.deltaT} (Aumento)</span>` : `<span style="color:#64748b;">0 (Estable)</span>`);
  }
  if (kpiDeltaBarthel) {
    kpiDeltaBarthel.innerHTML = deltas.deltaBarthel > 0 ? `<span style="color:#16a34a;">+${deltas.deltaBarthel} pts (Ganancia)</span>` : (deltas.deltaBarthel < 0 ? `<span style="color:#dc2626;">${deltas.deltaBarthel} pts (Pérdida)</span>` : `<span style="color:#64748b;">0 pts</span>`);
  }
  if (kpiDeltaMna) {
    kpiDeltaMna.innerHTML = deltas.deltaMna > 0 ? `<span style="color:#16a34a;">+${deltas.deltaMna} pts</span>` : (deltas.deltaMna < 0 ? `<span style="color:#dc2626;">${deltas.deltaMna} pts</span>` : `<span style="color:#64748b;">0 pts</span>`);
  }
  if (kpiDeltaZarit) {
    kpiDeltaZarit.innerHTML = deltas.deltaZarit < 0 ? `<span style="color:#16a34a;">${deltas.deltaZarit} pts (Alivio)</span>` : (deltas.deltaZarit > 0 ? `<span style="color:#dc2626;">+${deltas.deltaZarit} pts (Mayor carga)</span>` : `<span style="color:#64748b;">0 pts</span>`);
  }

  // 2.5. Gráfica Evolutiva Interactiva (Barthel, MNA-SF, Zarit)
  renderSeguimientoChart(p);

  // 3. Matriz Comparativa en Paralelo
  renderComparisonTable(p, baseline, latest, deltas);

  // 4. Metas PAI
  renderMetasTracking(p, latest);

  // 5. Timeline de Eventos
  renderTimeline(p);

  // 6. Descompensaciones (5.3.4) y Derivaciones (5.3.3)
  renderDescompensacionesList(p);
  renderDerivacionesList(p);

  if (window.lucide) lucide.createIcons();
}

function renderComparisonTable(p, baseline, latest, deltas) {
  const tbody = document.getElementById("comparison-table-body");
  if (!tbody) return;

  const b = baseline || {};
  const c = latest || {};

  const rows = [
    {
      dim: "Severidad Clínica (Eje T)",
      baseVal: `T = ${b.score_t ?? 0}`,
      actVal: `T = ${c.score_t ?? 0}`,
      deltaHtml: deltas.deltaT < 0 ? `<span class="delta-badge delta-mejoria">↓ -${Math.abs(deltas.deltaT)} (Mejoría)</span>` : (deltas.deltaT > 0 ? `<span class="delta-badge delta-deterioro">↑ +${deltas.deltaT} (Aumento)</span>` : `<span class="delta-badge delta-estabilidad">= Estable</span>`)
    },
    {
      dim: "Funcionalidad ABVD (Barthel)",
      baseVal: `${b.barthel ?? 100} pts (Z=${b.score_z ?? 0})`,
      actVal: `${c.barthel ?? 100} pts (Z=${c.score_z ?? 0})`,
      deltaHtml: deltas.deltaBarthel > 0 ? `<span class="delta-badge delta-mejoria">↑ +${deltas.deltaBarthel} pts</span>` : (deltas.deltaBarthel < 0 ? `<span class="delta-badge delta-deterioro">↓ ${deltas.deltaBarthel} pts</span>` : `<span class="delta-badge delta-estabilidad">= 0 pts</span>`)
    },
    {
      dim: "Instrumentales AIVD (Lawton)",
      baseVal: `${b.lawton ?? 8} / 8 pts`,
      actVal: `${c.lawton ?? 8} / 8 pts`,
      deltaHtml: deltas.deltaLawton > 0 ? `<span class="delta-badge delta-mejoria">↑ +${deltas.deltaLawton}</span>` : (deltas.deltaLawton < 0 ? `<span class="delta-badge delta-deterioro">↓ ${deltas.deltaLawton}</span>` : `<span class="delta-badge delta-estabilidad">= 0</span>`)
    },
    {
      dim: "Estado Nutricional (MNA-SF)",
      baseVal: `${b.mnaSf ?? 14} / 14 pts (AL=${b.score_al ?? 0})`,
      actVal: `${c.mnaSf ?? 14} / 14 pts (AL=${c.score_al ?? 0})`,
      deltaHtml: deltas.deltaMna > 0 ? `<span class="delta-badge delta-mejoria">↑ +${deltas.deltaMna} pts</span>` : (deltas.deltaMna < 0 ? `<span class="delta-badge delta-deterioro">↓ ${deltas.deltaMna} pts</span>` : `<span class="delta-badge delta-estabilidad">= 0 pts</span>`)
    },
    {
      dim: "Estado Cognitivo (Pfeiffer)",
      baseVal: `${b.pfeiffer ?? 0} errores (AF=${b.score_af ?? 0})`,
      actVal: `${c.pfeiffer ?? 0} errores (AF=${c.score_af ?? 0})`,
      deltaHtml: deltas.deltaPfeiffer < 0 ? `<span class="delta-badge delta-mejoria">↓ -${Math.abs(deltas.deltaPfeiffer)} err</span>` : (deltas.deltaPfeiffer > 0 ? `<span class="delta-badge delta-deterioro">↑ +${deltas.deltaPfeiffer} err</span>` : `<span class="delta-badge delta-estabilidad">= 0 err</span>`)
    },
    {
      dim: "Situación Sociofamiliar (Gijón)",
      baseVal: `${b.gijon ?? 5} / 25 pts (AR=${b.score_ar ?? 0})`,
      actVal: `${c.gijon ?? 5} / 25 pts (AR=${c.score_ar ?? 0})`,
      deltaHtml: deltas.deltaGijon < 0 ? `<span class="delta-badge delta-mejoria">↓ -${Math.abs(deltas.deltaGijon)} pts</span>` : (deltas.deltaGijon > 0 ? `<span class="delta-badge delta-deterioro">↑ +${deltas.deltaGijon} pts</span>` : `<span class="delta-badge delta-estabilidad">= 0 pts</span>`)
    },
    {
      dim: "Sobrecarga del Cuidador (Zarit)",
      baseVal: `${b.zarit ?? 22} / 88 pts`,
      actVal: `${c.zarit ?? 22} / 88 pts`,
      deltaHtml: deltas.deltaZarit < 0 ? `<span class="delta-badge delta-mejoria">↓ ${deltas.deltaZarit} pts (Alivio)</span>` : (deltas.deltaZarit > 0 ? `<span class="delta-badge delta-deterioro">↑ +${deltas.deltaZarit} pts</span>` : `<span class="delta-badge delta-estabilidad">= 0 pts</span>`)
    },
    {
      dim: "Complejidad Global New Care",
      baseVal: `<strong>${b.complejidad || "Alta Complejidad"}</strong> (${b.finalScore ?? 2})`,
      actVal: `<strong>${c.complejidad || "Media Complejidad"}</strong> (${c.finalScore ?? 1})`,
      deltaHtml: deltas.deltaFinal < 0 ? `<span class="delta-badge delta-mejoria">Evolución Favorable</span>` : (deltas.deltaFinal > 0 ? `<span class="delta-badge delta-deterioro">Mayor Complejidad</span>` : `<span class="delta-badge delta-estabilidad">Sin Cambio de Grado</span>`)
    },
    {
      dim: "Modalidad Asistencial PAI",
      baseVal: b.modalidad || "Domiciliario",
      actVal: c.modalidad || "Ambulatorio",
      deltaHtml: `<span style="font-size:11px; font-weight:700; color:#0f766e;">${c.modalidad === b.modalidad ? "Mantiene Modalidad" : "Transición Asistencial"}</span>`
    }
  ];

  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600; color: #1e293b;">${r.dim}</td>
      <td style="text-align: center; background: #f8fafc; font-family: monospace;">${r.baseVal}</td>
      <td style="text-align: center; background: #ffffff; font-family: monospace; font-weight: 700;">${r.actVal}</td>
      <td style="text-align: center;">${r.deltaHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderMetasTracking(p, latest) {
  const container = document.getElementById("pai-metas-tracking-container");
  if (!container) return;

  const metas = latest.metas_pai || {
    sanitarias: "EN_PROGRESO",
    nutricionales: "EN_PROGRESO",
    psicologicas: "EN_PROGRESO",
    sociales: "EN_PROGRESO"
  };

  const getStatusBadge = (st) => {
    if (st === "LOGRADA") return '<span class="badge badge-success" style="font-size:11px;">✅ Lograda</span>';
    if (st === "NO_LOGRADA") return '<span class="badge badge-danger" style="font-size:11px;">❌ No Alcanzada</span>';
    return '<span class="badge badge-warning" style="font-size:11px;">🟡 En Progreso</span>';
  };

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
      <span style="font-size:12px; font-weight:600; color:#1e293b;">🩺 Meta Sanitaria / Médica:</span>
      ${getStatusBadge(metas.sanitarias)}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
      <span style="font-size:12px; font-weight:600; color:#1e293b;">🥗 Meta Nutricional:</span>
      ${getStatusBadge(metas.nutricionales)}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
      <span style="font-size:12px; font-weight:600; color:#1e293b;">🧠 Meta Psicoafectiva / Cognitiva:</span>
      ${getStatusBadge(metas.psicologicas)}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
      <span style="font-size:12px; font-weight:600; color:#1e293b;">🤝 Meta Social y Apoyo al Cuidador:</span>
      ${getStatusBadge(metas.sociales)}
    </div>
    ${latest.observaciones ? `
      <div style="margin-top:6px; padding:8px 12px; background:#eff6ff; border-left:3px solid #3b82f6; border-radius:4px; font-size:11.5px; color:#1e40af;">
        <strong>Evolución del Equipo:</strong> ${latest.observaciones}
      </div>` : ''}
    ${(() => {
      const traj = analyzePatientTrajectory(p);
      if (traj.riskLevel === "BAJO") return "";
      const bg = traj.riskLevel === "ALTO" ? "#fef2f2" : "#fffbeb";
      const bd = traj.riskLevel === "ALTO" ? "#dc2626" : "#d97706";
      const fg = traj.riskLevel === "ALTO" ? "#991b1b" : "#92400e";
      return `
        <div style="margin-top:8px; padding:10px 12px; background:${bg}; border-left:4px solid ${bd}; border-radius:6px; font-size:11.5px; color:${fg};">
          <div style="font-weight:700; margin-bottom:4px;">⚠️ Alerta Predictiva de Trayectoria (Riesgo ${traj.riskLevel}):</div>
          <ul style="margin:0; padding-left:16px;">
            ${traj.signals.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>`;
    })()}
  `;
}

function renderTimeline(p) {
  const container = document.getElementById("timeline-events-container");
  if (!container) return;

  container.innerHTML = "";

  // Hito 0: Valoración de Ingreso
  const base = p.ingreso || {};
  const itemBase = document.createElement("div");
  itemBase.className = "timeline-item";
  itemBase.innerHTML = `
    <div class="timeline-dot timeline-dot-ingreso"></div>
    <div class="timeline-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:6px;">
        <span class="badge-registro-ingreso">Valoración de Ingreso (Línea Base)</span>
        <span style="font-size:11px; color:#64748b; font-weight:600;">📅 ${base.fecha || p.vmdDate || "2026-11-05"}</span>
      </div>
      <div style="font-size:12.5px; font-weight:700; color:#1e3a8a; margin-bottom:4px;">
        Dictamen de Ingreso: ${base.complejidad || "Alta Complejidad"} (${base.modalidad || "Domiciliario"})
      </div>
      <div style="font-size:11.5px; color:#475569;">
        Severidad T: <strong>${base.score_t ?? 2}</strong> | Barthel: <strong>${base.barthel ?? 55}</strong> | MNA-SF: <strong>${base.mnaSf ?? 9}</strong> | Zarit: <strong>${base.zarit ?? 48} pts</strong>
      </div>
    </div>
  `;
  container.appendChild(itemBase);

  // Hitos 1..N: Seguimientos
  if (p.seguimientos && p.seguimientos.length > 0) {
    p.seguimientos.forEach((seg, idx) => {
      const prev = idx === 0 ? base : p.seguimientos[idx - 1];
      const d = calculateDeltas(prev, seg);

      const itemSeg = document.createElement("div");
      itemSeg.className = "timeline-item";

      const dotClass = seg.motivo === "POST_ALTA" || seg.motivo === "DESCOMPENSACION" ? "timeline-dot-alerta" : "timeline-dot-seguimiento";
      const badgeClass = seg.motivo === "POST_ALTA" ? "badge-registro-post-alta" : "badge-registro-seguimiento";

      itemSeg.innerHTML = `
        <div class="timeline-dot ${dotClass}"></div>
        <div class="timeline-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:6px;">
            <span class="${badgeClass}">Seguimiento N° ${seg.numero} &bull; ${seg.motivoTexto || seg.motivo}</span>
            <span style="font-size:11px; color:#64748b; font-weight:600;">📅 ${seg.fecha}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div style="font-size:12.5px; font-weight:700; color:#0f766e;">
              ${seg.complejidad} (${seg.modalidad})
            </div>
            <span class="delta-badge ${d.badgeClass}" style="font-size:10.5px;">${d.statusText}</span>
          </div>
          <div style="font-size:11.5px; color:#475569; margin-bottom:6px;">
            Barthel: <strong>${seg.barthel} pts</strong> (${d.deltaBarthel >= 0 ? "+" + d.deltaBarthel : d.deltaBarthel}) | Zarit: <strong>${seg.zarit} pts</strong> (${d.deltaZarit}) | MNA: <strong>${seg.mnaSf}</strong>
          </div>
          <div style="font-size:11px; color:#64748b;">
            👨‍⚕️ Evaluador: <strong>${seg.evaluadorNombre || "Equipo New Care"}</strong> (${seg.evaluadorRol || "EPA"})
          </div>
          ${seg.observaciones ? `<div style="margin-top:6px; font-size:11.5px; color:#334155; font-style:italic;">"${seg.observaciones}"</div>` : ''}
        </div>
      `;
      container.appendChild(itemSeg);
    });
  } else {
    const emptyNotice = document.createElement("div");
    emptyNotice.style.padding = "12px";
    emptyNotice.style.background = "#f8fafc";
    emptyNotice.style.border = "1px dashed #cbd5e1";
    emptyNotice.style.borderRadius = "6px";
    emptyNotice.style.fontSize = "12px";
    emptyNotice.style.color = "#64748b";
    emptyNotice.style.textAlign = "center";
    emptyNotice.textContent = "Aún no se han registrado controles periódicos para este paciente. Pulse 'Registrar Nuevo Seguimiento' para añadir el primero.";
    container.appendChild(emptyNotice);
  }
}

/**
 * Abre el modal para registrar un nuevo seguimiento clínico
 */
function openNewSeguimientoModal() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;

  ensurePatientTrackingStructure(p);

  const baseline = p.ingreso || {};
  const hasSeg = p.seguimientos.length > 0;
  const latest = hasSeg ? p.seguimientos[p.seguimientos.length - 1] : baseline;

  // Llenar evaluadores
  const selEval = document.getElementById("mseg-evaluador");
  if (selEval) {
    selEval.innerHTML = "";
    stateProfesionales.forEach(prof => {
      const opt = document.createElement("option");
      opt.value = prof.id;
      opt.textContent = `${prof.nombre} (${prof.rolNombre || prof.rol})`;
      selEval.appendChild(opt);
    });
  }

  // Prellenar fecha con hoy
  const dateInput = document.getElementById("mseg-date");
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

  // Prellenar badges de línea base
  document.getElementById("mseg-base-barthel").textContent = `${baseline.barthel ?? 100} pts`;
  document.getElementById("mseg-base-lawton").textContent = `${baseline.lawton ?? 8} pts`;
  document.getElementById("mseg-base-mna").textContent = `${baseline.mnaSf ?? 14} pts`;
  document.getElementById("mseg-base-pfeiffer").textContent = `${baseline.pfeiffer ?? 0} err`;
  document.getElementById("mseg-base-gijon").textContent = `${baseline.gijon ?? 5} pts`;
  document.getElementById("mseg-base-zarit").textContent = `${baseline.zarit ?? 22} pts`;

  // Precargar con los últimos valores conocidos para que el clínico solo ajuste variaciones
  document.getElementById("mseg-barthel").value = latest.barthel ?? 100;
  document.getElementById("mseg-lawton").value = latest.lawton ?? 8;
  document.getElementById("mseg-mna").value = latest.mnaSf ?? 14;
  document.getElementById("mseg-pfeiffer").value = latest.pfeiffer ?? 0;
  document.getElementById("mseg-gijon").value = latest.gijon ?? 5;
  document.getElementById("mseg-zarit").value = latest.zarit ?? 22;
  document.getElementById("mseg-crit-val").value = latest.score_t ?? 1;
  document.getElementById("mseg-ambit").value = latest.modalidad === "DOMICILIARIO" || latest.modalidad === "Domiciliario" ? "Domiciliario" : "Ambulatorio";
  document.getElementById("mseg-obs").value = "";

  openModal("modal-new-seguimiento");
}

/**
 * Guarda el nuevo seguimiento clínico y actualiza la trazabilidad
 */
function saveNewSeguimiento() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;

  const fecha = document.getElementById("mseg-date").value;
  const motivoVal = document.getElementById("mseg-motivo").value;
  const motivoTexto = document.getElementById("mseg-motivo").selectedOptions[0]?.text || motivoVal;
  const evaluadorId = document.getElementById("mseg-evaluador").value;
  const prof = stateProfesionales.find(x => x.id === evaluadorId) || {};

  const barthel = Number(document.getElementById("mseg-barthel").value);
  const lawton = Number(document.getElementById("mseg-lawton").value);
  const mna = Number(document.getElementById("mseg-mna").value);
  const pfeiffer = Number(document.getElementById("mseg-pfeiffer").value);
  const gijon = Number(document.getElementById("mseg-gijon").value);
  const zarit = Number(document.getElementById("mseg-zarit").value);
  const score_t = Number(document.getElementById("mseg-crit-val").value);
  const ambit = document.getElementById("mseg-ambit").value;
  const obs = document.getElementById("mseg-obs").value.trim();

  if (!fecha) {
    alert("Por favor seleccione la fecha del seguimiento.");
    return;
  }

  // Calcular dimensiones según reglas New Care
  const sBarthel = getScoreBarthel(barthel);
  const sLawton = getScoreLawton(lawton);
  const score_z = Math.max(sBarthel, sLawton);

  const score_al = getScoreMNA_SF(mna);
  const score_af = getScorePfeiffer(pfeiffer);

  const sGijon = getScoreGijon(gijon);
  const sZarit = getScoreZarit(zarit);
  const score_ar = Math.max(sGijon, sZarit);

  // Algoritmo New Care: Si Z=2 o AF=2 o AL=2 o AR=2 => min(2, T + 1)
  let finalScore = score_t;
  if (score_z === 2 || score_af === 2 || score_al === 2 || score_ar === 2) {
    finalScore = Math.min(2, score_t + 1);
  }

  const complejidad = finalScore === 2 ? "Alta Complejidad" : (finalScore === 1 ? "Media Complejidad" : "Baja Complejidad");
  let modalidad = "ATENCIÓN PRIMARIA / PREVENTIVO";
  if (finalScore >= 2) {
    modalidad = (barthel <= 60 || score_z === 2)
      ? "DOMICILIARIO (Dependencia Funcional Severa)"
      : "AMBULATORIO (Alta Complejidad con Movilidad)";
  } else if (finalScore === 1) {
    modalidad = "AMBULATORIO (Media Complejidad)";
  }

  const numSeg = p.seguimientos.length + 1;
  const newSeg = {
    id: `SEG-${p.id || p.doc}-${String(numSeg).padStart(3, "0")}`,
    numero: numSeg,
    fecha,
    motivo: motivoVal,
    motivoTexto,
    evaluadorId,
    evaluadorNombre: prof.nombre || currentUser.name,
    evaluadorRol: prof.rolNombre || prof.rol || "Profesional de Salud",
    crit: p.crit || "IC",
    score_t,
    barthel,
    score_z,
    lawton,
    mnaSf: mna,
    score_al,
    pfeiffer,
    score_af,
    gijon,
    zarit,
    score_ar,
    finalScore,
    complejidad,
    modalidad,
    metas_pai: {
      sanitarias: document.getElementById("mseg-meta-san").value,
      nutricionales: document.getElementById("mseg-meta-nut").value,
      psicologicas: document.getElementById("mseg-meta-psi").value,
      sociales: document.getElementById("mseg-meta-soc").value
    },
    herramientas_554: {
      numMedicamentos: safeNum(document.getElementById("mseg-num-meds")?.value, 0),
      redApoyoPersonas: safeNum(document.getElementById("mseg-red-personas")?.value, 0),
      sindromesGeriatricos: Array.from(document.querySelectorAll(".mseg-sindrome-chk:checked")).map(c => c.value),
      cribadoAfectivo: {
        p1: safeNum(document.getElementById("mseg-afec-1")?.value, 0),
        p2: safeNum(document.getElementById("mseg-afec-2")?.value, 0),
        alterado: safeNum(document.getElementById("mseg-afec-1")?.value, 0) >= 2 || safeNum(document.getElementById("mseg-afec-2")?.value, 0) >= 2
      },
      cribadoSocialRapido: {
        relacion: document.getElementById("mseg-soc-1")?.value || "SI",
        ayuda: document.getElementById("mseg-soc-2")?.value || "SI",
        recursos: document.getElementById("mseg-soc-3")?.value || "SI",
        alterado: (document.getElementById("mseg-soc-1")?.value === "NO" || document.getElementById("mseg-soc-2")?.value === "NO" || document.getElementById("mseg-soc-3")?.value === "NO")
      },
      eq5d5l: {
        nivel: document.getElementById("mseg-eq5d-nivel")?.value || "NO_APLICA",
        eva: document.getElementById("mseg-eq5d-eva")?.value || ""
      },
      satisfaccion: {
        general: document.getElementById("mseg-satisfaccion")?.value || "NO_APLICA",
        informado: !!document.getElementById("mseg-sat-info")?.checked,
        tiempos: !!document.getElementById("mseg-sat-tiempo")?.checked,
        participacion: !!document.getElementById("mseg-sat-plan")?.checked,
        equipo: !!document.getElementById("mseg-sat-equipo")?.checked,
        calidadVida: !!document.getElementById("mseg-sat-calidad")?.checked
      }
    },
    observaciones: obs
  };

  p.seguimientos.push(newSeg);
  if ((p.rutaFase || 1) < 6) p.rutaFase = 6;

  // Guardar en Storage y sincronizar
  saveToStorage();
  if (window.supabaseClient) {
    syncSeguimientoToSupabase(p, newSeg);
  }

  closeModal("modal-new-seguimiento");
  renderSeguimientoTab();
  renderPatientsTable();

  const deltas = calculateDeltas(p.ingreso, newSeg);
  alert(`✅ Seguimiento N° ${numSeg} registrado exitosamente:

` +
        `• Nivel de Avance: ${deltas.statusText}
` +
        `• Nueva Complejidad: ${complejidad} (${modalidad})
` +
        `• Variación Barthel: ${deltas.deltaBarthel >= 0 ? "+" + deltas.deltaBarthel : deltas.deltaBarthel} pts
` +
        `• Variación Zarit: ${deltas.deltaZarit} pts`);
}

/**
 * Sincroniza un seguimiento específico contra Supabase en tiempo real
 */
async function syncSeguimientoToSupabase(paciente, seg) {
  if (!window.supabaseClient) return;
  try {
    await window.supabaseClient.from("seguimientos").upsert({
      id: seg.id,
      paciente_id: paciente.id || paciente.doc,
      numero_seguimiento: seg.numero,
      fecha_seguimiento: seg.fecha,
      motivo_seguimiento: seg.motivo,
      evaluador_id: seg.evaluadorId,
      evaluador_nombre: seg.evaluadorNombre,
      evaluador_rol: seg.evaluadorRol,
      score_t: seg.score_t,
      score_z: seg.score_z,
      score_al: seg.score_al,
      score_af: seg.score_af,
      score_ar: seg.score_ar,
      score_final: seg.finalScore,
      complejidad: seg.complejidad,
      modalidad_sugerida: seg.modalidad,
      metas_pai: seg.metas_pai,
      datos_completos: seg,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error("Error sincronizando seguimiento en Supabase", e);
  }
}

function printSeguimientoReport() {
  window.print();
}

// ============================================================================
// GRÁFICA EVOLUTIVA LONGITUDINAL INTERACTIVA (CHART.JS — EJES DUALES)
// ============================================================================
window.segEvolutionChartInstance = null;
window.segChartActiveFilter = "all";

function renderSeguimientoChart(p) {
  const canvas = document.getElementById("seg-evolution-chart");
  const fallback = document.getElementById("seg-chart-fallback");
  if (!canvas) return;

  if (typeof window.Chart === "undefined") {
    canvas.style.display = "none";
    if (fallback) {
      fallback.style.display = "block";
      fallback.textContent = "La gráfica interactiva requiere conexión para cargar Chart.js. Los datos numéricos siguen disponibles en la matriz comparativa.";
    }
    return;
  }

  canvas.style.display = "block";
  if (fallback) fallback.style.display = "none";

  const base = p.ingreso || {};
  const segs = Array.isArray(p.seguimientos) ? p.seguimientos : [];
  const points = [
    {
      label: `Ingreso (${base.fecha || p.vmdDate || "Base"})`,
      barthel: safeNum(base.barthel, 100),
      mna: safeNum(base.mnaSf, 14),
      zarit: safeNum(base.zarit, 22),
      meta: "Valoración Basal (Ingreso VMD)"
    },
    ...segs.map(s => ({
      label: `Seg #${s.numero} (${s.fecha || "-"})`,
      barthel: safeNum(s.barthel, 100),
      mna: safeNum(s.mnaSf, 14),
      zarit: safeNum(s.zarit, 22),
      meta: `${s.motivoTexto || s.motivo || "Seguimiento"} — ${s.evaluadorNombre || "Equipo New Care"}`
    }))
  ];

  const labels = points.map(pt => pt.label);
  const dataBarthel = points.map(pt => pt.barthel);
  const dataMna = points.map(pt => pt.mna);
  const dataZarit = points.map(pt => pt.zarit);

  const b0 = dataBarthel[0];
  const m0 = dataMna[0];
  const z0 = dataZarit[0];

  if (window.segEvolutionChartInstance) {
    window.segEvolutionChartInstance.destroy();
    window.segEvolutionChartInstance = null;
  }

  const mode = window.segChartActiveFilter || "all";

  const ctx = canvas.getContext("2d");
  window.segEvolutionChartInstance = new window.Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Barthel (0–100, ↑ mejor)",
          data: dataBarthel,
          yAxisID: "y",
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.12)",
          borderWidth: 2.8,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#059669",
          tension: 0.25,
          fill: mode === "barthel",
          hidden: mode !== "all" && mode !== "barthel"
        },
        {
          label: "Zarit (22–88, ↓ mejor)",
          data: dataZarit,
          yAxisID: "y",
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124, 58, 237, 0.10)",
          borderWidth: 2.5,
          borderDash: [6, 4],
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#7c3aed",
          tension: 0.25,
          fill: mode === "zarit",
          hidden: mode !== "all" && mode !== "zarit"
        },
        {
          label: "MNA-SF (0–14, ↑ mejor)",
          data: dataMna,
          yAxisID: "yMna",
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.12)",
          borderWidth: 2.8,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointStyle: "rectRot",
          pointBackgroundColor: "#d97706",
          tension: 0.25,
          fill: mode === "mna",
          hidden: mode !== "all" && mode !== "mna"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            font: { size: 11.5, weight: "600" }
          }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.94)",
          padding: 10,
          titleFont: { size: 12, weight: "700" },
          bodyFont: { size: 11.5 },
          callbacks: {
            afterTitle: (items) => {
              const idx = items[0]?.dataIndex ?? 0;
              return points[idx]?.meta || "";
            },
            label: (ctxItem) => {
              const idx = ctxItem.dataIndex;
              const val = ctxItem.parsed.y;
              if (ctxItem.datasetIndex === 0) {
                const d = val - b0;
                const dStr = idx === 0 ? "Base" : `Δ ${d >= 0 ? "+" + d : d} pts`;
                return ` Barthel: ${val} / 100 pts (${dStr})`;
              }
              if (ctxItem.datasetIndex === 1) {
                const d = val - z0;
                const dStr = idx === 0 ? "Base" : `Δ ${d >= 0 ? "+" + d : d} pts`;
                return ` Zarit: ${val} / 88 pts (${dStr})`;
              }
              const d = val - m0;
              const dStr = idx === 0 ? "Base" : `Δ ${d >= 0 ? "+" + d : d} pts`;
              return ` MNA-SF: ${val} / 14 pts (${dStr})`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(226, 232, 240, 0.6)" },
          ticks: { font: { size: 11 }, color: "#334155" }
        },
        y: {
          type: "linear",
          position: "left",
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Barthel (0–100) / Zarit (22–88)",
            color: "#334155",
            font: { size: 11, weight: "700" }
          },
          grid: { color: "rgba(226, 232, 240, 0.7)" },
          ticks: { stepSize: 20, font: { size: 11 }, color: "#475569" }
        },
        yMna: {
          type: "linear",
          position: "right",
          min: 0,
          max: 14,
          title: {
            display: true,
            text: "MNA-SF (0–14)",
            color: "#b45309",
            font: { size: 11, weight: "700" }
          },
          grid: { drawOnChartArea: false },
          ticks: { stepSize: 2, font: { size: 11 }, color: "#b45309" }
        }
      }
    }
  });
}

function filterSeguimientoChart(mode, btnEl) {
  window.segChartActiveFilter = mode;
  const btns = document.querySelectorAll("#seg-chart-filters .chart-filter-btn");
  btns.forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");

  if (!window.segEvolutionChartInstance) return;
  const chart = window.segEvolutionChartInstance;
  chart.data.datasets[0].hidden = (mode !== "all" && mode !== "barthel");
  chart.data.datasets[0].fill = (mode === "barthel");
  chart.data.datasets[1].hidden = (mode !== "all" && mode !== "zarit");
  chart.data.datasets[1].fill = (mode === "zarit");
  chart.data.datasets[2].hidden = (mode !== "all" && mode !== "mna");
  chart.data.datasets[2].fill = (mode === "mna");
  chart.update();
}

// ============================================================================
// CAPÍTULO 5 NEW CARE: ESTADOS (5.3.2), DERIVACIONES (5.3.3),
// DESCOMPENSACIONES (5.3.4), PIZARRA (5.5.4) Y RUTA DEL PACIENTE (5.6)
// ============================================================================

const ESTADOS_PROGRAMA_NEWCARE = {
  REMITIDO: { label: "Remitido sin evaluación", cssClass: "estado-remitido" },
  SOSPECHOSO: { label: "Sospechoso (Baja complejidad / Anual)", cssClass: "estado-sospechoso" },
  DESESTIMADO: { label: "Desestimado", cssClass: "estado-desestimado" },
  RECHAZO: { label: "Rechazo a valoración / programa", cssClass: "estado-rechazo" },
  ACTIVO: { label: "Activo", cssClass: "estado-activo" },
  DERIVADO: { label: "Derivado a Cuidados Paliativos", cssClass: "estado-derivado" },
  FALLECIDO: { label: "Fallecido", cssClass: "estado-fallecido" },
  RENUNCIA: { label: "Renuncia Voluntaria", cssClass: "estado-renuncia" },
  ALTA: { label: "Alta del Programa", cssClass: "estado-alta" }
};

function changePatientProgramStatus(newStatus) {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  p.estadoPrograma = newStatus;
  if (newStatus === "DERIVADO") p.rutaFase = 8;
  if (newStatus === "ALTA" || newStatus === "RENUNCIA" || newStatus === "FALLECIDO") p.rutaFase = 9;
  saveToStorage();
  renderSeguimientoTab();
  renderPatientsTable();
  if (document.getElementById("tab-ruta-pizarra")?.style.display === "block") {
    renderRutaYPizarraTab();
  }
}

function changePatientAltaReason(reason) {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  p.motivoAlta = reason;
  saveToStorage();
}

// --- 5.3.4 DESCOMPENSACIONES CLÍNICAS POR PATOLOGÍA Y ALTERACIONES SOCIALES ---
const DESCOMPENSACIONES_CLINICAS = {
  IC: {
    nombre: "Insuficiencia Cardíaca (IC)",
    aguda: [
      "Disnea de reposo de aparición aguda",
      "Crisis de Disnea Paroxística Nocturna",
      "Dolor torácico intenso de aparición aguda",
      "Crisis hipertensiva (TAs > 200 o TAd > 100 mmHg)",
      "Palpitaciones con pulso irregular (>150 lpm) y/o repercusión hemodinámica",
      "Síncope (pérdida aguda del conocimiento)"
    ],
    progresiva: [
      "Disnea progresiva hasta mínimos esfuerzos",
      "Crisis hipertensiva progresiva (TAs > 180 o TAd > 90 mmHg)",
      "Edemas en MMII de aparición progresiva",
      "Taquicardia rítmica sin repercusión hemodinámica",
      "Fiebre (infecciones concurrentes)",
      "Cansancio fácil y progresivo"
    ]
  },
  EPOC: {
    nombre: "Insuficiencia Respiratoria (EPOC)",
    aguda: [
      "Disnea de reposo de aparición aguda",
      "Dolor torácico agudo e intenso",
      "Síntomas de hipercapnia aguda (cefalea, somnolencia, flapping, cianosis)"
    ],
    progresiva: [
      "Disnea de aparición progresiva",
      "Fiebre (infecciones concurrentes)",
      "Tos en aumento, persistente y nocturna",
      "Mayor producción de mucosidad, más espesa o verdosa/purulenta"
    ]
  },
  CIRROSIS: {
    nombre: "Insuficiencia Hepática (Cirrosis)",
    aguda: [
      "Encefalopatía hepática grado III–IV",
      "Ascitis a tensión vs. Anasarca",
      "Hemorragia digestiva aguda"
    ],
    progresiva: [
      "Encefalopatía hepática grado I–II",
      "Ascitis no a tensión",
      "Ictericia",
      "Fiebre",
      "Edemas progresivos"
    ]
  },
  ERC: {
    nombre: "Insuficiencia Renal Crónica (ERC)",
    aguda: [
      "Disnea de aparición aguda",
      "Signos de uremia (náuseas/vómitos, asterixis, letargia, fetor urémico)",
      "Oligo-Anuria",
      "Signos de hiperpotasemia (arritmias, debilidad muscular en MMII)",
      "Crisis hipertensiva (TAs > 200 o TAd > 100 mmHg)"
    ],
    progresiva: [
      "Disnea progresiva",
      "Prurito",
      "Calambres musculares",
      "Anorexia",
      "Edemas",
      "Insomnio",
      "Subida de TA (TAs > 140 y/o TAd > 80 mmHg)",
      "Cansancio y palidez cutánea (anemia)"
    ]
  }
};

const ALTERACIONES_SOCIALES = {
  urgentes: [
    "Cuidador con síntomas graves de sobrecarga",
    "Falta de recursos económicos por interrupción repentina de ingresos",
    "Cambio de domicilio con infraestructuras no acondicionadas",
    "Enfermedad repentina y grave del cuidador principal",
    "Aparición repentina de necesidades de cuidado en otro familiar",
    "Fallecimiento del cuidador principal sin red de apoyo"
  ],
  progresivas: [
    "Cambios progresivos en los roles familiares",
    "Edad avanzada del cuidador principal",
    "Problemática emocional del paciente (afecta adherencia/autocuidado)",
    "Problemática emocional del cuidador principal",
    "Cuidador principal con síntomas leves de sobrecarga",
    "Falta de información o conocimiento sobre manejo del paciente"
  ]
};

function openDescompensacionModal() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  const dateEl = document.getElementById("desc-fecha");
  if (dateEl) dateEl.value = new Date().toISOString().split("T")[0];
  const patEl = document.getElementById("desc-patologia");
  if (patEl) patEl.value = p.crit || "IC";
  const condEl = document.getElementById("desc-conducta");
  if (condEl) condEl.value = "";
  renderDescompensacionChecklists();
  openModal("modal-descompensacion");
}

function renderDescompensacionChecklists() {
  const pat = document.getElementById("desc-patologia")?.value || "IC";
  const cfg = DESCOMPENSACIONES_CLINICAS[pat] || DESCOMPENSACIONES_CLINICAS.IC;
  const cont = document.getElementById("desc-checklists-container");
  if (!cont) return;

  cont.innerHTML = `
    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px;">
      <div style="font-weight:800; font-size:12px; color:#991b1b; margin-bottom:6px;">
        🔴 DESCOMPENSACIÓN AGUDA — ${cfg.nombre} (Derivación urgente hospitalaria / Respuesta 24–48 h)
      </div>
      <div class="checklist-grid-compact">
        ${cfg.aguda.map(s => `<label><input type="checkbox" class="desc-chk desc-aguda" value="${s}" onchange="updateDescompensacionConductaBanner()"> ${s}</label>`).join("")}
      </div>
    </div>
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px;">
      <div style="font-weight:800; font-size:12px; color:#92400e; margin-bottom:6px;">
        🟡 DESCOMPENSACIÓN PROGRESIVA — ${cfg.nombre} (Intervención temprana no urgente)
      </div>
      <div class="checklist-grid-compact">
        ${cfg.progresiva.map(s => `<label><input type="checkbox" class="desc-chk desc-progresiva" value="${s}" onchange="updateDescompensacionConductaBanner()"> ${s}</label>`).join("")}
      </div>
    </div>
    <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:8px; padding:10px;">
      <div style="font-weight:800; font-size:12px; color:#5b21b6; margin-bottom:6px;">
        🤝 ALTERACIONES SOCIALES (Urgentes y Progresivas — Trabajo Social / Promotor Comunitario)
      </div>
      <div class="checklist-grid-compact">
        ${ALTERACIONES_SOCIALES.urgentes.map(s => `<label><input type="checkbox" class="desc-chk desc-social-urg" value="[Social Urgente] ${s}" onchange="updateDescompensacionConductaBanner()"> <strong>[Urgente]</strong> ${s}</label>`).join("")}
        ${ALTERACIONES_SOCIALES.progresivas.map(s => `<label><input type="checkbox" class="desc-chk desc-social-prog" value="[Social Progresiva] ${s}" onchange="updateDescompensacionConductaBanner()"> ${s}</label>`).join("")}
      </div>
    </div>
  `;
  updateDescompensacionConductaBanner();
}

function updateDescompensacionConductaBanner() {
  const banner = document.getElementById("desc-conducta-banner");
  if (!banner) return;
  const agudas = document.querySelectorAll(".desc-aguda:checked").length;
  const prog = document.querySelectorAll(".desc-progresiva:checked").length;
  const socUrg = document.querySelectorAll(".desc-social-urg:checked").length;
  const socProg = document.querySelectorAll(".desc-social-prog:checked").length;

  if (agudas > 0) {
    banner.style.background = "#fef2f2";
    banner.style.borderColor = "#dc2626";
    banner.style.color = "#991b1b";
    banner.innerHTML = `<strong>🚨 RUTA DE DESCOMPENSACIÓN AGUDA ACTIVADA (${agudas} signo(s) agudo(s)):</strong> Requiere valoración médica inmediata, articulación con EPS para traslado a nivel hospitalario si aplica y respuesta máxima en <strong>24–48 horas</strong>.`;
  } else if (socUrg > 0) {
    banner.style.background = "#faf5ff";
    banner.style.borderColor = "#7c3aed";
    banner.style.color = "#5b21b6";
    banner.innerHTML = `<strong>⚠️ ALTERACIÓN SOCIAL URGENTE (${socUrg}):</strong> Activar de inmediato a Trabajo Social / Promotor Comunitario para provisión de apoyos en domicilio o centro especializado.`;
  } else if (prog > 0 || socProg > 0) {
    banner.style.background = "#fffbeb";
    banner.style.borderColor = "#d97706";
    banner.style.color = "#92400e";
    banner.innerHTML = `<strong>🟡 RUTA DE DESCOMPENSACIÓN PROGRESIVA (${prog + socProg} hallazgo(s)):</strong> Intervenir tan pronto se detecte mediante consulta prioritaria o reajuste terapéutico para evitar progresión a cuadro agudo.`;
  } else {
    banner.style.background = "#f8fafc";
    banner.style.borderColor = "#cbd5e1";
    banner.style.color = "#475569";
    banner.innerHTML = "Seleccione los signos de alarma presentes para determinar la ruta de respuesta (Aguda 24–48 h vs. Progresiva).";
  }
}

function saveDescompensacion() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  ensurePatientTrackingStructure(p);

  const fecha = document.getElementById("desc-fecha")?.value;
  const fuente = document.getElementById("desc-fuente")?.value || "EQUIPO";
  const patologia = document.getElementById("desc-patologia")?.value || p.crit || "IC";
  const conducta = document.getElementById("desc-conducta")?.value.trim() || "";
  const signos = Array.from(document.querySelectorAll(".desc-chk:checked")).map(c => c.value);

  if (!fecha || signos.length === 0) {
    alert("Seleccione la fecha y al menos un signo de alarma o alteración social.");
    return;
  }

  const esAguda = document.querySelectorAll(".desc-aguda:checked").length > 0;
  const esSocUrg = document.querySelectorAll(".desc-social-urg:checked").length > 0;
  const severidad = esAguda ? "AGUDA" : (esSocUrg ? "SOCIAL_URGENTE" : "PROGRESIVA");

  p.descompensaciones.push({
    id: `DESC-${Date.now()}`,
    fecha,
    fuente,
    patologia,
    severidad,
    signos,
    conducta,
    registradoPor: currentUser?.name || "Equipo New Care"
  });
  p.rutaFase = 7;
  saveToStorage();
  closeModal("modal-descompensacion");
  renderSeguimientoTab();
  alert(`✅ Descompensación (${severidad}) registrada en Historia Clínica.`);
}

function renderDescompensacionesList(p) {
  const cont = document.getElementById("seg-descompensaciones-list");
  if (!cont) return;
  const list = p.descompensaciones || [];
  if (list.length === 0) {
    cont.innerHTML = `<div style="padding:10px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:6px; text-align:center;">Sin episodios de descompensación registrados.</div>`;
    return;
  }
  cont.innerHTML = list.slice().reverse().map(d => {
    const isUrg = d.severidad === "AGUDA" || d.severidad === "SOCIAL_URGENTE";
    return `
      <div style="padding:10px; border-radius:6px; border-left:4px solid ${isUrg ? "#dc2626" : "#d97706"}; background:${isUrg ? "#fef2f2" : "#fffbeb"};">
        <div style="display:flex; justify-content:space-between; font-weight:700; color:${isUrg ? "#991b1b" : "#92400e"}; margin-bottom:4px;">
          <span>${isUrg ? "🔴" : "🟡"} ${d.severidad} (${d.patologia})</span>
          <span>📅 ${d.fecha}</span>
        </div>
        <div style="margin-bottom:4px;"><strong>Signos:</strong> ${d.signos.join(", ")}</div>
        ${d.conducta ? `<div><strong>Conducta:</strong> ${d.conducta}</div>` : ""}
      </div>`;
  }).join("");
}

// --- 5.3.3 CRITERIOS DE DERIVACIÓN ENTRE NIVELES ---
const CRITERIOS_DERIVACION = {
  AMBULATORIO_A_DOMICILIO: [
    "Pérdida de funcionalidad y capacidad de movilización",
    "Dificultades para acudir a consulta ambulatoria",
    "Control de síntomas complejos en domicilio",
    "Necesidades sociales adversas",
    "Reajuste de tratamiento supervisado",
    "Continuidad post hospitalización"
  ],
  DOMICILIO_A_AMBULATORIO: [
    "Resolución del cuadro agudo",
    "Paciente puede desplazarse con seguridad",
    "Adecuada red de cuidados",
    "Condiciones del entorno adecuadas"
  ],
  A_HOSPITAL_URGENCIAS: [
    "Descompensación aguda que requiere soporte hospitalario",
    "Administración de fármacos o procedimientos complejos intrahospitalarios",
    "Coordinación activa con EPS y red de urgencias"
  ],
  HOSPITAL_A_DOMICILIO: [
    "Egreso hospitalario con dependencia funcional (Barthel ≤ 60)",
    "Requiere seguimiento post-alta en primeras 48–72 h"
  ],
  HOSPITAL_A_AMBULATORIO: [
    "Egreso hospitalario con movilidad conservada y red estable"
  ],
  A_CUIDADOS_PALIATIVOS: [
    "Criterios NECPAL positivos / enfermedad orgánica terminal avanzada",
    "Consenso en Junta de Cronicidad y articulación con familia y EPS"
  ],
  A_CENTRO_SOCIAL: [
    "Alteración social urgente sin soporte familiar suficiente en domicilio"
  ]
};

function openDerivacionModal() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  const dateEl = document.getElementById("deriv-fecha");
  if (dateEl) dateEl.value = new Date().toISOString().split("T")[0];
  const respEl = document.getElementById("deriv-responsable");
  if (respEl) respEl.value = currentUser?.name || "Médico / EPA New Care";
  const recEl = document.getElementById("deriv-receptor");
  if (recEl) recEl.value = p.eps || "EPS / Red Prestadora";
  const resEl = document.getElementById("deriv-resumen");
  if (resEl) resEl.value = "";
  renderDerivacionCriterios();
  openModal("modal-derivacion");
}

function renderDerivacionCriterios() {
  const tipo = document.getElementById("deriv-tipo")?.value || "AMBULATORIO_A_DOMICILIO";
  const list = CRITERIOS_DERIVACION[tipo] || [];
  const cont = document.getElementById("deriv-criterios-container");
  if (!cont) return;
  cont.innerHTML = list.map(c => `<label><input type="checkbox" class="deriv-crit-chk" value="${c}"> ${c}</label>`).join("");
}

function saveDerivacion() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  ensurePatientTrackingStructure(p);

  const fecha = document.getElementById("deriv-fecha")?.value;
  const tipoEl = document.getElementById("deriv-tipo");
  const tipo = tipoEl?.value || "AMBULATORIO_A_DOMICILIO";
  const tipoTexto = tipoEl?.selectedOptions[0]?.text || tipo;
  const responsable = document.getElementById("deriv-responsable")?.value.trim() || "";
  const receptor = document.getElementById("deriv-receptor")?.value.trim() || "";
  const resumen = document.getElementById("deriv-resumen")?.value.trim() || "";
  const criterios = Array.from(document.querySelectorAll(".deriv-crit-chk:checked")).map(c => c.value);

  if (!fecha || criterios.length === 0) {
    alert("Seleccione la fecha y verifique al menos un criterio normativo de derivación.");
    return;
  }

  p.derivaciones.push({
    id: `DERIV-${Date.now()}`,
    fecha,
    tipo,
    tipoTexto,
    criterios,
    responsable,
    receptor,
    resumen
  });

  if (tipo === "A_CUIDADOS_PALIATIVOS") {
    p.estadoPrograma = "DERIVADO";
    p.rutaFase = 8;
  }
  saveToStorage();
  closeModal("modal-derivacion");
  renderSeguimientoTab();
  alert(`✅ Derivación registrada (${tipoTexto}).`);
}

function renderDerivacionesList(p) {
  const cont = document.getElementById("seg-derivaciones-list");
  if (!cont) return;
  const list = p.derivaciones || [];
  if (list.length === 0) {
    cont.innerHTML = `<div style="padding:10px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:6px; text-align:center;">Sin derivaciones registradas entre niveles asistenciales.</div>`;
    return;
  }
  cont.innerHTML = list.slice().reverse().map(d => `
    <div style="padding:10px; border-radius:6px; border-left:4px solid #1e3a8a; background:#eff6ff;">
      <div style="display:flex; justify-content:space-between; font-weight:700; color:#1e3a8a; margin-bottom:4px;">
        <span>🔀 ${d.tipoTexto}</span>
        <span>📅 ${d.fecha}</span>
      </div>
      <div style="margin-bottom:4px;"><strong>Criterios:</strong> ${d.criterios.join(" • ")}</div>
      <div style="font-size:11px; color:#475569;"><strong>Responsable:</strong> ${d.responsable} | <strong>Receptor/EPS:</strong> ${d.receptor}</div>
      ${d.resumen ? `<div style="margin-top:4px;"><strong>Resumen:</strong> ${d.resumen}</div>` : ""}
    </div>`).join("");
}

// --- 5.6 RUTA DEL PACIENTE (9 ETAPAS) & 5.5.4 PIZARRA OPERATIVA ---
const RUTA_PACIENTE_ETAPAS = [
  { num: 1, title: "Identificación EPS", sla: "Masiva mensual / Remisión", resp: "Aseguradora + Enlace IPS", desc: "Recepción de datos mínimos desde la EPS (identificación, contacto, diagnóstico IOCC y cuidador)." },
  { num: 2, title: "Contacto y Agendamiento", sla: "≤ 5 días hábiles", resp: "Aux. Admisiones / Enfermería", desc: "Contacto telefónico con paciente/familia y agendamiento de la Valoración Multidimensional." },
  { num: 3, title: "VMD y Estratificación", sla: "Día 0 del proceso", resp: "Médico / EPA / Trabajo Social", desc: "Aplicación de escalas oficiales, cálculo de complejidad New Care y asignación del Estado del Paciente (5.3.2)." },
  { num: 4, title: "Ingreso o Seguimiento Anual", sla: "Decisión inmediata", resp: "Jefe Programa / Médico", desc: "Si Media/Alta Complejidad → Estado ACTIVO. Si Baja Complejidad → Estado SOSPECHOSO (control anual)." },
  { num: 5, title: "VI y Emisión de PAI", sla: "Máx. 30 días desde VMD", resp: "Equipo Interdisciplinario", desc: "Valoración Integral y concertación de metas sanitarias, nutricionales, psicoafectivas y sociales con familia." },
  { num: 6, title: "Seguimientos Periódicos", sla: "Mensual Dom / 3–6M Amb", resp: "Médico, Enfermería, TS", desc: "Controles según complejidad, escalas trimestrales (MNA, Zarit, Gijón, Red) y semestrales (EQ-5D-5L, Satisfacción)." },
  { num: 7, title: "Descompensaciones 24/7", sla: "24–48 h Agudos", resp: "Jefe Programa + Médico", desc: "Atención de novedades por canal WhatsApp 24/7, ruta de descompensación aguda/progresiva y derivación EPS." },
  { num: 8, title: "Juntas y Transición CP", sla: "Junta mensual / NECPAL+", resp: "Junta de Cronicidad", desc: "Revisión interdisciplinaria, Asamblea de Pacientes y transición articulada a Cuidados Paliativos si aplica." },
  { num: 9, title: "Egreso / Alta del Programa", sla: "Cierre documentado en HC", resp: "Médico Tratante + EPS", desc: "Alta por objetivos, traslado de prestador, alta voluntaria (formato firmado) o fallecimiento." }
];

function renderRutaYPizarraTab() {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (p) {
    ensurePatientTrackingStructure(p);
    const nameEl = document.getElementById("ruta-patient-name");
    const estEl = document.getElementById("ruta-patient-estado");
    const estMeta = ESTADOS_PROGRAMA_NEWCARE[p.estadoPrograma] || ESTADOS_PROGRAMA_NEWCARE.ACTIVO;
    if (nameEl) nameEl.textContent = p.name;
    if (estEl) estEl.textContent = estMeta.label;

    const flowCont = document.getElementById("ruta-flujograma-container");
    const detCont = document.getElementById("ruta-etapa-detalle");
    const activeNum = p.rutaFase || 5;

    if (flowCont) {
      flowCont.innerHTML = RUTA_PACIENTE_ETAPAS.map(et => {
        const cls = et.num < activeNum ? "done" : (et.num === activeNum ? "active" : "");
        return `
          <button type="button" class="ruta-step ${cls}" onclick="setPatientRutaFase(${et.num})">
            <div class="ruta-step-num">Paso ${et.num} ${et.num < activeNum ? "✓" : (et.num === activeNum ? "• Actual" : "")}</div>
            <div class="ruta-step-title">${et.title}</div>
            <div class="ruta-step-sla">⏱️ ${et.sla}</div>
          </button>`;
      }).join("");
    }
    if (detCont) {
      const curr = RUTA_PACIENTE_ETAPAS.find(x => x.num === activeNum) || RUTA_PACIENTE_ETAPAS[0];
      detCont.innerHTML = `
        <div style="font-weight:800; color:#1e3a8a; margin-bottom:4px;">Etapa Actual (${curr.num}/9): ${curr.title}</div>
        <div><strong>Responsable:</strong> ${curr.resp} &bull; <strong>Tiempo Normativo:</strong> ${curr.sla}</div>
        <div style="margin-top:4px; color:#334155;">${curr.desc}</div>`;
    }
  }
  renderPizarraOperativa();
  if (window.lucide) lucide.createIcons();
}

function setPatientRutaFase(num) {
  const p = patients.find(item => item.id === currentPatientId) || patients[0];
  if (!p) return;
  p.rutaFase = num;
  saveToStorage();
  renderRutaYPizarraTab();
}

function renderPizarraOperativa() {
  const tbody = document.getElementById("pizarra-table-body");
  if (!tbody) return;
  const filterEst = document.getElementById("pizarra-filter-estado")?.value || "ALL";

  const rows = patients.filter(p => {
    ensurePatientTrackingStructure(p);
    if (filterEst !== "ALL" && p.estadoPrograma !== filterEst) return false;
    return true;
  });

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; color:#94a3b8; padding:18px;">No hay pacientes en el estado seleccionado.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => {
    const res = evaluatePatient(p);
    const estMeta = ESTADOS_PROGRAMA_NEWCARE[p.estadoPrograma] || ESTADOS_PROGRAMA_NEWCARE.ACTIVO;
    const fase = p.rutaFase || 4;
    const hasSeg = (p.seguimientos && p.seguimientos.length > 0);
    const hasDesc = (p.descompensaciones && p.descompensaciones.length > 0);
    const hasDeriv = (p.derivaciones && p.derivaciones.length > 0);
    const ok = `<span class="pizarra-mark-ok">✓</span>`;
    const dash = `<span style="color:#cbd5e1;">—</span>`;

    return `
      <tr onclick="loadPatient('${p.id}'); switchTab('tab-seguimiento');" style="cursor:pointer;" title="Clic para abrir seguimiento de ${p.name}">
        <td style="font-weight:700; color:#0f172a;">${p.name}</td>
        <td><span class="badge-estado-programa ${estMeta.cssClass}">${estMeta.label}</span></td>
        <td><strong>${res.complexityText}</strong></td>
        <td>${ok}</td>
        <td>${p.estadoPrograma === "ACTIVO" || fase >= 4 ? ok : dash}</td>
        <td>${fase >= 5 ? ok : dash}</td>
        <td>${fase >= 5 ? ok : dash}</td>
        <td>${hasSeg ? ok : dash}</td>
        <td>${hasSeg ? ok : dash}</td>
        <td>${hasSeg ? ok : dash}</td>
        <td>${hasDesc ? `<span class="pizarra-mark-alert">${p.descompensaciones.length}</span>` : dash}</td>
        <td>${hasDeriv ? `<span class="pizarra-mark-ok">${p.derivaciones.length}</span>` : dash}</td>
        <td style="font-size:11px; color:#475569;">${hasSeg ? `Seg #${p.seguimientos.length} (${p.seguimientos[p.seguimientos.length - 1].fecha})` : (p.vmdDate || "Ingreso pendiente")}</td>
      </tr>`;
  }).join("");
}
