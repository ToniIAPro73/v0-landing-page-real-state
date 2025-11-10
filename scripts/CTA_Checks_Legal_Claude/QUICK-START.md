# 🚀 Quick Start: Integración Playa Viva + HubSpot

## ⚡ Instalación Rápida (5 minutos)

### Opción A: Script Automático

```bash
# 1. Descargar todos los archivos en una carpeta
# 2. Navegar a la raíz de tu proyecto Next.js
cd tu-proyecto-playa-viva

# 3. Copiar archivos descargados a la raíz del proyecto
# 4. Ejecutar script de instalación
bash install.sh

# 5. Iniciar servidor
npm run dev
```

### Opción B: Manual (3 pasos)

```bash
# Paso 1: Crear directorios
mkdir -p src/app/api/submit-lead public/dossiers scripts

# Paso 2: Copiar archivos
cp page.tsx src/app/page.tsx
cp route.ts src/app/api/submit-lead/route.ts
cp personalizar_dossier.py scripts/

# Paso 3: Configurar .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7
NEXT_PUBLIC_SITE_URL=https://landing-page-playa-viva.vercel.app
EOF
```

---

## 📦 Archivos Incluidos

| Archivo | Ubicación Final | Descripción |
|---------|----------------|-------------|
| **page.tsx** | `src/app/page.tsx` | Página principal actualizada |
| **route.ts** | `src/app/api/submit-lead/route.ts` | API route para procesar leads |
| **personalizar_dossier.py** | `scripts/` | Script Python para HubSpot + PDF |
| **layout.tsx** | `src/app/layout.tsx` | ✅ Ya está correcto |
| **HubSpotScript.tsx** | `src/app/HubSpotScript.tsx` | ✅ Ya está correcto |

---

## ✅ Checklist de Verificación

```
□ Archivos copiados a ubicaciones correctas
□ .env.local configurado con variables correctas
□ npm run dev ejecutándose sin errores
□ Cookie hubspotutk se genera (ver DevTools)
□ Formulario envía datos (verificar en Network tab)
□ Lead aparece en HubSpot Contacts
□ Original Source muestra atribución correcta
```

---

## 🧪 Test Rápido

### 1. Iniciar servidor
```bash
npm run dev
```

### 2. Abrir navegador
```
http://localhost:3000
```

### 3. Verificar cookie HubSpot
Abrir DevTools > Console y ejecutar:
```javascript
document.cookie.split(';').find(c => c.includes('hubspotutk'))
```

Debería mostrar: `" hubspotutk=XXXXXXXXXX"`

### 4. Probar formulario
- Scroll hasta "Descargar Dossier"
- Completar campos:
  - Nombre: Juan
  - Apellido: Pérez
  - Email: test@test.com
- Marcar checkboxes
- Click "Descargar Dossier"

### 5. Verificar en HubSpot
- Ve a HubSpot > Contacts
- Busca: test@test.com
- Verifica campos:
  - ✅ Email: test@test.com
  - ✅ First name: Juan
  - ✅ Last name: Pérez
  - ✅ mercado_de_origen: España
  - ✅ lead_partner_source: Partner_Landing_ES_Playa_Viva
  - ✅ Original Source: (debe tener valor)

---

## 🎯 Cambios Principales

### Antes
```typescript
// Simulación
const orchestrateLeadAutomation = async (payload) => {
    console.log('[Automation] HubSpot API Dispatch', payload);
    // ... solo console.log
};
```

### Después
```typescript
// Envío real a HubSpot
const orchestrateLeadAutomation = async (payload) => {
    const hubspotutk = getHubSpotCookie(); // ← Captura cookie
    
    const response = await fetch('/api/submit-lead', { // ← Llamada real
        method: 'POST',
        body: JSON.stringify({
            ...payload,
            hubspotutk, // ← Para atribución correcta
        }),
    });
    
    return await response.json();
};
```

---

## 🔍 Troubleshooting Rápido

### Error: "hubspotutk not found"
```bash
# Verificar que HubSpot script está cargando
# Abrir DevTools > Network
# Buscar: hs-scripts.com
# Si no aparece, verificar layout.tsx
```

### Error: "Cannot POST /api/submit-lead"
```bash
# Verificar que route.ts está en ubicación correcta
ls src/app/api/submit-lead/route.ts

# Si no existe, copiar manualmente
cp route.ts src/app/api/submit-lead/route.ts
```

### Lead no aparece en HubSpot
```bash
# 1. Verificar en HubSpot > Contacts > All contacts
# 2. Buscar por email exacto
# 3. Si existe pero no visible, puede estar en spam
# 4. Revisar logs en DevTools > Console
```

---

## 📚 Documentación Adicional

- **README-INTEGRACION-COMPLETA.md** → Guía paso a paso detallada
- **CAMBIOS-PRINCIPALES.md** → Diferencias entre versión anterior y actual
- **README-IMPLEMENTACION.md** → Guía original del componente DossierCTA

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

## 📞 Soporte

**¿Problemas?** Contacta:
- Email: tony@uniestate.co.uk
- HubSpot Account: Anclora (147219365)

---

## 💡 Tips Importantes

1. **Cookie hubspotutk:**
   - Se genera automáticamente al cargar la página
   - Espera 10-15 segundos después de cargar
   - Es esencial para atribución correcta

2. **PDF Personalizado (Opcional):**
   - Requiere Python 3.8+
   - Si no lo necesitas ahora, desactívalo temporalmente
   - El envío a HubSpot funciona independientemente

3. **Testing:**
   - Usa emails reales para pruebas
   - HubSpot puede filtrar emails fake
   - Verifica siempre en HubSpot > Contacts

4. **Atribución:**
   - Usa UTM parameters para pruebas:
   ```
   ?utm_source=google&utm_medium=cpc&utm_campaign=test
   ```
   - Verifica "Original Source" en contacto HubSpot

---

## ✨ Próximos Pasos Sugeridos

1. [ ] Implementar envío de email real (Resend/SendGrid)
2. [ ] Configurar PDF con campo rellenable
3. [ ] Crear workflows automáticos en HubSpot
4. [ ] A/B testing del formulario
5. [ ] Integrar Google Analytics 4

---

**¡Todo listo! 🎉**

El formulario ahora envía leads reales a HubSpot con atribución correcta.
