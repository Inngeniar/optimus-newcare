# ARQUITECTURA DE SOFTWARE & DISEÑO TÉCNICO
## Módulo de Seguimiento Longitudinal • Programa New Care (VMD)
**Optimus Health IPS & Inngeniar Health Suite**  
*Metodología de Acreditación: Fundación NewHealth (Recursos 2.1)*  
*Documento de Fase 1 — Arquitectura y Modelado de Datos*

---

## 1. OBJETIVO DEL MÓDULO DE SEGUIMIENTO

Extender la herramienta de Valoración Multidimensional (VMD) actual para permitir el **seguimiento clínico longitudinal** de los pacientes admitidos en el Programa New Care. 

El módulo resuelve tres requerimientos cardinales:
1. **Asociación Ingreso $\rightarrow$ Seguimientos:** Relación $1:N$ donde cada paciente posee una única Valoración de Ingreso (Línea Base) y múltiples Registros de Seguimiento periódicos o extraordinarios.
2. **Trazabilidad y Nivel de Avance Multidimensional ($\Delta$ Delta):** Comparativa visual y analítica entre el estado inicial y los seguimientos subsecuentes en las 5 dimensiones ($T, Z, AL, AF, AR$) y el cumplimiento de metas del PAI.
3. **Diferenciación Estricta:** Distinción clara visual, documental y en bases de datos entre un evento de *Ingreso al Programa* y un evento de *Control de Seguimiento*.

---

## 2. ESTRUCTURA DE DIRECTORIOS Y ARCHIVOS

```text
Valoración Multidimensional(VMD)/
├── ARCHITECTURE.md                          <- Especificación técnica de arquitectura
├── README_Manual_Usuario_VMD_NewCare.md     <- Manual de usuario y clínico
├── Herramienta_VMD_NewCare_OptimusHealth.xlsx <- Libro Excel autónomo de contingencia
├── Manual_Usuario_VMD_NewCare_OptimusHealth.pdf <- Manual entregable oficial
└── WebApp_NewCare_VMD/
    ├── index.html                           <- Vista principal y modales
    ├── styles.css                           <- Estilos responsivos y badges
    ├── app.js                               <- Lógica de negocio y sincronización
    ├── schema_supabase.sql                  <- DDL relacional de PostgreSQL
    └── vercel.json                          <- Configuración de despliegue Cloud
```

---

## 3. MODELO DE DATOS RELACIONAL (POSTGRESQL / SUPABASE & JSON)

### 3.1. Entidad Principal: `pacientes`
Representa al afiliado en el censo New Care.
```json
{
  "id": "1020304050",
  "documento": "1020304050",
  "nombre": "GÓMEZ PÉREZ, CARLOS ALBERTO",
  "edad": 74,
  "sexo": "M",
  "eps": "Sura",
  "telefono": "+57 310 456 7890",
  "direccion": "Calle 45 # 23-10",
  "criterio_primario": "IC",
  "estado_programa": "ACTIVO", // ACTIVO, EGRESADO, FALLECIDO, SUSPENDIDO
  "fecha_ingreso": "2026-11-05",
  "modalidad_actual": "DOMICILIARIO" // DOMICILIARIO, AMBULATORIO
}
```

### 3.2. Entidad: `ingreso_vmd` (Línea Base $1:1$ con Paciente)
Almacena la fotografía inicial de la VMD con la cual el paciente fue admitido al programa.
```json
{
  "id": "ING-1020304050",
  "paciente_id": "1020304050",
  "tipo_registro": "INGRESO",
  "fecha_vmd": "2026-11-05",
  "evaluador_principal": "EQ-001",
  "severidad_clinica": {
    "criterio": "IC",
    "nyha": "CLASE III",
    "gold": "No aplica",
    "child_pugh": "No aplica",
    "erc": "G3b",
    "score_t": 2
  },
  "funcionalidad": {
    "barthel": 55,
    "lawton": 3,
    "score_z": 2
  },
  "nutricion": {
    "mna_sf": 9,
    "score_al": 1
  },
  "cognitivo": {
    "pfeiffer": 3,
    "score_af": 0
  },
  "social": {
    "gijon": 12,
    "zarit": 48,
    "score_ar": 1
  },
  "algoritmo_resultado": {
    "final_score": 2,
    "complejidad": "Alta Complejidad",
    "modalidad": "DOMICILIARIO"
  },
  "pai_inicial": {
    "sanitarias": "Optimización diuréticos...",
    "nutricionales": "Suplementación proteica...",
    "psicologicas": "Apoyo ansiedad...",
    "sociales": "Relevo cuidador..."
  }
}
```

