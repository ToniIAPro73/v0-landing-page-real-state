<#
.SYNOPSIS
  Promociona código entre entornos Anclora (development → preview / production).

.DESCRIPTION
  Automatiza los pasos de promoción de código con seguridad:
   - Dev → Main → Preview
   - Preview → Production
  Confirmaciones interactivas, merges seguros (--no-edit) y logs automáticos.

.EXAMPLES
  ./scripts/promote.ps1 preview
  ./scripts/promote.ps1 production
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("preview", "production")]
  [string]$Target
)

Write-Host "`n⚓ ANCLORA PROMOTE - Flujo de promoción controlado" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray

# --- Detectar ramas activas ---
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

if (-not $devBranch -or -not $mainBranch) {
  Write-Host "❌ Faltan ramas esenciales (development/main)." -ForegroundColor Red
  exit 1
}

# --- Función auxiliar para merge seguro ---
function Promote-Branches($from, $to) {
  Write-Host "`n🔄 Promoviendo $from → $to..." -ForegroundColor Yellow
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

# --- Lógica principal ---
switch ($Target) {
  "preview" {
    Write-Host "`n🌤️ Promoción: Development → Main → Preview" -ForegroundColor Cyan
    $confirm = Read-Host "¿Confirmas subir los últimos cambios de development a preview? (s/n)"
    if ($confirm -ne "s" -and $confirm -ne "S") { Write-Host "⏭️ Operación cancelada."; exit 0 }

    Promote-Branches $devBranch $mainBranch
    Promote-Branches $mainBranch $previewBranch
  }

  "production" {
    Write-Host "`n🚀 Promoción: Preview → Production" -ForegroundColor Cyan
    $confirm = Read-Host "¿Confirmas subir los cambios de preview a producción? (s/n)"
    if ($confirm -ne "s" -and $confirm -ne "S") { Write-Host "⏭️ Operación cancelada."; exit 0 }

    Promote-Branches $previewBranch $prodBranch
  }
}

# --- Log local ---
$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
$logLine = "$timestamp - Promoción completada ($Target)"
Add-Content -Path "./scripts/promotion_log.txt" -Value $logLine

Write-Host "`n🏁 Proceso de promoción finalizado correctamente." -ForegroundColor Cyan
Write-Host "🧾 Log registrado en scripts/promotion_log.txt"
