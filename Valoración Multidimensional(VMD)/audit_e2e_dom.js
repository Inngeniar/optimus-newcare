/**
 * audit_e2e_dom.js
 * Validación E2E de Contratos DOM (HTML <-> JS), Responsividad CSS y Producción Live
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const webDir = path.join(__dirname, 'WebApp_NewCare_VMD');
const html = fs.readFileSync(path.join(webDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(webDir, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(webDir, 'styles.css'), 'utf8');

console.log("=== 1. AUDITORÍA DE CONTRATOS DOM (IDs JS -> HTML) EN MÓDULO DE SEGUIMIENTO ===");
const segJsStart = js.indexOf('MÓDULO DE SEGUIMIENTO LONGITUDINAL');
const segJs = js.slice(segJsStart);

const idMatches = [...segJs.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(m => m[1]);
const uniqueIds = [...new Set(idMatches)];
let missingIds = [];

uniqueIds.forEach(id => {
  const re = new RegExp(`id=["']${id}["']`);
  if (!re.test(html)) {
    missingIds.push(id);
  }
});

console.log(`Total IDs referenciados en lógica de seguimiento: ${uniqueIds.length}`);
if (missingIds.length === 0) {
  console.log("✔ 100% de los IDs referenciados en app.js existen en index.html.");
} else {
  console.log("❌ IDs FALTANTES en index.html:", missingIds);
}

console.log("\n=== 2. AUDITORÍA DE HANDLERS ONCLICK EN SECCIÓN Y MODAL DE SEGUIMIENTO ===");
const segHtmlStart = html.indexOf('id="tab-seguimiento"');
const segHtml = html.slice(segHtmlStart, segHtmlStart + 18000);
const onclickMatches = [...segHtml.matchAll(/onclick=["']([a-zA-Z0-9_]+)\(/g)].map(m => m[1]);
const uniqueHandlers = [...new Set(onclickMatches)];
let missingHandlers = [];

uniqueHandlers.forEach(fn => {
  const re = new RegExp(`function\\s+${fn}\\s*\\(`);
  if (!re.test(js)) {
    missingHandlers.push(fn);
  }
});

console.log(`Handlers onclick encontrados: ${uniqueHandlers.join(', ')}`);
if (missingHandlers.length === 0) {
  console.log("✔ 100% de los handlers onclick existen en app.js.");
} else {
  console.log("❌ Handlers FALTANTES en app.js:", missingHandlers);
}

console.log("\n=== 3. AUDITORÍA DE RESPONSIVIDAD CSS PARA MÓVIL/TABLET ===");
const hasMediaQuery = /@media\s*\([^)]*max-width\s*:\s*(768|640|480)px\)/.test(css);
const hasTimelineCss = /\.timeline-container/.test(css) && /\.timeline-card/.test(css);
const hasDeltaCss = /\.delta-mejoria/.test(css) && /\.delta-deterioro/.test(css);
const hasResponsiveTable = /overflow-x\s*:\s*auto/.test(html.slice(segHtmlStart, segHtmlStart + 10000)) || /table-responsive/.test(css);

console.log(`Media queries móvil/tablet detectadas: ${hasMediaQuery ? '✔ SÍ' : '❌ NO'}`);
console.log(`Estilos de Timeline definidos: ${hasTimelineCss ? '✔ SÍ' : '❌ NO'}`);
console.log(`Estilos de Badges Delta definidos: ${hasDeltaCss ? '✔ SÍ' : '❌ NO'}`);
console.log(`Scroll horizontal en tablas de comparación: ${hasResponsiveTable ? '✔ SÍ' : '⚠️ REVISAR'}`);

console.log("\n=== 4. VERIFICACIÓN EN VIVO DE PRODUCCIÓN (VERCEL) ===");
function checkUrl(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          ms: Date.now() - start,
          hasSeguimiento: body.includes('tab-seguimiento'),
          hasModal: body.includes('modal-new-seguimiento')
        });
      });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

(async () => {
  const r1 = await checkUrl('https://optimus-newcare-vmd.vercel.app');
  const r2 = await checkUrl('https://inngeniar-hub.vercel.app');
  console.log(`VMD Live: HTTP ${r1.status} (${r1.ms} ms) | tab-seguimiento=${r1.hasSeguimiento} | modal=${r1.hasModal}`);
  console.log(`Hub Live: HTTP ${r2.status} (${r2.ms} ms)`);
})();
