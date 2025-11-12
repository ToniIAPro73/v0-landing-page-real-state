<#
.SYNOPSIS
  ⚓ Anclora Promote Full v2.2
  Sincroniza automáticamente todas las ramas clave del ecosistema Anclora
  (development, main/master, preview y production) de forma segura e inteligente.

.DESCRIPTION
  Este script detecta la rama más actualizada, valida el estado local y remoto,
  crea backups si hay cambios sin commit, resuelve divergencias, y propaga la
  versión confirmada a todas las ramas para mantener el repositorio en equilibrio total.

  ✅ Compatible con repos que usen main o master.
  ✅ Incluye modo Dry-Run.
  ✅ Genera log detallado en ./logs/.
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$timestamp = (Get-Date -Format "yyyy-MM-dd_HH-mm-ss")
$logDir = "logs"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
Start-Transcript -Path "$logDir/promote_$timestamp.txt" | Out-Null

Write-Host "`n⚓ ANCLORA DEV SHELL — PROMOTE FULL v2.2`n" -ForegroundColor Cyan

# 🔧 Definición de ramas
$branches = @("development", "main", "preview", "production")
if (git show-ref --verify --quiet refs/remotes/origin/master) {
    $branches += "master"
}

# 🔄 Actualiza refs
Write-Host "🔄 Actualizando referencias remotas..." -ForegroundColor Yellow
git fetch --all | Out-Null

# 🧩 Verifica que existan
$existing = @()
foreach ($b in $branches) {
    if (git branch -r | Select-String "origin/$b") { $existing += $b }
}
if ($existing.Count -eq 0) {
    Write-Host "❌ No se encontraron ramas válidas." -ForegroundColor Red
    Stop-Transcript | Out-Null; exit 1
}

# 🧱 Check cambios sin commit
if ((git status --porcelain).Length -gt 0) {
    Write-Host "`n⚠️ Hay cambios sin commit en tu entorno local." -ForegroundColor Yellow
    $resp = Read-Host "¿Deseas crear un backup automático antes de continuar? (S/N)"
    if ($resp -match "^[sS]$") {
        git add -A
        git commit -m "🧩 Backup automático previo a promote full ($timestamp)" | Out-Null
    } else {
        Write-Host "⛔ Proceso cancelado para evitar pérdida de cambios." -ForegroundColor Red
        Stop-Transcript | Out-Null; exit 0
    }
}

# 🧭 Determina commit más reciente
$commits = foreach ($b in $existing) {
    $hash = git rev-parse "origin/$b"
    $date = git log -1 --format=%ci "origin/$b"
    [PSCustomObject]@{ Branch=$b; Hash=$hash; Date=[datetime]$date }
}
$latest = $commits | Sort-Object Date -Descending | Select-Object -First 1
Write-Host "`n🧭 Último commit detectado:`n   → Rama: $($latest.Branch)`n   → Hash: $($latest.Hash.Substring(0,7))`n   → Fecha: $($latest.Date)`n"

# 💾 Check commits ahead local
foreach ($b in $existing) {
    $ahead = (git rev-list --left-right --count $b...origin/$b).Split(" ")[0]
    if ([int]$ahead -gt 0) {
        Write-Host "⚠️ '$b' tiene commits locales no subidos." -ForegroundColor Yellow
        $push = Read-Host "¿Deseas hacer push automático ahora? (S/N)"
        if ($push -match "^[sS]$") { git push origin $b | Out-Null }
    }
}

# ⚠️ Divergencia local/remoto
foreach ($b in $existing) {
    $diff = git rev-list --left-right --count origin/$b...$b
    $split = $diff.Split(" ")
    if ([int]$split[0] -gt 0 -and [int]$split[1] -gt 0) {
        Write-Host "🚫 Divergencia detectada en '$b'. Corrige manualmente antes de continuar." -ForegroundColor Red
        Stop-Transcript | Out-Null; exit 1
    }
}

# 🔍 Confirmación antes de propagar
if (-not $DryRun) {
    $confirm = Read-Host "¿Deseas usar '$($latest.Branch)' como fuente y sincronizar las demás? (S/N)"
    if ($confirm -notmatch "^[sS]$") {
        Write-Host "⛔ Operación cancelada." -ForegroundColor Red
        Stop-Transcript | Out-Null; exit 0
    }
}

# 🧪 Modo simulación
if ($DryRun) {
    Write-Host "`n🔬 Modo Dry-Run activado. Estas ramas serían sincronizadas:" -ForegroundColor Yellow
    foreach ($b in $existing) {
        if ($b -ne $latest.Branch) { Write-Host "   → $b ← $($latest.Branch)" }
    }
    Write-Host "`n(No se realizaron cambios reales.)"
    Stop-Transcript | Out-Null; exit 0
}

# 🔁 Sincronización real
foreach ($b in $existing) {
    if ($b -ne $latest.Branch) {
        Write-Host "`n🔁 Sincronizando '$b' con '$($latest.Branch)'..." -ForegroundColor Green
        try {
            git checkout $b | Out-Null
            git pull origin $b | Out-Null
            git merge "origin/$($latest.Branch)" -m "Auto-sync: merge $($latest.Branch) into $b" | Out-Null
            git push origin $b | Out-Null
        } catch {
            Write-Host "❌ Conflicto detectado al fusionar '$($latest.Branch)' → '$b'." -ForegroundColor Red
            Stop-Transcript | Out-Null; exit 1
        }
    }
}

# 🧩 Verificación final
Write-Host "`n🔍 Verificando hashes finales..." -ForegroundColor Yellow
git fetch --all | Out-Null
$finalHash = git rev-parse "origin/$($latest.Branch)"
$aligned = @()
foreach ($b in $existing) {
    $hash = git rev-parse "origin/$b"
    if ($hash -eq $finalHash) { $aligned += $b }
}
if ($aligned.Count -eq $existing.Count) {
    Write-Host "`n✅ Todas las ramas están perfectamente sincronizadas." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Las siguientes ramas difieren:" -ForegroundColor Yellow
    ($existing | Where-Object { $_ -notin $aligned }) | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Stop-Transcript | Out-Null
Write-Host "`n🏁 Proceso finalizado. Log guardado en /logs/promote_$timestamp.txt`n" -ForegroundColor Cyan
