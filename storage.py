"""
storage.py
Módulo de persistencia y gestión de datos para la aplicación GAP Analysis NewCare.
Soporta:
1. Persistencia local en archivo JSON (data/gap_assessment.json).
2. Sincronización colaborativa en la nube mediante GitHub Contents API (Inngeniar/optimus-newcare).
Permite que múltiples auditores y consultores alimenten el diagnóstico simultáneamente.
"""

import os
import json
import copy
import base64
import requests
from typing import List, Dict, Any, Tuple, Optional
from requirements_data import REQUIREMENTS_MASTER, GROUPS_CONFIG

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
STORAGE_FILE = os.path.join(DATA_DIR, "gap_assessment.json")
EVIDENCES_DIR = os.path.join(os.path.dirname(__file__), "evidencias")
MASTER_DOCS_DIR = os.path.join(os.path.dirname(__file__), "repositorio_central")
META_FILE = os.path.join(DATA_DIR, ".github_sync_meta.json")

def ensure_dirs():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(EVIDENCES_DIR):
        os.makedirs(EVIDENCES_DIR, exist_ok=True)
    if not os.path.exists(MASTER_DOCS_DIR):
        os.makedirs(MASTER_DOCS_DIR, exist_ok=True)

ensure_data_dir = ensure_dirs

# ====================================================================
# GITHUB AUTO-SYNC CORE ENGINE
# ====================================================================

def get_github_config() -> Tuple[Optional[str], str, str]:
    """
    Obtiene las credenciales de GitHub desde st.secrets o variables de entorno.
    """
    token = None
    repo = "Inngeniar/optimus-newcare"
    branch = "main"
    
    try:
        import streamlit as st
        if hasattr(st, "secrets"):
            if "GITHUB_TOKEN" in st.secrets:
                token = st.secrets["GITHUB_TOKEN"]
            elif "github_token" in st.secrets:
                token = st.secrets["github_token"]
            
            if "GITHUB_REPO" in st.secrets:
                repo = st.secrets["GITHUB_REPO"]
            if "GITHUB_BRANCH" in st.secrets:
                branch = st.secrets["GITHUB_BRANCH"]
    except Exception:
        pass
        
    if not token:
        token = os.environ.get("GITHUB_TOKEN")
        if os.environ.get("GITHUB_REPO"):
            repo = os.environ.get("GITHUB_REPO")
        if os.environ.get("GITHUB_BRANCH"):
            branch = os.environ.get("GITHUB_BRANCH")
            
    return token, repo, branch

def get_sync_status() -> Dict[str, Any]:
    """
    Retorna el estado de la sincronización con la nube para mostrar en la interfaz.
    """
    token, repo, branch = get_github_config()
    is_active = bool(token and token.startswith("gh"))
    
    last_sync = "-"
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r", encoding="utf-8") as f:
                meta = json.load(f)
                last_sync = meta.get("last_sync", "-")
        except Exception:
            pass
            
    return {
        "active": is_active,
        "repo": repo,
        "branch": branch,
        "last_sync": last_sync
    }

