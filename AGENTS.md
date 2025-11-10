# Repository Guidelines

## Project structure & module ownership
- `app/` contiene el App Router; `app/page.tsx` es un único Client Component con todo el hero, la galería y el CTA del dossier, mientras que `app/api` aloja las APIs de `submit-lead` y el challenge ALTCHA.
- `components/` alberga los componentes reutilizables y el sistema de diseño; evita copiar aquí nuevos estilos que no vayan a repetirse.
- `lib/` concentra la lógica compartida. Ahora `lib/dossier-storage.ts` normaliza rutas y detecta cuándo escribir en un directorio o en S3, y `lib/altcha.ts` genera/verifica retos porque `altcha/server` no existe en el paquete.
- `public/assets/dossier/` guarda el PDF base (`Dossier-Personalizado.pdf`) y el fallback `Dossier-Playa-Viva-ES.pdf`; las personalizaciones no viven dentro de `public/`, sino en `DOSSIER_LOCAL_DIR`.
- `docs/` reúne briefing, migraciones y plantillas de email; actualiza `ejemplo_email_respuesta.txt` si el copy cambia.

## Build, test y comandos comunes
- `npm run dev` (después de `pnpm install`) arranca Turbopack; se necesita `ALTCHA_SECRET` más `DOSSIER_LOCAL_DIR` bien definidos antes de abrir la landing.
- `npm run build` valida que App Router + `lib/altcha.ts` compilan (útil antes de PR).
- `npm run start` ejecuta el build localmente igual que en Vercel.
- `npm run lint` es obligatorio si tocas `app/page.tsx`, `lib`, o los handlers API.
- `npm run test` ejecuta Vitest. Añade `-- --watch` para iterar rápido sobre `lib` o helpers.
- `pwsh -File scripts/sync_all.ps1` se ejecuta solo cuando actualizas copy compartido con marketing.

## Estilo y convenciones
- TypeScript + Tailwind. Usa 2 espacios, dobles comillas salvo cuando hacer escape con simple sea más limpio, y `clsx`/`cva` para condicionales.
- Componentes/hooks/providers en PascalCase; helpers utilitarios en camelCase; env vars en SCREAMING_SNAKE_CASE.
- Mantén el ALTCHA widget copia-free, el texto dentro del div del formulario y la estética dorada.

## Guía rápida de pruebas
- Vitest cubre `lib` y APIs. Los tests usan el patrón `vi.stubEnv` y `vi.unstubAllEnvs()` en `beforeEach`.
- Si tocas `submit-lead`, añade un test que simule payloads ALTCHA válidos/rotos o compruebe la lógica de `personalizePDF`.
- Los PRs que afecten lead capture, ALTCHA, dossier o S3 deben incluir un test nuevo o actualizado.

## Commits & PRs
- Usa un subject descriptivo, estilo “app/api/submit-lead: valida ALTCHA antes de personalizar pdf”.
- Documenta la UX para el dossier (texto, guardado local o subida) y deja claro qué entornos deben recibir updates.
- PRs con UI cambian el copy visible + capturas; los fixes de API añaden pasos para reproducir y logs de `personalizePDF`.
- Siempre menciona variables nuevas (`ALTCHA_SECRET`, `DOSSIER_LOCAL_DIR`, `RESEND_API_KEY`, etc.) y en qué entornos configurar (local + Vercel).

## Seguridad & configuración
- Copia `.env.example` a `.env.local` y añade `ALTCHA_SECRET`, `DOSSIER_LOCAL_DIR`, `RESEND_API_KEY`, credenciales S3 y, si el dossier falta, las alertas (`DOSSIER_ALERT_EMAIL_ES`, `DOSSIER_ALERT_EMAIL_EN`).
- Para ALTCHA necesitas: secrets (local + Vercel), `ALTCHA_CHALLENGE_TTL` opcional, y el widget apuntando a `/api/altcha/challenge`.
- El PDF base debe existir en `public/assets/dossier/`; si no, el form devuelve un aviso amable, no un error 500, y te llega una alerta por email (español para leads ES/Martin, inglés para EN/Michael).
*** End Patch**
