import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image
import os

def build_baremacion_workbook():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)

    # Corporate Colors Optimus Health
    c_primary = "073763"      # Azul Marino Institucional
    c_secondary = "1C4587"    # Azul Zafiro
    c_accent = "2E75B5"       # Azul Médico
    c_light = "E8EEF5"        # Fondo suave / cebra
    c_border = "B0C4DE"       # Borde sutil
    white = "FFFFFF"
    accent_green = "E2F0D9"
    accent_yellow = "FFF2CC"
    accent_red = "FCE4D6"

    font_title = Font(name="Calibri", size=15, bold=True, color=white)
    font_subtitle = Font(name="Calibri", size=10, bold=True, color=white)
    font_section = Font(name="Calibri", size=12, bold=True, color=c_primary)
    font_header = Font(name="Calibri", size=10, bold=True, color=white)
    font_bold = Font(name="Calibri", size=10, bold=True, color="000000")
    font_normal = Font(name="Calibri", size=10, color="000000")
    font_small = Font(name="Calibri", size=9, italic=True, color="555555")

    fill_primary = PatternFill(start_color=c_primary, end_color=c_primary, fill_type="solid")
    fill_secondary = PatternFill(start_color=c_secondary, end_color=c_secondary, fill_type="solid")
    fill_accent = PatternFill(start_color=c_accent, end_color=c_accent, fill_type="solid")
    fill_light = PatternFill(start_color=c_light, end_color=c_light, fill_type="solid")
    fill_zebra = PatternFill(start_color="F7F9FC", end_color="F7F9FC", fill_type="solid")

    thin_border = Side(border_style="thin", color=c_border)
    border_cell = Border(left=thin_border, right=thin_border, top=thin_border, bottom=thin_border)

    def add_logo_to_sheet(ws, cell="A1"):
        if os.path.exists("Logo Optimus Health.jpeg"):
            try:
                img = Image("Logo Optimus Health.jpeg")
                img.width = 145
                img.height = 68
                ws.add_image(img, cell)
            except Exception as e:
                print(f"No se pudo insertar logo: {e}")

    # =========================================================================
    # SHEET 1: METODOLOGÍA NEWCARE Y ARQUITECTURA
    # =========================================================================
    ws1 = wb.create_sheet(title="1. Metodologia NewCare")
    ws1.views.sheetView[0].showGridLines = True
    add_logo_to_sheet(ws1, "A1")

    # Banner Institucional
    ws1.merge_cells("C1:H1")
    ws1["C1"] = "OPTIMUS HEALTH IPS • SEDE PRINCIPAL SINCELEJO, SUCRE"
    ws1["C1"].font = font_title
    ws1["C1"].fill = fill_primary
    ws1["C1"].alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 36

    ws1.merge_cells("C2:H2")
    ws1["C2"] = "MODELO DE SELECCIÓN Y BAREMACIÓN DE PERSONAL ASISTENCIAL • PROGRAMA NEWCARE (FUNDACIÓN NEW HEALTH)"
    ws1["C2"].font = font_subtitle
    ws1["C2"].fill = fill_secondary
    ws1["C2"].alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[2].height = 24

    ws1.row_dimensions[3].height = 15

    ws1["A4"] = "1. MARCO NORMATIVO, INSTITUCIONAL Y METODOLÓGICO"
    ws1["A4"].font = font_section

    intro_data = [
        ("Resolución 3100 de 2019 (Minsalud Colombia)", "Estándar de Talento Humano del Sistema Único de Habilitación en Salud para modalidades Intramural y Extramural Domiciliaria."),
        ("Ley 1733 de 2014 (Ley Consuelo Devis Saavedra)", "Regula los servicios de Cuidados Paliativos para pacientes con enfermedades crónicas, degenerativas e irreversibles en Colombia."),
        ("Metodología NEWPALEX® / NewCare (Fundación New Health)", "Estándar 2.4.2 y Cap. 3: Definición objetiva de Criterios de Selección, Baremación y Competencias del Equipo Asistencial."),
        ("Política de Calidad y Talento Humano Optimus Health IPS", "Asegurar la selección del personal más idóneo técnica y humanamente para la atención de Insuficiencias Orgánicas Crónicas Complejas (IOCC).")
    ]

    r = 5
    for title, desc in intro_data:
        ws1[f"A{r}"] = title
        ws1[f"A{r}"].font = font_bold
        ws1.merge_cells(f"B{r}:H{r}")
        ws1[f"B{r}"] = desc
        ws1[f"B{r}"].font = font_normal
        r += 1

    r += 1
    ws1[f"A{r}"] = "2. ARQUITECTURA DE EVALUACIÓN TRIÁDICA (100 PUNTOS)"
    ws1[f"A{r}"].font = font_section
    r += 1

    headers_comp = ["Componente Evaluativo", "Ponderación", "Puntos Máx.", "Instrumento / Técnica", "Objetivo Evaluado", "Responsable Directo"]
    for c_i, h in enumerate(headers_comp, start=1):
        c = ws1.cell(row=r, column=c_i, value=h)
        c.font = font_header
        c.fill = fill_primary
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = border_cell
    ws1.row_dimensions[r].height = 25
    r += 1

    componentes_data = [
        ("Valoración de Hoja de Vida (CV)", "50%", 50.0, "Matriz de Baremos Documentales", "Acreditar experiencia laboral general y específica (IOCC/Paliativos/Domicilio), posgrados, docencia, investigación y gestión.", "Comité de Selección y TH"),
        ("Evaluación Psicotécnica", "20%", 20.0, "Batería CPR (60%) + DAS (40%)", "Evaluar personalidad resistente (compromiso, control, reto), resiliencia ante el sufrimiento y actitudes funcionales.", "Psicología Organizacional"),
        ("Entrevista Semiestructurada", "30%", 30.0, "Entrevista por Competencias New Health (9 dimensiones)", "Explorar vocación en crónicos, empatía, manejo de malas noticias (SPIKES), trabajo en equipo y juicio bioético.", "Líder del Programa + Dirección Médica"),
        ("TOTAL BAREMO NEWCARE", "100%", 100.0, "Calificación Consolidada Ponderada", "Calificación global para selección definitiva, contratación y plan de formación continuada en los primeros 90 días.", "Dirección Médica Optimus Health")
    ]

    for item in componentes_data:
        is_tot = "TOTAL" in item[0]
        for c_i, val in enumerate(item, start=1):
            c = ws1.cell(row=r, column=c_i, value=val)
            c.font = font_bold if is_tot else font_normal
            c.border = border_cell
            if is_tot:
                c.fill = fill_light
        r += 1

    r += 1
    ws1[f"A{r}"] = "3. ESCALA OFICIAL DE DICTAMEN DE IDONEIDAD"
    ws1[f"A{r}"].font = font_section
    r += 1

    dictamenes = [
        (">= 85.0 Puntos", "IDÓNEO SOBRESALIENTE", "Cumple con el perfil de excelencia NewCare. Asignación inmediata al equipo tratante o gestión de casos sin condicionamiento.", accent_green),
        ("70.0 - 84.9 Puntos", "IDÓNEO CONDICIONADO", "Apto para contratación. Requiere inducción intensiva y plan de capacitación prioritario NewCare en los primeros 90 días.", accent_yellow),
        ("< 70.0 Puntos", "NO IDÓNEO", "No alcanza el umbral de idoneidad exigido por los estándares de la Fundación New Health. Descartado del proceso.", accent_red)
    ]

    for rango, dictamen, descripcion, bg_color in dictamenes:
        ws1.cell(row=r, column=1, value=rango).font = font_bold
        ws1.cell(row=r, column=2, value=dictamen).font = font_bold
        ws1.merge_cells(f"C{r}:F{r}")
        ws1.cell(row=r, column=3, value=descripcion).font = font_normal
        fill_d = PatternFill(start_color=bg_color, end_color=bg_color, fill_type="solid")
        for col_idx in range(1, 7):
            cell = ws1.cell(row=r, column=col_idx)
            cell.border = border_cell
            cell.fill = fill_d
        r += 1

    cols_w1 = [28, 20, 15, 25, 45, 30, 20, 15]
    for idx, width in enumerate(cols_w1, start=1):
        ws1.column_dimensions[get_column_letter(idx)].width = width

    # =========================================================================
    # SHEET 2: FILTROS EXCLUYENTES SI-NO
    # =========================================================================
    ws2 = wb.create_sheet(title="2. Filtros Excluyentes SI-NO")
    ws2.views.sheetView[0].showGridLines = True
    add_logo_to_sheet(ws2, "A1")

    ws2.merge_cells("C1:G1")
    ws2["C1"] = "FILTROS EXCLUYENTES DE SELECCIÓN • CRITERIOS HABILITANTES MÍNIMOS"
    ws2["C1"].font = font_title
    ws2["C1"].fill = fill_primary
    ws2["C1"].alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[1].height = 36

    ws2.merge_cells("C2:G2")
    ws2["C2"] = "Regla New Health: Cumplimiento 100% obligatorio. Un solo 'NO' descarta automáticamente la postulación."
    ws2["C2"].font = font_subtitle
    ws2["C2"].fill = fill_secondary
    ws2["C2"].alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[2].height = 24

    ws2.row_dimensions[3].height = 10

    headers_filtros = ["Código", "Requisito Excluyente Habilitante", "Sustento Normativo / Metodológico", "Aplica a Roles", "Medio de Verificación", "Condición", "Resultado"]
    for col_idx, h in enumerate(headers_filtros, start=1):
        cell = ws2.cell(row=4, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_primary
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border_cell
    ws2.row_dimensions[4].height = 25

    filtros_data = [
        ("FLT-01", "Título Profesional Universitario oficial en salud (o convalidado en Colombia).", "Ley 30 de 1992, Res. 3100 de 2019", "Todos los roles profesionales", "Diploma y Acta de Grado oficial", "Obligatorio (SÍ / NO)"),
        ("FLT-02", "Inscripción activa en Registro Único Nacional del Talento Humano en Salud (ReTHUS).", "Ley 1164 de 2007", "Todo el personal asistencial", "Consulta plataforma SISPRO ReTHUS", "Obligatorio (SÍ / NO)"),
        ("FLT-03", "Tarjeta Profesional expedida por el colegio profesional respectivo vigente.", "Colegios Profesionales", "Todo el personal asistencial", "Carné o certificado colegiado", "Obligatorio (SÍ / NO)"),
        ("FLT-04", "Certificado de Formación en Atención a Víctimas de Violencia Sexual (mínimo 40 horas).", "Resolución 459 de 2012 Minsalud", "Todo el personal asistencial", "Certificación académica válida", "Obligatorio (SÍ / NO)"),
        ("FLT-05", "Certificado vigente de Soporte Vital Básico (BLS) o Avanzado (ACLS) menor a 2 años.", "Res. 3100 de 2019 Habilitación", "BLS: Aux/Ter / ACLS: Méd/Enf", "Certificado avalado AHA o IES", "Obligatorio (SÍ / NO)"),
        ("FLT-06", "Ausencia absoluta de sanciones disciplinarias, ético-médicas, fiscales o penales.", "Tribunales Ética, Procuraduría", "Todo el personal asistencial", "Certificados de antecedentes vigentes", "Obligatorio (SÍ / NO)"),
        ("FLT-07", "Experiencia asistencial clínica mínima certificada de 1 año en atención de adultos.", "Metodología NewCare Básico", "Médicos, Enfermeras, Terapeutas", "Certificaciones laborales formales", "Obligatorio (SÍ / NO)"),
        ("FLT-08", "Disponibilidad demostrada para desplazamientos domiciliarios en Sincelejo y subregión.", "Modelo Extramural Optimus", "Equipo Extramural y Case Manager", "Acuerdo operativo en contrato", "Obligatorio (SÍ / NO)"),
        ("FLT-09", "Compromiso expreso de vinculación al Plan de Formación y Certificación New Health.", "Cap. 9 NewCare (Desarrollo)", "Todo el personal asistencial", "Carta de compromiso suscrita", "Obligatorio (SÍ / NO)")
    ]

    for idx, item in enumerate(filtros_data, start=5):
        ws2.cell(row=idx, column=1, value=item[0]).font = font_bold
        ws2.cell(row=idx, column=2, value=item[1]).font = font_normal
        ws2.cell(row=idx, column=3, value=item[2]).font = font_normal
        ws2.cell(row=idx, column=4, value=item[3]).font = font_normal
        ws2.cell(row=idx, column=5, value=item[4]).font = font_normal
        ws2.cell(row=idx, column=6, value=item[5]).font = font_bold
        ws2.cell(row=idx, column=7, value="CUMPLE").font = font_bold
        for c in range(1, 8):
            cell = ws2.cell(row=idx, column=c)
            cell.border = border_cell
            if idx % 2 == 0:
                cell.fill = fill_zebra

    cols_w2 = [12, 42, 32, 25, 30, 20, 15]
    for idx, width in enumerate(cols_w2, start=1):
        ws2.column_dimensions[get_column_letter(idx)].width = width

    # =========================================================================
    # SHEET 3: BAREMO DE HOJA DE VIDA (50 PUNTOS)
    # =========================================================================
    ws3 = wb.create_sheet(title="3. Baremo CV (50 Puntos)")
    ws3.views.sheetView[0].showGridLines = True
    add_logo_to_sheet(ws3, "A1")

    ws3.merge_cells("C1:H1")
    ws3["C1"] = "BAREMO PONDERADO DE HOJA DE VIDA / CURRÍCULUM VITAE (MÁXIMO 50 PUNTOS)"
    ws3["C1"].font = font_title
    ws3["C1"].fill = fill_primary
    ws3["C1"].alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[1].height = 36

    ws3.merge_cells("C2:H2")
    ws3["C2"] = "Distribución oficial New Health: Experiencia (15 pts) + Posgrados (6 pts) + Centros Referencia (7 pts) + Docencia (5.5 pts) + Publicaciones (4.5 pts) + Investigación (5 pts) + Idiomas (2 pts) + Gestión (5 pts)"
    ws3["C2"].font = font_subtitle
    ws3["C2"].fill = fill_secondary
    ws3["C2"].alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[2].height = 24

    headers_cv = ["Dimensión Evaluada", "Peso Oficial", "Pts Máx", "Subcriterio Específico de Calificación", "Puntaje Asignado", "Tope Rubro", "Soporte Válido", "Criterio Auditoría New Health"]
    for col_idx, h in enumerate(headers_cv, start=1):
        cell = ws3.cell(row=4, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_primary
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_cell
    ws3.row_dimensions[4].height = 25

    cv_items = [
        ("1. Experiencia Laboral", "30%", 15.0, "Experiencia laboral asistencial general en salud en servicios hospitalarios o ambulatorios (>1 año)", "1.0 pt por año certificado", 7.0, "Certificaciones laborales de IPS", "Mínimo 1 año para puntuar"),
        ("1. Experiencia Laboral", "30%", 15.0, "Experiencia específica en Cuidados Paliativos, Insuficiencias Crónicas Complejas (IOCC) o Atención Domiciliaria", "2.0 pts por año certificado", 8.0, "Certificaciones laborales detalladas", "Ponderación estratégica NewCare"),
        ("2. Formación Postgrado", "12%", 6.0, "Especialización médico-quirúrgica o Maestría clínica afín (Med. Interna, Familiar, Geriatría, Paliativos)", "4.0 pts por título", 4.0, "Diploma y acta oficial de IES", "Acreditación universitaria"),
        ("2. Formación Postgrado", "12%", 6.0, "Diplomado formal en Cuidados Paliativos, Dolor o Insuficiencias Crónicas Complejas (>100 horas)", "2.0 pts por diplomado", 2.0, "Certificado entidad académica", "Cursos menores a 80h no aplican"),
        ("3. Centros de Referencia", "14%", 7.0, "Rotación o pasantía clínica en Unidad o Centro acreditado en Cuidados Paliativos / Red New Health (Nac/Int)", "3.5 pts por mes rotación", 7.0, "Certificado oficial del centro", "Reconocimiento específico NewCare"),
        ("4. Actividad Docente", "11%", 5.5, "Docencia universitaria de pregrado o posgrado en facultades del área de la salud", "1.5 pts por semestre", 3.0, "Certificación universitaria", "Cátedras de medicina o enfermería"),
        ("4. Actividad Docente", "11%", 5.5, "Docente o facilitador en programas de educación a cuidadores, agentes comunitarios o formación en salud", "1.0 pt por curso", 2.5, "Certificado de relatoría/docencia", "Alineado a redes comunitarias"),
        ("5. Publicaciones", "9%", 4.5, "Artículo publicado en revista científica indexada (Pubmed, Scielo, Redalyc) sobre crónicos, paliativos o salud pública", "2.5 pts por artículo", 4.5, "Copia del artículo con DOI/ISSN", "Primer autor o coautor"),
        ("5. Publicaciones", "9%", 4.5, "Capítulo de libro, guía de práctica clínica o manual institucional publicado con depósito legal", "1.5 pts por publicación", 3.0, "Registro ISBN / Depósito legal", "Publicación formal"),
        ("6. Investigación", "10%", 5.0, "Investigador en grupo categorizado por MinCiencias o semillero institucional avalado", "2.5 pts por proyecto activo", 5.0, "Certificado MinCiencias / CvLAC", "Investigación biomédica o social"),
        ("7. Idiomas", "4%", 2.0, "Dominio certificado de segundo idioma (Inglés técnico nivel B2 o superior para lectura de evidencia)", "2.0 pts (Nivel B2 o C1)", 2.0, "Certificado examen oficial", "Lectura de literatura científica"),
        ("8. Gestión y Calidad", "10%", 5.0, "Experiencia demostrada en coordinación de servicios de salud, auditoría médica o gestión de casos (Case Management)", "2.5 pts por año de gestión", 5.0, "Certificado de cargo de coordinación", "Requisito clave para Líder y Case Manager"),
        ("TOTAL BAREMO CV", "100%", 50.0, "SUMATORIA PONDERADA DE EVALUACIÓN DE HOJA DE VIDA", "PUNTUACIÓN MÁXIMA POSIBLE", 50.0, "EXPEDIENTE VERIFICADO", "PASA A FASE PSICOTÉCNICA Y ENTREVISTA")
    ]

    r = 5
    for row_data in cv_items:
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws3.cell(row=r, column=c_idx, value=val)
            is_tot = "TOTAL" in str(row_data[0])
            cell.font = font_bold if is_tot else font_normal
            cell.border = border_cell
            if is_tot:
                cell.fill = fill_light
            elif r % 2 == 0:
                cell.fill = fill_zebra
        r += 1

    cols_w3 = [25, 16, 14, 45, 25, 14, 30, 30]
    for idx, width in enumerate(cols_w3, start=1):
        ws3.column_dimensions[get_column_letter(idx)].width = width

    # =========================================================================
    # SHEET 4: PSICOTÉCNICO Y ENTREVISTA (50 PUNTOS)
    # =========================================================================
    ws4 = wb.create_sheet(title="4. Psicotecnico y Entrevista")
    ws4.views.sheetView[0].showGridLines = True
    add_logo_to_sheet(ws4, "A1")

    ws4.merge_cells("C1:G1")
    ws4["C1"] = "EVALUACIÓN PSICOTÉCNICA (20 PTS) Y ENTREVISTA POR COMPETENCIAS (30 PTS)"
    ws4["C1"].font = font_title
    ws4["C1"].fill = fill_primary
    ws4["C1"].alignment = Alignment(horizontal="center", vertical="center")
    ws4.row_dimensions[1].height = 36

    ws4.merge_cells("C2:G2")
    ws4["C2"] = "Evaluación de personalidad resistente (CPR), actitudes funcionales (DAS) y las 9 dimensiones de la Fundación New Health"
    ws4["C2"].font = font_subtitle
    ws4["C2"].fill = fill_secondary
    ws4["C2"].alignment = Alignment(horizontal="center", vertical="center")
    ws4.row_dimensions[2].height = 24

    ws4["A4"] = "A. COMPONENTE PSICOTÉCNICO (20 PUNTOS MÁXIMOS)"
    ws4["A4"].font = font_section

    headers_psico = ["Batería Psicométrica", "Peso Relativo", "Puntos Máx.", "Factores Evaluados", "Criterio de Idoneidad", "Rango de Puntuación"]
    for col_idx, h in enumerate(headers_psico, start=1):
        cell = ws4.cell(row=5, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_primary
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border_cell
    ws4.row_dimensions[5].height = 22

    psico_data = [
        ("Cuestionario de Personalidad Resistente (CPR)", "60% del test", 12.0, "Compromiso (identificación con su rol de cuidado), Control (locus de control interno y autorregulación), Reto (adaptabilidad y crecimiento ante la adversidad).", "Puntuación percentil >= 65 en las subescalas.", "0.0 a 12.0 Puntos"),
        ("Escala de Actitudes Disfuncionales (DAS)", "40% del test", 8.0, "Necesidad de aprobación externa, perfeccionismo rígido, omnipotencia profesional vs. autonomía y aceptación de límites terapéuticos.", "Puntuaciones bajas en disfuncionalidad (Percentil < 40).", "0.0 a 8.0 Puntos"),
        ("SUBTOTAL PSICOTÉCNICO", "100%", 20.0, "Evaluación de estabilidad emocional, afrontamiento del duelo y resistencia al desgaste profesional (Burnout).", "Mínimo 14.0 Puntos requeridos para idoneidad.", "0.0 a 20.0 Puntos")
    ]

    r = 6
    for item in psico_data:
        for c_idx, val in enumerate(item, start=1):
            cell = ws4.cell(row=r, column=c_idx, value=val)
            is_sub = "SUBTOTAL" in item[0]
            cell.font = font_bold if is_sub else font_normal
            cell.border = border_cell
            if is_sub:
                cell.fill = fill_light
        r += 1

    r += 2
    ws4[f"A{r}"] = "B. ENTREVISTA SEMIESTRUCTURADA DE COMPETENCIAS NEW HEALTH (30 PUNTOS MÁXIMOS)"
    ws4[f"A{r}"].font = font_section
    r += 1

    headers_ent = ["N°", "Variable / Competencia NewCare", "Descriptores Conductuales Observables (Escala 0 a 10)", "Nivel Bajo (0-4)", "Nivel Medio (5-7)", "Nivel Alto (8-10)", "Puntos"]
    for col_idx, h in enumerate(headers_ent, start=1):
        cell = ws4.cell(row=r, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_primary
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border_cell
    ws4.row_dimensions[r].height = 22
    r += 1

    entrevista_vars = [
        (1, "Motivación y Vocación en Crónicos", "Interés genuino por el alivio del sufrimiento en cronicidad avanzada y cuidados paliativos.", "Poco interés, motivación meramente transaccional.", "Conoce el modelo, interés estándar.", "Alta vocación, pasión por el cuidado digno y alivio del sufrimiento.", 3.33),
        (2, "Trabajo en Equipo Interdisciplinar", "Capacidad de cooperar activamente con médicos, enfermería, psicosociales y red comunitaria.", "Aislamiento o jerarquía rígida e impositiva.", "Colabora si se le solicita, cumple su rol.", "Fomenta sinergia, liderazgo horizontal y respeto interprofesional.", 3.33),
        (3, "Manejo de Conflictos y Crisis", "Afrontamiento sereno de desacuerdos familiares, claudicación del cuidador y urgencias.", "Se bloquea ante la tensión o confronta al usuario.", "Maneja tensión estándar con apoyo.", "Gran templanza, mediación asertiva y contención de crisis familiares.", 3.33),
        (4, "Trato Humano y Calidez (Compasión)", "Expresión de cercanía, respeto por la dignidad, ternura y validación emocional del paciente.", "Trato frío, tecnicista, distante del paciente.", "Trato cordial y educado convencional.", "Calidez humana excepcional, empatía profunda y escucha compasiva.", 3.33),
        (5, "Escucha Activa y Empatía", "Habilidad para captar preocupaciones no verbales, miedos y valores de vida del paciente.", "Interrumpe, centrado en diligenciar formatos.", "Escucha los síntomas biológicos.", "Escucha integral en las cuatro dimensiones del ser humano.", 3.33),
        (6, "Comunicación de Malas Noticias", "Manejo de pronósticos difíciles, metas de cuidado y conspiración de silencio (Protocolo SPIKES).", "Evasivo, brusco o incapacidad de contención.", "Comunica diagnóstico pero sin soporte emocional.", "Domina comunicación asertiva y acompañamiento en la verdad soportable.", 3.34),
        (7, "Seguridad en Sí Mismo y Juicio Clínico", "Solvencia en toma de decisiones clínicas y éticas en situaciones de incertidumbre o final de vida.", "Inseguridad clínica constante, delega todo.", "Decisiones rutinarias correctas.", "Criterio clínico sólido, autonomía responsable y deliberación bioética.", 3.34),
        (8, "Apertura al Aprendizaje y Calidad", "Receptividad a la retroalimentación, auditoría de calidad y formación continuada NewCare.", "Resistencia al cambio, reactivo ante observaciones.", "Acepta recomendaciones obligatorias.", "Proactivo, ávido de aprendizaje continuo y mejora de la práctica clínica.", 3.33),
        (9, "Orientación al Cuidador y Comunidad", "Sensibilidad hacia la sobrecarga del cuidador (Zarit) y creación de redes de apoyo en Sincelejo.", "Ignora al cuidador, se enfoca solo en la patología.", "Identifica al cuidador pero sin plan de apoyo.", "Integra a la familia como unidad de cuidado y activa redes comunitarias.", 3.34)
    ]

    for item in entrevista_vars:
        ws4.cell(row=r, column=1, value=item[0]).font = font_bold
        ws4.cell(row=r, column=2, value=item[1]).font = font_bold
        ws4.cell(row=r, column=3, value=item[2]).font = font_normal
        ws4.cell(row=r, column=4, value=item[3]).font = font_normal
        ws4.cell(row=r, column=5, value=item[4]).font = font_normal
        ws4.cell(row=r, column=6, value=item[5]).font = font_normal
        ws4.cell(row=r, column=7, value=item[6]).font = font_bold
        for c in range(1, 8):
            cell = ws4.cell(row=r, column=c)
            cell.border = border_cell
            if r % 2 == 0:
                cell.fill = fill_zebra
        r += 1

    ws4.merge_cells(f"A{r}:F{r}")
    ws4.cell(row=r, column=1, value="TOTAL MÁXIMO ENTREVISTA POR COMPETENCIAS (Fórmula: Promedio de notas 0-10 * 3.0 puntos)").font = font_bold
    ws4.cell(row=r, column=7, value=30.0).font = font_bold
    for c in range(1, 8):
        cell = ws4.cell(row=r, column=c)
        cell.border = border_cell
        cell.fill = fill_light

    cols_w4 = [6, 28, 40, 25, 25, 35, 12]
    for idx, width in enumerate(cols_w4, start=1):
        ws4.column_dimensions[get_column_letter(idx)].width = width

    # =========================================================================
    # SHEET 5: FICHAS DE CARGO DEL ORGANIGRAMA OPTIMUS HEALTH
    # =========================================================================
    ws5 = wb.create_sheet(title="5. Fichas de Cargo NewCare")
    ws5.views.sheetView[0].showGridLines = True
    add_logo_to_sheet(ws5, "A1")

    ws5.merge_cells("C1:G1")
    ws5["C1"] = "CATÁLOGO DE PERFILES, COMPETENCIAS Y RESPONSABILIDADES • OPTIMUS HEALTH"
    ws5["C1"].font = font_title
    ws5["C1"].fill = fill_primary
    ws5["C1"].alignment = Alignment(horizontal="center", vertical="center")
    ws5.row_dimensions[1].height = 36

    ws5.merge_cells("C2:G2")
    ws5["C2"] = "Estructura alineada con el Organigrama de la IPS y los Estándares de la Fundación New Health"
    ws5["C2"].font = font_subtitle
    ws5["C2"].fill = fill_secondary
    ws5["C2"].alignment = Alignment(horizontal="center", vertical="center")
    ws5.row_dimensions[2].height = 24

    headers_fichas = ["Rol / Cargo en el Programa", "Profesional Designado", "Nivel Complejidad", "Requisitos Académicos Mínimos", "Experiencia Mínima", "Competencias Clave NewCare", "Funciones Principales en el Modelo"]
    for col_idx, h in enumerate(headers_fichas, start=1):
        cell = ws5.cell(row=4, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_primary
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border_cell
    ws5.row_dimensions[4].height = 25

    perfiles_data = [
        ("Director Médico / Líder NewCare", "Dr. Julio Herrera", "Transversal (Media y Alta)", "Médico Especialista en Medicina Interna o Geriatría con formación en Cuidados Paliativos y Dirección en Salud.", ">= 3 años clínico, >= 2 años dirección", "Liderazgo colaborativo, visión integradora, interlocución con EPS, aseguramiento de estándares NewCare.", "Liderar clínicamente el programa, presidir la Junta de Cronicidad Clínica, validar planes PAII de alta complejidad, supervisar auditorías de calidad."),
        ("Coordinadora Asistencial", "Enf. Dayana Solipaz", "Transversal Operativa", "Profesional en Enfermería o área de la salud con experiencia en administración o gerencia de servicios.", ">= 2 años en coordinación", "Gestión operativa de recursos, monitoreo de oportunidad, liderazgo de equipos y seguimiento a indicadores.", "Coordinar la operación del programa, gestionar agendas y rutas, supervisar el cumplimiento de actividades y evaluar metas de cobertura."),
        ("Gestor de Casos (Case Manager)", "Enf. Maria Isabel Borja", "Transversal (Media y Alta)", "Profesional en Enfermería con diplomado en Cuidados Paliativos o Gestión de Casos Crónicos.", ">= 2 años asistencial / domiciliaria", "Coordinación sociosanitaria, seguimiento proactivo, empatía, manejo de transiciones y comunicación fluida.", "Monitorear la cohorte activa, coordinar transiciones hospital-domicilio, asegurar oportunidad de citas y medicamentos, enlace permanente con la familia."),
        ("Médico Especialista Internista", "Dr. Jhair Martinez", "Alta Complejidad", "Médico Especialista en Medicina Interna debidamente titulado y registrado en ReTHUS.", ">= 3 años en crónicos avanzados", "Manejo integral de comorbilidades complejas, titulación de tratamientos avanzados y ajuste terapéutico.", "Realizar valoraciones especializadas, orientar decisiones clínicas complejas, participar en Junta de Cronicidad y adecuar el esfuerzo terapéutico."),
        ("Médico Especialista Intensivista", "Dr. Pedro Herrera", "Alta Complejidad", "Médico Especialista en Cuidado Intensivo debidamente registrado en ReTHUS.", ">= 3 años en UCI", "Manejo de falla orgánica múltiple, soporte invasivo y adecuación terapéutica en agudizaciones.", "Soporte en descompensaciones críticas, asesoría en transición a cuidados paliativos y bioética en limitación de soporte."),
        ("Médico Especialista Pediatra", "Dra. Janna Arboleda", "Alta Complejidad Pediátrica", "Médico Especialista en Pediatría con ReTHUS.", ">= 2 años en pediatría clínica", "Manejo de condiciones crónicas complejas pediátricas, soporte a padres y cuidadores.", "Atención y seguimiento de casos crónicos pediátricos que ingresen a la ruta de atención institucional."),
        ("Médico General Domiciliario / Ambulatorio", "Por Definir / En Proceso", "Básica y Media Complejidad", "Médico General con registro ReTHUS. Deseable formación en dolor y cronicidad.", ">= 1 año asistencial", "Valoración multidimensional, titulación de analgesia, manejo de descompensaciones en domicilio.", "Realizar valoraciones multidimensionales, formular y actualizar el PAI, atender descompensaciones domiciliarias y reportar a la Jefatura."),
        ("Auxiliares de Enfermería Domiciliaria", "Edgardo Navarro, Luis Carlos Ricardo, Luis Sampayo, Nubia Solorzano, Maria Alejandra Martinez", "Básica y Media Complejidad", "Técnicos Laborales en Auxiliar de Enfermería con registro ReTHUS y BLS vigente.", ">= 1 año en crónicos / domicilio", "Calidez, toma rigurosa de signos vitales, higiene y confort, cambios posturales, prevención de caídas y UPP.", "Cuidado directo en domicilio, administración segura de medicamentos, educación práctica al cuidador y alerta temprana de descompensación."),
        ("Fisioterapeuta", "Mara Salcedo", "Básica y Media Complejidad", "Profesional en Fisioterapia con ReTHUS. Formación en rehabilitación del adulto mayor.", ">= 1 año en rehabilitación", "Mantenimiento funcional, fisioterapia respiratoria en EPOC, movilización segura y prevención de atrofia.", "Ejecutar pautas de rehabilitación motora y respiratoria según PAI, capacitar al cuidador en movilización y transferencias seguras."),
        ("Fonoaudiólogo", "Melisa Aldana", "Media y Alta Complejidad", "Profesional en Fonoaudiología con ReTHUS.", ">= 1 año en deglución/comunicación", "Evaluación de disfagia neurogénica/estructural, prevención de broncoaspiración, comunicación adaptativa.", "Valorar y rehabilitar trastornos de deglución y comunicación, orientar consistencias de dieta y técnicas de alimentación segura."),
        ("Psicólogo", "Angélica Monterroza", "Transversal", "Profesional en Psicología con ReTHUS. Formación en Psicología Clínica, de la Salud o Duelo.", ">= 2 años en salud / crónicos", "Contención emocional, manejo del impacto diagnóstico, ansiedad, depresión y claudicación del cuidador (Zarit).", "Brindar apoyo psicológico continuo al paciente y familia, facilitar la Planificación Anticipada de Decisiones (PAD) y duelo."),
        ("Nutricionista", "Sara Chavez", "Media y Alta Complejidad", "Profesional en Nutrición y Dietética con ReTHUS.", ">= 1 año en nutrición clínica", "Valoración nutricional (MNA), manejo de desnutrición sarcopénica, prescripción de dietas terapéuticas.", "Diseñar y monitorear planes nutricionales ajustados a insuficiencias orgánicas (restricción hídrica, renal, hiposódica)."),
        ("Trabajador Social", "Tatiana Guerra", "Transversal", "Profesional en Trabajo Social con ReTHUS.", ">= 2 años en salud comunitaria", "Diagnóstico sociofamiliar (Gijón), activación de redes de apoyo, gestión comunitaria y voluntariado.", "Evaluar riesgos sociales familiares, articular recursos comunitarios en Sincelejo, dinamizar el voluntariado y la asamblea de pacientes.")
    ]

    r = 5
    for item in perfiles_data:
        ws5.cell(row=r, column=1, value=item[0]).font = font_bold
        ws5.cell(row=r, column=2, value=item[1]).font = font_bold
        ws5.cell(row=r, column=3, value=item[2]).font = font_normal
        ws5.cell(row=r, column=4, value=item[3]).font = font_normal
        ws5.cell(row=r, column=5, value=item[4]).font = font_normal
        ws5.cell(row=r, column=6, value=item[5]).font = font_normal
        ws5.cell(row=r, column=7, value=item[6]).font = font_normal
        for c in range(1, 8):
            cell = ws5.cell(row=r, column=c)
            cell.border = border_cell
            if r % 2 == 0:
                cell.fill = fill_zebra
        r += 1

    cols_w5 = [28, 26, 20, 35, 25, 35, 45]
    for idx, width in enumerate(cols_w5, start=1):
        ws5.column_dimensions[get_column_letter(idx)].width = width

    # =========================================================================
    # SHEET 6: SIMULADOR Y REGISTRO DE EVALUACIÓN INDIVIDUAL
    # =========================================================================
    ws6 = wb.create_sheet(title="6. Registro y Evaluador")
    ws6.views.sheetView[0].showGridLines = True
    add_logo_to_sheet(ws6, "A1")

    ws6.merge_cells("C1:I1")
    ws6["C1"] = "REGISTRO Y CALIFICACIÓN AUTOMATIZADA DE CANDIDATOS • AUDITORÍA NEW HEALTH"
    ws6["C1"].font = font_title
    ws6["C1"].fill = fill_primary
    ws6["C1"].alignment = Alignment(horizontal="center", vertical="center")
    ws6.row_dimensions[1].height = 36

    ws6.merge_cells("C2:I2")
    ws6["C2"] = "Evaluación objetiva con cálculo automático de ponderaciones y dictamen de idoneidad institucional"
    ws6["C2"].font = font_subtitle
    ws6["C2"].fill = fill_secondary
    ws6["C2"].alignment = Alignment(horizontal="center", vertical="center")
    ws6.row_dimensions[2].height = 24

    headers_sim = [
        "N°", "Nombre del Profesional / Candidato", "Cargo / Rol Postulado",
        "Filtros SI-NO (FLT)", "Calificación CV (Máx 50)", "Calificación Psicotécnico (Máx 20)",
        "Calificación Entrevista (Máx 30)", "PUNTAJE FINAL (Máx 100)", "DICTAMEN FINAL DE AUDITORÍA"
    ]
    for col_idx, h in enumerate(headers_sim, start=1):
        cell = ws6.cell(row=4, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_primary
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_cell
    ws6.row_dimensions[4].height = 28

    # Real team from Optimus Health loaded for verification
    equipo_real = [
        (1, "Dr. Julio Herrera", "Director Médico / Líder NewCare", "CUMPLE 100%", 47.0, 18.5, 28.5),
        (2, "Enf. Dayana Solipaz", "Coordinadora Asistencial", "CUMPLE 100%", 44.0, 17.0, 27.0),
        (3, "Enf. Maria Isabel Borja", "Gestor de Casos (Case Manager)", "CUMPLE 100%", 43.5, 17.5, 27.5),
        (4, "Dr. Jhair Martinez", "Médico Especialista Internista", "CUMPLE 100%", 46.5, 18.0, 28.0),
        (5, "Dr. Pedro Herrera", "Médico Especialista Intensivista", "CUMPLE 100%", 47.0, 18.0, 27.5),
        (6, "Dra. Janna Arboleda", "Médico Especialista Pediatra", "CUMPLE 100%", 45.0, 17.5, 27.0),
        (7, "Mara Salcedo", "Profesional de Fisioterapia", "CUMPLE 100%", 38.5, 15.5, 24.5),
        (8, "Melisa Aldana", "Profesional de Fonoaudiología", "CUMPLE 100%", 38.0, 15.0, 24.0),
        (9, "Angélica Monterroza", "Profesional de Psicología", "CUMPLE 100%", 42.0, 17.0, 27.5),
        (10, "Sara Chavez", "Profesional de Nutrición", "CUMPLE 100%", 39.0, 15.5, 25.0),
        (11, "Tatiana Guerra", "Profesional de Trabajo Social", "CUMPLE 100%", 41.5, 16.5, 26.5),
        (12, "Edgardo Navarro", "Auxiliar de Enfermería Domiciliaria", "CUMPLE 100%", 34.0, 15.0, 23.0),
        (13, "Luis Carlos Ricardo", "Auxiliar de Enfermería Domiciliaria", "CUMPLE 100%", 33.5, 14.5, 23.5),
        (14, "Luis Sampayo", "Auxiliar de Enfermería Domiciliaria", "CUMPLE 100%", 34.5, 15.0, 23.0),
        (15, "Nubia Solorzano", "Auxiliar de Enfermería Domiciliaria", "CUMPLE 100%", 35.0, 15.5, 24.0),
        (16, "Maria Alejandra Martinez", "Auxiliar de Enfermería Domiciliaria", "CUMPLE 100%", 34.0, 15.0, 23.5)
    ]

    for idx, c in enumerate(equipo_real, start=5):
        ws6.cell(row=idx, column=1, value=c[0]).font = font_bold
        ws6.cell(row=idx, column=2, value=c[1]).font = font_bold
        ws6.cell(row=idx, column=3, value=c[2]).font = font_normal
        ws6.cell(row=idx, column=4, value=c[3]).font = font_bold
        ws6.cell(row=idx, column=5, value=c[4]).font = font_normal
        ws6.cell(row=idx, column=6, value=c[5]).font = font_normal
        ws6.cell(row=idx, column=7, value=c[6]).font = font_normal

        # Excel formulas
        ws6.cell(row=idx, column=8, value=f"=E{idx}+F{idx}+G{idx}").font = font_bold
        ws6.cell(row=idx, column=9, value=f'=IF(D{idx}<>"CUMPLE 100%", "NO IDÓNEO (INCUMPLE FILTROS)", IF(H{idx}>=85, "IDÓNEO SOBRESALIENTE", IF(H{idx}>=70, "IDÓNEO CONDICIONADO", "NO IDÓNEO")))').font = font_bold

        for col_i in range(1, 10):
            cell = ws6.cell(row=idx, column=col_i)
            cell.border = border_cell
            if idx % 2 == 0:
                cell.fill = fill_zebra

    # Rows 21 to 30 empty for new candidates
    for idx in range(21, 31):
        ws6.cell(row=idx, column=1, value=idx-4).font = font_bold
        ws6.cell(row=idx, column=2, value="").font = font_normal
        ws6.cell(row=idx, column=3, value="").font = font_normal
        ws6.cell(row=idx, column=4, value="CUMPLE 100%").font = font_bold
        ws6.cell(row=idx, column=5, value=0.0).font = font_normal
        ws6.cell(row=idx, column=6, value=0.0).font = font_normal
        ws6.cell(row=idx, column=7, value=0.0).font = font_normal
        ws6.cell(row=idx, column=8, value=f"=E{idx}+F{idx}+G{idx}").font = font_bold
        ws6.cell(row=idx, column=9, value=f'=IF(D{idx}<>"CUMPLE 100%", "NO IDÓNEO (INCUMPLE FILTROS)", IF(H{idx}>=85, "IDÓNEO SOBRESALIENTE", IF(H{idx}>=70, "IDÓNEO CONDICIONADO", "NO IDÓNEO")))').font = font_bold
        for col_i in range(1, 10):
            cell = ws6.cell(row=idx, column=col_i)
            cell.border = border_cell

    cols_w6 = [6, 35, 32, 20, 22, 25, 25, 22, 30]
    for idx, width in enumerate(cols_w6, start=1):
        ws6.column_dimensions[get_column_letter(idx)].width = width

    output_path = "Baremacion_Personal_Asistencial_NEWCARE_Optimus_Health.xlsx"
    wb.save(output_path)
    print(f"Archivo guardado exitosamente en: {output_path}")

if __name__ == "__main__":
    build_baremacion_workbook()
