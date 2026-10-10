import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

def update_kpis_and_filter_link():
    wb_path = "Baremacion_Personal_Asistencial_NEWCARE_Optimus_Health.xlsx"
    wb = openpyxl.load_workbook(wb_path)

    # Styles
    c_primary = "073763"
    c_light = "E8EEF5"
    c_border = "B0C4DE"
    white = "FFFFFF"

    font_hdr = Font(name="Calibri", size=10, bold=True, color=white)
    font_bold = Font(name="Calibri", size=10, bold=True, color="000000")
    font_normal = Font(name="Calibri", size=10, color="000000")
    fill_hdr = PatternFill(start_color=c_primary, end_color=c_primary, fill_type="solid")
    fill_light = PatternFill(start_color=c_light, end_color=c_light, fill_type="solid")
    thin_border = Side(border_style="thin", color=c_border)
    border_cell = Border(left=thin_border, right=thin_border, top=thin_border, bottom=thin_border)

    # =========================================================================
    # 1. ACTUALIZACIÓN HOJA 2: FILTROS EXCLUYENTES SI-NO
    # =========================================================================
    ws2 = wb["2. Filtros Excluyentes SI-NO"]

    # Fila 3: Selector de Candidato Auditado
    ws2["B3"] = "Candidato en Auditoría:"
    ws2["B3"].font = font_bold
    ws2["B3"].alignment = Alignment(horizontal="right", vertical="center")

    ws2.merge_cells("C3:E3")
    ws2["C3"] = "Dr. Julio Herrera"
    ws2["C3"].font = Font(name="Calibri", size=11, bold=True, color=c_primary)
    ws2["C3"].fill = fill_light
    ws2["C3"].alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[3].height = 22

    # Lista de nombres para el desplegable de candidatos en C3
    candidatos_validos = (
        '"Dr. Julio Herrera,'
        'Enf. Dayana Solipaz,'
        'Enf. Maria Isabel Borja,'
        'Dr. Jhair Martinez,'
        'Dr. Pedro Herrera,'
        'Dra. Janna Arboleda,'
        'Mara Salcedo,'
        'Melisa Aldana,'
        'Angélica Monterroza,'
        'Sara Chavez,'
        'Tatiana Guerra,'
        'Edgardo Navarro,'
        'Luis Carlos Ricardo,'
        'Luis Sampayo,'
        'Nubia Solorzano,'
        'Maria Alejandra Martinez"'
    )
    dv_cand = DataValidation(type="list", formula1=candidatos_validos, allow_blank=False)
    ws2.add_data_validation(dv_cand)
    dv_cand.add("C3")

    # Dictamen en Fila 15 (G15)
    # Si hay al menos un "NO CUMPLE", emite "NO CUMPLE (DESCARTADO)", si no "CUMPLE 100%"
    ws2["G15"] = '=IF(COUNTIF(G5:G13,"NO CUMPLE")>0, "NO CUMPLE (DESCARTADO)", "CUMPLE 100%")'

    # =========================================================================
    # 2. VINCULACIÓN EN HOJA 6: COLUMNA D CON HOJA 2
    # =========================================================================
    ws6 = wb["6. Registro y Evaluador"]

    for r in range(5, 36):
        # Si la celda de nombre está vacía -> queda vacía
        # Si el candidato en la fila coincide con el auditado en la Hoja 2 (C3) -> toma el resultado dinámico de G15
        # Si no, mantiene "CUMPLE 100%"
        formula_d = (
            f'=IF(B{r}="","",'
            f'IF(B{r}=\'2. Filtros Excluyentes SI-NO\'!$C$3, '
            f'\'2. Filtros Excluyentes SI-NO\'!$G$15, "CUMPLE 100%"))'
        )
        c_d = ws6.cell(row=r, column=4, value=formula_d)
        c_d.font = font_bold
        c_d.alignment = Alignment(horizontal="center", vertical="center")

    # =========================================================================
    # 3. CORRECCIÓN DEFINITIVA DE KPIs EN HOJA 6 (M5 A M11)
    # =========================================================================
    # Total Candidatos Registrados (solo celdas con texto real, ignora vacías)
    ws6["M5"] = '=COUNTIF(B5:B35, "?*")'
    ws6["M5"].number_format = '#,##0'

    # Superan Filtros Habilitantes (solo candidatos registrados con CUMPLE 100%)
    ws6["M6"] = '=COUNTIFS(B5:B35, "?*", D5:D35, "CUMPLE 100%")'
    ws6["M6"].number_format = '#,##0'

    # Idóneos Sobresalientes (>=85)
    ws6["M7"] = '=COUNTIF(I5:I35, "IDÓNEO SOBRESALIENTE")'
    ws6["M7"].number_format = '#,##0'

    # Idóneos Condicionados (70-84)
    ws6["M8"] = '=COUNTIF(I5:I35, "IDÓNEO CONDICIONADO")'
    ws6["M8"].number_format = '#,##0'

    # Descartados / No Idóneos (registrados que contengan NO)
    ws6["M9"] = '=COUNTIFS(B5:B35, "?*", I5:I35, "*NO*")'
    ws6["M9"].number_format = '#,##0'

    # Promedio de Puntaje de los Aprobados (>0)
    ws6["M10"] = '=IFERROR(ROUND(AVERAGEIF(H5:H35, ">0"), 1), 0)'
    ws6["M10"].number_format = '#,##0.0'

    # Tasa de Aprobación Global (Aprobados / Total Registrados)
    # = (Sobresalientes + Condicionados) / Total Registrados
    ws6["M11"] = '=IF(M5=0, 0, ROUND((M7+M8)/M5, 3))'
    ws6["M11"].number_format = '0.0%'

    wb.save(wb_path)
    print(f"Workbook actualizado y guardado exitosamente en: {wb_path}")

if __name__ == "__main__":
    update_kpis_and_filter_link()
