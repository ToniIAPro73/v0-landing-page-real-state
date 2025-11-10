# Integración Completa: Landing Playa Viva + HubSpot Forms API + PDF Personalizado

## 📋 Archivos Actualizados

1. **page.tsx** - Página principal con formulario actualizado
2. **route.ts** - API route para procesar leads
3. **personalizar_dossier.py** - Script Python para HubSpot + PDF
4. **layout.tsx** - Ya configurado correctamente ✅
5. **HubSpotScript.tsx** - Ya configurado correctamente ✅

---

## 🎯 Arquitectura del Sistema

\`\`\`text
┌─────────────────┐
│   Formulario    │
│   (page.tsx)    │
└────────┬────────┘
         │
         │ 1. Captura hubspotutk (cookie)
         │ 2. Envía a API route
         ▼
┌─────────────────┐
│   API Route     │
│   (route.ts)    │
└────────┬────────┘
         │
         ├─── 3a. HubSpot Forms API (atribución)
         │
         └─── 3b. Personalización PDF (Python o TypeScript)
\`\`\`

---

## 🔧 PASO 1: Ubicación de Archivos

### 1.1 Estructura del proyecto Next.js

\`\`\`tree
tu-proyecto/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Reemplazar con el actualizado
│   │   ├── layout.tsx                  ← Ya está bien ✅
│   │   ├── HubSpotScript.tsx           ← Ya está bien ✅
│   │   └── api/
│   │       └── submit-lead/
│   │           └── route.ts            ← NUEVO: Copiar aquí
│   └── ...
├── public/
│   └── dossiers/                       ← Crear carpeta para PDFs generados
├── scripts/
│   └── personalizar_dossier.py         ← NUEVO: Script Python
└── .env.local                          ← Variables de entorno
\`\`\`

### 1.2 Crear directorios necesarios

\`\`\`bash
# Desde la raíz del proyecto
mkdir -p src/app/api/submit-lead
mkdir -p public/dossiers
mkdir -p scripts
\`\`\`

### 1.3 Copiar archivos

\`\`\`bash
# Copiar API route
cp route.ts src/app/api/submit-lead/route.ts

# Copiar página actualizada
cp page.tsx src/app/page.tsx

# Copiar script Python
cp personalizar_dossier.py scripts/personalizar_dossier.py
\`\`\`

---

## 🔑 PASO 2: Variables de Entorno

Crea o actualiza `.env.local`:

\`\`\`bash
# HubSpot
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7

# Site URL
NEXT_PUBLIC_SITE_URL=https://landing-page-playa-viva.vercel.app

# Email Service (opcional - para notificaciones)
RESEND_API_KEY=re_xxxxx
# O SendGrid:
# SENDGRID_API_KEY=SG.xxxxx
\`\`\`

**Nota:** El `HUBSPOT_FORM_GUID` ya está configurado en el código Python y en route.ts.

---

## 📝 PASO 3: Configurar PDF Base

### 3.1 Crear PDF con campo rellenable

El script Python busca un campo llamado `nombre_personalizacion_lead` en el PDF.

**Opciones:**

**A. Usar Adobe Acrobat Pro:**

1. Abre tu dossier en Acrobat Pro
2. Herramientas > Preparar formulario
3. Añade un campo de texto llamado exactamente: `nombre_personalizacion_lead`
4. Guarda como `Dossier-Personalizado.pdf`
5. Coloca en `scripts/Dossier-Personalizado.pdf`

**B. Usar LibreOffice (gratis):**

1. Abre PDF en LibreOffice Draw
2. Insertar > Campo de formulario > Cuadro de texto
3. Propiedades > Nombre: `nombre_personalizacion_lead`
4. Exportar como PDF
5. Guardar en `scripts/Dossier-Personalizado.pdf`

**C. Sin personalización (temporal):**
Si no quieres personalizar aún, comenta las líneas 142-146 en `personalizar_dossier.py`:

\`\`\`python
# Comentar estas líneas temporalmente:
# pdf_writer.update_page_form_field_values(
#     pdf_writer.pages,
#     {CAMPO_PDF_A_RELLENAR: personalization_value}
# )
\`\`\`

---

## 🐍 PASO 4: Configurar Python (Opcional)

### 4.1 Si quieres usar el script Python para personalización

\`\`\`bash
# Instalar Python 3.8+
python3 --version

# Instalar dependencias
cd scripts
pip install requests pypdf

# Probar script
python3 personalizar_dossier.py
\`\`\`

### 4.2 Integrar Python con Next.js

Actualiza `route.ts` línea 58:

\`\`\`typescript
async function personalizePDF(payload: LeadSubmitPayload): Promise<any> {
  const { spawn } = require("child_process");

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "personalizar_dossier.py"
    );
    const python = spawn("python3", [scriptPath], {
      env: { ...process.env },
    });

    let output = "";
    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    python.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          reject(new Error("Error parsing Python output"));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}`));
      }
    });

    // Enviar datos al script Python via stdin
    python.stdin.write(
      JSON.stringify({
        fullname: payload.fullName,
        email: payload.email,
        hubspotutk: payload.hubspotutk,
        pageUri: payload.pageUri,
      })
    );
    python.stdin.end();
  });
}
\`\`\`

---

## 🧪 PASO 5: Testing Local

### 5.1 Iniciar servidor desarrollo

\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

### 5.2 Abrir navegador

\`\`\`url
http://localhost:3000
\`\`\`

### 5.3 Verificar HubSpot tracking

**Consola del navegador:**

\`\`\`javascript
// Ver si la cookie existe
document.cookie.split(";").find((c) => c.includes("hubspotutk"));

// Debería mostrar algo como:
// " hubspotutk=1697224219759"
\`\`\`

### 5.4 Probar formulario

1. Scroll hasta sección "Descargar Dossier"
2. Completa:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: <tu@email.com>
3. Acepta checkbox de privacidad
4. Marca checkbox "No soy un robot"
5. Click "Descargar Dossier"

### 5.5 Verificar en HubSpot

1. Ve a HubSpot > Contacts
2. Busca el email que usaste
3. Verifica:
   - ✅ Contact creado
   - ✅ `Original Source` debe mostrar la fuente correcta
   - ✅ `Latest Source` actualizado
   - ✅ Campos personalizados: `mercado_de_origen`, `lead_partner_source`

---

## 🚀 PASO 6: Deploy a Vercel

### 6.1 Configurar variables de entorno en Vercel

\`\`\`bash
# Via CLI
vercel env add NEXT_PUBLIC_HUBSPOT_PORTAL_ID
vercel env add HUBSPOT_FORM_GUID
vercel env add NEXT_PUBLIC_SITE_URL

# O via Dashboard:
# Vercel Project > Settings > Environment Variables
\`\`\`

### 6.2 Deploy

\`\`\`bash
# Deploy a producción
vercel --prod

# O via Git push (si conectado a GitHub)
git add .
git commit -m "Integración HubSpot Forms API + PDF personalizado"
git push origin main
\`\`\`

### 6.3 Verificar en producción

1. Abre tu landing: `https://landing-page-playa-viva.vercel.app`
2. Prueba el formulario
3. Verifica en HubSpot que el lead se creó correctamente

