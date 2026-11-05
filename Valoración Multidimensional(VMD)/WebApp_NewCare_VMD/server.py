"""
Servidor Central y API REST para WebApp New Care VMD
Optimus Health IPS & Fundación NewHealth
Permite:
1. Conexión simultánea de múltiples profesionales en red local (LAN / Wi-Fi).
2. Persistencia automática en disco (JSON / SQLite).
3. Backups automáticos versionados con fecha y hora.
4. Gestión centralizada de profesionales y pacientes.
"""
import http.server
import socketserver
import json
import os
import sys
import shutil
import datetime
import urllib.parse

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
BACKUP_DIR = os.path.join(DATA_DIR, "backups")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

PACIENTES_FILE = os.path.join(DATA_DIR, "pacientes.json")
PROFESIONALES_FILE = os.path.join(DATA_DIR, "profesionales.json")

# Default team members
DEFAULT_PROFESIONALES = [
    {
        "id": "1",
        "name": "Dr. Carlos Restrepo",
        "document": "71234567",
        "reg": "RM-12345",
        "role": "MED",
        "roleName": "Médico Internista / Geriatra",
        "specialty": "Medicina Interna y Cronicidad Compleja",
        "email": "carlos.restrepo@optimushealth.com",
        "phone": "3101234567",
        "status": "Activo"
    },
    {
        "id": "2",
        "name": "Enf. Sandra Patricia Mejía",
        "document": "52345678",
        "reg": "RE-67890",
        "role": "ENF",
        "roleName": "Enfermera(o) Jefe",
        "specialty": "Cuidado Crónico y Funcionalidad",
        "email": "sandra.mejia@optimushealth.com",
        "phone": "3119876543",
        "status": "Activo"
    },
    {
        "id": "3",
        "name": "Lic. Marcela Gómez",
        "document": "43567890",
        "reg": "RTS-54321",
        "role": "TS",
        "roleName": "Trabajador(a) Social",
        "specialty": "Redes de Apoyo y Evaluación Familiar",
        "email": "marcela.gomez@optimushealth.com",
        "phone": "3154567890",
        "status": "Activo"
    },
    {
        "id": "4",
        "name": "Dra. Elena Torres",
        "document": "32456789",
        "reg": "RM-99887",
        "role": "COORD",
        "roleName": "Coordinador(a) / Junta de Cronicidad",
        "specialty": "Gerencia Clínica y Auditoría NewCare",
        "email": "elena.torres@optimushealth.com",
        "phone": "3001122334",
        "status": "Activo"
    }
]

def ensure_initial_data():
    if not os.path.exists(PROFESIONALES_FILE):
        with open(PROFESIONALES_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_PROFESIONALES, f, indent=2, ensure_ascii=False)
            
    if not os.path.exists(PACIENTES_FILE):
        # Initial empty or seeded from default
        with open(PACIENTES_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2, ensure_ascii=False)

def create_auto_backup():
    if not os.path.exists(PACIENTES_FILE):
        return
    now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    b_file = os.path.join(BACKUP_DIR, f"backup_pacientes_{now_str}.json")
    try:
        shutil.copy2(PACIENTES_FILE, b_file)
        # Keep maximum 50 backups
        backups = sorted([os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.startswith("backup_")])
        if len(backups) > 50:
            for old_b in backups[:-50]:
                os.remove(old_b)
    except Exception as e:
        print(f"Error creating backup: {e}")

class NewCareAPIHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/status":
            self.send_json_response({
                "status": "ONLINE",
                "server": "New Care VMD Hub",
                "timestamp": datetime.datetime.now().isoformat(),
                "dataDir": DATA_DIR
            })
            return

        elif path == "/api/profesionales":
            ensure_initial_data()
            try:
                with open(PROFESIONALES_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.send_json_response(data)
            except Exception as e:
                self.send_json_response({"error": str(e)}, 500)
            return

        elif path == "/api/pacientes":
            ensure_initial_data()
            try:
                with open(PACIENTES_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.send_json_response(data)
            except Exception as e:
                self.send_json_response({"error": str(e)}, 500)
            return

        elif path == "/api/backups":
            try:
                b_list = sorted([f for f in os.listdir(BACKUP_DIR) if f.startswith("backup_")], reverse=True)
                self.send_json_response({"backups": b_list})
            except Exception as e:
                self.send_json_response({"error": str(e)}, 500)
            return

        # Fallback to standard static file server
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            payload = {}

        if path == "/api/profesionales":
            # Save or update professional
            ensure_initial_data()
            try:
                with open(PROFESIONALES_FILE, "r", encoding="utf-8") as f:
                    profs = json.load(f)
                
                # If payload has an id, update or append
                pid = str(payload.get("id") or (len(profs) + 1))
                payload["id"] = pid
                
                # Check if exists
                idx = next((i for i, item in enumerate(profs) if item.get("id") == pid), None)
                if idx is not None:
                    profs[idx] = payload
                else:
                    profs.append(payload)

                with open(PROFESIONALES_FILE, "w", encoding="utf-8") as f:
                    json.dump(profs, f, indent=2, ensure_ascii=False)
                
                self.send_json_response({"success": True, "professional": payload})
            except Exception as e:
                self.send_json_response({"error": str(e)}, 500)
            return

        elif path == "/api/pacientes":
            # Save or update single or full patient list
            ensure_initial_data()
            try:
                if isinstance(payload, list):
                    # Full list sync
                    with open(PACIENTES_FILE, "w", encoding="utf-8") as f:
                        json.dump(payload, f, indent=2, ensure_ascii=False)
                    create_auto_backup()
                    self.send_json_response({"success": True, "count": len(payload)})
                else:
                    # Single patient update
                    with open(PACIENTES_FILE, "r", encoding="utf-8") as f:
                        patients = json.load(f)
                    
                    pid = str(payload.get("id"))
                    idx = next((i for i, item in enumerate(patients) if str(item.get("id")) == pid), None)
                    if idx is not None:
                        patients[idx] = payload
                    else:
                        patients.insert(0, payload)

                    with open(PACIENTES_FILE, "w", encoding="utf-8") as f:
                        json.dump(patients, f, indent=2, ensure_ascii=False)
                    
                    create_auto_backup()
                    self.send_json_response({"success": True, "patient": payload})
            except Exception as e:
                self.send_json_response({"error": str(e)}, 500)
            return

        elif path == "/api/backup":
            create_auto_backup()
            self.send_json_response({"success": True, "message": "Copia de seguridad creada en el servidor."})
            return

        self.send_json_response({"error": "Ruta no encontrada"}, 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/api/pacientes":
            pid = query.get("id", [None])[0]
            if not pid:
                self.send_json_response({"error": "ID requerido"}, 400)
                return

            try:
                with open(PACIENTES_FILE, "r", encoding="utf-8") as f:
                    patients = json.load(f)
                
                patients = [p for p in patients if str(p.get("id")) != str(pid)]

                with open(PACIENTES_FILE, "w", encoding="utf-8") as f:
                    json.dump(patients, f, indent=2, ensure_ascii=False)
                
                create_auto_backup()
                self.send_json_response({"success": True, "deletedId": pid})
            except Exception as e:
                self.send_json_response({"error": str(e)}, 500)
            return

        self.send_json_response({"error": "Ruta no encontrada"}, 404)

    def send_json_response(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def run_server():
    ensure_initial_data()
    os.chdir(BASE_DIR)
    
    port = PORT
    for attempt in range(5):
        try:
            httpd = ThreadingHTTPServer(("", port), NewCareAPIHandler)
            print("==================================================================")
            print(" SERVIDOR CENTRAL NEW CARE VMD ACTIVO (MODO MULTI-PROFESIONAL)")
            print("==================================================================")
            print(f" Acceso Local (esta máquina):   http://localhost:{port}/index.html")
            
            # Get local LAN IP
            try:
                import socket
                hostname = socket.gethostname()
                lan_ip = socket.gethostbyname(hostname)
                print(f" Acceso Red Local (LAN/Wi-Fi):  http://{lan_ip}:{port}/index.html")
            except Exception:
                pass
                
            print(f" Datos Centrales:               {PACIENTES_FILE}")
            print(f" Directorio de Backups:         {BACKUP_DIR}")
            print("==================================================================")
            print(" Presione Ctrl+C para detener el servidor central.")
            httpd.serve_forever()
            break
        except OSError as e:
            if "Address already in use" in str(e) or "WinError 10048" in str(e):
                port += 1
            else:
                raise e

if __name__ == '__main__':
    run_server()
