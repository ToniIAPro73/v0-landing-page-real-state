# Contexto del proyecto Playa Viva

## Situación actual (10 nov 2025)
- El landing corre sobre Next.js 16 con App Router; `app/page.tsx` sigue siendo un único Client Component que controla idioma (`es`/`en`), animaciones y los CTA principales.
- El formulario “Dossier Exclusivo” alimenta `/app/api/submit-lead/route.ts`, que: 1) envía el lead a HubSpot, 2) personaliza el PDF base con `pdf-lib`, 3) guarda el dossier en `C:\Users\<usuario>\Documents\Dossiers_Personalizados_PlayaViva` (o la ruta indicada por `DOSSIER_LOCAL_DIR`) y 4) intenta subirlo a S3 si estamos en Vercel o si `FORCE_S3_STORAGE` está activo. El correo de entrega se envía vía Resend cuando la API key existe.
- El CTA ya no requiere checkbox: se añadió reCAPTCHA Enterprise invisible. En `app/page.tsx` se carga el script `enterprise.js`, se ejecuta `grecaptcha.enterprise.execute` al enviar y se adjunta el token en `orchestrateLeadAutomation`. En el backend, `app/api/submit-lead/route.ts` llama al endpoint de Google (`assessments`) y rechaza cualquier score < 0.5 antes de personalizar el PDF o contactar HubSpot.
- `lib/dossier-storage.ts` y `tests/dossier-storage.test.ts` ya cubren la lógica de detección local vs. S3; las pruebas con Vitest validan que los flags `VERCEL`, `FORCE_S3_STORAGE` y `DISABLE_S3_STORAGE` se respetan.
- Las variables sensibles están documentadas en `.env.example`. Al clonar el repo hay que copiarlo a `.env.local` y definir al menos HubSpot, Resend y las credenciales S3 antes de probar en producción.
- Se añadió `AGENTS.md` en la raíz como guía corta para colaboradores. Resume estructura de carpetas, comandos principales y expectativas para commits/PR, por lo que ya podemos derivar tareas sin repetir instrucciones básicas.

## Trabajo realizado hoy
- Se creó y documentó `AGENTS.md`, lo que deja formalizada la guía de contribución “Repository Guidelines”.
- Se revisó `app/api/submit-lead/route.ts` y el helper de almacenamiento para confirmar que los mensajes de depuración y los fallbacks (local ↔ S3) siguen vigentes tras las últimas pruebas.
- Se integró reCAPTCHA Enterprise extremo a extremo: nuevas env vars (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_API_KEY`), carga del script en cliente y validación del token en el endpoint antes de tocar HubSpot/PDF/S3.

## Dónde estamos / próximos focos
1. **UI de `app/page.tsx`**: continúan pendientes los retoques del bloque CTA Dossier para alinear copy largo, proporciones de inputs y padding con las capturas de referencia (`Captura.png`). No se ha tocado desde la última nota, así que el layout sigue algo más alto de lo deseado.
2. **QA visual y responsive**: una vez ajustado el card, validar en desktop (100 % zoom) y mobile para asegurarse de que el hero y el formulario no introducen scroll adicional. Confirmar que el mensaje de seguridad reemplaza correctamente al antiguo checkbox en todos los breakpoints.
3. **Despliegues**: al subir a Vercel, asegurarse de replicar las nuevas variables (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_API_KEY`, `RECAPTCHA_PROJECT_ID`) junto con `RESEND_API_KEY` y las credenciales S3 para que la validación y la entrega de PDFs sigan funcionando.
4. **Sincronización con marketing**: cuando se actualice copy o recursos, ejecutar `pwsh -File scripts/sync_all.ps1` para mantener los textos legales y CTAs compartidos con el equipo comercial.
