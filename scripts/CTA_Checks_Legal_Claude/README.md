# 🚀 Integración Landing Playa Viva + HubSpot Forms API

## 📦 13 Archivos Generados | 230 KB Total

**Versión:** 2.0 - Actualizado con HubSpot Forms API + Atribución Correcta

---

## ⚡ Inicio Rápido (5 minutos)

```bash
# 1. Ejecutar instalación automática
bash install.sh

# 2. Iniciar servidor
npm run dev

# 3. Probar formulario
[Test URL](http://localhost:3000)
```

**✅ Listo.** El formulario ahora envía leads reales a HubSpot con atribución correcta.

---

## 📚 Documentación

### 🎯 Para Empezar:

1. **[QUICK-START.md](./QUICK-START.md)** ← Empieza aquí
   - Instalación en 5 minutos
   - Checklist de verificación
   - Test rápido

### 📖 Para Entender:

1. **[CAMBIOS-PRINCIPALES.md](./CAMBIOS-PRINCIPALES.md)**

   - Qué cambió vs. versión anterior
   - Antes vs. Después (código)
   - Por qué estos cambios

2. **[FLUJO-COMPLETO-SISTEMA.md](./FLUJO-COMPLETO-SISTEMA.md)**
   - Diagrama visual completo
   - Flujo paso a paso
   - Estados del sistema

### 🔧 Para Implementar:

1. **[README-INTEGRACION-COMPLETA.md](./README-INTEGRACION-COMPLETA.md)**

   - Guía paso a paso detallada
   - Configuración de PDF
   - Setup de Python
   - Deploy a Vercel

2. **[INDICE-ARCHIVOS.md](./INDICE-ARCHIVOS.md)**
   - Descripción de cada archivo
   - Dónde colocar cada uno
   - Cuáles usar y cuáles no

---

## 📁 Archivos Principales

### ✅ USAR ESTOS (Implementación)

| Archivo                              | Ubicación                  | Descripción                   |
| ------------------------------------ | -------------------------- | ----------------------------- |
| **page.tsx** (134 KB)                | `src/app/`                 | Página principal actualizada  |
| **route.ts** (6.1 KB)                | `src/app/api/submit-lead/` | API route para procesar leads |
| **personalizar_dossier.py** (7.6 KB) | `scripts/`                 | Script Python HubSpot + PDF   |

### 📖 LEER ESTOS (Documentación)

| Archivo                            | Tamaño | Descripción                 |
| ---------------------------------- | ------ | --------------------------- |
| **QUICK-START.md**                 | 5.5 KB | Guía rápida (5 min)         |
| **README-INTEGRACION-COMPLETA.md** | 11 KB  | Guía completa paso a paso   |
| **CAMBIOS-PRINCIPALES.md**         | 8.6 KB | Antes vs. Después           |
| **FLUJO-COMPLETO-SISTEMA.md**      | 22 KB  | Diagrama visual del sistema |
| **INDICE-ARCHIVOS.md**             | 6.3 KB | Descripción de archivos     |

### 🛠️ USAR ESTOS (Utilidades)

| Archivo         | Tamaño    | Descripción                    |
| --------------- | --------- | ------------------------------ |
| **install.sh**  | 5.6 KB    | Script instalación automática  |
| **env.example** | 754 bytes | Plantilla variables de entorno |

### ⚠️ NO USAR (Obsoletos)

| Archivo                  | Descripción                             |
| ------------------------ | --------------------------------------- |
| DossierCTA.tsx           | Componente del chat anterior (obsoleto) |
| api-dossier-submit.ts    | API route anterior (obsoleto)           |
| README-IMPLEMENTACION.md | Documentación anterior (obsoleto)       |

---

## 🎯 ¿Qué Hace Este Sistema?

### ANTES (Simulación):

```text
Usuario → Formulario → console.log() → Nada
```

### DESPUÉS (Funcional):

```text
Usuario → Formulario → API Route → HubSpot (con atribución) + PDF + Email
```

---

## ✨ Nuevas Funcionalidades

| Funcionalidad                            | Estado                |
| ---------------------------------------- | --------------------- |
| ✅ Envío real a HubSpot                  | Implementado          |
| ✅ Atribución correcta (Original Source) | Implementado          |
| ✅ Captura cookie hubspotutk             | Implementado          |
| ✅ HubSpot Forms API                     | Implementado          |
| ✅ Campos personalizados                 | Implementado          |
| ✅ Personalización PDF                   | Implementado (Python) |
| ⏳ Envío de email                        | Placeholder listo     |

---

## 🔑 Configuración Mínima

### Variables de Entorno (.env.local):

```bash
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7
NEXT_PUBLIC_SITE_URL=https://landing-page-playa-viva.vercel.app
```

### Archivos Mínimos:

1. ✅ page.tsx → `src/app/page.tsx`
2. ✅ route.ts → `src/app/api/submit-lead/route.ts`
3. ✅ .env.local (configurado)

**Con estos 3 archivos, el envío a HubSpot funciona.**

### Opcional (Personalización PDF):

1. ⚙️ personalizar_dossier.py → `scripts/`
2. ⚙️ Python 3.8+ instalado
3. ⚙️ PDF base con campo rellenable

