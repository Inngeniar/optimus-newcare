# Manual de Usuario y Guía Metodológica: Herramienta de Valoración Multidimensional (VMD) - Programa New Care
**Optimus Health IPS & Fundación NewHealth**  
*Modelo de Gestión para Pacientes con Insuficiencias Orgánicas Crónicas Complejas (IOCC)*

---

## 1. Presentación General
La presente solución ha sido desarrollada para estandarizar, agilizar y automatizar el proceso de **Valoración Multidimensional (VMD)** interdisciplinaria y toma de decisiones clínicas para el ingreso de pacientes al **Programa New Care**.

La herramienta se entrega en dos versiones totalmente articuladas y complementarias:
1. **Versión WebApp Interactiva (`WebApp_NewCare_VMD/`)**: Aplicación web moderna de nivel hospitalario, con control de acceso por rol profesional, cuestionarios asistidos ítem por ítem para cada escala, suite completa de cálculo de riesgo clínico, base de datos local persistente, exportación/importación y generación de informes oficiales de Plan de Atención Individualizado (PAI) listos para impresión/PDF.
2. **Versión Excel Automatizada (`Herramienta_VMD_NewCare_OptimusHealth.xlsx`)**: Cuaderno de cálculo profesional con fórmulas nativas en tiempo real, listas desplegables validadas, hojas interactivas por profesional, suite de calculadoras de riesgo, base de datos de 51 columnas compatible con la aseguradora y hoja de Red de Cuidados.

---

## 2. Flujo de Atención y Tiempos Normativos (Regla de los 30 Días)
De acuerdo con las directrices oficiales de New Care:
- **Días 1 a 15 (Recepción y Agendamiento):** La aseguradora remite los datos del paciente sospechoso con IOCC. El prestador tiene máximo 15 días calendario para citar y agendar la VMD.
- **Días 16 a 30 (Valoración Interdisciplinaria Conjunta):** El equipo tratante (Médico Internista/Geriatra, Enfermera Jefe y Trabajadora Social) realiza la valoración multidimensional de manera preferiblemente conjunta (máximo 15 días tras el agendamiento).
- **Día 30 (Consenso y Dictamen):** Reunión de equipo, aplicación del algoritmo oficial New Care, consenso de complejidad (Baja, Media, Alta), elaboración del PAI inicial y remisión del caso a la **Junta de Cronicidad Clínica / Aseguradora** para su validación final y formalización de ingreso.
- **Reevaluación de Seguimiento:**
  - Pacientes en **Alta Complejidad:** Reevaluación multidimensional obligatoria como mínimo cada 6 meses.
  - Pacientes en **Media Complejidad:** Reevaluación multidimensional como mínimo cada 12 meses.
  - Reevaluaciones extraordinarias: Tras cualquier alta hospitalaria, o ante descompensaciones clínicas o sociales significativas.

---

## 3. Roles Profesionales y Responsabilidades en la Herramienta

| Perfil Profesional | Responsabilidad Primaria en VMD | Escalas y Calculadoras a Cargo |
| :--- | :--- | :--- |
| 🩺 **Médico Internista / Geriatra** | Severidad Clínica de IOCC, revisión diagnóstica, suite de riesgo clínico, supervisión médica del PAI y sustentación en Junta de Cronicidad. | NYHA (Cardíaca), GOLD (EPOC), Child-Pugh (Hepática), ERC (Renal), CKD-EPI 2021, MELD-Na, BODEx, LACE. |
| 👩‍⚕️ **Enfermera(o) Jefe** | Valoración Funcional, Estado Nutricional, detección de fragilidad y riesgo cutáneo, signos vitales y educación al paciente/familia. | Índice de Barthel (ABVD), Lawton & Brody (AIVD), MNA-SF (Cribaje), MNA Completo, Escala Downton (Caídas), Escala Braden (UPP). |
| 🤝 **Trabajador(a) Social** | Valoración Sociofamiliar, Sobrecarga del Cuidador, Genograma familiar de 3 generaciones y Círculo de la Red de Cuidados. | Escala de Gijón (Sociofamiliar), Escala de Zarit (Sobrecarga Cuidador), Círculo de Red Interna, Externa y Comunitaria. |
| ⚖️ **Coordinador / Junta de Cronicidad** | Consolidación de las 5 dimensiones, ejecución del algoritmo de complejidad, dictamen de admisión y firma del PAI oficial. | Algoritmo New Care, Asignación de Ámbito (Domiciliario / Ambulatorio), Cadencia de Visitas y Llamadas. |

