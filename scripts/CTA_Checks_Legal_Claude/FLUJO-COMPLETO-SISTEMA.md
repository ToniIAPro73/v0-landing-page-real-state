# 🔄 Flujo Completo del Sistema: Landing → HubSpot → PDF → Email

## 📊 Diagrama de Arquitectura

\`\`\`text
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DEL USUARIO                         │
│                                                                  │
│  [Landing Page: landing-page-playa-viva.vercel.app]            │
│                                                                  │
│  1. Usuario carga página                                         │
│     ↓                                                            │
│  2. HubSpot Script se ejecuta (HubSpotScript.tsx)               │
│     ↓                                                            │
│  3. Cookie 'hubspotutk' se crea automáticamente                 │
│     (Valor: timestamp único, ej: 1697224219759)                 │
│                                                                  │
│  4. Usuario llena formulario (page.tsx):                        │
│     • Nombre: Juan                                              │
│     • Apellido: Pérez                                           │
│     • Email: juan@email.com                                     │
│     • ✓ Acepta privacidad                                       │
│     • ✓ No soy un robot                                         │
│                                                                  │
│  5. Click "Descargar Dossier"                                   │
│     ↓                                                            │
│  6. orchestrateLeadAutomation() se ejecuta:                     │
│     • Captura hubspotutk de cookies                             │
│     • Captura URL actual (con UTMs si existen)                  │
│     • Prepara payload completo                                  │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ POST /api/submit-lead
                         │ {
                         │   firstName: "Juan",
                         │   lastName: "Pérez",
                         │   email: "juan@email.com",
                         │   hubspotutk: "1697224219759",
                         │   pageUri: "https://...",
                         │   utm: {...}
                         │ }
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              API ROUTE: /api/submit-lead (route.ts)             │
│                                                                  │
│  7. Recibe payload y valida:                                    │
│     ✓ firstName, lastName, email presentes                      │
│     ✓ email formato válido                                      │
│     ✓ hubspotutk presente                                       │
│                                                                  │
│  8. Procesos PARALELOS (Promise.allSettled):                    │
│                                                                  │
│     ┌──────────────────────┐    ┌─────────────────────────┐    │
│     │  submitToHubSpot()   │    │  personalizePDF()       │    │
│     └──────────┬───────────┘    └───────────┬─────────────┘    │
│                │                             │                   │
└────────────────┼─────────────────────────────┼──────────────────┘
                 │                             │
                 ↓                             ↓
┌────────────────────────────────┐  ┌─────────────────────────────┐
│      HUBSPOT FORMS API         │  │   PERSONALIZACIÓN PDF       │
│                                │  │                             │
│  9. Envío a HubSpot:           │  │  11. Ejecuta Python script: │
│     POST https://api.hsforms   │  │      personalizar_dossier.  │
│     .com/submissions/v3/       │  │      py                     │
│     integration/submit/        │  │                             │
│     147219365/                 │  │  12. Lee PDF base:          │
│     34afefab-...               │  │      Dossier-Personalizado  │
│                                │  │      .pdf                   │
│  Payload:                      │  │                             │
│  {                             │  │  13. Rellena campo:         │
│    fields: [                   │  │      'nombre_personalizacion│
│      {name: "email",           │  │      _lead' = "Juan Pérez"  │
│       value: "juan@email.com"} │  │                             │
│      {name: "firstname",       │  │  14. Guarda PDF:            │
│       value: "Juan"}           │  │      /dossiers/Dossier_     │
│      {name: "lastname",        │  │      Playa_Viva_Juan_       │
│       value: "Pérez"}          │  │      Perez.pdf              │
│      {name: "mercado_de_       │  │                             │
│       origen",                 │  │  15. Retorna:               │
│       value: "España"}         │  │      {                      │
│      {name: "lead_partner_     │  │        success: true,       │
│       source",                 │  │        pdf_url: "/dossiers  │
│       value: "Partner_Landing  │  │        /..."                │
│       _ES_Playa_Viva"}         │  │      }                      │
│    ],                          │  │                             │
│    context: {                  │  └─────────────────────────────┘
│      hutk: "1697224219759", ◄──┼──── CLAVE PARA ATRIBUCIÓN
│      pageUri: "https://...",   │
│      pageName: "Playa Viva     │
│       Dossier Download"        │
│    }                           │
│  }                             │
│                                │
│  10. HubSpot procesa:          │
│      • Crea o actualiza        │
│        contacto                │
│      • Asigna Original Source  │
│        basado en hutk          │
│      • Registra actividad      │
│      • Guarda campos           │
│        personalizados          │
│                                │
│  Respuesta:                    │
│  {                             │
│    inlineMessage: "...",       │
│    redirectUrl: null           │
│  }                             │
│                                │
└────────────────────────────────┘
                 │
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│           API ROUTE: Continuación (route.ts)                    │
│                                                                  │
│  16. Ambos procesos completados:                                │
│      ✓ HubSpot: success                                         │
│      ✓ PDF: success + pdf_url                                   │
│                                                                  │
│  17. Ejecuta sendDossierEmail():                                │
│      • Servicio: Resend / SendGrid / etc.                       │
│      • To: juan@email.com                                       │
│      • Subject: "Tu Dossier Exclusivo de Playa Viva, Juan"     │
│      • Body: HTML con link a PDF:                               │
│        <a href="https://landing-page-playa-viva.vercel.app/    │
│        dossiers/Dossier_Playa_Viva_Juan_Perez.pdf">            │
│        Descargar Dossier</a>                                    │
│                                                                  │
│  18. Retorna a navegador:                                       │
│      {                                                           │
│        success: true,                                            │
│        hubspot_success: true,                                   │
│        pdf_success: true,                                       │
│        pdf_url: "/dossiers/...",                                │
│        message: "Lead procesado correctamente.                  │
│                  Revisa tu email."                              │
│      }                                                           │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Response 200 OK
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DEL USUARIO                         │
│                                                                  │
│  19. Recibe respuesta exitosa                                   │
│                                                                  │
│  20. Muestra mensaje:                                           │
│      "¡Gracias Juan! Tu dossier exclusivo está en camino.      │
│       Revisa tu email en los próximos minutos."                │
│                                                                  │
│  21. Formulario se limpia:                                      │
│      • Nombre: [vacío]                                          │
│      • Apellido: [vacío]                                        │
│      • Email: [vacío]                                           │
│      • Checkboxes desmarcados                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     HUBSPOT CONTACT RECORD                       │
│                                                                  │
│  Contact: juan@email.com                                        │
│  ────────────────────────────────────────────────────────       │
│                                                                  │
│  📧 Contact Info:                                               │
│     First name: Juan                                            │
│     Last name: Pérez                                            │
│     Email: juan@email.com                                       │
│                                                                  │
│  🎯 Custom Properties:                                          │
│     mercado_de_origen: España                                   │
│     lead_partner_source: Partner_Landing_ES_Playa_Viva         │
│                                                                  │
│  📊 Analytics:                                                  │
│     Original Source: Organic Search / Direct / Paid Search      │
│     Original Source Drill-Down 1: [utm_source]                 │
│     Original Source Drill-Down 2: [utm_medium]                 │
│     Latest Source: Form submission                              │
│     Latest Source Drill-Down 1: landing-page-playa-viva        │
│                                                                  │
│  ⏰ Activity:                                                   │
│     Last Activity: Form submission                              │
│     Form Name: Playa Viva Dossier Download                      │
│     Page URL: https://landing-page-playa-viva.vercel.app/      │
│     Timestamp: 2025-11-10 02:00:00                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      EMAIL DEL USUARIO                           │
│                                                                  │
│  De: inversiones@uniestate.co.uk                                │
│  Para: juan@email.com                                           │
│  Asunto: 📊 Tu Dossier Exclusivo de Playa Viva, Juan           │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  Hola Juan,                                                     │
│                                                                  │
│  Gracias por tu interés en Playa Viva.                         │
│  Tu dossier personalizado está listo.                           │
│                                                                  │
│  [Botón: Descargar Dossier] ◄─── Link a PDF personalizado      │
│                                                                  │
│  Contenido del dossier:                                         │
│  • Análisis de rentabilidades verificadas (7-8%)                │
│  • Planos y especificaciones técnicas                           │
│  • Comparativa RAK vs Dubai                                     │
│  • Estrategia del "Wynn Effect"                                 │
│                                                                  │
│  Un asesor se pondrá en contacto contigo en                     │
│  las próximas 24-48 horas.                                      │
│                                                                  │
│  Saludos,                                                       │
│  Equipo Uniestate                                               │
│                                                                  │
│  ─────────────────────────────────────────────────────────      │
│  Uniestate UK Ltd                                               │
│  inversiones@uniestate.co.uk                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 🔑 Puntos Críticos del Flujo

### 1. Cookie hubspotutk

\`\`\`text
Creación:    HubSpot Script (línea de script en layout.tsx)
Lectura:     orchestrateLeadAutomation() en page.tsx
Envío:       context.hutk en route.ts
Uso:         Atribución de Original Source en HubSpot
\`\`\`

### Por qué es crítico

- Sin esta cookie, HubSpot no puede atribuir correctamente el lead
- Garantiza que las conversiones se asocien a la fuente correcta
- Permite rastrear el journey completo del usuario

---

### 2. HubSpot Forms API vs. Contacts API

### ✅ Forms API (Lo que usamos)

\`\`\`javascript
POST https://api.hsforms.com/submissions/v3/integration/submit/
     {HUB_ID}/{FORM_GUID}

context: {
  hutk: "1697224219759"  // ← Garantiza atribución
}
\`\`\`

### ❌ Contacts API (No recomendado para atribución)

\`\`\`javascript
POST https://api.hubapi.com/crm/v3/objects/contacts

// No acepta hubspotutk en context
// Atribución siempre será "Offline sources"
\`\`\`

---

### 3. Procesos Paralelos

El sistema ejecuta HubSpot y PDF en paralelo usando `Promise.allSettled`:

### Ventajas

- ⚡ Más rápido (ambos procesos simultáneos)
- 🛡️ Resiliente (si uno falla, el otro continúa)
- ✅ Mejor experiencia de usuario

### Resultado

\`\`\`javascript
const [hubspotResult, pdfResult] = await Promise.allSettled([
  submitToHubSpot(payload),
  personalizePDF(payload),
]);

// Si HubSpot falla pero PDF funciona:
// hubspot_success: false
// pdf_success: true
// El usuario recibe su PDF, pero se registra error en logs
\`\`\`

---

## 📊 Estados Posibles del Sistema

| HubSpot | PDF | Email | Resultado                              |
| ------- | --- | ----- | -------------------------------------- |
| ✅      | ✅  | ✅    | Perfecto - Lead completo               |
| ✅      | ✅  | ❌    | Lead guardado, PDF creado, email falló |
| ✅      | ❌  | ❌    | Lead guardado, PDF/email fallaron      |
| ❌      | ✅  | ✅    | Lead no guardado, PDF/email OK         |
| ❌      | ❌  | ❌    | Fallo completo                         |

### Manejo inteligente

El sistema continúa con los procesos exitosos y registra errores en logs.

---

## 🔍 Verificación Paso a Paso

### En HubSpot

\`\`\`text
1. Ve a: Contacts > All contacts
2. Busca: juan@email.com
3. Verifica:
   ✓ Contact existe
   ✓ First name: Juan
   ✓ Last name: Pérez
   ✓ mercado_de_origen: España
   ✓ lead_partner_source: Partner_Landing_ES_Playa_Viva
   ✓ Original Source: [NO debe ser "Offline sources"]
   ✓ Activity log: Form submission registrada
\`\`\`

### En Servidor:

\`\`\`bash
# Ver logs en tiempo real
npm run dev

# Buscar errores
grep -i "error" logs/server.log

# Verificar PDF generado
ls -lh public/dossiers/
\`\`\`

### En Email:

\`\`\`text
1. Revisa inbox de juan@email.com
2. Busca email de: inversiones@uniestate.co.uk
3. Asunto: "Tu Dossier Exclusivo de Playa Viva, Juan"
4. Click en botón "Descargar Dossier"
5. Verifica que descarga PDF con nombre correcto
\`\`\`

---

## 🎯 Testing con UTM Parameters

### URL de prueba:

\`\`\`text
https://landing-page-playa-viva.vercel.app/?utm_source=google&utm_medium=cpc&utm_campaign=playa_viva_spain&utm_content=hero_cta&utm_term=luxury+beach+apartments
\`\`\`

### Resultado esperado en HubSpot:

\`\`\`text
Original Source: Paid Search
Original Source Drill-Down 1: google
Original Source Drill-Down 2: cpc

Latest Source: Direct Traffic
Latest Source Drill-Down 1: landing-page-playa-viva
\`\`\`

---

## 💡 Tips de Troubleshooting

### Problema: Cookie no se genera

\`\`\`javascript
// En consola del navegador:
document.cookie.split(";").find((c) => c.includes("hubspotutk"));

// Si retorna undefined:
// 1. Verificar que HubSpotScript.tsx está en layout.tsx
// 2. Esperar 10-15 segundos después de cargar
// 3. Verificar en DevTools > Application > Cookies
\`\`\`

### Problema: Lead con "Offline sources"

\`\`\`text
Causa: hubspotutk no se envió correctamente

Verificar:
1. Cookie existe en navegador
2. orchestrateLeadAutomation() captura la cookie
3. API route recibe hubspotutk en payload
4. HubSpot Forms API recibe hutk en context
\`\`\`

### Problema: PDF no se personaliza

\`\`\`text
Causa: Campo 'nombre_personalizacion_lead' no existe en PDF

Solución:
1. Verificar PDF tiene campo correcto
2. O comentar personalización temporalmente
3. O usar otro nombre de campo en script Python
\`\`\`

---

## ✅ Checklist de Verificación Completa

\`\`\`text
Navegador:
□ Cookie hubspotutk se crea
□ Formulario valida campos
□ Mensaje de éxito se muestra
□ Formulario se limpia después de envío

API Route:
□ POST /api/submit-lead responde 200
□ hubspotutk presente en request
□ Payload válido
□ HubSpot API responde success
□ PDF se genera (si habilitado)

HubSpot:
□ Contact creado/actualizado
□ Email correcto
□ Nombres correctos
□ Campos personalizados guardados
□ Original Source correcto (NO "Offline sources")
□ Activity log muestra form submission

Email (si configurado):
□ Email enviado
□ Link a PDF funciona
□ PDF descarga correctamente
□ Nombre personalizado en PDF

Logs:
□ Sin errores en consola del navegador
□ Sin errores en logs del servidor
□ Respuestas HTTP 200 en Network tab
\`\`\`

---

## Sistema completo funcionando cuando TODOS los checks pasan ✅
