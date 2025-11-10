# Contexto del proyecto Playa Viva

## Estado actual
- La landing sigue basada en Next.js 16 con App Router; `app/page.tsx` es el único Client Component que controla hero, CTA, formularios y las animaciones en ambos idiomas.
- El formulario “Dossier Exclusivo” consume `app/api/submit-lead/route.ts`, que ahora:
  1. valida tokens ALTCHA mediante `lib/altcha.ts`,
  2. envía los datos a HubSpot,
  3. personaliza el PDF base (o alerta si falta) y lo guarda en `DOSSIER_LOCAL_DIR` o en S3 (según `env`),
  4. dispara los correos (Resend) con el dossier o, si falta el PDF, envía alertas urgentes en español/inglés.
- `lib/dossier-storage.ts` gestiona la ruta local, normaliza separadores y decide el modo de almacenamiento según las variables (`DOSSIER_LOCAL_DIR`, `FORCE_S3_STORAGE`, `VERCEL`, etc.).
- ALTCHA ya es el único CAPTCHA activo: `/api/altcha/challenge` genera retos firmados internamente, el widget `<altcha-widget>` los consume y `submit-lead` los verifica antes de procesar el lead. Ya no se importa nada de Google.

## Qué se ha corregido
- Se implementó `lib/altcha.ts` porque `altcha/server` no existía; ahora generamos retos HMAC, validamos payloads y respetamos el TTL (`ALTCHA_CHALLENGE_TTL`).
- Actualización completa del flujo: reto, verificación, formulario, PDF, emails de entrega y alertas cuando falta el PDF base. En caso de sonar la alerta, se envía un email urgente a Toni (español) o a Michael (inglés) y el usuario recibe un aviso amistoso.
- Normalización de `DOSSIER_LOCAL_DIR` y respeto a  `/` en Windows para que `personalizePDF` escriba en `C:/Users/...` sin perderse en `C:Users`.
- El README y `AGENTS.md` ya recogen la guía de comandos, variables y convenciones necesarias para trabajar con ALTCHA y el dossier.

## Lo que sigue fallando o por vigilar
- El CTA del dossier todavía debe pulirse: el widget ALTCHA debe anclarse a esa sección, mantener el diseño premium que se ve en `Captura_1.png` y no flotar en el resto del scroll (el check debe quedar limitado al card).
- Los scripts de `CTA_ReCaptcha_Claude` son documentación histórica; si se reevalúan, archivarlos para evitar confusión.
- El PDF base debe existir en `public/assets/dossier/`; si falta, el servicio responde con el aviso y se dispara la alerta de Resend. Hay que comprobar antes del deploy que ese fichero está presente en el repo y en producción.

## Qué falta probar antes del push principal / pruebas pendientes
1. Validar en local (y luego en `main`→`v0`) que el dossier se genera en `DOSSIER_LOCAL_DIR` con el nuevo `ALTCHA_SECRET` y que el log imprime la ruta correcta sin escape. `npm run dev` + formulario + revisar carpeta `C:/Users/...`.
2. Confirmar que `ALTCHA_SECRET` (y opcionalmente `ALTCHA_CHALLENGE_TTL`) están configuradas en Vercel y que el despliegue no arroja `Module not found` ni errores de verificación.
3. Probar la alerta de “PDF base ausente” retirando temporalmente `Dossier-Personalizado.pdf` para asegurar que se envía el email en el idioma correcto y que la landing muestra el mensaje suave en lugar de un 500.
4. QA visual: confirmar en desktop y mobile que el CTA permanece en la sección del dossier y que el widget sigue el estilo dorado/marrón del resto de la landing.

## Notas para el deploy y próximos movimientos
- Antes de subir a `main` o al bot `v0`, asegúrate de: (a) tener `ALTCHA_SECRET` / `ALTCHA_CHALLENGE_TTL` en `.env.local` y en Vercel; (b) que `DOSSIER_LOCAL_DIR` apunta a `C:/Users/Usuario/Documents/Dossiers_Personalizados_PlayaViva` (o al equivalente del entorno); (c) el PDF base está en `public/assets/dossier/`.
- La próxima vez que hagas un deploy de pruebas, actúa como lead real: rellena formulario, verifica que el correo de dossier llega y que el archivo se guarda localmente o en S3 según las variables utilzadas.
*** End Patch***
