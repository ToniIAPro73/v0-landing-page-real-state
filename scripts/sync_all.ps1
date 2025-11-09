<#
.SYNOPSIS
  Sincroniza la rama actual con main y opcionalmente con una rama v0.
  - Actualiza main desde remoto
  - Rebase de la rama actual sobre main
  - Merge de la rama actual → main
  - (Opcional) Merge de main → v0
  - Push de todo de forma segura

.DESCRIPTION
  Ejecutar dentro del repo raíz:
    ./sync_all.ps1
#>

Write-Host "`n⚓ Iniciando sincronización completa de ramas..." -ForegroundColor Cyan

# 1️⃣ Validar entorno Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ No estás dentro de un repositorio Git." -ForegroundColor Red
    exit 1
}

# 2️⃣ Obtener nombre de la rama actual
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "📍 Rama actual: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -eq "main") {
    Write-Host "⚠️ Estás en main. Cambia a tu rama de trabajo para sincronizar." -ForegroundColor DarkYellow
    exit 0
}

# 3️⃣ Actualizar información remota
Write-Host "`n🔄 Fetch de ramas remotas..." -ForegroundColor Cyan
git fetch origin

# 4️⃣ Rebase actual sobre main
Write-Host "`n🧭 Rebase de $currentBranch sobre origin/main..." -ForegroundColor Cyan
git rebase origin/main
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Conflictos detectados durante el rebase." -ForegroundColor Red
    Write-Host "👉 Corrige los archivos marcados, luego ejecuta:" -ForegroundColor Gray
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git rebase --continue" -ForegroundColor Gray
    exit 1
}

# 5️⃣ Subir rama actual
Write-Host "`n🚀 Subiendo rama actual al remoto..." -ForegroundColor Cyan
git push --force-with-lease
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Error al subir la rama actual. Revisa el log." -ForegroundColor Red
    exit 1
}

# 6️⃣ Actualizar y fusionar main
Write-Host "`n🔁 Cambiando a main para actualizar..." -ForegroundColor Cyan
git checkout main
git pull origin main

Write-Host "`n🔧 Fusionando cambios desde $currentBranch → main..." -ForegroundColor Cyan
git merge $currentBranch --no-ff -m "Merge $currentBranch into main (auto-sync)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Error durante el merge. Corrige manualmente y repite." -ForegroundColor Red
    exit 1
}

Write-Host "`n⬆️ Subiendo main actualizado..." -ForegroundColor Cyan
git push origin main

# 7️⃣ Sincronizar rama v0 (si existe)
$v0Branch = "v0/playa-viva-landing-page"
$existsV0 = git branch -r | Select-String "origin/$v0Branch"

if ($existsV0) {
    Write-Host "`n⚓ Sincronizando rama v0 ($v0Branch) con main..." -ForegroundColor Cyan
    git checkout $v0Branch 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Rama v0 no existe localmente, creando..." -ForegroundColor DarkYellow
        git checkout -b $v0Branch origin/$v0Branch
    }
    git pull origin $v0Branch
    git merge main --no-ff -m "Merge main into $v0Branch (auto-sync)"
    git push origin $v0Branch
}
else {
    Write-Host "`nℹ️ No se encontró la rama v0/playa-viva-landing-page, se omitió esta parte." -ForegroundColor DarkGray
}

# 8️⃣ Volver a tu rama original
git checkout $currentBranch
Write-Host "`n✅ Sincronización completa finalizada con éxito." -ForegroundColor Green
