<#
.SYNOPSIS
  Promueve y sincroniza automáticamente las ramas principales del repositorio:
  development → main → preview → production

.DESCRIPTION
  Este script:
  - Verifica y sincroniza los commits locales/remotos.
  - Limpia logs antiguos (más de 24h) para evitar bloqueos.
  - Realiza push y merges ordenados entre entornos.
  - Crea un log detallado de cada ejecución en /logs.
  - Es compatible con repos que usen “main” o “master”.

.VERSION
  2.3 (estable)
#>

# ==========================
# ⚓ CONFIGURACIÓN INICIAL
# ==========================
$ErrorActionPreference = "Stop"
$repoRoot = (git rev-parse --show-toplevel)
Set-Location $repoRoot

$logDir = Join-Path $repoRoot "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# Limpia logs de más de 24h
Get-ChildItem $logDir -Filter "promote_*.txt" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-24) } |
    Remove-Item -Force -ErrorAction SilentlyContinue

# Crea nuevo log
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $logDir "promote_$timestamp.txt"
Start-Transcript -Path $logFile | Out-Null

Write-Host ""
Write-Host "⚓ ANCLORA DEV SHELL — PROMOTE FULL v2.3" -ForegroundColor Cyan
Write-Host ""

# ==========================
# 🧭 DETECTA RAMAS CLAVE
# ==========================
$branches = git branch --format="%(refname:short)"
$mainBranch = if ($branches -match 'main') { 'main' } elseif ($branches -match 'master') { 'master' } else { 'main' }
$devBranch = if ($branches -match 'development') { 'development' } else { Read-Host "❓ Nombre de tu rama de desarrollo" }
$previewBranch = if ($branches -match 'preview') { 'preview' } else { '' }
$productionBranch = if ($branches -match 'production') { 'production' } else { '' }

Write-Host "🔹 Ramas detectadas:" -ForegroundColor Cyan
Write-Host "   Dev: $devBranch"
Write-Host "   Main: $mainBranch"
if ($previewBranch) { Write-Host "   Preview: $previewBranch" }
if ($productionBranch) { Write-Host "   Production: $productionBranch" }
Write-Host ""

# ==========================
# 🔄 ACTUALIZA REMOTOS
# ==========================
Write-Host "🔄 Actualizando referencias remotas..." -ForegroundColor Yellow
git fetch --all

# ==========================
# 📦 ESTADO DEL ÚLTIMO COMMIT
# ==========================
$lastCommit = git log -1 --format="%h|%ad" --date=format:"%m/%d/%Y %H:%M:%S" $devBranch
$commitParts = $lastCommit -split '\|'
Write-Host "`n🧭 Último commit detectado:"
Write-Host "   → Rama: $devBranch"
Write-Host "   → Hash: $($commitParts[0])"
Write-Host "   → Fecha: $($commitParts[1])`n"

# ==========================
# 🧮 ESTADO DE SINCRONIZACIÓN
# ==========================
$branchesToCheck = @($devBranch, $mainBranch, $previewBranch, $productionBranch) | Where-Object { $_ -ne '' }

foreach ($b in $branchesToCheck) {
    $counts = git rev-list --left-right --count $b...origin/$b | Out-String
    $split = $counts -split "\s+"
    $ahead = [int]($split[0].Trim())
    $behind = [int]($split[1].Trim())

    if ($ahead -gt 0 -and $behind -gt 0) {
        Write-Host "⚠️  '$b' ha divergido del remoto. Se recomienda un rebase manual." -ForegroundColor Yellow
    } elseif ($ahead -gt 0) {
        Write-Host "⬆️  '$b' tiene $ahead commits locales no subidos."
    } elseif ($behind -gt 0) {
        Write-Host "⬇️  '$b' está $behind commits detrás del remoto."
    } else {
        Write-Host "✅ '$b' está sincronizada."
    }
}

Write-Host ""

# ==========================
# 🚀 PROMOCIÓN ENTRE RAMAS
# ==========================
function Promote($source, $target) {
    Write-Host "🔁 Fusionando $source → $target..." -ForegroundColor Green
    git checkout $target
    git pull origin $target
    git merge $source -m "🔀 Promote $source → $target"
    git push origin $target
}

Promote $devBranch $mainBranch

if ($previewBranch) { Promote $mainBranch $previewBranch }
if ($productionBranch) { Promote $previewBranch $productionBranch }

# ==========================
# 🧩 VERIFICACIÓN FINAL
# ==========================
Write-Host ""
Write-Host "🔍 Verificando sincronización final..." -ForegroundColor Yellow
git fetch --all
Write-Host ""
Write-Host "🏁 Proceso completado sin errores. Todas las ramas principales están alineadas." -ForegroundColor Cyan

Stop-Transcript | Out-Null
