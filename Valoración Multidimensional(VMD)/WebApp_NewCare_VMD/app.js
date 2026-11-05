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
  document.querySelectorAll(".nav-tab").forEach(el => el.classList.remove("active"));
  
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = "block";
  }
  
  // Highlight nav
  const tabs = document.querySelectorAll(".nav-tab");
  if (tabId === "tab-padron") tabs[0]?.classList.add("active");
  if (tabId === "tab-vmd") tabs[1]?.classList.add("active");
  if (tabId === "tab-risk") tabs[2]?.classList.add("active");
  if (tabId === "tab-red") tabs[3]?.classList.add("active");
  if (tabId === "tab-pai") {
    tabs[4]?.classList.add("active");
    renderPrintablePAI();
  }
  if (tabId === "tab-equipo") {
    tabs[5]?.classList.add("active");
    renderTeamDirectory();
  }
  if (tabId === "tab-guia") tabs[6]?.classList.add("active");

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
// MODULO: EQUIPO DE SALUD INTERDISCIPLINARIO & GESTION DE EVALUADORES
// ============================================================================
const STORAGE_PROF_KEY = "newcare_vmd_profesionales_v1";

const defaultProfesionales = [
  {
    id: "EQ-001",
    nombre: "Dr. Carlos Restrepo Mendoza",
    rol: "MED",
    rolNombre: "Médico Internista / Evaluador Senior",
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
  try {
    const raw = localStorage.getItem(STORAGE_PROF_KEY);
    if (raw) {
      stateProfesionales = JSON.parse(raw);
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
    opt.textContent = `${p.nombre} (${p.rol})`;
    opt.style.backgroundColor = "#0f172a";
    opt.style.color = "#ffffff";
    sel.appendChild(opt);
  });

  // Keep current active selection or default to first
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
    badge.className = "badge-role " + (
      prof.rol === "MED" ? "badge-med" :
      prof.rol === "ENF" ? "badge-enf" :
      prof.rol === "TS" ? "badge-ts" : "badge-coord"
    );
  }

  // Update currentUser object for evaluations audit
  currentUser = {
    name: prof.nombre,
    role: prof.rol,
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

    const roleBadgeClass = p.rol === "MED" ? "badge-med" : (p.rol === "ENF" ? "badge-enf" : (p.rol === "TS" ? "badge-ts" : "badge-coord"));
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

function openNewProfessionalModal() {
  document.getElementById("edit-prof-id").value = "";
  document.getElementById("edit-prof-name").value = "";
  document.getElementById("edit-prof-role").value = "MED";
  document.getElementById("edit-prof-doc").value = "";
  document.getElementById("edit-prof-reg").value = "";
  document.getElementById("edit-prof-spec").value = "";
  document.getElementById("edit-prof-phone").value = "";
  document.getElementById("edit-prof-email").value = "";
  document.getElementById("modal-new-prof-title").textContent = "Registrar Nuevo Miembro del Equipo de Salud";
  openModal("modal-new-prof");
}

function editProfessionalRecord(id) {
  const p = stateProfesionales.find(x => x.id === id);
  if (!p) return;

  document.getElementById("edit-prof-id").value = p.id;
  document.getElementById("edit-prof-name").value = p.nombre || "";
  document.getElementById("edit-prof-role").value = p.rol || "MED";
  document.getElementById("edit-prof-doc").value = p.cedula || "";
  document.getElementById("edit-prof-reg").value = p.registro || "";
  document.getElementById("edit-prof-spec").value = p.especialidad || "";
  document.getElementById("edit-prof-phone").value = p.telefono || "";
  document.getElementById("edit-prof-email").value = p.email || "";
  document.getElementById("modal-new-prof-title").textContent = "Editar Miembro del Equipo de Salud";
  openModal("modal-new-prof");
}

function saveProfessionalRecord() {
  const idField = document.getElementById("edit-prof-id").value;
  const nombre = document.getElementById("edit-prof-name").value.trim();
  const rol = document.getElementById("edit-prof-role").value;
  const cedula = document.getElementById("edit-prof-doc").value.trim();
  const registro = document.getElementById("edit-prof-reg").value.trim();
  const especialidad = document.getElementById("edit-prof-spec").value.trim();
  const telefono = document.getElementById("edit-prof-phone").value.trim();
  const email = document.getElementById("edit-prof-email").value.trim();

  if (!nombre) {
    alert("Por favor ingrese los nombres y apellidos del profesional.");
    return;
  }

  const rolNombres = {
    "MED": "Médico Internista / Evaluador Senior",
    "ENF": "Enfermera(o) de Práctica Avanzada",
    "TS": "Trabajador(a) Social Sociosanitaria",
    "COORD": "Coordinador(a) / Junta de Cronicidad"
  };

  if (idField) {
    // Editar
    const idx = stateProfesionales.findIndex(x => x.id === idField);
    if (idx !== -1) {
      stateProfesionales[idx] = {
        ...stateProfesionales[idx],
        nombre,
        rol,
        rolNombre: rolNombres[rol] || rol,
        cedula,
        registro,
        especialidad,
        telefono,
        email
      };
    }
  } else {
    // Crear nuevo
    const newId = "EQ-" + String(stateProfesionales.length + 1).padStart(3, "0");
    stateProfesionales.push({
      id: newId,
      nombre,
      rol,
      rolNombre: rolNombres[rol] || rol,
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
  alert("Profesional guardado exitosamente en el Directorio New Care.");
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

// ============================================================================
// MODULO: CONEXION NUBE SUPABASE (POSTGRESQL & REALTIME SYNC)
// ============================================================================
const SUPABASE_URL_KEY = "newcare_supabase_url";
const SUPABASE_ANON_KEY = "newcare_supabase_anon_key";
const DEFAULT_SUPABASE_URL = "https://anradajzsijjrolmfzepv.supabase.co";

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
    keyInput.value = localStorage.getItem(SUPABASE_ANON_KEY) || "";
  }
  openModal("modal-supabase");
}

function initSupabase() {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem(SUPABASE_ANON_KEY);

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
  const key = document.getElementById("supabase-key-input").value.trim();
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
  const key = document.getElementById("supabase-key-input").value.trim();

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
      stateProfesionales = profs;
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

window.addEventListener("DOMContentLoaded", initApp);
