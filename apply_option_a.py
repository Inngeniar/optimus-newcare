import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter

def apply_option_a():
    wb_path = "Baremacion_Personal_Asistencial_NEWCARE_Optimus_Health.xlsx"
    wb = openpyxl.load_workbook(wb_path)

    c_primary = "073763"      # Azul Marino Institucional
    c_secondary = "1C4587"    # Azul Zafiro
    c_accent = "2E75B5"       # Azul Médico
    c_light = "E8EEF5"        # Fondo suave cabeceras/subtotales
    c_zebra = "F7F9FC"        # Fondo cebra alterno
    c_border = "B0C4DE"       # Borde sutil
    white = "FFFFFF"

    font_title = Font(name="Calibri", size=13, bold=True, color=c_primary)
    font_subtitle = Font(name="Calibri", size=9, italic=True, color="444444")
    font_hdr = Font(name="Calibri", size=9, bold=True, color=white)
    font_bold = Font(name="Calibri", size=9, bold=True, color="000000")
    font_normal = Font(name="Calibri", size=9, color="000000")

    fill_hdr = PatternFill(start_color=c_primary, end_color=c_primary, fill_type="solid")
    fill_sec = PatternFill(start_color=c_secondary, end_color=c_secondary, fill_type="solid")
    fill_light = PatternFill(start_color=c_light, end_color=c_light, fill_type="solid")
    fill_zebra_p = PatternFill(start_color=c_zebra, end_color=c_zebra, fill_type="solid")

    thin_border = Side(border_style="thin", color=c_border)
    border_cell = Border(left=thin_border, right=thin_border, top=thin_border, bottom=thin_border)

    ws3 = wb["3. Baremo CV (50 Puntos)"]

    # Desfusionar celdas previamente combinadas a partir de la fila 3
    to_unmerge = [m for m in list(ws3.merged_cells.ranges) if m.min_row >= 3]
    for m in to_unmerge:
        ws3.unmerge_cells(str(m))

    ws3.row_dimensions[1].height = 36
    ws3.row_dimensions[2].height = 24

    # -------------------------------------------------------------------------
    # 1. FILA 3: BARRA INTERACTIVA DE AUDITORÍA CURRICULAR DEL CANDIDATO
    # -------------------------------------------------------------------------
    ws3.row_dimensions[3].height = 26
    
    ws3.cell(row=3, column=2, value="Candidato en Evaluación:").font = font_bold
    ws3.cell(row=3, column=2).alignment = Alignment(horizontal="right", vertical="center")

    ws3.merge_cells("C3:E3")
    c_cand = ws3.cell(row=3, column=3, value="Dr. Julio Herrera")
    c_cand.font = Font(name="Calibri", size=10, bold=True, color=c_primary)
    c_cand.fill = fill_light
    c_cand.alignment = Alignment(horizontal="center", vertical="center")
    c_cand.border = border_cell

    ws3.cell(row=3, column=6, value="Puntaje CV (Con Topes):").font = font_bold
    ws3.cell(row=3, column=6).alignment = Alignment(horizontal="right", vertical="center")

    c_score = ws3.cell(row=3, column=7, value="=I17")
    c_score.font = Font(name="Calibri", size=11, bold=True, color=c_primary)
    c_score.fill = fill_light
    c_score.alignment = Alignment(horizontal="center", vertical="center")
    c_score.border = border_cell

    ws3.cell(row=3, column=8, value="Dictamen Curricular:").font = font_bold
    ws3.cell(row=3, column=8).alignment = Alignment(horizontal="right", vertical="center")

    ws3.merge_cells("I3:J3")
    c_dict = ws3.cell(row=3, column=9, value="=J17")
    c_dict.font = font_bold
    c_dict.fill = fill_light
    c_dict.alignment = Alignment(horizontal="center", vertical="center")
    c_dict.border = border_cell

    ws3.cell(row=3, column=11, value="Umbral NewCare:").font = font_bold
    ws3.cell(row=3, column=11).alignment = Alignment(horizontal="right", vertical="center")

    c_umb = ws3.cell(row=3, column=12, value='=IF(G3>=35,"SUPERA UMBRAL (>=35 PTS)","BAJO UMBRAL (<35 PTS)")')
    c_umb.font = font_bold
    c_umb.fill = fill_light
    c_umb.alignment = Alignment(horizontal="center", vertical="center")
    c_umb.border = border_cell

    # -------------------------------------------------------------------------
    # 2. FILA 4: ENCABEZADOS DE LA TABLA NORMATIVA Y CALIFICADOR ACTIVO
    # -------------------------------------------------------------------------
    headers_cv_top = [
        "Dimensión Evaluada",
        "Peso Oficial",
        "Pts Máx",
        "Subcriterio Específico de Calificación",
        "Tasa Asignación",
        "Tope Rubro",
        "Cantidad Acreditada",
        "Puntos Brutos",
        "Puntaje Con Tope",
        "Auditoría del Tope Rubro",
        "Soporte Válido Exigido",
        "Criterio Auditoría New Health"
    ]

    for col_idx, h_text in enumerate(headers_cv_top, start=1):
        cell = ws3.cell(row=4, column=col_idx, value=h_text)
        cell.font = font_hdr
        cell.fill = fill_hdr
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_cell
    ws3.row_dimensions[4].height = 28

    # -------------------------------------------------------------------------
    # 3. FILAS 5 A 16: LOS 12 SUBCRITERIOS OFICIALES CON FÓRMULAS DE TOPE
    # -------------------------------------------------------------------------
    # IMPORTANTE: En VLOOKUP($C$3, $B$23:$Q$48, col_idx, FALSE):
    # Col B = 1 (Nombre)
    # Col C = 2 (Cargo)
    # Col D = 3 (1.1 Exp General)
    # Col E = 4 (1.2 Exp Paliativos)
    # Col F = 5 (2.1 Especialidad)
    # Col G = 6 (2.2 Diplomados)
    # Col H = 7 (3.1 Centros Ref)
    # Col I = 8 (4.1 Docencia Univ)
    # Col J = 9 (4.2 Docencia Cuidadores)
    # Col K = 10 (5.1 Artículos)
    # Col L = 11 (5.2 Libros/Guías)
    # Col M = 12 (6.1 Proyectos Inv)
    # Col N = 13 (7.1 Idiomas)
    # Col O = 14 (8.1 Gestión)
    subcriterios_data = [
        # (dim, peso, max_dim, subcrit, tasa_txt, tasa_num, tope, col_vlookup_idx, soporte, criterio)
        ("1. Experiencia Laboral", "30%", 15.0, "Experiencia laboral asistencial general en salud en servicios hospitalarios o ambulatorios (>1 año)", "1.0 pt por año", 1.0, 7.0, 3, "Certificaciones laborales IPS", "Mínimo 1 año para puntuar"),
        ("1. Experiencia Laboral", "30%", 15.0, "Experiencia específica en Cuidados Paliativos, Insuficiencias Crónicas Complejas (IOCC) o Domicilio", "2.0 pts por año", 2.0, 8.0, 4, "Certificaciones laborales detalladas", "Ponderación estratégica NewCare"),
        ("2. Formación Postgrado", "12%", 6.0, "Especialización médico-quirúrgica o Maestría clínica afín (Med. Interna, Familiar, Geriatría, Paliativos)", "4.0 pts por título", 4.0, 4.0, 5, "Diploma y acta oficial IES", "Acreditación universitaria"),
        ("2. Formación Postgrado", "12%", 6.0, "Diplomado formal en Cuidados Paliativos, Dolor o Insuficiencias Crónicas Complejas (>100 horas)", "2.0 pts por diplomado", 2.0, 2.0, 6, "Certificado entidad académica", "Cursos menores a 80h no aplican"),
        ("3. Centros de Referencia", "14%", 7.0, "Rotación o pasantía clínica en Unidad o Centro acreditado en Cuidados Paliativos / Red New Health", "3.5 pts por mes", 3.5, 7.0, 7, "Certificado oficial del centro", "Reconocimiento específico NewCare"),
        ("4. Actividad Docente", "11%", 5.5, "Docencia universitaria de pregrado o posgrado en facultades del área de la salud", "1.5 pts por semestre", 1.5, 3.0, 8, "Certificación universitaria", "Cátedras de medicina o enfermería"),
        ("4. Actividad Docente", "11%", 5.5, "Docente o facilitador en programas de educación a cuidadores, agentes comunitarios o formación en salud", "1.0 pt por curso", 1.0, 2.5, 9, "Certificado de relatoría/docencia", "Alineado a redes comunitarias"),
        ("5. Publicaciones", "9%", 4.5, "Artículo publicado en revista científica indexada (Pubmed, Scielo, Redalyc) sobre crónicos o paliativos", "2.5 pts por artículo", 2.5, 4.5, 10, "Copia de artículo con DOI/ISSN", "Primer autor o coautor"),
        ("5. Publicaciones", "9%", 4.5, "Capítulo de libro, guía de práctica clínica o manual institucional publicado con depósito legal", "1.5 pts por publicación", 1.5, 3.0, 11, "Registro ISBN / Depósito legal", "Publicación formal"),
        ("6. Investigación", "10%", 5.0, "Investigador en grupo categorizado por MinCiencias o semillero institucional avalado", "2.5 pts por proyecto", 2.5, 5.0, 12, "Certificado MinCiencias / CvLAC", "Investigación biomédica o social"),
        ("7. Idiomas", "4%", 2.0, "Dominio certificado de segundo idioma (Inglés técnico nivel B2 o superior para evidencia)", "2.0 pts (Nivel B2/C1)", 2.0, 2.0, 13, "Certificado examen oficial", "Lectura de literatura científica"),
        ("8. Gestión y Calidad", "10%", 5.0, "Experiencia demostrada en coordinación de servicios de salud, auditoría o Case Management", "2.5 pts por año", 2.5, 5.0, 14, "Certificado de cargo de coordinación", "Requisito clave para Líder y Case Manager")
    ]

    for idx, item in enumerate(subcriterios_data, start=5):
        ws3.cell(row=idx, column=1, value=item[0]).font = font_bold
        ws3.cell(row=idx, column=2, value=item[1]).font = font_normal
        ws3.cell(row=idx, column=3, value=item[2]).font = font_normal
        ws3.cell(row=idx, column=4, value=item[3]).font = font_normal
        ws3.cell(row=idx, column=5, value=item[4]).font = font_normal
        
        # Col F: Tope Rubro
        c_tope = ws3.cell(row=idx, column=6, value=item[6])
        c_tope.font = font_bold
        c_tope.alignment = Alignment(horizontal="center", vertical="center")

        # Col G: Cantidad Acreditada (traída dinámicamente de la matriz inferior para el candidato en C3)
        col_vlookup_idx = item[7]
        c_cant = ws3.cell(row=idx, column=7, value=f'=IF($C$3="","",IFERROR(VLOOKUP($C$3,$B$23:$Q$48,{col_vlookup_idx},FALSE),0))')
        c_cant.font = font_bold
        c_cant.alignment = Alignment(horizontal="center", vertical="center")

        # Col H: Puntos Brutos Acumulados
        tasa_val = item[5]
        c_bruto = ws3.cell(row=idx, column=8, value=f'=IF(G{idx}="","",ROUND(G{idx}*{tasa_val},2))')
        c_bruto.font = font_normal
        c_bruto.alignment = Alignment(horizontal="center", vertical="center")

        # Col I: Puntaje Obtenido (Con Tope Aplicado)
        c_topado = ws3.cell(row=idx, column=9, value=f'=IF(H{idx}="","",ROUND(MIN(F{idx},H{idx}),2))')
        c_topado.font = font_bold
        c_topado.alignment = Alignment(horizontal="center", vertical="center")
        c_topado.fill = fill_light

        # Col J: Auditoría de Aplicación del Tope Rubro
        c_aud = ws3.cell(row=idx, column=10, value=(
            f'=IF(G{idx}="","",'
            f'IF(H{idx}>F{idx},"TOPE APLICADO (Exceso: "&TEXT(H{idx}-F{idx},"0.0")&" pts no contabilizados)",'
            f'IF(H{idx}=F{idx},"TOPE EXACTO ALCANZADO","PUNTAJE DENTRO DEL TOPE (Sin exceso)")))'
        ))
        c_aud.font = font_bold
        c_aud.alignment = Alignment(horizontal="center", vertical="center")

        # Col K: Soporte Válido Exigido
        ws3.cell(row=idx, column=11, value=item[8]).font = font_normal

        # Col L: Criterio Auditoría
        ws3.cell(row=idx, column=12, value=item[9]).font = font_normal

        for c_i in range(1, 13):
            cell = ws3.cell(row=idx, column=c_i)
            cell.border = border_cell
            if idx % 2 == 0 and c_i != 9:
                cell.fill = fill_zebra_p
        ws3.row_dimensions[idx].height = 22

    # Fila 17: Total Baremo CV
    ws3.merge_cells("A17:E17")
    c_tot_lbl = ws3.cell(row=17, column=1, value="TOTAL BAREMO CV (SUMATORIA CON TOPES APLICADOS)")
    c_tot_lbl.font = font_bold
    c_tot_lbl.fill = fill_hdr
    c_tot_lbl.alignment = Alignment(horizontal="center", vertical="center")

    c_tot_tope = ws3.cell(row=17, column=6, value=50.0)
    c_tot_tope.font = font_bold
    c_tot_tope.fill = fill_hdr
    c_tot_tope.alignment = Alignment(horizontal="center", vertical="center")

    ws3.cell(row=17, column=7, value="---").alignment = Alignment(horizontal="center", vertical="center")
    ws3.cell(row=17, column=8, value="---").alignment = Alignment(horizontal="center", vertical="center")

    c_tot_pts = ws3.cell(row=17, column=9, value="=ROUND(SUM(I5:I16),1)")
    c_tot_pts.font = Font(name="Calibri", size=11, bold=True, color=c_primary)
    c_tot_pts.fill = fill_light
    c_tot_pts.alignment = Alignment(horizontal="center", vertical="center")

    c_tot_dict = ws3.cell(row=17, column=10, value='=IF(I17>=42,"DESTACADO (EXCELENCIA)",IF(I17>=35,"IDÓNEO CURRICULAR","REQUIERE FORTALECIMIENTO"))')
    c_tot_dict.font = font_bold
    c_tot_dict.fill = fill_light
    c_tot_dict.alignment = Alignment(horizontal="center", vertical="center")

    ws3.merge_cells("K17:L17")
    c_tot_sop = ws3.cell(row=17, column=11, value="EXPEDIENTE CURRICULAR VERIFICADO")
    c_tot_sop.font = font_bold
    c_tot_sop.alignment = Alignment(horizontal="center", vertical="center")

    for c_i in range(1, 13):
        ws3.cell(row=17, column=c_i).border = border_cell
    ws3.row_dimensions[17].height = 25

    # -------------------------------------------------------------------------
    # 4. FILAS 20 A 48: MATRIZ DE ACREDITACIÓN Y BAREMACIÓN CURRICULAR POR CANDIDATO
    # -------------------------------------------------------------------------
    ws3["A19"] = ""
    ws3["A20"] = "MATRIZ DE ACREDITACIÓN Y REGISTRO CURRICULAR POR CANDIDATO (MÁXIMO 50 PUNTOS)"
    ws3["A20"].font = font_title
    ws3["A21"] = "Base de datos auditable con acreditación de méritos por subcriterio y aplicación matemática de topes"
    ws3["A21"].font = font_subtitle
    ws3.row_dimensions[20].height = 22
    ws3.row_dimensions[21].height = 16

    headers_cv_matrix = [
        "N°", "Nombre del Profesional / Candidato", "Cargo / Rol Postulado",
        "1.1 Exp General (Años)", "1.2 Exp Paliativos (Años)", "2.1 Especialidad (Títulos)",
        "2.2 Diplomados (Cursos)", "3.1 Centros Ref. (Meses)", "4.1 Docencia Univ (Semestres)",
        "4.2 Docencia Cuidadores (Cursos)", "5.1 Artículos (Publicaciones)", "5.2 Libros/Guías (Publicaciones)",
        "6.1 Proyectos Inv (Proyectos)", "7.1 Idioma B2+ (Nivel)", "8.1 Gestión (Años)",
        "TOTAL BAREMO CV (Con Topes)", "Dictamen Curricular"
    ]

    for col_idx, h_text in enumerate(headers_cv_matrix, start=1):
        cell = ws3.cell(row=22, column=col_idx, value=h_text)
        cell.font = font_hdr
        cell.fill = fill_hdr
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_cell
    ws3.row_dimensions[22].height = 28

    equipo_data = [
        (1, "Dr. Julio Herrera", "Director Médico / Líder NewCare"),
        (2, "Enf. Dayana Solipaz", "Coordinadora Asistencial"),
        (3, "Enf. Maria Isabel Borja", "Gestor de Casos (Case Manager)"),
        (4, "Dr. Jhair Martinez", "Médico Especialista Internista"),
        (5, "Dr. Pedro Herrera", "Médico Especialista Intensivista"),
        (6, "Dra. Janna Arboleda", "Médico Especialista Pediatra"),
        (7, "Mara Salcedo", "Profesional de Fisioterapia"),
        (8, "Melisa Aldana", "Profesional de Fonoaudiología"),
        (9, "Angélica Monterroza", "Profesional de Psicología"),
        (10, "Sara Chavez", "Profesional de Nutrición"),
        (11, "Tatiana Guerra", "Profesional de Trabajo Social"),
        (12, "Edgardo Navarro", "Auxiliar de Enfermería Domiciliaria"),
        (13, "Luis Carlos Ricardo", "Auxiliar de Enfermería Domiciliaria"),
        (14, "Luis Sampayo", "Auxiliar de Enfermería Domiciliaria"),
        (15, "Nubia Solorzano", "Auxiliar de Enfermería Domiciliaria"),
        (16, "Maria Alejandra Martinez", "Auxiliar de Enfermería Domiciliaria")
    ]

    # Cantidades acreditadas por cada profesional para cada uno de los 12 subcriterios
    acreditaciones_candidatos = [
        [10.0, 5.0, 1.0, 1.0, 2.0, 2.0, 2.5, 2.0, 0.0, 2.0, 1.0, 0.8],  # 1. Julio = 47.0
        [8.0, 3.5, 1.0, 0.5, 2.0, 2.0, 1.0, 1.2, 0.0, 1.6, 1.0, 2.0],  # 2. Dayana = 44.0
        [8.0, 3.5, 1.0, 0.5, 2.0, 2.0, 1.0, 1.2, 0.0, 1.4, 1.0, 2.0],  # 3. Maria Isabel = 43.5
        [10.0, 5.0, 1.0, 1.0, 2.0, 2.0, 2.5, 2.0, 0.0, 2.0, 1.0, 0.6],  # 4. Jhair = 46.5
        [10.0, 5.0, 1.0, 1.0, 2.0, 2.0, 2.5, 2.0, 0.0, 2.0, 1.0, 0.8],  # 5. Pedro = 47.0
        [8.0, 4.0, 1.0, 1.0, 2.0, 2.0, 1.0, 1.2, 0.0, 2.0, 1.0, 1.2],  # 6. Janna = 45.0
        [6.0, 3.0, 0.5, 0.5, 2.0, 2.0, 1.0, 0.6, 0.0, 1.6, 1.0, 2.0],  # 7. Mara = 38.5
        [6.0, 3.0, 0.5, 0.5, 2.0, 1.5, 0.8, 0.8, 0.0, 1.6, 1.0, 2.0],  # 8. Melisa = 38.0
        [8.0, 3.5, 1.0, 0.0, 2.0, 2.0, 1.0, 1.2, 0.0, 2.0, 1.0, 1.2],  # 9. Angélica = 42.0
        [7.0, 3.0, 0.5, 0.5, 2.0, 1.5, 0.8, 0.8, 0.0, 2.0, 1.0, 2.0],  # 10. Sara = 39.0
        [8.0, 3.5, 1.0, 0.0, 2.0, 2.0, 1.0, 0.6, 0.0, 2.0, 1.0, 1.6],  # 11. Tatiana = 41.5
        [8.0, 4.0, 0.0, 1.0, 2.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.75, 2.0], # 12. Edgardo = 34.0
        [7.5, 4.0, 0.0, 1.0, 2.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.75, 2.0], # 13. Luis Carlos = 33.5
        [8.0, 4.0, 0.0, 1.0, 2.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 2.0],  # 14. Luis Sampayo = 34.5
        [8.0, 4.0, 0.0, 1.0, 2.0, 0.0, 1.5, 0.0, 0.0, 1.0, 1.0, 2.0],  # 15. Nubia = 35.0
        [7.5, 4.0, 0.0, 1.0, 2.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 2.0]   # 16. Maria Alejandra = 34.0
    ]

    for idx, (cand_info, q_vals) in enumerate(zip(equipo_data, acreditaciones_candidatos), start=23):
        ws3.cell(row=idx, column=1, value=cand_info[0]).font = font_bold
        ws3.cell(row=idx, column=2, value=cand_info[1]).font = font_bold
        ws3.cell(row=idx, column=3, value=cand_info[2]).font = font_normal

        # Columnas 4 a 15: cantidades acreditadas (Cols D a O)
        for q_i, q_val in enumerate(q_vals, start=4):
            c_q = ws3.cell(row=idx, column=q_i, value=q_val)
            c_q.font = font_normal
            c_q.alignment = Alignment(horizontal="center", vertical="center")

        # Columna 16 (Col P): Total Baremo CV aplicando la fórmula matemática estricta con topes por rubro
        f_tot_cv = (
            f'=IF(B{idx}="","",ROUND('
            f'MIN(7,D{idx}*1.0) + '
            f'MIN(8,E{idx}*2.0) + '
            f'MIN(4,F{idx}*4.0) + '
            f'MIN(2,G{idx}*2.0) + '
            f'MIN(7,H{idx}*3.5) + '
            f'MIN(3,I{idx}*1.5) + '
            f'MIN(2.5,J{idx}*1.0) + '
            f'MIN(4.5,MIN(4.5,K{idx}*2.5)+MIN(3,L{idx}*1.5)) + '
            f'MIN(5,M{idx}*2.5) + '
            f'MIN(2,N{idx}*2.0) + '
            f'MIN(5,O{idx}*2.5), 1))'
        )
        c_p = ws3.cell(row=idx, column=16, value=f_tot_cv)
        c_p.font = font_bold
        c_p.alignment = Alignment(horizontal="center", vertical="center")
        c_p.fill = fill_light

        # Columna 17 (Col Q): Dictamen Curricular
        f_dict_cv = f'=IF(B{idx}="","",IF(P{idx}>=42,"DESTACADO (EXCELENCIA)",IF(P{idx}>=35,"IDÓNEO CURRICULAR","REQUIERE FORTALECIMIENTO")))'
        c_q_d = ws3.cell(row=idx, column=17, value=f_dict_cv)
        c_q_d.font = font_bold
        c_q_d.alignment = Alignment(horizontal="center", vertical="center")

        for col_i in range(1, 18):
            cell = ws3.cell(row=idx, column=col_i)
            cell.border = border_cell
            if idx % 2 == 0 and col_i != 16:
                cell.fill = fill_zebra_p
        ws3.row_dimensions[idx].height = 20

    # Filas de reserva (N° 17 a 26 -> Filas 39 a 48)
    for idx in range(39, 49):
        ws3.cell(row=idx, column=1, value=idx-22).font = font_bold
        ws3.cell(row=idx, column=2, value="").font = font_bold
        ws3.cell(row=idx, column=3, value="").font = font_normal

        for col_i in range(4, 16):
            c_blank = ws3.cell(row=idx, column=col_i, value="")
            c_blank.alignment = Alignment(horizontal="center", vertical="center")

        f_tot_cv = (
            f'=IF(B{idx}="","",ROUND('
            f'MIN(7,D{idx}*1.0) + '
            f'MIN(8,E{idx}*2.0) + '
            f'MIN(4,F{idx}*4.0) + '
            f'MIN(2,G{idx}*2.0) + '
            f'MIN(7,H{idx}*3.5) + '
            f'MIN(3,I{idx}*1.5) + '
            f'MIN(2.5,J{idx}*1.0) + '
            f'MIN(4.5,MIN(4.5,K{idx}*2.5)+MIN(3,L{idx}*1.5)) + '
            f'MIN(5,M{idx}*2.5) + '
            f'MIN(2,N{idx}*2.0) + '
            f'MIN(5,O{idx}*2.5), 1))'
        )
        c_p = ws3.cell(row=idx, column=16, value=f_tot_cv)
        c_p.font = font_bold
        c_p.alignment = Alignment(horizontal="center", vertical="center")
        c_p.fill = fill_light

        f_dict_cv = f'=IF(B{idx}="","",IF(P{idx}>=42,"DESTACADO (EXCELENCIA)",IF(P{idx}>=35,"IDÓNEO CURRICULAR","REQUIERE FORTALECIMIENTO")))'
        c_q_d = ws3.cell(row=idx, column=17, value=f_dict_cv)
        c_q_d.font = font_bold
        c_q_d.alignment = Alignment(horizontal="center", vertical="center")

        for col_i in range(1, 18):
            cell = ws3.cell(row=idx, column=col_i)
            cell.border = border_cell
        ws3.row_dimensions[idx].height = 20

    # Validación desplegable en C3
    ws3.data_validations.dataValidation.clear()
    dv3 = DataValidation(type="list", formula1="=Lista_Candidatos", allow_blank=False)
    ws3.add_data_validation(dv3)
    dv3.add("C3")

    # Formatos condicionales
    green_fill = PatternFill(start_color='E2F0D9', end_color='E2F0D9', fill_type='solid')
    green_font = Font(name='Calibri', size=9, bold=True, color='276A3C')
    yellow_fill = PatternFill(start_color='FFF2CC', end_color='FFF2CC', fill_type='solid')
    yellow_font = Font(name='Calibri', size=9, bold=True, color='B25900')

    ws3.conditional_formatting.add('J17', FormulaRule(formula=['ISNUMBER(SEARCH("DESTACADO",J17))'], fill=green_fill, font=green_font))
    ws3.conditional_formatting.add('J17', FormulaRule(formula=['ISNUMBER(SEARCH("IDÓNEO",J17))'], fill=green_fill, font=green_font))
    ws3.conditional_formatting.add('J17', FormulaRule(formula=['ISNUMBER(SEARCH("FORTALECIMIENTO",J17))'], fill=yellow_fill, font=yellow_font))

    ws3.conditional_formatting.add('I3', FormulaRule(formula=['ISNUMBER(SEARCH("DESTACADO",I3))'], fill=green_fill, font=green_font))
    ws3.conditional_formatting.add('I3', FormulaRule(formula=['ISNUMBER(SEARCH("IDÓNEO",I3))'], fill=green_fill, font=green_font))
    ws3.conditional_formatting.add('I3', FormulaRule(formula=['ISNUMBER(SEARCH("FORTALECIMIENTO",I3))'], fill=yellow_fill, font=yellow_font))

    ws3.conditional_formatting.add('Q23:Q48', FormulaRule(formula=['ISNUMBER(SEARCH("DESTACADO",Q23))'], fill=green_fill, font=green_font))
    ws3.conditional_formatting.add('Q23:Q48', FormulaRule(formula=['ISNUMBER(SEARCH("IDÓNEO",Q23))'], fill=green_fill, font=green_font))
    ws3.conditional_formatting.add('Q23:Q48', FormulaRule(formula=['ISNUMBER(SEARCH("FORTALECIMIENTO",Q23))'], fill=yellow_fill, font=yellow_font))

    ws3.conditional_formatting.add('J5:J16', FormulaRule(formula=['ISNUMBER(SEARCH("EXCESO",J5))'], fill=yellow_fill, font=yellow_font))
    ws3.conditional_formatting.add('J5:J16', FormulaRule(formula=['ISNUMBER(SEARCH("TOPE EXACTO",J5))'], fill=green_fill, font=green_font))

    # Anchos de columna
    cols_w3 = [24, 12, 10, 38, 16, 12, 18, 16, 18, 42, 28, 28, 16, 16, 16, 18, 26]
    for idx, width in enumerate(cols_w3, start=1):
        ws3.column_dimensions[get_column_letter(idx)].width = width

    # -------------------------------------------------------------------------
    # 5. ACTUALIZAR VINCULACIÓN EN HOJA 6 (COLUMNA E -> APUNTA A COLUMNA P DE HOJA 3)
    # -------------------------------------------------------------------------
    ws6 = wb["6. Registro y Evaluador"]
    for r in range(5, 36):
        ws6.cell(row=r, column=5, value=(
            f'=IF(B{r}="","",IFERROR(VLOOKUP(B{r}, \'3. Baremo CV (50 Puntos)\'!$B$23:$Q$48, 15, FALSE), 0))'
        )).font = font_normal

    wb.save(wb_path)
    print(f"Opción A corregida con éxito y guardada en: {wb_path}")

if __name__ == "__main__":
    apply_option_a()
