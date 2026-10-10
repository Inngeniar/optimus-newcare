import openpyxl
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

def fix_all_dropdowns():
    wb_path = "Baremacion_Personal_Asistencial_NEWCARE_Optimus_Health.xlsx"
    wb = openpyxl.load_workbook(wb_path)

    # 1. Definir rango con nombre para los candidatos en Excel
    target_range = "'6. Registro y Evaluador'!$B$5:$B$20"
    dn = DefinedName("Lista_Candidatos", attr_text=target_range)
    wb.defined_names.add(dn)
    print("Rango con nombre 'Lista_Candidatos' creado apuntando a:", target_range)

    # 2. Configurar Validación de Datos en Hoja 2, Hoja 3 y Hoja 4
    # En Excel, una validación tipo Lista con origen a un rango con nombre =Lista_Candidatos
    # es 100% nativa y visible en la pestaña Datos > Validación de datos.
    targets = [
        ("2. Filtros Excluyentes SI-NO", "C4"),
        ("3. Baremo CV (50 Puntos)", "L5"),
        ("4. Psicotecnico y Entrevista", "M6")
    ]

    for sname, cell_coord in targets:
        ws = wb[sname]
        # Limpiar validaciones previas para evitar duplicados
        ws.data_validations.dataValidation.clear()
        
        dv = DataValidation(
            type="list",
            formula1="=Lista_Candidatos",
            allow_blank=True,
            showDropDown=False # En openpyxl False significa 'mostrar flecha desplegable'
        )
        dv.errorTitle = "Candidato No Válido"
        dv.error = "Por favor seleccione un candidato registrado de la lista desplegable."
        dv.promptTitle = "Seleccionar Candidato"
        dv.prompt = "Elija un candidato registrado en el sistema."
        dv.showErrorMessage = True
        dv.showInputMessage = True

        ws.add_data_validation(dv)
        dv.add(cell_coord)
        print(f"Validación desplegable configurada en Hoja '{sname}' celda {cell_coord}")

    wb.save(wb_path)
    print("Guardado exitoso del archivo con listas desplegables nativas.")

if __name__ == "__main__":
    fix_all_dropdowns()
