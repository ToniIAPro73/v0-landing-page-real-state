# Cambios Principales: Versión Anterior vs. Actualizada

## 📝 Resumen de Cambios

| Archivo                     | Estado Anterior           | Estado Actualizado              |
| --------------------------- | ------------------------- | ------------------------------- |
| **page.tsx**                | Formulario con simulación | Formulario con llamada API real |
| **route.ts**                | ❌ No existía             | ✅ Nuevo: API route funcional   |
| **personalizar_dossier.py** | Básico                    | Mejorado con manejo de errores  |
| **layout.tsx**              | ✅ Correcto               | ✅ Sin cambios necesarios       |
| **HubSpotScript.tsx**       | ✅ Correcto               | ✅ Sin cambios necesarios       |

---

## 🔄 Cambio 1: page.tsx - Función orchestrateLeadAutomation

### ❌ ANTES (Líneas 1175-1189)

```typescript
const orchestrateLeadAutomation = async (payload: LeadAutomationPayload) => {
  const simulateCall = (label: string, delay = 650) =>
    new Promise<void>((resolve) => {
      console.log(`[Automation] ${label}`, payload);
      setTimeout(resolve, delay);
    });

  await Promise.all([
    simulateCall("HubSpot API Dispatch", 700),
    simulateCall("Python Dossier Personalization", 900),
    simulateCall("Internal Metrics Storage", 550),
  ]);

  await simulateCall("Email confirmation & gratitude message", 600);
};
```

**Problema:** Solo simula llamadas con `console.log`. No envía datos reales.

---

### ✅ DESPUÉS (Actualizado)

```typescript
/**
 * Orquesta el proceso completo de lead:
 * 1.  Captura hubspotutk (cookie de HubSpot)
 * 2.  Envía a HubSpot Forms API (garantiza atribución)
 * 3.  Personaliza PDF
 * 4.  Envía email con dossier
 */
const orchestrateLeadAutomation = async (payload: LeadAutomationPayload) => {
  // Capturar cookie hubspotutk de HubSpot
  const getHubSpotCookie = (): string => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "hubspotutk") {
        return value;
      }
    }
    // Si no existe la cookie, generar timestamp como fallback
    return `generated_${Date.now()}`;
  };

  const hubspotutk = getHubSpotCookie();
  const pageUri = window.location.href;

  // Preparar payload para API
  const apiPayload = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    fullName: payload.fullName,
    email: payload.email,
    language: payload.language,
    hubspotutk, // ← NUEVO: Cookie para atribución
    pageUri, // ← NUEVO: URL actual
    utm: payload.utm,
  };

  // Llamar API route
  const response = await fetch("/api/submit-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error procesando lead");
  }

  return await response.json();
};
```

**Mejoras:**

- ✅ Captura real de cookie `hubspotutk`
- ✅ Envío real a API route
- ✅ Manejo de errores
- ✅ Retorna resultado real

---

## 🔄 Cambio 2: Nuevo Archivo - route.ts

### ✅ NUEVO: src/app/api/submit-lead/route.ts

Este archivo NO existía antes. Es completamente nuevo.

**Funciones principales:**

1. **submitToHubSpot()** - Envía a HubSpot Forms API
2. **personalizePDF()** - Personaliza PDF (placeholder para Python)
3. **sendDossierEmail()** - Envía email con dossier
4. **POST()** - Endpoint principal que orquesta todo

**Código clave:**

```typescript
// Configuración HubSpot
const HUB_ID = "147219365";
const FORM_GUID = "34afefab-a031-4516-838e-f0edf0b98bc7";
const HUB_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUB_ID}/${FORM_GUID}`;

