# Repository Guidelines

## Project Structure & Module Organization

- `app/`: rutas App Router de Next 14; cada carpeta agrupa layout, página y componentes asociados.
- `components/`: bloques reutilizables (hero, sliders, tabs) generados en v0 y refinados a mano.
- `lib/`: utilidades (formatos de precios, conversiones metrificadas, helpers de idioma).
- `public/`: imágenes optimizadas, favicon y PDFs listos para servir; subcarpetas `assets/imagenes` y `public-assets-imagenes` cubren galerías y soportes de ventas.
- `styles/`: capa global de Tailwind (`globals.css`) y ajustes específicos (animaciones, efectos hover).

## Build, Test & Development Commands

- `npm install`: instala dependencias (ejecútalo tras cada pull).
- `npm run dev`: servidor local en `http://localhost:3000` con hot reload.
- `npm run lint`: ESLint + TypeScript; no dejes warnings antes de subir cambios.
- `npm run build` y `npm run start`: cadena de producción idéntica a Vercel; úsala para pruebas de humo previas al deploy.

## Coding Style & Naming Conventions

- Componentes funcionales en TypeScript; marca como `use client` solo lo imprescindible.
- Indentación de 2 espacios; strings Tailwind ordenados por bloques semánticos (layout → color → efectos). PascalCase para componentes, camelCase para helpers, hooks prefijados con `use`.
- Mantén assets nuevos en `public/assets/imagenes` comprimidos (<300 KB) y reutiliza efectos de sombra/elevación definidos en Tailwind.

## Testing Guidelines

- No hay suite automatizada aún: valida con `npm run lint` + revisiones manuales en iPhone 12 Pro (vertical/landscape), iPad y desktop 1440 px.
- Documenta en el PR qué tabs (Galería, Apartamentos) y qué idioma revisaste.
- Para lógica en `lib/`, añade pruebas Jest bajo `__tests__/nombre.test.ts`.

## Commit & PR Guidelines

- Commits cortos, imperativos, bilingües si afecta copies (ej. `Refina tabs Apartamentos ES/EN`).
- Cada PR debe incluir: objetivo, secciones impactadas, capturas por breakpoint e idioma, enlace al preview de Vercel y checklist de pruebas manuales.
- Relaciona issues o tareas Notion y menciona a quien deba revisar UX/Contenido antes del merge.

## Optional: Security & Assets

- No expongas claves; usa variables de entorno prefijadas `NEXT_PUBLIC_`.
- Los PDFs (`public-assets/dossier/*.pdf`) deben verificarse tras cada actualización de marketing para evitar enlaces rotos.
