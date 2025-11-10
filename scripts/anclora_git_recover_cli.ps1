<#
.SYNOPSIS
  Restaurador automático de ramas Git (modo CLI, sin menú interactivo).

.DESCRIPTION
  Permite restaurar o respaldar ramas directamente mediante parámetros, 
  pensado para CI/CD, tareas automatizadas o scripts personalizados.

.PARAMETER Mode
  Modo de operación:
    - mainFromBranch : restaura main/master desde una rama fuente
    - branchFromMain : restaura una rama desde main/master
    - backup         : crea una copia de seguridad de una rama

.PARAMETER Source
  Rama fuente (por ejemplo, "claude/playa-viva-landing-page...").

.PARAMETER Target
  Rama destino (opcional; detecta automáticamente main/master según el modo).

.PARAMETER AutoConfirm
  Si se establece en $true, omite confirmaciones interactivas.

.EXAMPLE
  ./anclora_git_recover_cli.ps1 -Mode mainFromBranch -Source "claude/playa-viva..." -AutoConfirm $true
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("mainFromBranch", "branchFromMain", "backup")]
    [string]$Mode,

    [Parameter(Mandatory = $false)]
    [string]$Source,

    [Parameter(Mandatory = $false)]
    [string]$Target,

    [Parameter(Mandatory = $false)]
    [bool]$AutoConfirm = $false
)

Write-Host "`n⚓ ANCLORA GIT RECOVER CLI - Modo automatizado" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray

# 1️⃣ Validar entorno
if (-not (Test-Path ".git")) {
    Write-Host "❌ No estás dentro de un repositorio Git." -ForegroundColor Red
    exit 1
}

# 2️⃣ Detectar rama principal
$mainBranch = if (git branch -r | Select-String "origin/main") { "main" } elseif (git branch -r | Select-String "origin/master") { "master" } else { "" }
if (-not $mainBranch) {
    Write-Host "❌ No se detectó rama principal (main o master)." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Rama principal detectada: $mainBranch" -ForegroundColor Cyan

# 3️⃣ Confirmación condicional
function Confirm-Action($msg) {
    if ($AutoConfirm) { return $true }
    $input = Read-Host "$msg (s/n)"
    return ($input -in @("s", "S"))
}

# 4️⃣ Funciones auxiliares
function Backup-Branch($branchName) {
    $timestamp = (Get-Date -Format "yyyyMMdd-HHmmss")
    $backupBranch = "backup/$branchName-$timestamp"
    git branch $backupBranch $branchName
    Write-Host "💾 Copia de seguridad creada: $backupBranch" -ForegroundColor Green
}

# 5️⃣ Modo 1: Restaurar main/master desde otra rama
if ($Mode -eq "mainFromBranch") {
    if (-not $Source) { Write-Host "❌ Falta parámetro -Source (rama fuente)."; exit 1 }

    if (-not (git show-ref --verify --quiet "refs/heads/$Source")) {
        Write-Host "❌ La rama '$Source' no existe localmente. Ejecuta 'git fetch' primero." -ForegroundColor Red
        exit 1
    }

    if (-not (Confirm-Action "⚠️ Esto sobrescribirá '$mainBranch' con el contenido de '$Source'. ¿Continuar?")) {
        Write-Host "❌ Operación cancelada."; exit 0
    }

    Backup-Branch $mainBranch

    git fetch origin
    git checkout $mainBranch
    git pull origin $mainBranch

    Write-Host "🔧 Copiando contenido de $Source → $mainBranch..." -ForegroundColor Cyan
    git checkout $Source -- .

    git add .
    git commit -m "🔄 Restore $mainBranch from $Source (Anclora CLI)"
    git push origin $mainBranch --force-with-lease

    Write-Host "✅ Restauración completada: '$mainBranch' actualizado desde '$Source'." -ForegroundColor Green
    exit 0
}

# 6️⃣ Modo 2: Restaurar una rama desde main/master
if ($Mode -eq "branchFromMain") {
    if (-not $Target) { Write-Host "❌ Falta parámetro -Target (rama a restaurar)."; exit 1 }

    if (-not (git show-ref --verify --quiet "refs/heads/$Target")) {
        Write-Host "ℹ️ La rama '$Target' no existe localmente. Creándola desde $mainBranch..." -ForegroundColor Yellow
        git checkout -b $Target $mainBranch
    } else {
        git checkout $Target
    }

    if (-not (Confirm-Action "⚠️ Esto sobrescribirá '$Target' con el contenido de '$mainBranch'. ¿Continuar?")) {
        Write-Host "❌ Operación cancelada."; exit 0
    }

    Backup-Branch $Target

    Write-Host "🔧 Copiando contenido de $mainBranch → $Target..." -ForegroundColor Cyan
    git checkout $mainBranch -- .

    git add .
    git commit -m "🔄 Restore $Target from $mainBranch (Anclora CLI)"
    git push origin $Target --force-with-lease

    Write-Host "✅ Restauración completada: '$Target' contiene ahora el contenido de '$mainBranch'." -ForegroundColor Green
    exit 0
}

# 7️⃣ Modo 3: Backup directo
if ($Mode -eq "backup") {
    if (-not $Source) { Write-Host "❌ Falta parámetro -Source (rama a respaldar)."; exit 1 }
    if (-not (git show-ref --verify --quiet "refs/heads/$Source")) {
        Write-Host "❌ La rama '$Source' no existe localmente." -ForegroundColor Red
        exit 1
    }
    Backup-Branch $Source
    exit 0
}

Write-Host "❌ Modo no reconocido o incompleto." -ForegroundColor Red