---

## 🧪 Test Rápido

### 1. Verificar Cookie HubSpot

Abrir DevTools > Console:

```javascript
document.cookie.split(";").find((c) => c.includes("hubspotutk"));
// Debería retornar: " hubspotutk=1697224219759"
```

### 2. Probar Formulario

1. Ir a: [http://localhost:3000](http://localhost:3000)
2. Scroll hasta sección "Descargar Dossier"
3. Completar:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: test@test.com
4. Marcar checkboxes
5. Click "Descargar Dossier"

### 3. Verificar en HubSpot

1. HubSpot > Contacts
2. Buscar: test@test.com
3. Verificar:
   - ✅ Contact creado
   - ✅ First name: Juan
   - ✅ Last name: Pérez
   - ✅ mercado_de_origen: España
   - ✅ **Original Source ≠ "Offline sources"** ← MUY IMPORTANTE

---

## 🚀 Deploy a Producción

```bash
# Configurar variables en Vercel
vercel env add NEXT_PUBLIC_HUBSPOT_PORTAL_ID
vercel env add HUBSPOT_FORM_GUID
vercel env add NEXT_PUBLIC_SITE_URL

# Deploy
vercel --prod
```

---

## 🔍 Troubleshooting

### Cookie no se genera

```javascript
// Verificar que HubSpot script está en layout.tsx
// Esperar 10-15 segundos después de cargar página
```

### Lead con "Offline sources"

```text
Problema: hubspotutk no se envió
Solución: Verificar orchestrateLeadAutomation() captura cookie
```

### API route no responde

```bash
# Verificar ubicación correcta
ls src/app/api/submit-lead/route.ts
```

---

## 📊 Estructura del Proyecto

```tree
tu-proyecto/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Reemplazar ✅
│   │   ├── layout.tsx                  ← Ya está bien ✅
│   │   ├── HubSpotScript.tsx           ← Ya está bien ✅
│   │   └── api/
│   │       └── submit-lead/
│   │           └── route.ts            ← Nuevo ✅
├── scripts/
│   └── personalizar_dossier.py         ← Nuevo (opcional)
├── public/
│   └── dossiers/                       ← Crear carpeta
└── .env.local                          ← Configurar ✅
```

---

## ✅ Checklist de Implementación

```text
Instalación:
□ Archivos copiados a ubicaciones correctas
□ .env.local configurado
□ Directorios creados (public/dossiers, scripts)

Testing Local:
□ npm run dev funciona sin errores
□ Cookie hubspotutk se genera
□ Formulario envía datos
□ API route responde 200 OK
□ Lead aparece en HubSpot

Verificación HubSpot:
□ Contact creado con datos correctos
□ Campos personalizados guardados
□ Original Source ≠ "Offline sources"
□ Activity log muestra form submission

Deploy:
□ Variables de entorno en Vercel
□ Deploy exitoso
□ Test en producción
□ Verificación final en HubSpot
```

---

## 📞 Soporte

**¿Problemas o dudas?**

- 📧 Email: tony@uniestate.co.uk
- 🏢 HubSpot Account: Anclora (ID: 147219365)
- 📖 Lee: [QUICK-START.md](./QUICK-START.md)
- 📖 O: [README-INTEGRACION-COMPLETA.md](./README-INTEGRACION-COMPLETA.md)

---

## 🎓 Recursos Adicionales

### HubSpot Forms API:

- [Documentación oficial](https://developers.hubspot.com/docs/api/marketing/forms)
- [Atribución con hutk](https://developers.hubspot.com/docs/api/marketing/forms#understanding-the-hutk-parameter)

### Next.js API Routes:

- [Documentación oficial](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Python PDF:

- [pypdf Documentación](https://pypdf.readthedocs.io/)

---

## 📝 Changelog

### Versión 2.0 (Actual)

- ✅ Integración HubSpot Forms API
- ✅ Captura cookie hubspotutk
- ✅ Atribución correcta (Original Source)
- ✅ Campos personalizados (mercado_de_origen, lead_partner_source)
- ✅ Script Python para personalización PDF
- ✅ API route funcional en Next.js
- ✅ Manejo de errores robusto
- ✅ Documentación completa

### Versión 1.0 (Anterior)

- ❌ Solo simulación (console.log)
- ❌ Sin envío real a HubSpot
- ❌ Sin atribución
- ❌ Sin personalización PDF

---

## 💡 Próximos Pasos Sugeridos

1. [ ] Configurar servicio de email (Resend/SendGrid)
2. [ ] Crear PDF con campo rellenable
3. [ ] Configurar workflows automáticos en HubSpot
4. [ ] A/B testing del formulario
5. [ ] Integrar Google Analytics 4
6. [ ] Optimizar imágenes (Lazy Loading)

---

## 🎉 ¡Listo!

Tu landing Playa Viva ahora está integrada con HubSpot Forms API y genera leads con atribución correcta.

**Empieza con:** [QUICK-START.md](./QUICK-START.md)

---

**Última actualización:** Noviembre 10, 2025
**Versión:** 2.0
**Autor:** Claude + Toni (Uniestate UK)
