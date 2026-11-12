# Portafolio de Servicios y Modelo Tarifario: Programa NEWCARE

## Optimus Health S.A.S. | IPS & New Health Foundation

---

### Resumen Ejecutivo

Para responder a las necesidades de atención de pacientes con **Insuficiencias Orgánicas Crónicas Complejas** en el departamento de Sucre y la región Caribe, se ha articulado el modelo **NEWCARE** dentro de la operación asistencial de **Optimus Health IPS**.

Este portafolio integra:

1. **La visión clínica y operativa del Manual Interno NEWCARE** (secciones 2.1, 2.2, 2.3, 2.4 y 5.3), formalizando la oferta sanitaria, social y comunitaria.
2. **El modelo analítico de ponderación de frecuencias y costos base** (procedente de `Paquetes NEWCARE.xlsx`).
3. **El catálogo real de tarifas institucionales, códigos CUPS y paquetes contratados** (extraído de `PAQUETES Y EVENTOS.xlsx`).

---

## 1. Arquitectura de los Modelos de Atención

El portafolio se estructura en **dos modalidades principales**, subdivididas según el nivel de complejidad del usuario determinado por escalas validadas (Barthel, NYHA, GOLD, ERC, Child-Pugh y Pfeiffer):

- **Modalidad Ambulatoria (Unidad de Cuidado Crónico - UCC):**
  - **Ambulatorio Media Complejidad:** Costo Técnico: $1,712.30 | Precio Base Sugerido: $2,283.07
  - **Ambulatorio Alta Complejidad:** Costo Técnico: $2,947.26 | Precio Base Sugerido: $3,929.68
- **Modalidad Domiciliaria (Programa Extramural - PAD):**
  - **Domiciliario Media Complejidad:** Costo Técnico: $4,281.26 | Precio Base Sugerido: $5,708.35
  - **Domiciliario Alta Complejidad:** Costo Técnico: $6,679.26 | Precio Base Sugerido: $8,905.68
- **Módulos Especializados de Atención Domiciliaria:**
  - *Crónico con Terapias (CUPS E985111):* $667,939 / mes
  - *Crónico Paliativo Domiciliario (CUPS E890190-P):* $1,450,175 / mes
  - *Clínica de Heridas con Terapia VAC (CUPS E891864):* $2,559,159 / mes
  - *Traqueostomía Domiciliaria (CUPS E985112):* $2,307,156 / mes
  - *UCC Internación Crónico Terminal (CUPS 134M01 / 133M01):* $600,000 - $850,000 / día

---

## 2. Herramientas Creadas

1. **Aplicación Web Interactiva de Diseño y Cotización (`app/index.html`)**:
   - Acceso directo con doble clic en `abrir_app.bat`.
   - Permite encender o apagar servicios con switches, modificar frecuencias y tarifas, ajustar el margen con un slider y ver en tiempo real el desglose de costos y gráficos.
   - Genera propuestas comerciales membretadas listas para imprimir o exportar a PDF.

2. **Libro Excel Dinámico (`Portafolio_NEWCARE_Optimus_Health.xlsx`)**:
   - 6 hojas interactivas con fórmulas nativas de Excel (`SUM`, promedios, márgenes, selector de cohorte).
   - Incluye catálogo completo de códigos CUPS, parámetros maestros y fichas clínicas con las escalas del manual.
