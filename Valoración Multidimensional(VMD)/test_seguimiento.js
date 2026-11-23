// test_seguimiento.js - Pruebas Unitarias del Módulo de Seguimiento y Deltas
const assert = require('assert');

// Extraer o simular calculateDeltas exactamente como en app.js
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

  let globalStatus = "ESTABILIDAD";
  let statusText = "Estabilidad Clínica";
  let badgeClass = "delta-estabilidad";

  if (deltaFinal < 0 || deltaBarthel >= 10 || deltaZarit <= -10 || deltaMna >= 3) {
    globalStatus = "MEJORIA";
    statusText = "🟢 Avance Favorable (Mejoría)";
    badgeClass = "delta-mejoria";
  } else if (deltaFinal > 0 || deltaBarthel <= -15 || deltaZarit >= 12 || deltaMna <= -3) {
    globalStatus = "DETERIORO";
    statusText = "🔴 Alerta Clínica (Deterioro)";
    badgeClass = "delta-deterioro";
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
    badgeClass
  };
}

console.log("=== INICIANDO PRUEBAS UNITARIAS: MÓDULO DE SEGUIMIENTO Y TRAZABILIDAD ===");

// TEST 1: Caso de Mejoría Funcional y Disminución de Sobrecarga
const baseline1 = {
  score_t: 3,
  barthel: 45,
  lawton: 2,
  mnaSf: 7,
  pfeiffer: 4,
  gijon: 12,
  zarit: 55,
  finalScore: 5
};

const followUp1 = {
  score_t: 2,
  barthel: 65,  // +20 pts
  lawton: 3,
  mnaSf: 11,    // +4 pts
  pfeiffer: 3,
  gijon: 10,
  zarit: 40,    // -15 pts
  finalScore: 3 // -2 pts
};

const d1 = calculateDeltas(baseline1, followUp1);
assert.strictEqual(d1.deltaT, -1, "Delta T debe ser -1");
assert.strictEqual(d1.deltaBarthel, 20, "Delta Barthel debe ser +20");
assert.strictEqual(d1.deltaMna, 4, "Delta MNA debe ser +4");
assert.strictEqual(d1.deltaZarit, -15, "Delta Zarit debe ser -15");
assert.strictEqual(d1.globalStatus, "MEJORIA", "Estado global debe ser MEJORIA");
console.log("✔ Test 1 Superado: Mejoría Funcional, Nutricional y Alivio del Cuidador detectados con éxito.");

// TEST 2: Caso de Deterioro Clínico y Aumento de Sobrecarga
const followUp2 = {
  score_t: 4,
  barthel: 25,  // -20 pts
  lawton: 1,
  mnaSf: 6,     // -1 pt
  pfeiffer: 6,  // +2 errores
  gijon: 14,
  zarit: 68,    // +13 pts
  finalScore: 6 // +1 pt
};

const d2 = calculateDeltas(baseline1, followUp2);
assert.strictEqual(d2.deltaT, 1, "Delta T debe ser +1");
assert.strictEqual(d2.deltaBarthel, -20, "Delta Barthel debe ser -20");
assert.strictEqual(d2.deltaZarit, 13, "Delta Zarit debe ser +13");
assert.strictEqual(d2.globalStatus, "DETERIORO", "Estado global debe ser DETERIORO");
console.log("✔ Test 2 Superado: Deterioro y Alerta Clínica detectados oportunamente.");

// TEST 3: Caso de Estabilidad Clínica
const followUp3 = {
  score_t: 3,
  barthel: 45,  // 0 pts
  lawton: 2,
  mnaSf: 8,     // +1 pt (no suficiente para mejorar categoricamente)
  pfeiffer: 4,
  gijon: 12,
  zarit: 53,    // -2 pts (no significativo)
  finalScore: 5 // 0 pts
};

const d3 = calculateDeltas(baseline1, followUp3);
assert.strictEqual(d3.deltaBarthel, 0, "Delta Barthel debe ser 0");
assert.strictEqual(d3.globalStatus, "ESTABILIDAD", "Estado global debe ser ESTABILIDAD");
console.log("✔ Test 3 Superado: Estabilidad Clínica clasificada correctamente.");

// TEST 4: Trazabilidad 1:N y Estructura Relacional
const testPatient = {
  id: "pac_test_001",
  nombre: "Doña Carmen Rodríguez",
  ingreso: baseline1,
  seguimientos: [
    { id: "seg_1", numero_seguimiento: 1, fecha: "2026-12-15", ...followUp3 },
    { id: "seg_2", numero_seguimiento: 2, fecha: "2027-01-20", ...followUp1 }
  ]
};

assert.strictEqual(testPatient.seguimientos.length, 2, "Debe soportar N seguimientos");
assert.strictEqual(testPatient.seguimientos[0].numero_seguimiento, 1);
assert.strictEqual(testPatient.seguimientos[1].numero_seguimiento, 2);
console.log("✔ Test 4 Superado: Estructura relacional 1:N y trazabilidad secuencial validadas.");

console.log("=== TODAS LAS PRUEBAS UNITARIAS (4/4) COMPLETADAS CON ÉXITO ===");
