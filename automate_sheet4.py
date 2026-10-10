import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter

def automate_sheet4():
    wb_path = "Baremacion_Personal_Asistencial_NEWCARE_Optimus_Health.xlsx"
    wb = openpyxl.load_workbook(wb_path)
    ws4 = wb["4. Psicotecnico y Entrevista"]

    # Colors & Styles
    c_primary = "073763"
    c_secondary = "1C4587"
    c_accent = "2E75B5"
    c_light = "E8EEF5"
    c_zebra = "F7F9FC"
    c_border = "B0C4DE"
    white = "FFFFFF"

    font_hdr = Font(name="Calibri", size=10, bold=True, color=white)
    font_bold = Font(name="Calibri", size=10, bold=True, color="000000")
    font_normal = Font(name="Calibri", size=10, color="000000")
    fill_hdr = PatternFill(start_color=c_primary, end_color=c_primary, fill_type="solid")
    fill_sec = PatternFill(start_color=c_secondary, end_color=c_secondary, fill_type="solid")
    fill_light = PatternFill(start_color=c_light, end_color=c_light, fill_type="solid")
    thin_border = Side(border_style="thin", color=c_border)
    border_cell = Border(left=thin_border, right=thin_border, top=thin_border, bottom=thin_border)

    # =========================================================================
    # 1. AUTOMATIZACIÓN DE LA SECCIÓN A: PSICOTÉCNICO (FILAS 5 A 8)
    # =========================================================================
    # Encabezados en Fila 5
    h_col7 = ws4.cell(row=5, column=7, value="Percentil Test (0-100)")
    h_col7.font = font_hdr
    h_col7.fill = fill_hdr
    h_col7.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    h_col7.border = border_cell

    h_col8 = ws4.cell(row=5, column=8, value="Puntaje Obtenido (Pts)")
    h_col8.font = font_hdr
    h_col8.fill = fill_hdr
    h_col8.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    h_col8.border = border_cell

    h_col9 = ws4.cell(row=5, column=9, value="Dictamen Parcial")
    h_col9.font = font_hdr
    h_col9.fill = fill_hdr
    h_col9.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    h_col9.border = border_cell

    # Fila 6: CPR (Personalidad Resistente, máx 12)
    # Ejemplo inicial: Percentil 75
    c_g6 = ws4.cell(row=6, column=7, value=75)
    c_g6.font = font_bold
    c_g6.alignment = Alignment(horizontal="center", vertical="center")
    c_g6.border = border_cell

    c_h6 = ws4.cell(row=6, column=8, value='=IF(G6="","",ROUND((G6/100)*C6,2))')
    c_h6.font = font_bold
    c_h6.alignment = Alignment(horizontal="center", vertical="center")
    c_h6.border = border_cell

    c_i6 = ws4.cell(row=6, column=9, value='=IF(G6="","",IF(G6>=65,"IDÓNEO (ALTA RESISTENCIA)","VULNERABLE (BAJO)"))')
    c_i6.font = font_bold
    c_i6.alignment = Alignment(horizontal="center", vertical="center")
    c_i6.border = border_cell

    # Fila 7: DAS (Actitudes Disfuncionales, máx 8)
    # Ejemplo inicial: Percentil 25 (bajo en disfuncionalidad = excelente)
    c_g7 = ws4.cell(row=7, column=7, value=25)
    c_g7.font = font_bold
    c_g7.alignment = Alignment(horizontal="center", vertical="center")
    c_g7.border = border_cell

    c_h7 = ws4.cell(row=7, column=8, value='=IF(G7="","",ROUND((1-(G7/100))*C7,2))')
    c_h7.font = font_bold
    c_h7.alignment = Alignment(horizontal="center", vertical="center")
    c_h7.border = border_cell

    c_i7 = ws4.cell(row=7, column=9, value='=IF(G7="","",IF(G7<=40,"IDÓNEO (BAJA DISFUNCIÓN)","ALTO RIESGO DISFUNCIONAL"))')
    c_i7.font = font_bold
    c_i7.alignment = Alignment(horizontal="center", vertical="center")
    c_i7.border = border_cell

    # Fila 8: Subtotal Psicotécnico (Máx 20 pts)
    c_g8 = ws4.cell(row=8, column=7, value="SUBTOTAL")
    c_g8.font = font_bold
    c_g8.alignment = Alignment(horizontal="center", vertical="center")
    c_g8.fill = fill_light
    c_g8.border = border_cell

    c_h8 = ws4.cell(row=8, column=8, value='=IF(COUNT(H6:H7)=0,"",ROUND(H6+H7,2))')
    c_h8.font = font_bold
    c_h8.alignment = Alignment(horizontal="center", vertical="center")
    c_h8.fill = fill_light
    c_h8.border = border_cell

    c_i8 = ws4.cell(row=8, column=9, value='=IF(H8="","",IF(H8>=14,"APTO PSICOTÉCNICO","CONDICIONADO"))')
    c_i8.font = font_bold
    c_i8.alignment = Alignment(horizontal="center", vertical="center")
    c_i8.fill = fill_light
    c_i8.border = border_cell

    # =========================================================================
    # 2. AUTOMATIZACIÓN DE LA SECCIÓN B: ENTREVISTA (FILAS 11 A 21)
    # =========================================================================
    # Encabezados en Fila 11
    h_ent8 = ws4.cell(row=11, column=8, value="Nota Evaluador (0 a 10)")
    h_ent8.font = font_hdr
    h_ent8.fill = fill_hdr
    h_ent8.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    h_ent8.border = border_cell

    h_ent9 = ws4.cell(row=11, column=9, value="Puntaje Ponderado")
    h_ent9.font = font_hdr
    h_ent9.fill = fill_hdr
    h_ent9.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    h_ent9.border = border_cell

    # Notas de ejemplo realistas (entre 8.0 y 9.5 para perfil idóneo)
    demo_notas = [9.0, 8.5, 8.0, 9.0, 8.5, 8.0, 8.5, 9.0, 8.5]

    for idx, r in enumerate(range(12, 21)):
        # Columna H: Nota asignada
        cell_nota = ws4.cell(row=r, column=8, value=demo_notas[idx])
        cell_nota.font = font_bold
        cell_nota.alignment = Alignment(horizontal="center", vertical="center")
        cell_nota.border = border_cell

        # Columna I: Puntaje Ponderado = (Nota / 10) * Peso_Maximo_G
        cell_pond = ws4.cell(row=r, column=9, value=f'=IF(H{r}="","",ROUND((H{r}/10)*G{r},2))')
        cell_pond.font = font_bold
        cell_pond.alignment = Alignment(horizontal="center", vertical="center")
        cell_pond.border = border_cell

    # Fila 21: Total de la Entrevista
    c_tot_nota = ws4.cell(row=21, column=8, value='=IF(COUNT(H12:H20)=0,"",ROUND(AVERAGE(H12:H20),2))')
    c_tot_nota.font = font_bold
    c_tot_nota.alignment = Alignment(horizontal="center", vertical="center")
    c_tot_nota.fill = fill_light
    c_tot_nota.border = border_cell

    c_tot_pond = ws4.cell(row=21, column=9, value='=IF(COUNT(H12:H20)=0,"",ROUND(SUM(I12:I20),2))')
    c_tot_pond.font = font_bold
    c_tot_pond.alignment = Alignment(horizontal="center", vertical="center")
    c_tot_pond.fill = fill_light
    c_tot_pond.border = border_cell

    # =========================================================================
    # 3. TARJETA RESUMEN EJECUTIVO EN COLUMNAS K A M (FILAS 5 A 11)
    # =========================================================================
    ws4.merge_cells("K5:M5")
    ws4["K5"] = "CALIFICADOR PSICO-RELACIONAL EN VIVO"
    ws4["K5"].font = font_hdr
    ws4["K5"].fill = fill_hdr
    ws4["K5"].alignment = Alignment(horizontal="center", vertical="center")
    ws4.row_dimensions[5].height = 25

    resumen_items = [
        ("Candidato en Evaluación:", "Dr. Julio Herrera", False),
        ("Puntaje Psicotécnico (Máx 20):", "=H8", False),
        ("Puntaje Entrevista (Máx 30):", "=I21", False),
        ("TOTAL ETAPA PSICO-RELACIONAL (Máx 50):", "=H8+I21", False),
        ("Dictamen Parcial de la Etapa:", '=IF(M9="","",IF(M9>=42,"SOBRESALIENTE",IF(M9>=35,"IDÓNEO CONDICIONADO","NO IDÓNEO")))', False)
    ]

    for idx, (lbl, formula_val, is_cur) in enumerate(resumen_items, start=6):
        ws4.merge_cells(f"K{idx}:L{idx}")
        c_k = ws4[f"K{idx}"]
        c_k.value = lbl
        is_tot = "TOTAL" in lbl or "Dictamen" in lbl
        c_k.font = font_bold if is_tot else font_normal
        c_k.alignment = Alignment(horizontal="left", vertical="center")

        c_m = ws4[f"M{idx}"]
        c_m.value = formula_val
        c_m.font = font_bold
        c_m.alignment = Alignment(horizontal="center", vertical="center")

        for c_col in range(11, 14):
            c_cl = ws4.cell(row=idx, column=c_col)
            c_cl.border = border_cell
            if is_tot:
                c_cl.fill = fill_light
            elif idx % 2 == 0:
                c_cl.fill = PatternFill(start_color=c_zebra, end_color=c_zebra, fill_type="solid")

    # Column Dimensions
    ws4.column_dimensions["G"].width = 18
    ws4.column_dimensions["H"].width = 18
    ws4.column_dimensions["I"].width = 20
    ws4.column_dimensions["K"].width = 24
    ws4.column_dimensions["L"].width = 10
    ws4.column_dimensions["M"].width = 18

    # Formato Condicional en M10 (Dictamen)
    green_fill = PatternFill(start_color="E2F0D9", end_color="E2F0D9", fill_type="solid")
    green_font = Font(name="Calibri", size=10, bold=True, color="276A3C")
    yellow_fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
    yellow_font = Font(name="Calibri", size=10, bold=True, color="B25900")
    red_fill = PatternFill(start_color="FCE4D6", end_color="FCE4D6", fill_type="solid")
    red_font = Font(name="Calibri", size=10, bold=True, color="C00000")

    ws4.conditional_formatting.add("M10", FormulaRule(formula=['ISNUMBER(SEARCH("SOBRESALIENTE",M10))'], fill=green_fill, font=green_font))
    ws4.conditional_formatting.add("M10", FormulaRule(formula=['ISNUMBER(SEARCH("CONDICIONADO",M10))'], fill=yellow_fill, font=yellow_font))
    ws4.conditional_formatting.add("M10", FormulaRule(formula=['ISNUMBER(SEARCH("NO IDÓNEO",M10))'], fill=red_fill, font=red_font))

    wb.save(wb_path)
    print(f"Hoja 4 automatizada y guardada exitosamente en: {wb_path}")

if __name__ == "__main__":
    automate_sheet4()
