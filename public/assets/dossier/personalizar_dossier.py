import json
import os
import sys
import subprocess
from pathlib import Path

# Install required dependencies (handles missing libraries)
def install_package(package_name):
    """Helper function to install packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        return True
    except subprocess.CalledProcessError:
        print(f"Failed to install {package_name}")
        return False

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

# --- CONFIGURACIÓN DE HUBSPOT ---
# DEBES REEMPLAZAR ESTOS VALORES REALES (DEL PASO 4)
HUB_ID = 147219365  # Ejemplo: 12345678
FORM_GUID = "34afefab-a031-4516-838e-f0edfb98bc76"  # Ejemplo: 1234abcd-1234-abcd-1234-abcd1234abcd

HUB_API_URL = f"https://api.hsforms.com/submissions/v3/integration/submit/{HUB_ID}/{FORM_GUID}"

# --- CONFIGURACIÓN DEL PDF ---
# Usar paths relativos basados en la ubicación del script
SCRIPT_DIR = Path(__file__).parent.absolute()
PDF_BASE_PATH = SCRIPT_DIR / "Dossier-Personalizado.pdf"  # Fixed: removed duplicate extension
PDF_OUTPUT_DIR = SCRIPT_DIR / "dossiers_generados"  # Directorio relativo
CAMPO_PDF_A_RELLENAR = "nombre_personalizacion_lead"

def verificar_dependencias():
    """Verificar que todas las dependencias están disponibles"""
    dependencias_faltantes = []
    
    try:
        import requests
    except ImportError:
        dependencias_faltantes.append("requests")
    
    try:
        from pypdf import PdfReader, PdfWriter  # type: ignore
    except ImportError:
        dependencias_faltantes.append("pypdf")
    
    if dependencias_faltantes:
        print(f"Missing dependencies: {', '.join(dependencias_faltantes)}")
        print("Execute: pip install requests pypdf")
        return False
    
    return True

def personalizar_y_enviar(data_from_landing_page):
    """
    Función principal que ejecuta la lógica paralela.
    Recibe un diccionario con los datos del formulario (nombre, email, hutk, etc.).
    """
    
    # Verificar dependencias antes de proceder
    if not verificar_dependencias():
        return {"success": False, "message": "Faltan dependencias requeridas."}
    
    # 1. Extracción de datos clave para ambas operaciones
    nombre_completo = data_from_landing_page.get('fullname', '').strip()
    email = data_from_landing_page.get('email', '').strip()
    hutk = data_from_landing_page.get('hubspotutk', '').strip()
    
    if not all([nombre_completo, email, hutk]):
        return {"success": False, "message": "Faltan campos esenciales (fullname, email, hutk)."}

    # 2. Verificar que el archivo PDF base existe
    if not PDF_BASE_PATH.exists():
        return {"success": False, "message": f"Archivo PDF base no encontrado: {PDF_BASE_PATH}"}

    # ----------------------------------------------------
    # ACCIÓN PARALELA 1: SINCRONIZACIÓN DE LEADS CON HUBSPOT
    # ----------------------------------------------------
    
    # Mapeo de campos a la estructura de la API de HubSpot
    hubspot_payload = {
        "fields": [
            {"name": "email", "value": email},
            {"name": "firstname", "value": nombre_completo.split()[0] if nombre_completo else ""},
            {"name": "lastname", "value": nombre_completo.split()[-1] if len(nombre_completo.split()) > 1 else ""},
            # Campos personalizados del Paso 4 (Ocultos en el formulario)
            {"name": "mercado_de_origen", "value": "España"},
            {"name": "lead_partner_source", "value": "Partner_Landing_ES_Playa_Viva"},
        ],
        "context": {
            "hutk": hutk,  # CLAVE DE LA ATRIBUCIÓN (Original Source)
            "pageUri": data_from_landing_page.get('pageUri', 'http://localhost:3000'),  # Opcional: para mejor seguimiento
            "pageName": "Playa Viva Dossier Download"
        }
    }
    
    hubspot_success = False
    try:
        # Envío de la solicitud a HubSpot
        hubspot_response = requests.post(
            HUB_API_URL, 
            headers={'Content-Type': 'application/json'}, 
            data=json.dumps(hubspot_payload),
            timeout=10  # Añadir timeout para evitar bloqueos
        )
        hubspot_response.raise_for_status()  # Lanza excepción si la respuesta no es 2xx
        hubspot_success = True
        print("SUCCESS: Data sent to HubSpot")
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
        # Leer el PDF original
        pdf_reader = PdfReader(str(PDF_BASE_PATH))
        pdf_writer = PdfWriter()
        
        # Asignar el valor de personalización
        personalization_value = nombre_completo
        
        # Verificar si el PDF tiene campos de formulario
        if pdf_reader.get_form_text_fields():
            # Si el PDF tiene campos de formulario, rellenar el campo específico
            form_fields = pdf_reader.get_form_text_fields()
            if CAMPO_PDF_A_RELLENAR in form_fields:
                # Crear un nuevo PDF con el campo rellenado
                for page in pdf_reader.pages:
                    pdf_writer.add_page(page)
                
                # Rellenar el campo del formulario
                pdf_writer.update_page_form_field_values(
                    pdf_writer.pages, 
                    {CAMPO_PDF_A_RELLENAR: personalization_value}
                )
            else:
                # Si no existe el campo específico, copiar páginas sin modificar
                for page in pdf_reader.pages:
                    pdf_writer.add_page(page)
                print(f"Field '{CAMPO_PDF_A_RELLENAR}' not found in PDF. Available fields: {list(form_fields.keys())}")
        else:
            # Si el PDF no tiene campos de formulario, solo copiar las páginas
            for page in pdf_reader.pages:
                pdf_writer.add_page(page)
            print("PDF does not contain fillable form fields")

        # Escribir el nuevo PDF personalizado
        with open(output_path, "wb") as output_stream:
            pdf_writer.write(output_stream)
            
        pdf_delivery_url = f"/descargas/{output_filename}"  # URL que usarás para enviar por email
        pdf_success = True
        print(f"Custom PDF saved: {output_path}")

    except Exception as e:
        print(f"ERROR customizing PDF: {e}")
        pdf_success = False
        pdf_delivery_url = None

    # ----------------------------------------------------
    # ACCIÓN FINAL: RESUMEN Y ENTREGA (Envío de Email)
    # ----------------------------------------------------
    
    if pdf_success:
        # Aquí se debería integrar la lógica de envío de correo electrónico
        # usando un servicio como SendGrid, Mailgun o un servidor SMTP.
        # Por ahora, simulamos el éxito:
        print(f"Email processed for {email} with download link.")
        
    return {
        "success": True,
        "hubspot_success": hubspot_success,
        "pdf_success": pdf_success,
        "pdf_path": str(output_path) if pdf_success else None,
        "pdf_delivery_url": pdf_delivery_url,
        "message": "Operación de personalización y envío a HubSpot completada."
    }

# --- EJEMPLO DE USO (Esto simula la recepción de datos de la landing page) ---
if __name__ == "__main__":
    # Simulación de datos recibidos del front-end
    datos_de_prueba = {
        "fullname": "Antonio Ballesteros",
        "email": "toni.ballesteros.73@gmail.com",
        "hubspotutk": "simulador_hutk_123456",  # Esto DEBE ser el valor real de la cookie
        "pageUri": "http://localhost:3000"
    }
    
    # Si desea probar con un Hutk real, puede inspeccionar el navegador (F12) 
    # y pegar el valor de la cookie 'hubspotutk' aquí.
    
    print("Starting dossier customization process...")
    resultado = personalizar_y_enviar(datos_de_prueba)
    print("\n--- EXECUTION RESULT ---")
    print(json.dumps(resultado, indent=4, ensure_ascii=False))