### 3.3. Entidad: `seguimientos_vmd` (Evoluciones Longitudinales $1:N$)
Cada control periódico genera un registro inmutable con cálculo automático de avance ($\Delta$ Delta).
```json
{
  "id": "SEG-1020304050-001",
  "paciente_id": "1020304050",
  "ingreso_id": "ING-1020304050",
  "tipo_registro": "SEGUIMIENTO",
  "numero_seguimiento": 1,
  "fecha_seguimiento": "2027-05-05",
  "motivo_seguimiento": "PERIODICO_6M", // PERIODICO_6M, PERIODICO_12M, POST_ALTA, DESCOMPENSACION
  "evaluador_principal": "EQ-003", // Enfermera EPA
  "severidad_clinica": {
    "nyha": "CLASE II",
    "gold": "No aplica",
    "child_pugh": "No aplica",
    "erc": "G3b",
    "score_t": 1
  },
  "funcionalidad": {
    "barthel": 70,
    "lawton": 4,
    "score_z": 1
  },
  "nutricion": {
    "mna_sf": 12,
    "score_al": 0
  },
  "cognitivo": {
    "pfeiffer": 2,
    "score_af": 0
  },
  "social": {
    "gijon": 9,
    "zarit": 38,
    "score_ar": 0
  },
  "algoritmo_resultado": {
    "final_score": 1,
    "complejidad": "Media Complejidad",
    "modalidad": "AMBULATORIO"
  },
  "evaluacion_metas_pai": {
    "sanitarias_estado": "LOGRADA", // LOGRADA, EN_PROGRESO, NO_LOGRADA
    "nutricionales_estado": "LOGRADA",
    "psicologicas_estado": "EN_PROGRESO",
    "sociales_estado": "LOGRADA",
    "observaciones_evolucion": "Mejoría notable en Barthel (+15 pts) y descenso en Zarit (-10 pts)."
  },
  "deltas_avance": {
    "delta_t": -1,       // -1 indica reducción de severidad clínica (Mejoría)
    "delta_barthel": +15, // +15 indica ganancia de independencia (Mejoría)
    "delta_mna": +3,     // +3 recuperación nutricional
    "delta_pfeiffer": -1,// -1 menor número de errores
    "delta_zarit": -10,  // -10 reducción de sobrecarga del cuidador (Mejoría)
    "estado_global": "MEJORIA" // MEJORIA, ESTABILIDAD, DETERIORO
  }
}
```

---

## 4. CONTRATOS DE COMPORTAMIENTO & UI/UX

### 4.1. En la Ficha VMD: Selector de Modo (Ingreso vs. Seguimiento)
* Cuando el paciente se abre por primera vez o no tiene ingreso formalizado: Modo **`📥 Valoración de Ingreso (Línea Base)`**.
* Cuando el paciente ya tiene ingreso formalizado: La app ofrece el botón **`🔄 Realizar Nuevo Seguimiento Clínico`**.
* Al crear un seguimiento:
  1. Precarga los datos administrativos y diagnósticos para evitar re-digitación.
  2. Muestra en paralelo la columna **`Línea Base (Ingreso)`** al lado del valor actual para que el clínico vea inmediatamente si el paciente avanza o retrocede.

### 4.2. Nueva Pestaña: `📈 Historial & Trazabilidad de Seguimiento`
Ubicada en la navegación principal o dentro de la ficha del paciente:
* **Línea de Tiempo (Timeline):** Gráfica vertical con hitos:
  * 🟢 `Ingreso al Programa (05/11/2026)` - Alta Complejidad Domiciliaria
  * 🔵 `Seguimiento N° 1 (05/05/2027)` - Media Complejidad Ambulatoria ($\Delta$ Favorable)
