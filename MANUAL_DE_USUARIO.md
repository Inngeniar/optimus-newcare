# 🏥 MANUAL DE USUARIO Y GUÍA DE DESPLIEGUE
## Herramienta de Análisis GAP para la Certificación NewCare (Fundación New Health)
**Optimus Health IPS • Sede Sincelejo, Sucre**

---

### 1. Resumen Ejecutivo
La aplicación de **Análisis GAP NewCare** es una plataforma web desarrollada para **Optimus Health IPS** que permite verificar, evaluar y cerrar las brechas normativas frente a los estándares de la **Fundación New Health** para certificar y operar el programa de Insuficiencias Orgánicas Crónicas Complejas (**IOCC**: Falla Cardíaca, EPOC, Renal Crónica y Cirrosis Hepática).

Inspirada en la metodología de Análisis GAP de la norma **ISO 9001:2015**, la herramienta evalúa de forma atómica y auditable **64 requisitos normativos** organizados en **13 capítulos**, calculando calificaciones ponderadas, brechas críticas y generando planes de mejora continua automatizados.

---

### 2. Paquete de Archivos para el Patrocinador

Para que el patrocinador o cualquier directivo ejecute la herramienta en su propio equipo, se han dispuesto los siguientes ejecutables en la raíz de la carpeta:

| Archivo | Función Principal | Modo de Uso |
| :--- | :--- | :--- |
| **INSTALADOR_AUTOMATICO.bat** | Crea el entorno virtual ('env_newcare') e instala automáticamente todas las librerías necesarias. | Doble clic (solo la primera vez). |
| **ejecutar_app.bat** | Inicia el servidor local y abre la aplicación en el navegador web automáticamente. | Doble clic en el día a día. |
| **equirements.txt** | Lista exacta de dependencias requeridas (Streamlit, Plotly, Pandas, OpenPyXL, Python-Docx). | Consumido por el instalador. |
| **MANUAL_DE_USUARIO_GAP_NEWCARE_OPTIMUS_HEALTH.docx** | Manual formal en Word con membrete corporativo y firmas de aprobación. | Para lectura directiva y archivo de calidad. |
| **data/gap_assessment.json** | Base de datos local persistente con todas las calificaciones y planes guardados. | Gestión interna automática. |
| **evidencias/** | Carpeta local donde se almacenan los documentos subidos por requisito. | Gestión interna automática. |
| **epositorio_central/** | Carpeta donde se almacenan manuales e instructivos maestros consolidados. | Gestión interna automática. |

---

### 3. Instrucciones de Instalación y Puesta en Marcha

#### Paso 1: Requisitos Previos
1. Computador con **Windows 10 o Windows 11**.
2. **Python 3.10 o superior** instalado. Si no lo tiene, descargarlo desde [python.org](https://www.python.org/downloads/).  
   > ⚠️ **Muy Importante:** Al instalar Python, asegúrese de marcar la casilla: **"Add Python to PATH"**.

#### Paso 2: Instalación Automática (1 Clic)
1. Copie o descomprima la carpeta Proyecto NEWCARE en el computador del patrocinador.
2. Haga doble clic en el archivo:  
   👉 **INSTALADOR_AUTOMATICO.bat**
3. El instalador configurará el entorno e instalará todas las dependencias. Al terminar, la ventana mostrará el mensaje de éxito.

#### Paso 3: Abrir la Aplicación
1. Haga doble clic en el archivo:  
   👉 **ejecutar_app.bat**
2. Se abrirá automáticamente su navegador web en la dirección:  
   👉 **http://localhost:8501**

---

### 4. Guía Rápida de Navegación por Módulos

1. **📊 Panel Ejecutivo (Dashboard):**  
   - KPI de Cumplimiento Global Ponderado (con mayor peso en Cap. 5: 25% y Cap. 8: 15%).
   - Spider Chart (Radar) con la huella de los 13 capítulos frente al 100% de la norma.
   - Listado de Brechas Críticas que impiden la certificación.

2. **📝 Estudio de Evaluación GAP:**  
   - Calificación interactiva de los 64 requisitos (0: No Cumple, 1: Cumple Parcial, 2: Cumple Completo, NA: No Aplica).
   - Acordeón de evidencias con **cargador de archivos individuales** y enlace para asociar documentos del repositorio central.

3. **🎯 Plan de Mejora Continua:**  
   - 3 vistas ergonómicas para gestionar las tareas correctivas: Fichas de Acción Detalladas (texto completo), Acordeón por Capítulos, y Tabla Multilínea.
   - Control de estado (Pendiente, En Proceso, Implementado) y botón para marcar como cumplido (2 pts).

4. **🔍 Simulador de Auditoría:**  
   - Checklist específico para **Informe Favorable** (inicio de operación) y para **Certificación Final** (Sello NewCare).

5. **📁 Repositorio Documental Central:**  
   - Carga y almacenamiento unificado de documentos marco (Manual Consolidado v2.0, instructivos de New Health, marco legal, etc.).

6. **📚 Manual y Referencias:**  
   - Resúmenes de Guías Clínicas (AHA, GOLD, KDIGO, Cirrosis), escalas clínicas (NECPAL, Barthel, Zarit, etc.) y glosario NewCare.

7. **📥 Exportar y Reportes:**  
   - Descarga en 6 formatos: Excel Oficial (.xlsx), Informe Formal en Word (.docx con espacio para firmas), CSVs en UTF-8 con BOM, Respaldo JSON e Informe HTML imprimible.

---

### 5. Soporte y Persistencia de Información
- **Guardado Automático:** Cada cambio se almacena inmediatamente en el disco local en data/gap_assessment.json. La información nunca se pierde al cerrar la sesión.
- **Copias de Seguridad:** Puede exportar en cualquier momento un respaldo JSON fechado desde el módulo de descargas.
