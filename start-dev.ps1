# ============================================================
#  GreenHouse · Dev Starter
#  Inicia el backend (nodemon) y el frontend (Tailwind watch)
#  en ventanas separadas de PowerShell.
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$backend  = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "  GreenHouse · Iniciando entorno de desarrollo..." -ForegroundColor Cyan
Write-Host ""

# ── Backend ─────────────────────────────────────────────────
if (Test-Path $backend) {
    Start-Process powershell -ArgumentList `
        "-NoExit", `
        "-Command", `
        "cd '$backend'; `$host.UI.RawUI.WindowTitle = 'GreenHouse · Backend'; npm run dev" `
        -WindowStyle Normal
    Write-Host "  [OK] Backend  →  $backend" -ForegroundColor Green
} else {
    Write-Host "  [!] No se encontro la carpeta backend: $backend" -ForegroundColor Red
}

# ── Frontend ─────────────────────────────────────────────────
if (Test-Path $frontend) {
    Start-Process powershell -ArgumentList `
        "-NoExit", `
        "-Command", `
        "cd '$frontend'; `$host.UI.RawUI.WindowTitle = 'GreenHouse · Frontend (Tailwind)'; npm run dev" `
        -WindowStyle Normal
    Write-Host "  [OK] Frontend →  $frontend" -ForegroundColor Green
} else {
    Write-Host "  [!] No se encontro la carpeta frontend: $frontend" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Ambos procesos corriendo en ventanas independientes." -ForegroundColor Cyan
Write-Host "  Cierra cada ventana para detenerlos." -ForegroundColor DarkGray
Write-Host ""
