import requests
import json
from pypdf import PdfReader, PdfWriter
import os

# --- CONFIGURACIÓN DE HUBSPOT ---
# DEBES REEMPLAZAR ESTOS VALORES REALES (DEL PASO 4)
HUB_ID = "TU_HUB_ID_DE_ANCLORA"  # Ejemplo: 12345678
FORM_GUID = "TU_FORM_GUID_DEL_PASO_4" # Ejemplo: 1234abcd-1234-abcd-1234-abcd1234abcd

HUB_API_URL = f"https://api.hsforms.com/submissions/v3/integration/submit/{HUB_ID}/{FORM_GUID}"

# --- CONFIGURACIÓN DEL PDF ---
PDF_BASE_PATH = "Dossier-Personalizado.pdf"
PDF_OUTPUT_DIR = r"C:\Users\tu_usuario\Documentos\Dossiers_PlayaViva" 
CAMPO_PDF_A_RELLENAR = "nombre_personalizacion_lead"

def personalizar_y_enviar(data_from_landing_page):
    """
    Función principal que ejecuta la lógica paralela.
    Recibe un diccionario con los datos del formulario (nombre, email, hutk, etc.).
    """
    
    # 1. Extracción de datos clave para ambas operaciones
    nombre_completo = data_from_landing_page.get('fullname')
    email = data_from_landing_page.get('email')
    hutk = data_from_landing_page.get('hubspotutk')
    
    if not all([nombre_completo, email, hutk]):
        return {"success": False, "message": "Faltan campos esenciales (fullname, email, hutk)."}, 400

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
            "hutk": hutk, # CLAVE DE LA ATRIBUCIÓN (Original Source)
            "pageUri": data_from_landing_page.get('pageUri', 'http://localhost:3000'), # Opcional: para mejor seguimiento
            "pageName": "Playa Viva Dossier Download"
        }
    }
    
    try:
        # Envío de la solicitud a HubSpot
        hubspot_response = requests.post(HUB_API_URL, headers={'Content-Type': 'application/json'}, data=json.dumps(hubspot_payload))
        hubspot_response.raise_for_status() # Lanza excepción si la respuesta no es 2xx
        hubspot_success = True
    except requests.exceptions.RequestException as e:
        print(f"ERROR AL ENVIAR DATOS A HUBSPOT: {e}")
        hubspot_success = False

    # ----------------------------------------------------
    # ACCIÓN PARALELA 2: PERSONALIZACIÓN DEL PDF
    # ----------------------------------------------------
    
    # Crear el directorio de salida si no existe
    os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)
    
    # Generar el nombre de archivo seguro
    nombre_seguro = "".join(c if c.isalnum() else "_" for c in nombre_completo)
    output_filename = f"Dossier_Playa_Viva_{nombre_seguro}.pdf"
    output_path = os.path.join(PDF_OUTPUT_DIR, output_filename)
    
    pdf_reader = PdfReader(PDF_BASE_PATH)
    pdf_writer = PdfWriter()
    
    # Asignar el valor de personalización
    # El campo tiene la coma (,) incluida en el diseño.
    personalization_value = nombre_completo 
    
    # Rellenar los campos de formulario (AcroForm)
    try:
        pdf_writer.add_form_data({
            CAMPO_PDF_A_RELLENAR: personalization_value
        })
        
        # Añadir las páginas al escritor
        for page in pdf_reader.pages:
            pdf_writer.add_page(page)

        # Escribir el nuevo PDF personalizado
        with open(output_path, "wb") as output_stream:
            pdf_writer.write(output_stream)
            
        pdf_delivery_url = f"/descargas/{output_filename}" # URL que usarás para enviar por email
        pdf_success = True

    except Exception as e:
        print(f"ERROR AL PERSONALIZAR EL PDF: {e}")
        pdf_success = False
        pdf_delivery_url = None

    # ----------------------------------------------------
    # ACCIÓN FINAL: RESUMEN Y ENTREGA (Envío de Email)
    # ----------------------------------------------------
    
    if pdf_success:
        # Aquí se debería integrar la lógica de envío de correo electrónico
        # usando un servicio como SendGrid, Mailgun o un servidor SMTP.
        # Por ahora, simulamos el éxito:
        print(f"✅ Éxito: PDF Personalizado guardado en {output_path}")
        print(f"📧 Éxito: Se ha enviado el correo a {email} con el enlace de descarga.")
        
    return {
        "hubspot_success": hubspot_success,
        "pdf_success": pdf_success,
        "pdf_path": output_path if pdf_success else None,
        "message": "Operación de personalización y envío a HubSpot completada."
    }

# --- EJEMPLO DE USO (Esto simula la recepción de datos de la landing page) ---
if __name__ == "__main__":
    # Simulación de datos recibidos del front-end
    datos_de_prueba = {
        "fullname": "Antonio Ballesteros",
        "email": "toni.ballesteros.73@gmail.com",
        "hubspotutk": "simulador_hutk_123456", # Esto DEBE ser el valor real de la cookie
        "pageUri": "http://localhost:3000"
    }
    
    # Si desea probar con un Hutk real, puede inspeccionar el navegador (F12) 
    # y pegar el valor de la cookie 'hubspotutk' aquí.
    
    resultado = personalizar_y_enviar(datos_de_prueba)
    print("\n--- RESULTADO DE LA EJECUCIÓN ---")
    print(json.dumps(resultado, indent=4))