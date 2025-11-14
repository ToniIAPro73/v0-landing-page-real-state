# Contexto del proyecto Playa Viva

## Estado actual (Noviembre 2025)

La landing page está completamente funcional con sistema de captura de leads, sección Features reestructurada, y news carousel actualizado:

- **Plataforma**: Next.js 16 con App Router desplegado en Vercel
- **Idiomas**: Bilingüe español/inglés con cambio dinámico
- **Features**: 4 subsecciones especializadas (Development, Specifications, Playa Viva Views, Services/Amenities)
- **Noticias**: Carrusel con 5 artículos, incluido nuevo artículo Wynn Resorts (10 Nov 2025)
- **Formulario**: Captura de leads con verificación ALTCHA (alternativa privada a CAPTCHA)
- **Personalización**: Generación dinámica de PDFs personalizados con el nombre del lead
- **Almacenamiento**: Sistema dual S3 (producción) + local (fallback/desarrollo)
- **Email**: Entrega vía SMTP con remitentes específicos por idioma
- **Integración**: HubSpot para gestión de leads y agendamiento de reuniones

### Arquitectura del flujo de leads

```text
Usuario llena formulario
    ↓
Verificación ALTCHA
    ↓
Envío a HubSpot (creación de lead)
    ↓
Generación PDF personalizado (pdf-lib + fuente Allura)
    ↓
Subida a S3 (con URL firmada 24h) [fallback: almacenamiento local]
    ↓
Email SMTP con botones premium (Descargar + Agendar reunión)
```

### Componentes clave

1. **`app/page.tsx`**:

   - Client Component principal con gestión de estado compleja
   - Control bilingüe (ES/EN) con toggle simple
   - Animaciones hero, galerías, apartamentos, FAQ
   - Botones flotantes de navegación (up/down) con detección inteligente de posición

2. **`app/api/submit-lead/route.ts`**:

   - Endpoint principal de procesamiento de leads
   - Validación ALTCHA
   - Integración HubSpot
   - Personalización PDF con fuente custom
   - Almacenamiento S3 con fallback local
   - Envío SMTP con templates HTML ricos

3. **`lib/dossier-storage.ts`**:

   - **Detección automática de entorno** (no requiere configuración manual)
   - Vercel/Production → `/tmp/dossiers`
   - Local/Development → `C:\Users\Usuario\Documents\Dossiers_Personalizados_PlayaViva`
   - Normalización automática de endpoint S3 (agrega `https://` si falta)

4. **`lib/altcha.ts`**:
   - Generación y verificación de desafíos HMAC
   - Alternativa privada a reCAPTCHA/hCaptcha
   - TTL configurable (default: 300s)

## Últimos cambios implementados

### Sesión actual (Noviembre 2025)

1. **Reestructuración completa de Features (`app/page.tsx` líneas 376-477, 857-956)** ✅

   - **Antes**: Sección "Características Exclusivas" con 4 tarjetas simples con iconos
   - **Después**: 4 subsecciones especializadas:
     - **FEATURES_1 - Development Structure**: Showcase de edificio con efecto grayscale→color
     - **FEATURES_2 - Specifications**: 4 cards elegantes con detalles de unidades y precios
     - **FEATURES_3 - Playa Viva Views**: Galería de tabs (4 vistas con imágenes diferentes)
     - **FEATURES_4 - Services/Amenities**: Carrusel horizontal (desktop) / vertical (mobile)
   - **Estado**: Bilingüe completo (ES/EN) con efectos visuales premium

2. **Renombrado de sección Amenities a "Servicios" (solo ES)** ✅

   - **Español**: "Amenities" → "Servicios" (línea 448)
   - **Inglés**: "Amenities" (sin cambios)
   - **Titles de items traducidos al español**:
     - Outdoor Cinema → Cine Exterior
     - Spa & Wellness → Spa y Bienestar
     - Fitness Center → Centro de Fitness
     - Outdoor Swimming Pools → Piscinas Exteriores
     - Retail & Dining → Comercios y Restauración

3. **Actualización de artículos de noticias** ✅

   - **Nuevo artículo**: Wynn Resorts announces second resort (10 Noviembre 2025)
   - **Fuente**: Hotel Management Network
   - **Imagen**: `news_1.png`
   - **URL**: https://www.hotelmanagement-network.com/news/wynn-resorts-marjan-second-resort/
   - **Fecha actualizada**: "23 Enero 2025" → "10 Noviembre 2025" (ES & EN)
   - **Total de artículos**: 5 (nuevo + 4 existentes)

