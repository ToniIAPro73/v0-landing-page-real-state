<#
.SYNOPSIS
  Asistente interactivo de recuperación y respaldo para ramas Git (versión extendida Anclora).

.DESCRIPTION
  Permite:
   1️⃣ Restaurar main/master desde otra rama (Claude, feature, etc.)
   2️⃣ Restaurar una rama desde main/master
   3️⃣ Crear una copia de seguridad (backup) de cualquier rama antes de sobrescribirla

  Detección automática de main/master y confirmaciones interactivas seguras.
  Ideal para mantener sincronía total entre ramas en entornos con bots o CI/CD.
#>

Write-Host "`n⚓ ANCLORA GIT RECOVER - Asistente de restauración y respaldo de ramas" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray

# 1️⃣ Validar entorno
if (-not (Test-Path ".git")) {
    Write-Host "❌ No estás dentro de un repositorio Git." -ForegroundColor Red
    exit 1
}

# 2️⃣ Detectar rama principal (main o master)
$mainBranch = if (git branch -r | Select-String "origin/main") { "main" } elseif (git branch -r | Select-String "origin/master") { "master" } else { "" }
if (-not $mainBranch) {
    Write-Host "❌ No se detectó rama principal (main o master)." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Rama principal detectada: $mainBranch" -ForegroundColor Cyan

# 3️⃣ Menú principal
Write-Host "`nSelecciona la acción que deseas realizar:" -ForegroundColor Yellow
Write-Host "  1️⃣  Restaurar $mainBranch desde otra rama (Claude, feature, etc.)" -ForegroundColor White
Write-Host "  2️⃣  Restaurar una rama desde $mainBranch" -ForegroundColor White
Write-Host "  3️⃣  Crear copia de seguridad de una rama (backup)" -ForegroundColor White
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray

$choice = Read-Host "Introduce 1, 2 o 3"

switch ($choice) {

    # --- OPCIÓN 1 ---
    1 {
        $sourceBranch = Read-Host "🔹 Escribe el nombre de la rama buena (ej: claude/playa-viva...)"
        if (-not (git show-ref --verify --quiet "refs/heads/$sourceBranch")) {
            Write-Host "❌ La rama '$sourceBranch' no existe localmente. Ejecuta 'git fetch' primero." -ForegroundColor Red
            exit 1
        }

        $confirm = Read-Host "`n⚠️ Esto SOBRESCRIBIRÁ '$mainBranch' con el contenido de '$sourceBranch'. ¿Continuar? (s/n)"
        if ($confirm -notin @("s", "S")) { Write-Host "❌ Operación cancelada."; exit 0 }

        # Crear copia de seguridad automática antes de restaurar
        $backupBranch = "backup/$mainBranch-" + (Get-Date -Format "yyyyMMdd-HHmmss")
        git branch $backupBranch $mainBranch
        Write-Host "💾 Copia de seguridad creada: $backupBranch" -ForegroundColor Green

        Write-Host "`n🔄 Actualizando remoto..."
        git fetch origin

        Write-Host "🧭 Cambiando a $mainBranch..."
        git checkout $mainBranch
        git pull origin $mainBranch

        Write-Host "`n🔧 Copiando contenido de $sourceBranch → $mainBranch..."
        git checkout $sourceBranch -- .

        git add .
        $commitMsg = "🔄 Restore $mainBranch from $sourceBranch (Anclora Git Recover)"
        git commit -m $commitMsg

        Write-Host "`n🚀 Subiendo restauración a remoto ($mainBranch)..."
        git push origin $mainBranch --force-with-lease

        Write-Host "`n✅ Restauración completada: '$mainBranch' ahora contiene el contenido de '$sourceBranch'." -ForegroundColor Green
        Write-Host "🔙 Copia de seguridad disponible: '$backupBranch'." -ForegroundColor Green
    }

    # --- OPCIÓN 2 ---
    2 {
        $targetBranch = Read-Host "🔹 Escribe el nombre de la rama a restaurar (ej: claude/playa-viva...)"

        if (-not (git show-ref --verify --quiet "refs/heads/$targetBranch")) {
            Write-Host "ℹ️ La rama '$targetBranch' no existe localmente. Creándola desde $mainBranch..." -ForegroundColor Yellow
            git checkout -b $targetBranch $mainBranch
        } else {
            Write-Host "🧭 Cambiando a la rama $targetBranch..." -ForegroundColor Cyan
            git checkout $targetBranch
        }

        $confirm = Read-Host "`n⚠️ Esto SOBRESCRIBIRÁ '$targetBranch' con el contenido de '$mainBranch'. ¿Continuar? (s/n)"
        if ($confirm -notin @("s", "S")) { Write-Host "❌ Operación cancelada."; exit 0 }

        # Crear copia de seguridad antes de sobrescribir
        $backupBranch = "backup/$targetBranch-" + (Get-Date -Format "yyyyMMdd-HHmmss")
        git branch $backupBranch $targetBranch
        Write-Host "💾 Copia de seguridad creada: $backupBranch" -ForegroundColor Green

        Write-Host "`n🔧 Copiando contenido de $mainBranch → $targetBranch..."
        git checkout $mainBranch -- .

        git add .
        $commitMsg = "🔄 Restore $targetBranch from $mainBranch (Anclora Git Recover)"
        git commit -m $commitMsg

        Write-Host "`n🚀 Subiendo restauración a remoto ($targetBranch)..."
        git push origin $targetBranch --force-with-lease

        Write-Host "`n✅ Restauración completada: '$targetBranch' contiene el contenido de '$mainBranch'." -ForegroundColor Green
        Write-Host "🔙 Copia de seguridad disponible: '$backupBranch'." -ForegroundColor Green
    }

    # --- OPCIÓN 3 ---
    3 {
        $branchToBackup = Read-Host "🗃️  Escribe el nombre de la rama que deseas respaldar"
        if (-not (git show-ref --verify --quiet "refs/heads/$branchToBackup")) {
            Write-Host "❌ La rama '$branchToBackup' no existe localmente. Ejecuta 'git fetch' primero." -ForegroundColor Red
            exit 1
        }

        $backupBranch = "backup/$branchToBackup-" + (Get-Date -Format "yyyyMMdd-HHmmss")
        git branch $backupBranch $branchToBackup
        Write-Host "`n💾 Copia de seguridad creada correctamente: $backupBranch" -ForegroundColor Green
    }

    default {
        Write-Host "❌ Opción no válida. Ejecuta de nuevo el script." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🏁 Proceso finalizado correctamente." -ForegroundColor Cyan