def fetch_from_github() -> Tuple[Optional[List[Dict[str, Any]]], Optional[str]]:
    """
    Consulta la última versión de data/gap_assessment.json en el repositorio de GitHub.
    Retorna (items, sha) o (None, None) en caso de error.
    """
    token, repo, branch = get_github_config()
    if not token:
        return None, None
        
    url = f"https://api.github.com/repos/{repo}/contents/data/gap_assessment.json"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "OptimusHealth-NewCare-Streamlit"
    }
    params = {"ref": branch}
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            sha = data.get("sha")
            content_b64 = data.get("content", "")
            raw_bytes = base64.b64decode(content_b64)
            items = json.loads(raw_bytes.decode("utf-8"))
            
            # Guardar metadatos locales de sincronización
            try:
                import datetime
                with open(META_FILE, "w", encoding="utf-8") as f:
                    json.dump({"sha": sha, "last_sync": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, f)
            except Exception:
                pass
                
            return items, sha
        else:
            print(f"Aviso GitHub GET ({resp.status_code}): {resp.text[:150]}")
            return None, None
    except Exception as e:
        print(f"Excepción conectando a GitHub GET: {e}")
        return None, None

def push_to_github(items: List[Dict[str, Any]], commit_message: str = "Actualización evaluación GAP desde app") -> Tuple[bool, str]:
    """
    Envía y confirma (commit) los datos actualizados directamente a GitHub.
    Resuelve conflictos de concurrencia automáticamente.
    """
    token, repo, branch = get_github_config()
    if not token:
        return False, "Token de GitHub no configurado"
        
    url = f"https://api.github.com/repos/{repo}/contents/data/gap_assessment.json"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "OptimusHealth-NewCare-Streamlit"
    }
    
    # 1. Obtener el sha actual del archivo en GitHub
    sha = None
    try:
        check_resp = requests.get(url, headers=headers, params={"ref": branch}, timeout=8)
        if check_resp.status_code == 200:
            sha = check_resp.json().get("sha")
    except Exception as e:
        print(f"Error consultando sha de GitHub: {e}")

    # 2. Serializar y codificar contenido a base64
    json_str = json.dumps(items, ensure_ascii=False, indent=2)
    b64_content = base64.b64encode(json_str.encode("utf-8")).decode("utf-8")
    
    payload = {
        "message": commit_message,
        "content": b64_content,
        "branch": branch
    }
    if sha:
        payload["sha"] = sha
        
    try:
        put_resp = requests.put(url, headers=headers, json=payload, timeout=12)
        if put_resp.status_code in [200, 201]:
            new_sha = put_resp.json().get("content", {}).get("sha")
            try:
                import datetime
                with open(META_FILE, "w", encoding="utf-8") as f:
                    json.dump({"sha": new_sha, "last_sync": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, f)
            except Exception:
                pass
            return True, "Sincronizado exitosamente con GitHub"
        elif put_resp.status_code == 409:
            # Conflicto de versión (otro usuario guardó al mismo tiempo): reintentar con el nuevo sha
            try:
                check_resp2 = requests.get(url, headers=headers, params={"ref": branch}, timeout=8)
                if check_resp2.status_code == 200:
                    payload["sha"] = check_resp2.json().get("sha")
                    put_resp2 = requests.put(url, headers=headers, json=payload, timeout=12)
                    if put_resp2.status_code in [200, 201]:
                        return True, "Sincronizado tras resolver concurrencia"
            except Exception:
                pass
            return False, f"Conflicto de concurrencia en GitHub (409)"
        else:
            return False, f"Error GitHub PUT ({put_resp.status_code}): {put_resp.text[:120]}"
    except Exception as e:
        return False, f"Error de red enviando a GitHub: {e}"

# ====================================================================
# CARGA Y GUARDADO DE EVALUACIÓN
# ====================================================================

def initialize_default_items() -> List[Dict[str, Any]]:
    """
    Genera la lista inicial de ítems precargados con la línea base diagnóstica.
    """
    items = []
    for req in REQUIREMENTS_MASTER:
        item = copy.deepcopy(req)
        item["score"] = req.get("default_score", 0)
        item["evidence"] = req.get("default_evidence", "")
        item["findings"] = req.get("default_findings", "")
        item["action"] = req.get("default_action", "")
        item["responsible"] = req.get("default_responsible", "")
        item["priority"] = req.get("default_priority", "Media")
        item["status"] = req.get("default_status", "Pendiente")
        items.append(item)
    return items

def load_assessment_data(force_remote: bool = False) -> List[Dict[str, Any]]:
    """
    Carga los datos de evaluación:
    1. Si hay conexión a GitHub, consulta la última versión compartida en la nube.
    2. Si falla o no hay conexión, carga del almacenamiento local (data/gap_assessment.json).
    3. Si no existe localmente, inicializa con la línea base.
    """
    ensure_data_dir()
    
    # 1. Intentar cargar desde GitHub (colaborativo)
    remote_items, _ = fetch_from_github()
    if remote_items and len(remote_items) > 0:
        # Guardar copia local de respaldo
        try:
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump(remote_items, f, ensure_ascii=False, indent=2)
        except Exception:
            pass
        return _merge_with_master(remote_items)
        
    # 2. Cargar de archivo local
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                local_items = json.load(f)
            return _merge_with_master(local_items)
        except Exception as e:
            print(f"Error cargando localmente: {e}")
            
    # 3. Inicializar línea base
    items = initialize_default_items()
    save_assessment_data(items, sync_cloud=False)
    return items

def _merge_with_master(saved_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Combina datos guardados con la estructura maestra de REQUIREMENTS_MASTER.
    """
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

def save_assessment_data(items: List[Dict[str, Any]], sync_cloud: bool = True, commit_msg: str = "Actualización evaluación GAP") -> Tuple[bool, str]:
    """
    Guarda los datos de evaluación:
    1. En el archivo local JSON de la máquina/contenedor.
    2. En el repositorio de GitHub (si sync_cloud=True y las credenciales están configuradas).
    """
    ensure_data_dir()
    local_ok = False
    try:
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        local_ok = True
    except Exception as e:
        print(f"Error guardando datos locales: {e}")
        return False, f"Error local: {e}"
        
    if sync_cloud:
        cloud_ok, cloud_msg = push_to_github(items, commit_message=commit_msg)
        if cloud_ok:
            return True, "Guardado localmente y sincronizado en la nube (GitHub)."
        else:
            return True, f"Guardado localmente. Aviso Cloud: {cloud_msg}"
            
    return local_ok, "Guardado localmente."

def reset_to_baseline() -> List[Dict[str, Any]]:
    items = initialize_default_items()
    save_assessment_data(items, sync_cloud=True, commit_msg="Restablecer a línea base diagnóstica")
    return items

def reset_to_empty() -> List[Dict[str, Any]]:
    items = initialize_default_items()
    for it in items:
        it["score"] = 0
        it["evidence"] = ""
        it["findings"] = ""
        it["action"] = ""
        it["status"] = "Pendiente"
    save_assessment_data(items, sync_cloud=True, commit_msg="Restablecer evaluación a ceros")
    return items

def set_all_to_compliant() -> List[Dict[str, Any]]:
    items = load_assessment_data()
    for it in items:
        it["score"] = 2
        it["status"] = "Implementado"
    save_assessment_data(items, sync_cloud=True, commit_msg="Simulación de 100% cumplimiento")
    return items

# ====================================================================
# GESTIÓN DE ARCHIVOS DE EVIDENCIA Y DOCUMENTOS MAESTROS
# ====================================================================

def save_uploaded_evidence(req_id: str, uploaded_file) -> Dict[str, Any]:
    ensure_dirs()
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
    ensure_dirs()
    safe_name = uploaded_file.name.replace(" ", "_")
    filepath = os.path.join(MASTER_DOCS_DIR, safe_name)
    with open(filepath, "wb") as f:
        f.write(uploaded_file.getbuffer())
        
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
    docs.sort(key=lambda x: x["original_name"])
    return docs

def delete_central_document(filename: str) -> bool:
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