4. **Gestión de imágenes actualizada** ✅

   - **Building Structure**: `building-structure.webp` (nueva)
   - **Playa Viva Views**: `view1.webp`, `view2.jpg`, `view3.webp`, `beach.webp`
   - **Services**: `cinema.webp`, `foto galeria 7.jpg`, `foto galeria 4.jpg`, `foto galeria 11.webp`, `retail.webp`
   - **News**: `news_1.png`, `news_2.webp`, `news_3.png`, `news_4.png`, `news_5.png`

5. **Mejoras de código** ✅

   - Añadido estado React: `activePlayaVivaTab` (línea 143)
   - Comentarios identificadores para todas las subsecciones de Features
   - Responsive design verificado (desktop/tablet/mobile)
   - Animaciones escalonadas (stagger effects)
   - Efectos hover premium (elevation, shadows, color transitions)

### Cambios previos (Enero 2025)

**Sistema de S3, Email SMTP, HubSpot y ALTCHA completamente implementados y funcionales**

## Estado de funcionalidades

| Funcionalidad       | Estado          | Notas                           |
| ------------------- | --------------- | ------------------------------- |
| Sección Features    | ✅ Reestructurada | 4 subsecciones con efectos premium |
| Carrusel Noticias   | ✅ Actualizado  | 5 artículos, nuevo Wynn 10/11   |
| Servicios/Amenities | ✅ Traducido    | "Servicios" en ES, items ES/EN   |
| Formulario bilingüe | ✅ Funcionando  | ES/EN con validación ALTCHA     |
| Generación PDF      | ✅ Funcionando  | Ambos idiomas, fuente Allura    |
| Almacenamiento S3   | ✅ Funcionando  | Automatizado, producción OK      |
| Email SMTP          | ✅ Funcionando  | Tony (ES) / Michael (EN)        |
| HubSpot leads       | ✅ Funcionando  | Creación automática con UTMs    |
| HubSpot Meetings    | ✅ Funcionando  | Botón en email                  |
| Detección entorno   | ✅ Automática   | Sin config manual               |

## Problemas conocidos

**Ninguno actualmente** - Todos los issues críticos han sido resueltos.

## Workflow de desarrollo

### Estrategia de ramas

```text
development (Claude trabaja aquí)
    ↓
preview (Usuario promueve para testing)
    ↓
production (Usuario promueve cuando valida)
```

**IMPORTANTE**:

- Claude Code **SOLO** trabaja en rama `development`
- Usuario es responsable de promover cambios a `preview` y `production`
- URLs de Vercel:
  - Production (fija): <https://playaviva-uniestate.vercel.app/>
  - Preview (cambia): `https://eslatamlandingpageplayavivauniestate-xxxxx.vercel.app/`

### Comandos esenciales

```bash
# Desarrollo local
npm run dev

# Linting
npm run lint

# Build de producción
npm run build
npm run start
```

## Variables de entorno requeridas

### Producción (Vercel)

```bash
# HubSpot
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7
HUBSPOT_MEETINGS_URL_ES=https://meetings-eu1.hubspot.com/toni-ballesteros-alonso
HUBSPOT_MEETINGS_URL_EN=https://meetings-eu1.hubspot.com/toni-ballesteros-alonso

# Site URL
NEXT_PUBLIC_SITE_URL=https://playaviva-uniestate.vercel.app

# SMTP
SMTP_HOST=mail.uniestate.co.uk
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER_ES=tony@uniestate.co.uk
SMTP_PASS_ES=<password>
SMTP_USER_EN=michael@uniestate.co.uk
SMTP_PASS_EN=<password>

# S3 (iDrive e2)
# NOTA: Regiones configuradas en código (Frankfurt/Paris con failover automático)
S3_Access_Key_ID=<key>
S3_Secret_Access_Key=<secret>
S3_BUCKET_NAME=dossier-playa-viva

# ALTCHA
ALTCHA_SECRET=<secret>
ALTCHA_CHALLENGE_TTL=300
```

### Notas importantes

