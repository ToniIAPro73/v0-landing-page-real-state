<#
.SYNOPSIS
  Sincronización universal entre la rama actual y la rama principal (main/master).
  - Detecta automáticamente si la rama principal se llama 'main' o 'master'.
  - Actualiza el remoto.
  - Rebase de la rama actual sobre la principal.
  - Merge bidireccional para garantizar igualdad total.
  - Sincroniza opcionalmente ramas espejo (como v0/).
  - Evita divergencias, commits behind/ahead y PR vacíos.

.DESCRIPTION
  Ejecutar desde la raíz de cualquier repositorio:
      ./sync_all.ps1

  El script detectará automáticamente la configuración y dejará ambas ramas (principal y actual)
  perfectamente sincronizadas, tanto en contenido como en historial.
#>

Write-Host "`n⚓ Iniciando sincronización inteligente de repositorio..." -ForegroundColor Cyan

# 1️⃣ Validar entorno Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ No estás dentro de un repositorio Git." -ForegroundColor Red
    exit 1
}

# 2️⃣ Detectar rama actual
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $currentBranch) {
    Write-Host "❌ No se pudo detectar la rama actual." -ForegroundColor Red
    exit 1
}
Write-Host "📍 Rama actual: $currentBranch" -ForegroundColor Yellow

# 3️⃣ Detectar si la principal es 'main' o 'master'
$mainBranch = if ((git branch -r | Select-String "origin/main")) { "main" } else { "master" }
Write-Host "🔹 Rama principal detectada: $mainBranch" -ForegroundColor Cyan

if ($currentBranch -eq $mainBranch) {
    Write-Host "⚠️ Estás en la rama principal. No hay nada que sincronizar." -ForegroundColor DarkYellow
    exit 0
}

# 4️⃣ Fetch general
Write-Host "`n🔄 Actualizando referencias remotas..." -ForegroundColor Cyan
git fetch origin

# 5️⃣ Actualizar rama principal
Write-Host "`n🧭 Alineando $mainBranch con remoto..." -ForegroundColor Cyan
git checkout $mainBranch
git pull origin $mainBranch

# 6️⃣ Rebase de la rama actual sobre la principal
Write-Host "`n🔧 Rebasing $currentBranch sobre $mainBranch..." -ForegroundColor Cyan
git checkout $currentBranch
git rebase $mainBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Conflictos detectados durante rebase. Corrige y ejecuta 'git rebase --continue'." -ForegroundColor Red
    exit 1
}

# 7️⃣ Merge rama → principal
Write-Host "`n🔁 Fusionando $currentBranch → $mainBranch..." -ForegroundColor Cyan
git checkout $mainBranch
git merge $currentBranch --no-ff -m "Auto-sync: merge $currentBranch into $mainBranch"
git push origin $mainBranch

# 8️⃣ Merge principal → rama (para dejar ambas idénticas)
Write-Host "`n🔁 Fusionando $mainBranch → $currentBranch..." -ForegroundColor Cyan
git checkout $currentBranch
git merge $mainBranch --no-ff -m "Auto-sync: merge $mainBranch into $currentBranch"
git push origin $currentBranch --force-with-lease

# 9️⃣ Sincronizar rama v0 (si existe)
$v0Branch = (git branch -r | Select-String "origin/v0" | ForEach-Object { ($_ -split '/')[1] } | Select-Object -First 1)
if ($v0Branch) {
    Write-Host "`n⚓ Sincronizando rama espejo v0 ($v0Branch)..." -ForegroundColor Cyan
    git fetch origin $v0Branch
    git checkout $v0Branch 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout -b $v0Branch origin/$v0Branch
    }
    git pull origin $v0Branch
    git merge $mainBranch --no-ff -m "Auto-sync: merge $mainBranch into $v0Branch"
    git push origin $v0Branch
} else {
    Write-Host "`nℹ️ No se encontró rama tipo v0/* — se omite esta parte." -ForegroundColor DarkGray
}

# 🔟 Verificación final
Write-Host "`n🔍 Verificando sincronización final..." -ForegroundColor Cyan
$statusMain  = git rev-parse origin/$mainBranch
$statusLocal = git rev-parse origin/$currentBranch

if ($statusMain -eq $statusLocal) {
    Write-Host "`n✅ Ramas '$currentBranch' y '$mainBranch' perfectamente sincronizadas (sin ahead/behind)." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ GitHub aún detecta diferencias de historial. Ejecuta un rebase manual si el mensaje persiste." -ForegroundColor DarkYellow
}

Write-Host "`n🏁 Proceso completado." -ForegroundColor Cyan