---

## 4. Algoritmo Oficial de Asignación de Complejidad New Care
El modelo matemático y clínico oficial opera bajo la siguiente lógica:

$$\text{Valor Final} = \begin{cases} \min(2, T + 1) & \text{si } Z = 2 \lor AF = 2 \lor AL = 2 \lor AR = 2 \\ T & \text{en caso contrario} \end{cases}$$

Donde:
- **$T$ (Severidad Clínica):** Base $= \max(\text{NYHA}, \text{GOLD}, \text{Child-Pugh}, \text{ERC})$. Valores: $0$ (Baja), $1$ (Media), $2$ (Alta). *La severidad clínica es el eje preponderante de la complejidad.*
- **$Z$ (Funcionalidad):** $\max(\text{Barthel}, \text{Lawton \& Brody})$. Valores: $0, 1, 2$.
- **$AL$ (Nutricional):** $\max(\text{MNA-SF}, \text{MNA Completo})$. Valores: $0, 1, 2$.
- **$AF$ (Cognitivo):** $\max(\text{Pfeiffer}, \text{Minimental MMSE})$. Valores: $0, 1, 2$.
- **$AR$ (Social):** $\max(\text{Gijón}, \text{Zarit})$. Valores: $0, 1, 2$.

### Criterio de Ingreso al Programa New Care:
- **Alta Complejidad (Valor Final = 2):** **INGRESA AL PROGRAMA NEW CARE**.
  - Si el paciente presenta dependencia funcional severa (Barthel $\le 60$ o $Z=2$): Se asigna **Modalidad Domiciliaria** (visita mensual médica, enfermería y TS + llamada de control quincenal).
  - Si el paciente conserva movilidad: Se asigna **Modalidad Ambulatoria** (consulta médica trimestral + llamada mensual).
- **Media Complejidad (Valor Final = 1):** **INGRESA AL PROGRAMA NEW CARE**.
  - Modalidad Ambulatoria: Consulta cada 4 a 6 meses + llamada cada 2 a 3 meses.
- **Baja Complejidad (Valor Final = 0):** **NO CUMPLE CRITERIOS DE INGRESO**.
  - Manejo preventivo continuo en Atención Primaria con control anual.

---

## 5. Suite Integrada de Calculadoras de Riesgo Clínico

La herramienta incorpora calculadoras clínicas de referencia internacional para guiar las decisiones del PAI:
1. **Riesgo Renal (CKD-EPI 2021 sin raza):**
   - Calcula automáticamente la TFG estimada ($ml/min/1.73m^2$) a partir de Creatinina sérica, Edad y Sexo biológico.
   - Vincula automáticamente el estadio ERC ($G1$ a $G5$) y alerta sobre ajustes de fármacos nefroprotectores.
2. **Riesgo Hepático (Score MELD / MELD-Na):**
   - Utiliza Bilirrubina, Creatinina, INR y Sodio sérico.
   - Estima el riesgo de mortalidad a 3 meses en cirrosis hepática ($<10$ ptos: Bajo $\sim 1.9\%$; $10-19$ ptos: Moderado $\sim 6.0\%$; $20-29$ ptos: Alto $\sim 19.6\%$; $\ge 30$ ptos: Muy Severo $>50\%$).