* **Panel de Semáforo de Evolución ($\Delta$ Delta):**
  * 🟢 **Verde (Mejoría):** Incremento de Barthel $\ge 10$ pts, disminución de Zarit $\ge 10$ pts, disminución de clase NYHA/GOLD.
  * 🟡 **Amarillo (Estabilidad):** Variación dentro de márgenes clínicos normales sin deterioro de órgano.
  * 🔴 **Rojo (Deterioro / Alerta):** Caída de Barthel $> 15$ pts, aumento de clase funcional, aumento de Zarit $\ge 56$ pts (riesgo de claudicación familiar).

### 4.3. Diferenciación Visual Inconfundible
* **Badges Distintivos:**
  * <span style="background: #1e3a8a; color: white; padding: 2px 8px; border-radius: 4px;">Ingreso VMD</span>
  * <span style="background: #0d9488; color: white; padding: 2px 8px; border-radius: 4px;">Seguimiento #1 (Semestral)</span>
  * <span style="background: #ca8a04; color: white; padding: 2px 8px; border-radius: 4px;">Seguimiento Post-Alta</span>
* **Filtros en el Padrón:** Selector para filtrar: *Todos*, *Solo Ingresos Pendientes*, *Pacientes con Seguimientos al Día*, *Seguimientos Vencidos*.

---

## 5. DDL EN SUPABASE (POSTGRESQL)

```sql
-- Tabla relacional para seguimientos longitudinales
CREATE TABLE IF NOT EXISTS public.seguimientos (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  numero_seguimiento INT NOT NULL,
  fecha_seguimiento DATE NOT NULL,
  motivo_seguimiento TEXT NOT NULL,
  evaluador_id TEXT REFERENCES public.profesionales(id),
  evaluador_nombre TEXT,
  evaluador_rol TEXT,
  
  -- Dimensiones
  nyha TEXT,
  gold TEXT,
  child_pugh TEXT,
  erc_stage TEXT,
  score_t INT NOT NULL DEFAULT 0,
  
  barthel INT NOT NULL DEFAULT 100,
  lawton INT NOT NULL DEFAULT 8,
  score_z INT NOT NULL DEFAULT 0,
  
  mna_sf INT NOT NULL DEFAULT 14,
  score_al INT NOT NULL DEFAULT 0,
  
  pfeiffer INT NOT NULL DEFAULT 0,
  score_af INT NOT NULL DEFAULT 0,
  
  gijon INT NOT NULL DEFAULT 5,
  zarit INT NOT NULL DEFAULT 22,
  score_ar INT NOT NULL DEFAULT 0,
  
  score_final INT NOT NULL DEFAULT 0,
  complejidad TEXT NOT NULL,
  modalidad_sugerida TEXT NOT NULL,
  
  -- Metas PAI
  pai_sanitarias_estado TEXT DEFAULT 'EN_PROGRESO',
  pai_nutricionales_estado TEXT DEFAULT 'EN_PROGRESO',
  pai_psicologicas_estado TEXT DEFAULT 'EN_PROGRESO',
  pai_sociales_estado TEXT DEFAULT 'EN_PROGRESO',
  observaciones_evolucion TEXT,
  
  -- Objeto JSON con cálculos completos y deltas
  datos_seguimiento JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seguimientos_paciente ON public.seguimientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_fecha ON public.seguimientos(fecha_seguimiento);
```

---

## 6. CRITERIOS DE ACEPTACIÓN TÉCNICA
1. **Integridad Relacional:** Un seguimiento no puede existir sin un paciente e ingreso previo registrado.
2. **Cálculo Automático de Deltas:** La UI debe comparar automáticamente el seguimiento actual con el ingreso basal y con el seguimiento inmediato anterior.
3. **Persistencia Dual:** Guardado simultáneo en `localStorage` (offline) y Supabase (PostgreSQL en tiempo real).
4. **Compatibilidad con Exportación:** El archivo de 51 columnas reglamentarias de New Care debe poder exportarse tanto para ingresos como para la última evolución de seguimiento.

---

## 7. EXTENSIÓN NORMATIVA CAPÍTULO 5 (NEW CARE RECURSOS 2.1 & MANUAL INTERNO)

