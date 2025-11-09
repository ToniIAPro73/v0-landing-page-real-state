<#
.SYNOPSIS
  Sincroniza la rama actual y main bidireccionalmente.
  - Actualiza main desde remoto
  - Rebase de la rama actual sobre main
  - Merge rama → main
  - Merge main → rama (para igualarlas)
  - Push de ambas ramas
  - Sincroniza también rama v0 (si existe)

.DESCRIPTION
  Ejecutar en la raíz del repo:
    ./sync_all.ps1
#>

Write-Host "`n⚓ Iniciando sincronización completa (rama ↔ main ↔ v0)..." -ForegroundColor Cyan

# 1️⃣ Validar entorno
if (-not (Test-Path ".git")) {
    Write-Host "❌ No estás dentro de un repositorio Git." -ForegroundColor Red
    exit 1
}

# 2️⃣ Identificar rama actual
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "📍 Rama actual: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -eq "main") {
    Write-Host "⚠️ Estás en main. Cambia a tu rama de trabajo y vuelve a ejecutar." -ForegroundColor DarkYellow
    exit 0
}

# 3️⃣ Fetch general
Write-Host "`n🔄 Actualizando información del remoto..." -ForegroundColor Cyan
git fetch origin

# 4️⃣ Actualizar main con remoto
Write-Host "`n🧭 Alineando main con remoto..." -ForegroundColor Cyan
git checkout main
git pull origin main

# 5️⃣ Rebase de tu rama sobre main
Write-Host "`n🔧 Rebasing $currentBranch sobre main..." -ForegroundColor Cyan
git checkout $currentBranch
git rebase origin/main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Conflictos durante rebase. Corrige y ejecuta 'git rebase --continue'." -ForegroundColor Red
    exit 1
}

# 6️⃣ Merge rama → main (tu trabajo hacia main)
Write-Host "`n🔁 Fusionando $currentBranch → main..." -ForegroundColor Cyan
git checkout main
git merge $currentBranch --no-ff -m "Auto-sync: merge $currentBranch into main"
git push origin main

# 7️⃣ Merge main → rama (para dejarlas idénticas)
Write-Host "`n🔁 Fusionando main → $currentBranch..." -ForegroundColor Cyan
git checkout $currentBranch
git merge main --no-ff -m "Auto-sync: merge main into $currentBranch"
git push origin $currentBranch

# 8️⃣ Sincronizar rama v0 si existe
$v0Branch = "v0/playa-viva-landing-page"
$existsV0 = git branch -r | Select-String "origin/$v0Branch"
if ($existsV0) {
    Write-Host "`n⚓ Sincronizando rama v0 ($v0Branch)..." -ForegroundColor Cyan
    git checkout $v0Branch 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout -b $v0Branch origin/$v0Branch
    }
    git pull origin $v0Branch
    git merge main --no-ff -m "Auto-sync: merge main into $v0Branch"
    git push origin $v0Branch
} else {
    Write-Host "`nℹ️ No se encontró la rama v0/playa-viva-landing-page, omitiendo..." -ForegroundColor DarkGray
}

# 9️⃣ Volver a tu rama
git checkout $currentBranch
Write-Host "`n✅ Sincronización completada: main y $currentBranch están 100% alineadas." -ForegroundColor Green
