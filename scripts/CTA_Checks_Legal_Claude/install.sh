#!/bin/bash

# Script de instalación rápida para integración Playa Viva + HubSpot
# Uso: bash install.sh

set -e  # Exit on error

echo "🚀 Iniciando instalación de integración Playa Viva + HubSpot..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en la raíz del proyecto Next.js
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Por favor, ejecuta este script desde la raíz de tu proyecto Next.js"
    exit 1
fi

echo -e "${GREEN}✅ Detectado proyecto Next.js${NC}"
echo ""

# Paso 1: Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p src/app/api/submit-lead
mkdir -p public/dossiers
mkdir -p scripts

echo -e "${GREEN}✅ Directorios creados${NC}"
echo ""

# Paso 2: Verificar que los archivos están disponibles
echo "📄 Verificando archivos necesarios..."

files_to_check=("page.tsx" "route.ts" "personalizar_dossier.py")
missing_files=()

for file in "${files_to_check[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ Faltan archivos:${NC}"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Por favor, descarga todos los archivos y colócalos en la misma carpeta que este script."
    exit 1
fi

echo -e "${GREEN}✅ Todos los archivos necesarios están presentes${NC}"
echo ""

# Paso 3: Mover archivos a sus ubicaciones
echo "📦 Moviendo archivos..."

# Backup de page.tsx existente
if [ -f "src/app/page.tsx" ]; then
    echo -e "${YELLOW}⚠️  Creando backup de page.tsx existente...${NC}"
    cp src/app/page.tsx src/app/page.tsx.backup
    echo -e "${GREEN}   Backup guardado: src/app/page.tsx.backup${NC}"
fi

# Copiar archivos
cp page.tsx src/app/page.tsx
cp route.ts src/app/api/submit-lead/route.ts
cp personalizar_dossier.py scripts/personalizar_dossier.py

echo -e "${GREEN}✅ Archivos copiados correctamente${NC}"
echo ""

# Paso 4: Verificar variables de entorno
echo "🔐 Verificando variables de entorno..."

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  No se encontró .env.local${NC}"
    echo "Creando .env.local con plantilla..."
    
    cat > .env.local << 'EOF'
# HubSpot
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=147219365
HUBSPOT_FORM_GUID=34afefab-a031-4516-838e-f0edf0b98bc7

# Site URL
NEXT_PUBLIC_SITE_URL=https://landing-page-playa-viva.vercel.app

# Email Service (opcional)
# RESEND_API_KEY=re_xxxxx
# SENDGRID_API_KEY=SG.xxxxx
EOF

    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
    echo -e "${YELLOW}   Por favor, revisa y actualiza las variables según sea necesario${NC}"
else
    echo -e "${GREEN}✅ .env.local ya existe${NC}"
fi
echo ""

# Paso 5: Verificar Python (opcional)
echo "🐍 Verificando Python..."

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python instalado: $PYTHON_VERSION${NC}"
    
    echo "   Instalando dependencias Python..."
    cd scripts
    python3 -m pip install requests pypdf --quiet 2>/dev/null || {
        echo -e "${YELLOW}   ⚠️  No se pudieron instalar dependencias automáticamente${NC}"
        echo "   Ejecuta manualmente: cd scripts && pip install requests pypdf"
    }
    cd ..
else
    echo -e "${YELLOW}⚠️  Python no encontrado${NC}"
    echo "   La personalización de PDF no estará disponible sin Python"
    echo "   Para instalar Python: https://www.python.org/downloads/"
fi
echo ""

# Paso 6: Verificar Node.js y dependencias
echo "📦 Verificando dependencias Node.js..."

if [ -f "package-lock.json" ] || [ -f "yarn.lock" ] || [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✅ Gestor de paquetes detectado${NC}"
else
    echo -e "${YELLOW}⚠️  No se detectó gestor de paquetes${NC}"
fi
echo ""

# Paso 7: Instrucciones finales
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "                    🎉 INSTALACIÓN COMPLETADA                   "
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Archivos instalados correctamente${NC}"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Revisa y actualiza .env.local con tus configuraciones"
echo ""
echo "2. Coloca tu PDF base en: scripts/Dossier-Personalizado.pdf"
echo "   (Con campo rellenable 'nombre_personalizacion_lead')"
echo ""
echo "3. Inicia el servidor de desarrollo:"
echo "   npm run dev"
echo "   # o"
echo "   yarn dev"
echo ""
echo "4. Prueba el formulario en: http://localhost:3000"
echo ""
echo "5. Verifica en HubSpot que el lead se creó correctamente"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📖 Para más información, lee:"
echo "   - README-INTEGRACION-COMPLETA.md (guía completa)"
echo "   - CAMBIOS-PRINCIPALES.md (qué cambió)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   Si tienes cambios personalizados en page.tsx,"
echo "   revisa el backup: src/app/page.tsx.backup"
echo ""
echo "════════════════════════════════════════════════════════════════"