3. **Riesgo Respiratorio en EPOC (Índice BODEx):**
   - Integra B (IMC), O (FEV1%), D (Disnea mMRC 0-4) y Ex (Exacerbaciones graves al año).
   - Clasifica en cuartiles de riesgo de mortalidad a 4 años ($Q1$ a $Q4$).
4. **Riesgo de Caídas en Adulto Mayor (Escala de Downton):**
   - Evalúa 5 factores críticos: caídas previas, fármacos de riesgo (sedantes, diuréticos), déficit sensorial, estado mental y marcha.
   - $>2$ puntos: Alerta de **Alto Riesgo de Caídas** $\rightarrow$ Activa protocolo preventivo en el PAI.
5. **Riesgo de Lesiones por Presión (Escala de Braden):**
   - Evalúa percepción sensorial, humedad, actividad, movilidad, nutrición y fricción (rango 6 a 23).
   - $\le 12$ puntos: **Alto Riesgo** $\rightarrow$ Pauta colchón antiescaras y cambios posturales programados cada 2-3 horas.
6. **Riesgo de Reingreso Hospitalario a 30 Días (Índice LACE):**
   - Integra Días de estancia ($L$), Ingreso agudo ($A$), Comorbilidades de Charlson ($C$) y Visitas a urgencias en 6 meses ($E$).
   - $\ge 10$ puntos: **Alto Riesgo de Reingreso** $\rightarrow$ Activa llamada de seguimiento temprano antes de 48-72 horas post-alta.

---

## 6. Instrucciones de Uso de las Herramientas

### A. Para Utilizar la WebApp:
1. Ingrese a la carpeta `WebApp_NewCare_VMD/`.
2. Haga doble clic en el archivo **`iniciar_webapp.bat`** (iniciará el servidor local y abrirá su navegador predeterminado automáticamente).
   *(Alternativa directa: Puede abrir directamente el archivo `index.html` en Chrome, Edge o Firefox).*
3. En la barra superior, seleccione o configure su **Nombre** y **Rol Profesional** (Médico, Enfermera, TS, Coordinador).
4. En la pestaña **Padrón de Pacientes**, puede consultar los casos de prueba precargados, buscar por cédula/nombre, filtrar por complejidad o crear una **Nueva Valoración**.
5. En la pestaña **Ficha de Valoración VMD**, complete cada sección. Puede usar los botones de **"Abrir Cuestionario"** para que la herramienta sume los ítems automáticamente.
6. En la pestaña **Suite de Riesgo Clínico**, ingrese los datos de laboratorio para obtener las estimaciones de riesgo en tiempo real.
7. En la pestaña **Plan de Atención (PAI) & Dictamen**, revise el informe clínico consolidado con el algoritmo oficial y haga clic en **"Imprimir / Guardar en PDF"**.

### B. Para Utilizar el Archivo Excel:
1. Abra el archivo **`Herramienta_VMD_NewCare_OptimusHealth.xlsx`** en Microsoft Excel.
2. Navegue por las hojas diseñadas:
   - **`Inicio & Guía NewCare`**: Resumen metodológico y lineamientos.
   - **`Ficha VMD Individual`**: Formulario interactivo del paciente actual con listas desplegables y fórmulas automáticas de complejidad y admisión.
   - **`Calculadoras de Riesgo`**: Hojas activas con fórmulas automáticas para CKD-EPI 2021, MELD-Na, BODEx, Downton, Braden y LACE.
   - **`Calculadoras de Escalas`**: Desglose de ítems de Barthel, Lawton, MNA-SF, Pfeiffer, Gijón y Child-Pugh.
   - **`Consolidado Pacientes VMD`**: Base de datos de 51 columnas con fórmulas de severidad, funcionalidad, cognición, nutrición, social, complejidad y observaciones.
   - **`Red Cuidados`**: Registro del círculo de apoyo interno, externo y comunitario.
   - **`Tabla auxiliar`**: Matrices maestras de referencia del programa.
