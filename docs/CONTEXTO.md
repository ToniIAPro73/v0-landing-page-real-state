# Contexto del proyecto Playa Viva

## Situación actual (10 nov 2025)
- El landing corre sobre Next.js 16 con App Router; `app/page.tsx` sigue siendo un único Client Component que controla idioma (`es`/`en`), animaciones y los CTA principales.
- El formulario “Dossier Exclusivo” alimenta `/app/api/submit-lead/route.ts`, que: 1) envía el lead a HubSpot, 2) personaliza el PDF base con `pdf-lib`, 3) guarda el dossier en `C:\Users\<usuario>\Documents\Dossiers_Personalizados_PlayaViva` (o la ruta indicada por `DOSSIER_LOCAL_DIR`) y 4) intenta subirlo a S3 si estamos en Vercel o si `FORCE_S3_STORAGE` está activo. El correo de entrega se envía vía Resend cuando la API key existe.
- El CTA ya no depende de Google: se reemplazó reCAPTCHA v3 por ALTCHA autoalojado. El widget (`<altcha-widget>`) vive dentro del formulario, obtiene retos de `/api/altcha/challenge` y envía el payload `altcha_payload`. En el backend `app/api/submit-lead/route.ts` valida con el helper local `verifyAltchaPayload` (firma HMAC + expiración embebida en la sal) antes de seguir con HubSpot o la personalización del dossier.
- `lib/dossier-storage.ts` y `tests/dossier-storage.test.ts` ya cubren la lógica de detección local vs. S3; las pruebas con Vitest validan que los flags `VERCEL`, `FORCE_S3_STORAGE` y `DISABLE_S3_STORAGE` se respetan.
- Las variables sensibles están documentadas en `.env.example`. Al clonar el repo hay que copiarlo a `.env.local` y definir al menos HubSpot, Resend y las credenciales S3 antes de probar en producción.
- Se añadió `AGENTS.md` en la raíz como guía corta para colaboradores. Resume estructura de carpetas, comandos principales y expectativas para commits/PR, por lo que ya podemos derivar tareas sin repetir instrucciones básicas.

## Trabajo realizado hoy
- Se creó y documentó `AGENTS.md`, lo que deja formalizada la guía de contribución “Repository Guidelines”.
- Se revisó `app/api/submit-lead/route.ts` y el helper de almacenamiento para confirmar que los mensajes de depuración y los fallbacks (local ↔ S3) siguen vigentes tras las últimas pruebas.
- Se migró la protección del formulario a ALTCHA: se creó el endpoint `/api/altcha/challenge`, se añadió el widget en `app/page.tsx`, se instaló la librería `altcha` y se introdujo la nueva env `ALTCHA_SECRET` para firmar/verificar challenges. El código de Google quedó eliminado del repositorio.
- Derivado del bug de build en Vercel (“module not found: altcha/server”), se implementó `lib/altcha.ts`, que genera retos compatibles y verifica los payloads sin depender de módulos inexistentes del paquete. `/api/altcha/challenge` y `/api/submit-lead` ya consumen ese helper.

## Dónde estamos / próximos focos
1. **CTA Dossier (sección PDF)**: falta bloquear que el widget ALTCHA solo aparezca cuando el usuario llega a la sección y permanezca anclado allí (similar al comportamiento referenciado en `Captura_1.png`). Se debe mantener la estética premium: fondo dorado, detalles marrones y copy ajustado para que no parezca un elemento flotante por defecto.
2. **Accesos y estilos**: CTA_ReCaptcha_Claude (scripts) ya no se invoca, pero conviene revisar qué fragmentos siguen siendo útiles como documentación para el nuevo flujo ALTCHA o si deben archivarse. Evitar modificaciones en otras secciones hasta que el diseño de la tarjeta y el nuevo widget estén validados con producto.
3. **QA visual y responsive**: una vez ajustado el card, validar en desktop (100 % zoom) y mobile para asegurarse de que el hero y el formulario no introducen scroll adicional. Confirmar que las traducciones del widget se cargan bien (se inyecta `altcha/i18n/all` en cliente) y que no hay warnings en consola.
4. **Despliegues**: al subir a Vercel, asegurarse de replicar `ALTCHA_SECRET` junto con `RESEND_API_KEY` y las credenciales S3 para que la validación y la entrega de PDFs sigan funcionando. Registrar también `ALTCHA_CHALLENGE_TTL` si se quiere ajustar expira­ción.
5. **Sincronización con marketing**: cuando se actualice copy o recursos, ejecutar `pwsh -File scripts/sync_all.ps1` para mantener los textos legales y CTAs compartidos con el equipo comercial.
