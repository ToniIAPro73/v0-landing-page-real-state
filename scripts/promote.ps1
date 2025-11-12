<#
.SYNOPSIS
  Sincroniza todas las ramas principales de Anclora (development, main, preview, production)
  usando como fuente la más reciente según su commit HEAD.

.DESCRIPTION
  Detecta automáticamente cuál rama está más actualizada (según timestamp del último commit).
  Muestra un resumen previo de la acción.
  Luego propaga esa versión a las demás ramas de forma controlada.
#>

Write-Host "⚓ Iniciando promoción completa entre entornos..." -ForegroundColor Cyan
Write-Host ""

# 1️⃣ Variables base
$branches = @("development", "main", "preview", "production")

# 2️⃣ Actualiza referencias remotas
Write-Host "🔄 Actualizando referencias remotas..." -ForegroundColor Yellow
git fetch --all | Out-Null

# 3️⃣ Verifica existencia de ramas
$existingBranches = @()
foreach ($b in $branches) {
    $exists = git branch -r | Select-String "origin/$b"
    if ($exists) { $existingBranches += $b }
}
if ($existingBranches.Count -eq 0) {
    Write-Host "❌ No se encontraron ramas válidas." -ForegroundColor Red
    exit 1
}

# 4️⃣ Determina el commit más reciente por fecha
$commits = @()
foreach ($b in $existingBranches) {
    $hash = git rev-parse "origin/$b"
    $date = git log -1 --format=%ci "origin/$b"
    $commits += [PSCustomObject]@{ Branch=$b; Hash=$hash; Date=[datetime]$date }
}

$latest = $commits | Sort-Object Date -Descending | Select-Object -First 1

Write-Host "🧭 Último commit detectado:"
Write-Host "   → Rama: $($latest.Branch)"
Write-Host "   → Hash: $($latest.Hash.Substring(0,7))"
Write-Host "   → Fecha: $($latest.Date)"
Write-Host ""

# 5️⃣ Confirmación antes de proceder
$confirm = Read-Host "¿Deseas usar '$($latest.Branch)' como fuente para sincronizar las demás ramas? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "⛔ Operación cancelada." -ForegroundColor Red
    exit 0
}

# 6️⃣ Sincroniza las demás ramas
foreach ($b in $existingBranches) {
    if ($b -ne $latest.Branch) {
        Write-Host "🔁 Sincronizando '$b' con '$($latest.Branch)'..."
        git checkout $b | Out-Null
        git pull origin $b | Out-Null
        git merge "origin/$($latest.Branch)" -m "Auto-sync: merge $($latest.Branch) into $b" | Out-Null
        git push origin $b | Out-Null
    }
}

# 7️⃣ Verificación final
Write-Host ""
Write-Host "✅ Verificando sincronización final..." -ForegroundColor Yellow
git fetch --all | Out-Null
$finalHash = git rev-parse "origin/$($latest.Branch)"
$aligned = @()
foreach ($b in $existingBranches) {
    $hash = git rev-parse "origin/$b"
    if ($hash -eq $finalHash) { $aligned += $b }
}
if ($aligned.Count -eq $existingBranches.Count) {
    Write-Host "🎯 Todas las ramas están perfectamente sincronizadas." -ForegroundColor Green
} else {
    Write-Host "⚠️ Algunas ramas no coinciden con la fuente:" -ForegroundColor Yellow
    $mismatch = $existingBranches | Where-Object { $_ -notin $aligned }
    $mismatch | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "🏁 Promoción completa finalizada con éxito." -ForegroundColor Cyan