---

## 🔍 PASO 7: Troubleshooting

### Error: "hubspotutk not found"

**Causa:** La cookie de HubSpot no se está generando.

**Solución:**

1. Verifica que `HubSpotScript.tsx` está en el layout
2. Espera 10-15 segundos después de cargar la página
3. Verifica en DevTools > Application > Cookies que existe `hubspotutk`

### Error: "HubSpot API error 400"

**Causa:** Datos inválidos o FORM_GUID incorrecto.

**Solución:**

1. Verifica que `FORM_GUID` es correcto: `34afefab-a031-4516-838e-f0edf0b98bc7`
2. Verifica que el email es válido
3. Revisa logs en la API route

### Error: "PDF customization failed"

**Causa:** Campo `nombre_personalizacion_lead` no existe en PDF.

**Solución:**

1. Verifica que el PDF tiene el campo correcto
2. O comenta la personalización temporalmente (ver Paso 3.C)

### Lead no aparece en HubSpot

**Causa:** Puede ser filtro de spam o datos duplicados.

**Solución:**

1. Ve a HubSpot > Contacts > All contacts
2. Busca por email específico
3. Si existe, verifica si está en spam
4. Revisa Activity log del contacto

---

## 📊 PASO 8: Verificación de Atribución

### 8.1 Crear UTM tags de prueba

\`\`\`url
https://landing-page-playa-viva.vercel.app/?utm_source=google&utm_medium=cpc&utm_campaign=playa_viva_spain&utm_content=test
\`\`\`

### 8.2 Verificar en HubSpot

Después de enviar el formulario con UTMs:

1. HubSpot > Contacts > [Tu contacto]
2. Ve a la pestaña "Activity"
3. Busca "Original Source Data"
4. Debería mostrar:
   - Original Source: `Organic Search` o `Paid Search` (según UTM)
   - Original Source Drill-Down 1: `google`
   - Original Source Drill-Down 2: `cpc`

---

## 🎨 Personalización del Formulario

El formulario mantiene el estilo visual de Playa Viva:

**Colores:**

- Marrones: `#837960`, `#5a4f3d`, `#6E5F46`
- Dorados: `#A29060`, `#d4af37`, `#c4a037`
- Crema: `#f5f0e8`, `#f8f5f0`

**Tipografía:**

- Headings: Playfair Display
- Body: Lato

**Si quieres cambiar:**

- Busca en `page.tsx` línea 2675-2925 (sección de formulario)
- Modifica clases Tailwind CSS según necesites

---

## 📧 PASO 9: Configurar Email Service (Opcional)

### Opción A: Resend (Recomendado)

\`\`\`bash
npm install resend
\`\`\`

Actualiza `route.ts`:

\`\`\`typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendDossierEmail(payload: LeadSubmitPayload, pdfUrl: string) {
  await resend.emails.send({
    from: "inversiones@uniestate.co.uk",
    to: payload.email,
    subject: `📊 Tu Dossier Exclusivo de Playa Viva, ${payload.firstName}`,
    html: `<!-- tu HTML aquí -->`,
  });
}
\`\`\`

### Opción B: SendGrid

\`\`\`bash
npm install @sendgrid/mail
\`\`\`

---

## ✅ Checklist Final

- [ ] Archivos copiados a ubicaciones correctas
- [ ] Variables de entorno configuradas
- [ ] PDF base con campo rellenable (o personalización deshabilitada)
- [ ] HubSpot script cargando correctamente
- [ ] Cookie `hubspotutk` se genera
- [ ] Formulario envía datos a API route
- [ ] Lead aparece en HubSpot con atribución correcta
- [ ] PDF se personaliza (si habilitado)
- [ ] Email se envía (si configurado)
- [ ] Deploy a Vercel exitoso

---

## 📞 Soporte

Para problemas o preguntas:

- Email: <tony@uniestate.co.uk>
- HubSpot Account: Anclora (ID: 147219365)

---

## 🔄 Próximos Pasos Sugeridos

1. **A/B Testing:** Probar diferentes copys del formulario
2. **Automatizaciones HubSpot:** Crear workflows automáticos
3. **Analytics:** Integrar Google Analytics 4
4. **Optimización:** Implementar Lazy Loading de imágenes
5. **SEO:** Añadir más contenido textual
