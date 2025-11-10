import json
import os
import sys
import subprocess
from pathlib import Path
from typing import TYPE_CHECKING, Optional

# Type imports for static analysis
if TYPE_CHECKING:
    import requests
    from pypdf import PdfReader, PdfWriter

# Install required dependencies
def install_package(package_name):
    """Helper function to install packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name], 
                              stdout=subprocess.DEVNULL, 
                              stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        print(f"Failed to install {package_name}")
        return False

# Import dependencies with automatic installation
try:
    import requests
except ImportError:
    print("Installing requests library...")
    if install_package("requests"):
        import requests
    else:
        print("ERROR: Could not install requests library")
        sys.exit(1)

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    print("Installing pypdf library...")
    if install_package("pypdf"):
        from pypdf import PdfReader, PdfWriter
    else:
        print("ERROR: Could not install pypdf library")
        sys.exit(1)

# --- CONFIGURACIÓN HUBSPOT (VERIFICADA) ---
HUB_ID = "147219365"
FORM_GUID = "34afefab-a031-4516-838e-f0edf0b98bc7"
HUB_API_URL = f"https://api.hsforms.com/submissions/v3/integration/submit/{HUB_ID}/{FORM_GUID}"

# --- CONFIGURACIÓN PDF Y RUTAS ---
SCRIPT_DIR = Path(__file__).parent.absolute()
PDF_BASE_PATH = SCRIPT_DIR / "Dossier-Personalizado.pdf"
PDF_OUTPUT_DIR = SCRIPT_DIR / "dossiers_generados"
CAMPO_PDF_A_RELLENAR = "nombre_personalizacion_lead"

def verificar_dependencias():
    """Verificar que todas las dependencias están disponibles"""
    try:
        requests
        PdfReader
        return True
    except NameError as e:
        print(f"Missing dependencies: {str(e)}")
        print("Execute: pip install requests pypdf")
        return False

def personalizar_y_enviar(data_from_landing_page: dict) -> dict:
    """
    Función principal que ejecuta la lógica paralela:
    1. Sincroniza el lead con HubSpot (Atribución).
    2. Personaliza y guarda el PDF (Entrega Premium).
    """
    
    # Verificar dependencias
    if not verificar_dependencias():
        return {"success": False, "message": "Faltan dependencias requeridas."}
    
    # 1. Extracción y saneamiento de datos clave
    nombre_completo = data_from_landing_page.get('fullname', '').strip()
    email = data_from_landing_page.get('email', '').strip()
    hutk = data_from_landing_page.get('hubspotutk', '').strip()
    
    # Validar campos esenciales
    if not all([nombre_completo, email]):
        return {
            "success": False,
            "message": "Faltan campos esenciales (fullname, email) en el payload.",
            "hubspot_success": False,
            "pdf_success": False,
            "pdf_path": None,
            "pdf_delivery_url": None
        }
    
    # Si no hay hutk, usar timestamp como fallback
    if not hutk:
        hutk = f"generated_{int(time.time() * 1000)}"
        print(f"WARNING: No hubspotutk provided. Using fallback: {hutk}")

    # 2. Verificar que el archivo PDF base existe
    if not PDF_BASE_PATH.exists():
        return {
            "success": False,
            "message": f"Archivo PDF base no encontrado: {PDF_BASE_PATH}",
            "hubspot_success": False,
            "pdf_success": False,
            "pdf_path": None,
            "pdf_delivery_url": None
        }

    # ----------------------------------------------------
    # ACCIÓN PARALELA 1: SINCRONIZACIÓN DE LEADS CON HUBSPOT
    # ----------------------------------------------------
    
    # Construcción del payload
    hubspot_payload = {
        "fields": [
            {"name": "email", "value": email},
            {"name": "firstname", "value": nombre_completo.split()[0] if nombre_completo else ""},
            {"name": "lastname", "value": " ".join(nombre_completo.split()[1:]) if len(nombre_completo.split()) > 1 else ""},
            {"name": "mercado_de_origen", "value": "España"},
            {"name": "lead_partner_source", "value": "Partner_Landing_ES_Playa_Viva"},
        ],
        "context": {
            "hutk": hutk,  # CLAVE DE LA ATRIBUCIÓN
            "pageUri": data_from_landing_page.get('pageUri', 'https://landing-page-playa-viva.vercel.app/'),
            "pageName": "Playa Viva Dossier Download"
        }
    }
    
    hubspot_success = False
    try:
        hubspot_response = requests.post(
            HUB_API_URL, 
            headers={'Content-Type': 'application/json'}, 
            data=json.dumps(hubspot_payload),
            timeout=10
        )
        hubspot_response.raise_for_status()
        hubspot_success = True
        print(f"SUCCESS: Data sent to HubSpot. Status: {hubspot_response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"ERROR sending data to HubSpot: {e}")
        hubspot_success = False

    # ----------------------------------------------------
    # ACCIÓN PARALELA 2: PERSONALIZACIÓN DEL PDF
    # ----------------------------------------------------
    
    # Crear el directorio de salida si no existe
    PDF_OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Generar el nombre de archivo seguro
    nombre_seguro = "".join(c if c.isalnum() or c in " -_" else "_" for c in nombre_completo)
    nombre_seguro = nombre_seguro.replace(" ", "_")
    output_filename = f"Dossier_Playa_Viva_{nombre_seguro}.pdf"
    output_path = PDF_OUTPUT_DIR / output_filename
    
    pdf_success = False
    pdf_delivery_url = None
    
    try:
        pdf_reader = PdfReader(str(PDF_BASE_PATH))
        pdf_writer = PdfWriter()
        
        personalization_value = nombre_completo
        
        # Copiar todas las páginas
        for page in pdf_reader.pages:
            pdf_writer.add_page(page)

        # Rellenar el campo del formulario
        pdf_writer.update_page_form_field_values(
            pdf_writer.pages, 
            {CAMPO_PDF_A_RELLENAR: personalization_value}
        )
        
        # Escribir el nuevo PDF personalizado
        with open(output_path, "wb") as output_stream:
            pdf_writer.write(output_stream)
            
        pdf_delivery_url = f"/dossiers/{output_filename}"
        pdf_success = True
        print(f"SUCCESS: Custom PDF saved locally: {output_path}")

    except Exception as e:
        print(f"ERROR customizing PDF: {e}")
        pdf_success = False
        pdf_delivery_url = None

    # ----------------------------------------------------
    # RETORNO DE RESULTADOS
    # ----------------------------------------------------
    
    return {
        "success": hubspot_success and pdf_success,
        "hubspot_success": hubspot_success,
        "pdf_success": pdf_success,
        "pdf_path": str(output_path) if pdf_success else None,
        "pdf_delivery_url": pdf_delivery_url,
        "message": "Operación de personalización y envío a HubSpot completada."
    }

# --- USO COMO CLI ---
if __name__ == "__main__":
    import time
    
    # Simulación de datos recibidos del front-end
    datos_de_prueba = {
        "fullname": "Toni Ballesteros",
        "email": "toni.ballesteros.73@gmail.com",
        "hubspotutk": "1697224219759",  # Cookie real para pruebas
        "pageUri": "https://landing-page-playa-viva.vercel.app/?utm_source=test&utm_medium=cpc"
    }
    
    print("Starting dossier customization process...")
    resultado = personalizar_y_enviar(datos_de_prueba)
    print("\n--- EXECUTION RESULT ---")
    print(json.dumps(resultado, indent=4, ensure_ascii=False))