- ❌ **NO configurar**: `DOSSIER_LOCAL_DIR` (detección automática)
- ❌ **NO configurar**: `S3_Endpoint` y `S3_Region_Code` (regiones hardcoded con failover)
- ⚠️ **S3 Endpoint**: Se normaliza automáticamente (agrega `https://`)
- 📧 **SMTP**: Dos cuentas separadas (ES/EN) con credenciales distintas
- 🔒 **ALTCHA_SECRET**: Debe ser idéntico en todos los entornos
- 🌍 **S3 Regiones**: Frankfurt (primaria) → Paris (fallback automático)

## Pruebas pendientes

### Verificación final en producción

**Usuario debe ejecutar después de promover a production**:

1. **Formulario español**:

   - ✅ Llenar con datos de prueba
   - ✅ Verificar ALTCHA funciona
   - ✅ Confirmar email llega desde <tony@uniestate.co.uk>
   - ✅ Descargar PDF desde enlace (debe venir de S3)
   - ✅ Verificar lead aparece en HubSpot
   - ✅ Probar botón "Agendar Consulta"

2. **Formulario inglés**:

   - ✅ Cambiar idioma a EN
   - ✅ Repetir todas las verificaciones anteriores
   - ✅ Confirmar email llega desde <michael@uniestate.co.uk>

3. **Verificación S3**:

   - ✅ Acceder a bucket `dossier-playa-viva` en iDrive e2
   - ✅ Confirmar PDFs se están guardando en carpeta `dossiers/`
   - ✅ Verificar formato: `Dossier_Nombre_Apellido.pdf`

4. **Monitoreo logs Vercel**:
   - ✅ Buscar: `[INIT] S3 Configuration: { ... useS3Storage: true }`
   - ✅ Verificar: `[personalizePDF] Uploaded dossier to S3 bucket`
   - ✅ Confirmar: `[sendDossierEmail] ✓ Email sent successfully via SMTP!`

## Assets críticos

### PDFs base (deben existir)

```tree
public/assets/dossier/
├── Dossier-Playa-Viva-ES.pdf  ← PDF base español
└── Dossier-Playa-Viva-EN.pdf  ← PDF base inglés
```

Si faltan, el sistema:

1. ❌ No genera PDF personalizado
2. 📧 Envía alerta a tony@/michael@ (según idioma)
3. 💬 Muestra mensaje al usuario: "Dossier en mejora, intenta en unos minutos"

### Imágenes email

```tree
public/assets/imagenes/
├── Foto_Complejo.png  (240x160px)
├── logo.png           (149x64px)
└── Casino.png         (240x160px)
```

## Próximos pasos sugeridos

1. **Monitoreo inicial** (primera semana producción):

   - Revisar logs Vercel diariamente
   - Confirmar todos los PDFs van a S3
   - Verificar emails llegan consistentemente
   - Validar leads en HubSpot tienen toda la información

2. **Optimizaciones futuras** (opcional):

   - Implementar tests automatizados (Vitest + Playwright)
   - Agregar analytics de descarga de PDFs
   - Versionar templates de email
   - CDN para entrega de PDFs (si volumen es alto)
   - Dashboard de métricas (leads, descargas, reuniones agendadas)

3. **Mantenimiento**:
   - Renovar credenciales S3 cuando expiren
   - Actualizar PDFs base cuando marketing lo requiera
   - Revisar espacio usado en bucket S3 mensualmente
   - Mantener sincronizadas URLs de HubSpot Meetings

## Notas técnicas importantes

- **Fuente personalizada**: Allura-Regular.ttf (must exist in `public/fonts/`)
- **Estilo texto PDF**: Color #8B7355 (dorado-bronce) con sombra negra 65% opacidad
- **Nombres largos**: División automática en 2 líneas si >80% ancho página
- **URLs firmadas S3**: Expiran en 24 horas (renovar si usuario solicita reenvío)
- **ALTCHA TTL**: 5 minutos (300s) - ajustar si usuarios reportan expiración prematura
- **Timeout SMTP**: 30 segundos - suficiente para mail.uniestate.co.uk

---

**Última actualización**: Noviembre 2025
**Estado general**: ✅ Sistema completamente funcional - listo para producción
**Cambios recientes**: Features reestructurada en 4 subsecciones + News carousel actualizado
**Verificación**: npm run lint ✅ | TypeScript ✅ | Responsive design ✅
