/**
 * audit_simulacion_cohortes.js
 * Auditoría Clínica Profunda, Simulación Multicohorte IOCC y Análisis Predictivo de Trayectorias
 * Programa New Care (Optimus Health IPS)
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

// 1. Cargar funciones clínicas reales desde WebApp_NewCare_VMD/app.js en sandbox controlado
const appJsPath = path.join(__dirname, 'WebApp_NewCare_VMD', 'app.js');
const appCode = fs.readFileSync(appJsPath, 'utf8');

// Extraer bloque de scoring oficial (líneas 330-505) y bloque de seguimiento (calculateDeltas / ensurePatientTrackingStructure)
const sandbox = {
  console,
  Math,
  Number,
  isNaN,
  Array,
  Object,
  Date,
  String
};

// Extraemos funciones puras para auditar exactamente el código en producción
function extractFunction(code, fnName) {
  const regex = new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{`);
  const match = regex.exec(code);
  if (!match) throw new Error(`No se encontró la función ${fnName}`);
  let idx = match.index;
  let braces = 0;
  let started = false;
  for (let i = idx; i < code.length; i++) {
    if (code[i] === '{') { braces++; started = true; }
    else if (code[i] === '}') { braces--; }
    if (started && braces === 0) {
      return code.slice(idx, i + 1);
    }
  }
  throw new Error(`No se pudo cerrar el bloque de ${fnName}`);
}

const fnsToLoad = [
  'getScoreNYHA', 'getScoreGOLD', 'getScoreCP', 'getScoreERC',
  'getScoreBarthel', 'getScoreLawton', 'getScoreMNA_SF', 'getScoreMNA_C',
  'getScorePfeiffer', 'getScoreMMSE', 'getScoreGijon', 'getScoreZarit',
  'evaluatePatient', 'safeNum', 'ensurePatientTrackingStructure',
  'calculateDeltas', 'analyzePatientTrajectory'
];

const extractedCode = fnsToLoad.map(fn => extractFunction(appCode, fn)).join('\n\n');
vm.createContext(sandbox);
vm.runInContext(extractedCode, sandbox);

const { evaluatePatient, ensurePatientTrackingStructure, calculateDeltas, analyzePatientTrajectory } = sandbox;

// ============================================================================
// 2. DEFINICIÓN DE 4 COHORTES CLÍNICAS COMPLEJAS (IOCC) CON TRAYECTORIAS A 90 DÍAS
// ============================================================================
const cohortes = [
  {
    codigo: "COHORTE-IC-01",
    nombre: "Insuficiencia Cardíaca Avanzada (NYHA III -> II) — Trayectoria de Rehabilitación Exitosa",
    paciente: {
      id: "SIM-IC-001", name: "Hernando Quintero", age: 74, crit: "IC",
      nyha: "CLASE III", gold: "No aplica", cp: "No aplica", erc: "G3a",
      barthel: 55, lawton: 3, mnaSf: 9, pfeiffer: 2, gijon: 11, zarit: 52,
      vmdDate: "2026-08-01"
    },
    seguimientos: [
      { fecha: "2026-09-01", dias: 30, score_t: 2, barthel: 60, lawton: 3, mnaSf: 10, pfeiffer: 2, gijon: 10, zarit: 46, finalScore: 2, nota: "Titulación ARNI/iSGLT2 + rehabilitación domiciliaria" },
      { fecha: "2026-10-01", dias: 60, score_t: 1, barthel: 70, lawton: 4, mnaSf: 11, pfeiffer: 2, gijon: 9, zarit: 40, finalScore: 1, nota: "Compensación hemodinámica (NYHA II), transición a ambulatorio" },
      { fecha: "2026-11-01", dias: 90, score_t: 1, barthel: 80, lawton: 5, mnaSf: 12, pfeiffer: 1, gijon: 8, zarit: 34, finalScore: 1, nota: "Consolidación funcional (+25 Barthel) y alivio cuidador (-18 Zarit)" }
    ],
    esperadoFinal: "MEJORIA"
  },
  {
    codigo: "COHORTE-EPOC-02",
    nombre: "EPOC GOLD IV + Fragilidad — Trayectoria de Deterioro Progresivo en Cascada (Silencioso)",
    paciente: {
      id: "SIM-EPOC-002", name: "María Eugenia Saldarriaga", age: 79, crit: "EPOC",
      nyha: "No aplica", gold: "GOLD III", cp: "No aplica", erc: "No aplica",
      barthel: 75, lawton: 5, mnaSf: 11, pfeiffer: 2, gijon: 10, zarit: 42,
      vmdDate: "2026-08-01"
    },
    seguimientos: [
      { fecha: "2026-09-01", dias: 30, score_t: 2, barthel: 68, lawton: 4, mnaSf: 10, pfeiffer: 3, gijon: 11, zarit: 45, finalScore: 2, nota: "Exacerbación leve ambulatoria (-7 Barthel)" },
      { fecha: "2026-10-01", dias: 60, score_t: 2, barthel: 60, lawton: 3, mnaSf: 9, pfeiffer: 4, gijon: 12, zarit: 50, finalScore: 2, nota: "Pérdida acumulada -15 Barthel, cruza umbral Domiciliario (<=60)" },
      { fecha: "2026-11-01", dias: 90, score_t: 2, barthel: 45, lawton: 2, mnaSf: 7, pfeiffer: 6, gijon: 14, zarit: 58, finalScore: 2, nota: "Post-alta hospitalaria: caquexia (MNA 7), delirium/deterioro cognitivo y claudicación cuidador" }
    ],
    esperadoFinal: "DETERIORO"
  },
  {
    codigo: "COHORTE-CIRROSIS-03",
    nombre: "Cirrosis Hepática Child-Pugh B->C — Trayectoria Disociada (Deterioro Clínico + Alivio Cuidador)",
    paciente: {
      id: "SIM-CP-003", name: "Jairo Alonso Montoya", age: 66, crit: "CIRROSIS",
      nyha: "No aplica", gold: "No aplica", cp: "GRADO B", erc: "G2",
      barthel: 70, lawton: 5, mnaSf: 10, pfeiffer: 2, gijon: 11, zarit: 56,
      vmdDate: "2026-08-01"
    },
    seguimientos: [
      { fecha: "2026-09-15", dias: 45, score_t: 2, barthel: 45, lawton: 2, mnaSf: 7, pfeiffer: 5, gijon: 11, zarit: 42, finalScore: 2, nota: "Encefalopatía hepática grado II (+3 errores Pfeiffer), ascitis refractaria (-25 Barthel), PERO llegó apoyo familiar (-14 Zarit)" }
    ],
    esperadoFinal: "DETERIORO (o MIXTA CON ALERTA CRÍTICA)"
  },
  {
    codigo: "COHORTE-ERC-04",
    nombre: "ERC KDIGO G5 Postración Extrema (Barthel = 0) — Caso Borde Falsy 0",
    paciente: {
      id: "SIM-ERC-004", name: "Rosaura Velásquez", age: 84, crit: "ERC",
      nyha: "CLASE II", gold: "No aplica", cp: "No aplica", erc: "G5",
      barthel: 0, lawton: 0, mnaSf: 6, pfeiffer: 8, gijon: 16, zarit: 64,
      vmdDate: "2026-08-01"
    },
    seguimientos: [
      { fecha: "2026-09-01", dias: 30, score_t: 2, barthel: 0, lawton: 0, mnaSf: 7, pfeiffer: 8, gijon: 15, zarit: 50, finalScore: 2, nota: "Cuidado paliativo domiciliario, soporte al cuidador (-14 Zarit), paciente en postración total (Barthel 0)" }
    ],
    esperadoFinal: "ESTABILIDAD_PALIATIVA_CON_ALIVIO_CUIDADOR"
  }
];

console.log("================================================================================");
console.log(" AUDITORÍA CLÍNICA PROFUNDA Y SIMULACIÓN MULTICOHORTE (CÓDIGO ACTUAL EN PROD) ");
console.log("================================================================================\n");

const hallazgos = [];

cohortes.forEach(c => {
  console.log(`▶ ${c.codigo}: ${c.nombre}`);
  const p = JSON.parse(JSON.stringify(c.paciente));
  ensurePatientTrackingStructure(p);

  console.log(`   [Ingreso Basal] T=${p.ingreso.score_t}, Barthel=${p.ingreso.barthel} (Original: ${c.paciente.barthel}), Lawton=${p.ingreso.lawton} (Orig: ${c.paciente.lawton}), MNA=${p.ingreso.mnaSf}, Pfeiffer=${p.ingreso.pfeiffer}, Zarit=${p.ingreso.zarit}, Final=${p.ingreso.finalScore} (${p.ingreso.complejidad})`);

  // Verificar Bug #2 (Falsy 0)
  if (p.ingreso.barthel !== c.paciente.barthel || p.ingreso.lawton !== c.paciente.lawton) {
    const msg = `BUG CRÍTICO [Falsy 0] en ${c.codigo}: Barthel original ${c.paciente.barthel} fue sobrescrito a ${p.ingreso.barthel}; Lawton ${c.paciente.lawton} -> ${p.ingreso.lawton}`;
    console.log(`   ❌ ${msg}`);
    hallazgos.push({ severidad: "CRÍTICA", cohorte: c.codigo, detalle: msg });
  }

  c.seguimientos.forEach((seg, idx) => {
    const deltaBase = calculateDeltas(p.ingreso, seg);
    const prev = idx === 0 ? p.ingreso : c.seguimientos[idx - 1];
    const deltaStep = calculateDeltas(prev, seg);

    console.log(`   [Día ${seg.dias}] T=${seg.score_t} (ΔT=${deltaBase.deltaT}), Barthel=${seg.barthel} (Δ=${deltaBase.deltaBarthel}), MNA=${seg.mnaSf} (Δ=${deltaBase.deltaMna}), Pfeiffer=${seg.pfeiffer} (Δ=${deltaBase.deltaPfeiffer}), Zarit=${seg.zarit} (Δ=${deltaBase.deltaZarit})`);
    console.log(`       -> Clasificación PROD (vs Ingreso): ${deltaBase.globalStatus} (${deltaBase.statusText})`);
    console.log(`       -> Clasificación PROD (vs Anterior): ${deltaStep.globalStatus}`);

    // Verificar Bug #1 (Enmascaramiento de deterioro)
    if (c.codigo === "COHORTE-CIRROSIS-03" && deltaBase.globalStatus === "MEJORIA") {
      const msg = `BUG CRÍTICO [Enmascaramiento de Deterioro] en ${c.codigo}: Paciente con ΔT=+1, ΔBarthel=-25, ΔMNA=-3, ΔPfeiffer=+3 fue clasificado como 'MEJORIA' solo porque ΔZarit=-14.`;
      console.log(`   ❌ ${msg}`);
      hallazgos.push({ severidad: "CRÍTICA", cohorte: c.codigo, detalle: msg });
    }

    // Verificar ceguera a deterioro progresivo escalonado (EPOC día 60)
    if (c.codigo === "COHORTE-EPOC-02" && seg.dias === 60) {
      p.seguimientos = c.seguimientos.slice(0, idx + 1);
      const traj = analyzePatientTrajectory(p);
      console.log(`       -> Motor Predictivo (Día 60): Riesgo=${traj.riskLevel} | Señales: ${traj.signals.join(" ; ")}`);
      if (traj.riskLevel === "BAJO") {
        const msg = `FALLO PREDICTIVO en ${c.codigo} Día 60: No detectó deterioro escalonado.`;
        console.log(`   ❌ ${msg}`);
        hallazgos.push({ severidad: "ALTA", cohorte: c.codigo, detalle: msg });
      }
    }
  });
  p.seguimientos = c.seguimientos;
  const trajFinal = analyzePatientTrajectory(p);
  console.log(`   [Trayectoria Predictiva Final] Riesgo: ${trajFinal.riskLevel} | Señales: ${trajFinal.signals.join(" ; ")}`);
  console.log("");
});

console.log("================================================================================");
console.log(` RESUMEN DE HALLAZGOS AUTOMATIZADOS: ${hallazgos.length} anomalías detectadas`);
console.log("================================================================================");
hallazgos.forEach((h, i) => {
  console.log(`${i + 1}. [${h.severidad}] (${h.cohorte}) ${h.detalle}`);
});
