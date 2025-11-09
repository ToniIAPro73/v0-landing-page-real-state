# Playa Viva landing page

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/pmi140979-6354s-projects/v0-landing-page-real-state)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/lUsLj88yELz)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/pmi140979-6354s-projects/v0-landing-page-real-state](https://vercel.com/pmi140979-6354s-projects/v0-landing-page-real-state)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/lUsLj88yELz](https://v0.app/chat/lUsLj88yELz)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Linting

Este proyecto utiliza ESLint para mantener la calidad del código.

### Comandos disponibles:

- `npm run lint` - Ejecuta el linter y muestra los errores
- `npm run lint:fix` - Ejecuta el linter y corrige automáticamente los errores que sea posible

### Git Hooks automáticos:

El proyecto está configurado con Husky y lint-staged para ejecutar el linter automáticamente:

- **Pre-commit**: Ejecuta `eslint --fix` solo en los archivos que vas a commitear
- **Pre-push**: Ejecuta `npm run lint` en todo el proyecto antes de hacer push

### Configuración inicial:

Después de clonar el repositorio, ejecuta:

\`\`\`bash
npm install
\`\`\`

Esto instalará todas las dependencias y configurará los hooks de Git automáticamente.

## Desarrollo Local

Para ejecutar el proyecto localmente:

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