### 7.1. Estados Oficiales del Paciente (5.3.2 / 5.3.5 / 5.5.4)
Cada paciente (`p.estadoPrograma`) adopta uno de los estados oficiales definidos en el Manual Interno y el Modelo Pizarra:
- `REMITIDO`: Remitido sin evaluación.
- `SOSPECHOSO`: VMD de baja complejidad; no ingresa y queda bajo seguimiento anual.
- `DESESTIMADO`: No cumple criterios clínicos de inclusión.
- `RECHAZO`: Rechazo a valoración o al programa previo al ingreso.
- `ACTIVO`: Paciente ingresado en programa con PAI vigente.
- `DERIVADO`: Paciente activo remitido al programa de Cuidados Paliativos.
- `FALLECIDO`: Egreso por fallecimiento.
- `RENUNCIA`: Retiro voluntario posterior al ingreso (con Formato de Alta Voluntaria).
- `ALTA`: Egreso por cumplimiento de objetivos, traslado a otro prestador u otros motivos (`p.motivoAlta`).

### 7.2. Criterios de Derivación y Transiciones entre Niveles (5.3.3)
Registro estructurado en `p.derivaciones[]` con:
- **Transiciones oficiales:** `AMBULATORIO_A_DOMICILIO`, `DOMICILIO_A_AMBULATORIO`, `A_HOSPITAL_URGENCIAS`, `HOSPITAL_A_DOMICILIO`, `HOSPITAL_A_AMBULATORIO`, `A_CUIDADOS_PALIATIVOS`, `A_CENTRO_SOCIAL`.
- **Checklists normativos:**
  - *Ambulatorio → Domicilio (6 criterios):* Pérdida de funcionalidad/movilización, dificultad de desplazamiento, control de síntomas, necesidades sociales adversas, reajuste de tratamiento, continuidad post-hospitalización.
  - *Domicilio → Ambulatorio (4 criterios):* Resolución del cuadro agudo, paciente puede desplazarse, adecuada red de cuidados, condiciones del entorno adecuadas.

### 7.3. Factores de Descompensación Clínica y Social (5.3.4)
Registro en `p.descompensaciones[]`:
- **Descompensación Aguda (Respuesta 24–48 h / Derivación urgente hospitalaria):** Signos de alarma específicos por patología (`IC`, `EPOC`, `CIRROSIS`, `ERC`).
- **Descompensación Progresiva (Intervención temprana no urgente):** Signos de progresión subaguda por patología.
- **Alteraciones Sociales Urgentes (6 criterios)** y **Progresivas (11 criterios)** con activación obligatoria de Trabajo Social / Promotor Comunitario.

### 7.4. Herramientas de Seguimiento Obligatorias y Modelo Pizarra (5.5.4)
- **Extensión del registro de seguimiento (`seg`):**
  - `numMedicamentos` (conteo en cada ajuste) y `sindromesGeriatricos[]` (caídas, UPP, alteración de marcha, disfagia, polifarmacia, trastornos del comportamiento, infecciones de repetición).
  - `redApoyoPersonas` (n.º de personas implicadas en el cuidado, mínimo trimestral).
  - `cribadoAfectivo`: 2 preguntas oficiales de alteración afectiva (frecuencia en el último mes).
  - `cribadoSocialRapido`: 3 preguntas oficiales de red y recursos.
  - `eq5d5l` (Calidad de vida `EQ-5D-5L`, mínimo semestral) y `satisfaccion` (7 ítems oficiales, mínimo semestral).
- **Pizarra Operativa New Care:** Tabla transversal por cohorte que cruza *Paciente*, *Estado Oficial*, *Complejidad* y *Fase de Atención* (`VMD`, `Ingreso`, `VI`, `PAI`, `Seg. Médico`, `Seg. Enfermería`, `Seg. Trabajo Social`, `Consulta Prioritaria`, `Derivación`).

### 7.5. Ruta del Paciente y Flujograma Interactivo (5.6)
Tracker de 9 etapas (`p.rutaFase` del 1 al 9) con responsables, tiempos de respuesta normativos (`≤ 30 días` para VI/PAI, `24–48 h` descompensación aguda), canal 24/7 Jefe de Programa, Juntas de Cronicidad, transición a Cuidados Paliativos y vías de alta.