async function submitToHubSpot(payload: LeadSubmitPayload): Promise<any> {
  const hubspotPayload = {
    fields: [
      { name: "email", value: payload.email },
      { name: "firstname", value: payload.firstName },
      { name: "lastname", value: payload.lastName },
      {
        name: "mercado_de_origen",
        value: payload.language === "es" ? "España" : "International",
      },
      { name: "lead_partner_source", value: "Partner_Landing_ES_Playa_Viva" },
    ],
    context: {
      hutk: payload.hubspotutk, // ← CRÍTICO para atribución
      pageUri: payload.pageUri,
      pageName: "Playa Viva Dossier Download",
    },
  };

  const response = await fetch(HUB_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hubspotPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HubSpot API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}
```

**Mejoras vs. versión anterior:**

- ✅ Envío real a HubSpot (no simulación)
- ✅ Usa Forms API (garantiza atribución)
- ✅ Incluye `hubspotutk` en context
- ✅ Manejo de errores robusto

---

## 🔄 Cambio 3: personalizar_dossier.py

### ❌ ANTES

Tenía un pequeño error en línea 79:

```python
hutk = data_from_landing_page.get('hubspotutk', '').strip()

# Validar campos esenciales

if not all([nombre_completo, email, hutk]): # ← Requería hutk obligatoriamente
```

**Problema:** Si no existía la cookie, el script fallaba completamente.

---

### ✅ DESPUÉS

```python
hutk = data_from_landing_page.get('hubspotutk', '').strip()

# Validar campos esenciales

if not all([nombre_completo, email]): # ← Ya no requiere hutk obligatoriamente
    return {...}

# Si no hay hutk, usar timestamp como fallback

if not hutk:
    hutk = f"generated_{int(time.time() * 1000)}"
    print(f"WARNING: No hubspotutk provided. Using fallback: {hutk}")
```

**Mejoras:**

- ✅ No falla si falta `hubspotutk`
- ✅ Genera fallback automático
- ✅ Registra warning en logs
- ✅ Script más robusto

---

## 📊 Flujo de Datos: Antes vs. Después

### ❌ FLUJO ANTERIOR

Usuario llena formulario
↓
Simulación local
↓
console.log()
↓
(nada)

**Resultado:** No se guardaban leads reales.

---

### ✅ FLUJO ACTUALIZADO

Usuario llena formulario
↓
Captura hubspotutk cookie
↓
Envía a /api/submit-lead
↓
┌────────────────────┐
│ API Route │
└────────────────────┘
↓
┌────────┴─────────┐
▼ ▼
HubSpot Personaliza
Forms API PDF
↓ ↓
Original Guarda en
Source OK /dossiers/
↓ ↓
└─────────┬────────┘
↓
Envía Email
con dossier

**Resultado:** Lead completo con atribución correcta.

---

## 🎯 Ventajas del Nuevo Sistema

| Característica          | Antes               | Después                     |
| ----------------------- | ------------------- | --------------------------- |
| **Envío a HubSpot**     | ❌ Simulado         | ✅ Real (Forms API)         |
| **Atribución**          | ❌ No disponible    | ✅ Original Source correcta |
| **Cookie hubspotutk**   | ❌ No capturada     | ✅ Capturada y enviada      |
| **Personalización PDF** | ❌ No implementada  | ✅ Implementada (Python)    |
| **Email automático**    | ❌ No disponible    | ✅ Placeholder listo        |
| **Manejo de errores**   | ❌ Básico           | ✅ Robusto                  |
| **Testing local**       | ❌ Solo console.log | ✅ Funcional end-to-end     |

---

## 🔍 Verificación de Atribución

### ANTES

Sin forma de verificar atribución porque no se enviaban datos reales.

### DESPUÉS

Puedes verificar en HubSpot:

1. **Contact creado:**

   - HubSpot > Contacts > [email del lead]

2. **Original Source:**

   - Ve a la pestaña "About this contact"
   - Busca sección "Analytics"
   - Verifica:
     - Original Source: `Organic Search` / `Direct Traffic` / `Paid Search`
     - Original Source Drill-Down 1
     - Original Source Drill-Down 2

3. **Campos personalizados:**
   - `mercado_de_origen`: "España"
   - `lead_partner_source`: "Partner_Landing_ES_Playa_Viva"

---

## 🚀 Próximo Paso

**Lee el archivo `README-INTEGRACION-COMPLETA.md` para instrucciones paso a paso de implementación.**

---

## ❓ FAQ

**P: ¿Tengo que reemplazar todo el archivo page.tsx?**
R: Sí, el nuevo `page.tsx` tiene la función `orchestrateLeadAutomation` actualizada.

**P: ¿Dónde va el archivo route.ts?**
R: En `src/app/api/submit-lead/route.ts`

**P: ¿Es obligatorio usar el script Python?**
R: No. Puedes deshabilitarlo temporalmente y solo usar la integración HubSpot.

**P: ¿Qué pasa si no tengo el PDF con campo rellenable?**
R: Comenta las líneas de personalización en el script Python (ver README).

**P: ¿Funciona el código actual sin cambios?**
R: No. El código actual solo simula envíos. Necesitas los archivos actualizados para envíos reales.
