# URLs de Deployment en Vercel

## Proyecto: es_latam_landing_page_playa_viva_uniestate

### 🟢 Production (rama `production`)
**URL estable:**
```
https://es-latam-landing-page-playa-viva-uniestate.vercel.app
```

- **Cuándo usar**: Versión pública final para usuarios
- **Cuándo actualizar**: Solo después de probar en Preview
- **Variable de entorno**: `NEXT_PUBLIC_SITE_URL` debe apuntar a esta URL

---

### 🔵 Preview (rama `preview`)
**URL estable:**
```
https://es-latam-landing-page-playa-viva-uniestate-git-preview-toniIAPro73.vercel.app
```

- **Cuándo usar**: Testing y QA antes de producción
- **Cuándo actualizar**: Para probar nuevas funcionalidades
- **Variable de entorno**: `NEXT_PUBLIC_SITE_URL` debe apuntar a esta URL en environment "Preview"

---

### ⚪ Main (rama `main`)
**URL estable:**
```
https://es-latam-landing-page-playa-viva-uniestate-git-main-toniIAPro73.vercel.app
```

- **Cuándo usar**: Development (no recomendado para testing público)
- **Nota**: Actualmente configurado como preview también

---

## Configuración de Variables de Entorno en Vercel

### Para Production:
```bash
NEXT_PUBLIC_SITE_URL=https://es-latam-landing-page-playa-viva-uniestate.vercel.app
```

### Para Preview:
```bash
NEXT_PUBLIC_SITE_URL=https://es-latam-landing-page-playa-viva-uniestate-git-preview-toniIAPro73.vercel.app
```

### Para Development (local):
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Workflow Recomendado

1. **Desarrollar** en rama `claude/*` o feature branches
2. **Merge a `main`** cuando el código esté listo
3. **Merge `main` → `preview`** para testing
4. **Probar en Preview URL** (arriba)
5. **Si todo OK**: Merge `preview` → `production`
6. **Verificar en Production URL** (arriba)

---

## Dashboard del Proyecto

**URL directa al proyecto:**
```
https://vercel.com/toniIAPro73s-projects/es_latam_landing_page_playa_viva_uniestate
```

**Project ID:**
```
prj_9PAqnPJEKvBk0hAQuCuSpVeMPgX5
```

---

## Notas Importantes

- Las URLs con `-git-{branch}-` son **estables** y siempre apuntan al último deployment de esa rama
- Las URLs con hashes aleatorios (`-llklcvuom`) son **específicas** de cada deployment individual
- GitHub Actions/Checks siempre muestran URLs con hash, pero las URLs estables también funcionan
- Puedes agregar dominios personalizados en **Settings → Domains** del proyecto
