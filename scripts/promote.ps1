<#
.SYNOPSIS
  Promociona código entre entornos Anclora (Development → Preview → Production).

.DESCRIPTION
  Script PowerShell completo para gestionar promociones de código entre entornos:
  - Development → Main → Preview
  - Preview → Production
  - Development → Main → Preview → Production (modo full)

  Incluye sistema de SmartBackup:
   - Un backup por día y rama
   - Limpieza automática de backups > 7 días
   - Opción de forzar backup con parámetro -ForceBackup

.PARAMETER Target
  Objetivo de la promoción: preview, production o full

.PARAMETER ForceBackup
  (Opcional) Fuerza la creación de backups incluso si ya existen.

.EXAMPLES
  ./scripts/promote.ps1 preview
  ./scripts/promote.ps1 production
  ./scripts/promote.ps1 full
  ./scripts/promote.ps1 full -ForceBackup
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("preview", "production", "full")]
  [string]$Target,

  [switch]$ForceBackup
)

Write-Host "`n⚓ ANCLORA PROMOTE - Flujo de promoción controlado" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray

# --- Detección de ramas ---
$branches = git branch -r | ForEach-Object { $_.Trim() }

function Detect-Branch($patterns) {
  foreach ($p in $patterns) {
    $match = $branches | Where-Object { $_ -match "origin/$p$" }
    if ($match) { return $p }
  }
  return $null
}

$devBranch = Detect-Branch @("development")
$mainBranch = Detect-Branch @("main","master")
$previewBranch = Detect-Branch @("preview")
$prodBranch = Detect-Branch @("production")

Write-Host "`n📦 Ramas detectadas:"
Write-Host "  🧩 Development: $devBranch"
Write-Host "  🔹 Main:        $mainBranch"
Write-Host "  🌤️ Preview:     $previewBranch"
Write-Host "  🚀 Production:  $prodBranch"

if (-not $devBranch -or -not $mainBranch -or -not $previewBranch -or -not $prodBranch) {
  Write-Host "❌ Faltan ramas esenciales en el repositorio." -ForegroundColor Red
  exit 1
}

# --- Sistema SmartBackup ---
function SmartBackup($branchName, [switch]$ForceBackup) {
  $timestamp = (Get-Date -Format "yyyyMMdd")
  $existingBackup = git branch --list "backup/$branchName-$timestamp"

  if ($existingBackup -and -not $ForceBackup) {
    Write-Host "🟢 Backup ya existe para hoy ($branchName). No se crea otro." -ForegroundColor DarkGreen
    return
  }

  $backupBranch = "backup/$branchName-$timestamp"
  git branch $backupBranch $branchName
  Write-Host "💾 Backup creado: $backupBranch" -ForegroundColor Green

  # Limpieza de backups antiguos (>7 días)
  $cutoff = (Get-Date).AddDays(-7)
  git branch --list "backup/$branchName-*" | ForEach-Object {
    if ($_ -match "backup/$branchName-(\d{8})") {
      $date = [datetime]::ParseExact($matches[1], "yyyyMMdd", $null)
      if ($date -lt $cutoff) {
        git branch -D $_.Trim()
        Write-Host "🧹 Eliminado backup antiguo: $_" -ForegroundColor DarkYellow
      }
    }
  }
}

# --- Merge seguro ---
function Promote-Branches($from, $to, [switch]$ForceBackup) {
  Write-Host "`n🔄 Promoviendo $from → $to..." -ForegroundColor Yellow
  SmartBackup $to -ForceBackup:$ForceBackup
  git fetch origin
  git checkout $to
  git pull origin $to
  git merge origin/$from --no-edit
  if ($LASTEXITCODE -eq 0) {
    git push origin $to
    Write-Host "✔️  Promoción completada: $from → $to" -ForegroundColor Green
  } else {
    Write-Host "⚠️  Conflictos detectados entre $from y $to. Resolver manualmente." -ForegroundColor Red
    exit 1
  }
}

# --- Confirmación principal ---
function Confirm-Action($msg) {
  $input = Read-Host "$msg (s/n)"
  return ($input -in @("s","S"))
}

# --- Ejecución principal ---
switch ($Target) {
  "preview" {
    Write-Host "`n🌤️ Promoción: Development → Main → Preview" -ForegroundColor Cyan
    if (-not (Confirm-Action "¿Confirmas subir los cambios de development hasta preview?")) { exit 0 }

    Promote-Branches $devBranch $mainBranch -ForceBackup:$ForceBackup
    Promote-Branches $mainBranch $previewBranch -ForceBackup:$ForceBackup
  }

  "production" {
    Write-Host "`n🚀 Promoción: Preview → Production" -ForegroundColor Cyan
    if (-not (Confirm-Action "¿Confirmas subir los cambios de preview a producción?")) { exit 0 }

    Promote-Branches $previewBranch $prodBranch -ForceBackup:$ForceBackup
  }

  "full" {
    Write-Host "`n🌍 Promoción completa: Development → Main → Preview → Production" -ForegroundColor Cyan
    if (-not (Confirm-Action "⚠️ Esto promoverá TODOS los cambios de development hasta production. ¿Continuar?")) { exit 0 }

    Promote-Branches $devBranch $mainBranch -ForceBackup:$ForceBackup
    Promote-Branches $mainBranch $previewBranch -ForceBackup:$ForceBackup
    Promote-Branches $previewBranch $prodBranch -ForceBackup:$ForceBackup
  }
}

# --- Registro en log local ---
$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
$logLine = "$timestamp - Promotion executed: $Target (ForceBackup=$ForceBackup)"
Add-Content -Path "./scripts/promotion_log.txt" -Value $logLine

Write-Host "`n🏁 Proceso completado correctamente." -ForegroundColor Cyan
Write-Host "🧾 Log actualizado en scripts/promotion_log.txt"
