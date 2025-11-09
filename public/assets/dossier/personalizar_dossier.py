import json
import os
import sys
import subprocess
from pathlib import Path
from typing import TYPE_CHECKING, Optional

# Type imports for static analysis (used for type checking tools)
if TYPE_CHECKING: # pragma: no cover
    import requests
    from pypdf import PdfReader, PdfWriter

# Install required dependencies (handles missing libraries)
def install_package(package_name):
    """Helper function to install packages"""
    try:
        # Use sys.executable to ensure the package is installed to the correct environment
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
    from pypdf import PdfReader, PdfWriter  # type: ignore
except ImportError:
    print("Installing pypdf library...")
    if install_package("pypdf"):
        from pypdf import PdfReader, PdfWriter  # type: ignore
    else:
        print("ERROR: Could not install pypdf library")
        sys.exit(1)

# --- CONFIGURACIÓN DE HUBSPOT (ACTUALIZADA Y VERIFICADA) ---
HUB_ID = "147219365"  # Confirmado
FORM_GUID = "34afefab-a031-4516-838e-f0edf0b98bc7"  # Confirmado
# Nota: La URL se construye con cadenas, es preferible aunque HUB_ID fuera un entero

HUB_API_URL = f"https://api.hsforms.com/submissions/v3/integration/submit/{HUB_ID}/{FORM_GUID}"

# --- CONFIGURACIÓN DEL PDF Y RUTAS LOCALES ---
# Se utiliza Pathlib para rutas seguras y absolutas
SCRIPT_DIR = Path(__file__).parent.absolute()
PDF_BASE_PATH = SCRIPT_DIR / "Dossier-Personalizado.pdf"
PDF_OUTPUT_DIR = SCRIPT_DIR / "dossiers_generados"  # Carpeta local para los resultados
CAMPO_PDF_A_RELLENAR = "nombre_personalizacion_lead"

def verificar_dependencias():
    """Verificar que todas las dependencias están disponibles"""
    # Esta función ahora solo comprueba que los módulos importados están cargados
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
    if not all([nombre_completo, email, hutk]):
        return {
            "success": False,
            "message": "Faltan campos esenciales (fullname, email, hutk) en el payload.",
            "hubspot_success": False,
            "pdf_success": False,
            "pdf_path": None,
            "pdf_delivery_url": None
        }

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
            # Intentar separar Nombre y Apellido para campos estándar de HubSpot
            {"name": "firstname", "value": nombre_completo.split()[0] if nombre_completo else ""},
            {"name": "lastname", "value": " ".join(nombre_completo.split()[1:]) if len(nombre_completo.split()) > 1 else ""},
            # Campos personalizados
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
    
    # Generar el nombre de archivo seguro (limpiando caracteres)
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
        
        # Copiar todas las páginas y rellenar el campo del formulario si existe
        for page in pdf_reader.pages:
            pdf_writer.add_page(page)

        # Rellenar el campo del formulario: nombre_personalizacion_lead
        # Se requiere que el PDF base tenga un campo de formulario con ese nombre.
        pdf_writer.update_page_form_field_values(
            pdf_writer.pages, 
            {CAMPO_PDF_A_RELLENAR: personalization_value}
        )
        
        # Escribir el nuevo PDF personalizado
        with open(output_path, "wb") as output_stream:
            pdf_writer.write(output_stream)
            
        pdf_delivery_url = f"/descargas/{output_filename}"
        pdf_success = True
        print(f"SUCCESS: Custom PDF saved locally: {output_path}")

    except Exception as e:
        print(f"ERROR customizing PDF: {e}. Check if '{CAMPO_PDF_A_RELLENAR}' is a valid fillable field in your PDF base.")
        pdf_success = False
        pdf_delivery_url = None

    # ----------------------------------------------------
    # ACCIÓN FINAL: RESUMEN Y ENTREGA (Envío de Email)
    # ----------------------------------------------------
    
    if pdf_success:
        # Aquí se debería integrar la lógica de envío de correo electrónico
        # usando un servicio SMTP/API (e.g., SendGrid, Mailgun) para enviar el enlace (pdf_delivery_url)
        print(f"Email delivery simulated for {email} with download link: {pdf_delivery_url}")
        
    return {
        "success": hubspot_success and pdf_success,
        "hubspot_success": hubspot_success,
        "pdf_success": pdf_success,
        "pdf_path": str(output_path) if pdf_success else None,
        "pdf_delivery_url": pdf_delivery_url,
        "message": "Operación de personalización y envío a HubSpot completada."
    }

# --- EJEMPLO DE USO (Esto simula la recepción de datos de la landing page) ---
if __name__ == "__main__":
    # Simulación de datos recibidos del front-end (Payload de la solicitud POST de tu landing page)
    # Asegúrate de que este 'hubspotutk' sea REAL para probar la atribución.
    datos_de_prueba = {
        "fullname": "Toni Ballesteros",
        "email": "toni.ballesteros.73@gmail.com",
        "hubspotutk": "1697224219759", # Reemplazar con una cookie real para pruebas
        "pageUri": "https://landing-page-playa-viva.vercel.app/?utm_source=test&utm_medium=cpc"
    }
    
    print("Starting dossier customization process...")
    resultado = personalizar_y_enviar(datos_de_prueba)
    print("\n--- EXECUTION RESULT ---")
    print(json.dumps(resultado, indent=4, ensure_ascii=False))