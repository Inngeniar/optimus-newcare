"""
storage.py
Módulo de persistencia y gestión de datos locales para la aplicación GAP Analysis NewCare.
Guarda y carga evaluaciones en formato JSON de forma automática e íntegra.
"""

import os
import json
import copy
from typing import List, Dict, Any
from requirements_data import REQUIREMENTS_MASTER, GROUPS_CONFIG

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
STORAGE_FILE = os.path.join(DATA_DIR, "gap_assessment.json")
EVIDENCES_DIR = os.path.join(os.path.dirname(__file__), "evidencias")
MASTER_DOCS_DIR = os.path.join(os.path.dirname(__file__), "repositorio_central")

def ensure_dirs():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(EVIDENCES_DIR):
        os.makedirs(EVIDENCES_DIR, exist_ok=True)
    if not os.path.exists(MASTER_DOCS_DIR):
        os.makedirs(MASTER_DOCS_DIR, exist_ok=True)

ensure_data_dir = ensure_dirs

def save_uploaded_evidence(req_id: str, uploaded_file) -> Dict[str, Any]:
    """
    Guarda un archivo subido por el usuario en la carpeta 'evidencias/'
    con el prefijo del código del requisito.
    """
    ensure_dirs()
    # Limpiar nombre de archivo
    safe_name = uploaded_file.name.replace(" ", "_")
    filename = f"{req_id}_{safe_name}"
    filepath = os.path.join(EVIDENCES_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(uploaded_file.getbuffer())
        
    return {
        "filename": filename,
        "original_name": uploaded_file.name,
        "filepath": filepath,
        "size_kb": round(len(uploaded_file.getbuffer()) / 1024, 1)
    }

def get_evidence_files(req_id: str) -> List[Dict[str, Any]]:
    """
    Retorna la lista de archivos existentes en la carpeta 'evidencias/' para un requisito.
    """
    ensure_dirs()
    files = []
    prefix = f"{req_id}_"
    if os.path.exists(EVIDENCES_DIR):
        for fname in os.listdir(EVIDENCES_DIR):
            if fname.startswith(prefix):
                fpath = os.path.join(EVIDENCES_DIR, fname)
                orig = fname[len(prefix):]
                sz = round(os.path.getsize(fpath) / 1024, 1) if os.path.exists(fpath) else 0
                files.append({
                    "filename": fname,
                    "original_name": orig,
                    "filepath": fpath,
                    "size_kb": sz
                })
    return files

def save_central_document(uploaded_file, category: str = "General", notes: str = "") -> Dict[str, Any]:
    """
    Guarda un documento maestro/transversal en 'repositorio_central/'
    y registra sus metadatos en un índice JSON.
    """
    ensure_dirs()
    safe_name = uploaded_file.name.replace(" ", "_")
    filepath = os.path.join(MASTER_DOCS_DIR, safe_name)
    
    with open(filepath, "wb") as f:
        f.write(uploaded_file.getbuffer())
        
    # Guardar metadatos en json
    meta_file = os.path.join(MASTER_DOCS_DIR, "index_metadata.json")
    meta_data = {}
    if os.path.exists(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta_data = json.load(f)
        except Exception:
            meta_data = {}
            
    import datetime
    meta_data[safe_name] = {
        "filename": safe_name,
        "original_name": uploaded_file.name,
        "category": category,
        "notes": notes,
        "size_kb": round(len(uploaded_file.getbuffer()) / 1024, 1),
        "uploaded_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta_data, f, ensure_ascii=False, indent=2)
        
    return meta_data[safe_name]

def get_central_documents() -> List[Dict[str, Any]]:
    """
    Retorna la lista de todos los documentos en el repositorio central con sus metadatos.
    """
    ensure_dirs()
    docs = []
    meta_file = os.path.join(MASTER_DOCS_DIR, "index_metadata.json")
    meta_data = {}
    if os.path.exists(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta_data = json.load(f)
        except Exception:
            meta_data = {}
            
    if os.path.exists(MASTER_DOCS_DIR):
        for fname in os.listdir(MASTER_DOCS_DIR):
            if fname == "index_metadata.json":
                continue
            fpath = os.path.join(MASTER_DOCS_DIR, fname)
            sz = round(os.path.getsize(fpath) / 1024, 1) if os.path.exists(fpath) else 0
            m = meta_data.get(fname, {})
            docs.append({
                "filename": fname,
                "original_name": m.get("original_name", fname),
                "category": m.get("category", "General"),
                "notes": m.get("notes", ""),
                "size_kb": m.get("size_kb", sz),
                "uploaded_at": m.get("uploaded_at", "-"),
                "filepath": fpath
            })
    # Ordenar por fecha o nombre
    docs.sort(key=lambda x: x["original_name"])
    return docs

def delete_central_document(filename: str) -> bool:
    """
    Elimina un documento del repositorio central.
    """
    ensure_dirs()
    fpath = os.path.join(MASTER_DOCS_DIR, filename)
    if os.path.exists(fpath):
        os.remove(fpath)
        
    meta_file = os.path.join(MASTER_DOCS_DIR, "index_metadata.json")
    if os.path.exists(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta_data = json.load(f)
            if filename in meta_data:
                del meta_data[filename]
                with open(meta_file, "w", encoding="utf-8") as f:
                    json.dump(meta_data, f, ensure_ascii=False, indent=2)
        except Exception:
            pass
    return True

def initialize_default_items() -> List[Dict[str, Any]]:
    """
    Genera la lista inicial de ítems precargados con la línea base diagnóstica.
    """
    items = []
    for req in REQUIREMENTS_MASTER:
        item = copy.deepcopy(req)
        # Asignar campos de evaluación con los valores por defecto del diagnóstico
        item["score"] = req.get("default_score", 0)
        item["evidence"] = req.get("default_evidence", "")
        item["findings"] = req.get("default_findings", "")
        item["action"] = req.get("default_action", "")
        item["responsible"] = req.get("default_responsible", "")
        item["priority"] = req.get("default_priority", "Media")
        item["status"] = req.get("default_status", "Pendiente")
        items.append(item)
    return items

def load_assessment_data() -> List[Dict[str, Any]]:
    """
    Carga los datos guardados o inicializa con la línea base diagnóstica si no existe el archivo.
    """
    ensure_data_dir()
    if not os.path.exists(STORAGE_FILE):
        items = initialize_default_items()
        save_assessment_data(items)
        return items
    
    try:
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            saved_items = json.load(f)
            
        # Validar consistencia con REQUIREMENTS_MASTER por si se agregaron nuevos requisitos
        saved_dict = {it["id"]: it for it in saved_items}
        merged_items = []
        for req in REQUIREMENTS_MASTER:
            rid = req["id"]
            if rid in saved_dict:
                merged = copy.deepcopy(req)
                merged.update(saved_dict[rid])
                merged_items.append(merged)
            else:
                item = copy.deepcopy(req)
                item["score"] = req.get("default_score", 0)
                item["evidence"] = req.get("default_evidence", "")
                item["findings"] = req.get("default_findings", "")
                item["action"] = req.get("default_action", "")
                item["responsible"] = req.get("default_responsible", "")
                item["priority"] = req.get("default_priority", "Media")
                item["status"] = req.get("default_status", "Pendiente")
                merged_items.append(item)
        return merged_items
    except Exception as e:
        print(f"Error cargando datos de almacenamiento: {e}. Restaurando línea base.")
        items = initialize_default_items()
        save_assessment_data(items)
        return items

def save_assessment_data(items: List[Dict[str, Any]]) -> bool:
    """
    Guarda los datos de evaluación en el archivo local JSON.
    """
    ensure_data_dir()
    try:
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando datos: {e}")
        return False

def reset_to_baseline() -> List[Dict[str, Any]]:
    """
    Restablece todas las calificaciones y notas al diagnóstico inicial precargado.
    """
    items = initialize_default_items()
    save_assessment_data(items)
    return items

def reset_to_empty() -> List[Dict[str, Any]]:
    """
    Restablece todas las calificaciones a cero (sin evaluar).
    """
    items = initialize_default_items()
    for it in items:
        it["score"] = 0
        it["evidence"] = ""
        it["findings"] = ""
        it["action"] = ""
        it["status"] = "Pendiente"
    save_assessment_data(items)
    return items

def set_all_to_compliant() -> List[Dict[str, Any]]:
    """
    Simulador de auditoría: pone todos los ítems en 2 (Cumple Completo).
    """
    items = load_assessment_data()
    for it in items:
        it["score"] = 2
        it["status"] = "Implementado"
    save_assessment_data(items)
    return items