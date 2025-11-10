# Implementación DossierCTA - Playa Viva

## Archivos incluidos

1. **DossierCTA.tsx** - Componente React/Next.js con formulario y validación GDPR
2. **api-dossier-submit.ts** - API route para procesar sumisiones
3. **env.example** - Variables de entorno necesarias

---

## PASO 1: Configurar Variables de Entorno

1. Copia `env.example` a `.env.local` en la raíz del proyecto
2. Completa todas las variables:

\`\`\`bash
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key

# HubSpot
HUBSPOT_PRIVATE_APP_TOKEN=pat-eu1-xxxxx
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
\`\`\`

### Obtener claves reCAPTCHA v3:
1. Ve a: https://www.google.com/recaptcha/admin
2. Registra tu sitio con tipo "reCAPTCHA v3"
3. Dominio: `landing-page-playa-viva.vercel.app`
4. Copia las claves generadas

### Obtener token HubSpot:
1. HubSpot > ⚙️ Configuración > Integrations > Private Apps
2. Crea nueva app "Playa Viva API"
3. Permisos: `crm.objects.contacts.write` + `crm.objects.contacts.read`
4. Copia el token generado

---

## PASO 2: Instalar Componente

Copia `DossierCTA.tsx` a tu carpeta de componentes:

\`\`\`bash
cp DossierCTA.tsx src/components/DossierCTA.tsx
\`\`\`

---

## PASO 3: Crear API Route

Copia la API route al directorio correcto según tu versión de Next.js:

**App Router (Next.js 13+):**
\`\`\`bash
mkdir -p src/app/api/dossier-submit
cp api-dossier-submit.ts src/app/api/dossier-submit/route.ts
\`\`\`

**Pages Router (Next.js 12):**
\`\`\`bash
mkdir -p pages/api
cp api-dossier-submit.ts pages/api/dossier-submit.ts
\`\`\`

---

## PASO 4: Usar el Componente

Importa y usa el componente en tu página:

\`\`\`tsx
import DossierCTA from '@/components/DossierCTA';

export default function PlayaVivaPage() {
  return (
    <div>
      {/* Tus otras secciones */}
      
      <DossierCTA />
      
      {/* Más contenido */}
    </div>
  );
}
\`\`\`

---

## PASO 5: Verificar Funcionamiento

### 5.1 Desarrollo local:
\`\`\`bash
npm run dev
\`\`\`

### 5.2 Prueba el formulario:
1. Completa campos
2. Acepta política de privacidad
3. Envía formulario
4. Verifica en consola del navegador que no hay errores

### 5.3 Verificar integraciones:
- [ ] reCAPTCHA carga correctamente
- [ ] Formulario valida campos obligatorios
- [ ] Sumisión exitosa muestra mensaje de confirmación
- [ ] Lead aparece en HubSpot (Contacts)
- [ ] UTM campaign se registra: `237663446-Playa%20Viva`

---

## PASO 6: Configurar Email Service (Opcional)

Para enviar emails automáticos, configura uno de estos servicios:

### Opción A: Resend (Recomendado)
\`\`\`bash
npm install resend
\`\`\`

\`\`\`typescript
// En api-dossier-submit.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendDossierEmail(payload: DossierSubmitPayload) {
  await resend.emails.send({
    from: 'inversiones@uniestate.co.uk',
    to: payload.email,
    subject: '📊 Tu Dossier Exclusivo de Playa Viva',
    html: `<!-- tu HTML aquí -->`,
  });
}
\`\`\`

### Opción B: SendGrid
\`\`\`bash
npm install @sendgrid/mail
\`\`\`

---

## PASO 7: Deploy a Vercel

\`\`\`bash
# Añadir variables de entorno en Vercel Dashboard
vercel env add RECAPTCHA_SECRET_KEY
vercel env add HUBSPOT_PRIVATE_APP_TOKEN
# ... etc

# Deploy
vercel --prod
\`\`\`

---

## Estructura de Datos Enviados a HubSpot

\`\`\`json
{
  "properties": {
    "firstname": "Juan",
    "lastname": "Pérez García",
    "email": "juan@email.com",
    "phone": "+34600000000",
    "hs_lead_status": "NEW",
    "lifecyclestage": "subscriber",
    "utm_campaign": "237663446-Playa Viva",
    "utm_source": "landing_playa_viva",
    "marketing_consent": "true",
    "privacy_policy_accepted": "true",
    "lead_source": "Landing Page - Playa Viva",
    "acquisition_date": "2025-11-10T00:55:00.000Z"
  }
}
\`\`\`

---

## Cumplimiento Legal

✅ **GDPR/LOPDGDD compliant:**
- Check obligatorio de Política de Privacidad
- Check separado para marketing (opcional)
- Información clara sobre TID a EE.UU.
- Mención de derechos (acceso, rectificación, supresión)

✅ **reCAPTCHA v3:**
- Protección contra bots
- Validación en backend
- Score mínimo: 0.5

---

## Troubleshooting

### Error: "reCAPTCHA verification failed"
- Verifica que las claves estén correctas en `.env.local`
- Confirma que el dominio esté registrado en Google reCAPTCHA

### Error: "HubSpot API error"
- Verifica token de HubSpot
- Confirma permisos de la Private App
- Revisa que el Portal ID sea correcto (147219365)

### El formulario no envía datos:
- Abre DevTools > Console
- Busca errores JavaScript
- Verifica que la API route esté en la ruta correcta

### Lead no aparece en HubSpot:
- Revisa logs del servidor
- Confirma que el token tenga permisos `contacts.write`
- Verifica que el email no exista ya en HubSpot

---

## Próximos Pasos

1. Implementar servicio de email real (Resend/SendGrid)
2. Crear página `/politica-privacidad`
3. Diseñar template de email de bienvenida
4. Configurar automatizaciones en HubSpot
5. A/B testing del formulario

---

## Contacto

Para soporte técnico:
- Email: tony@uniestate.co.uk
- HubSpot: Cuenta Anclora (147219365)
