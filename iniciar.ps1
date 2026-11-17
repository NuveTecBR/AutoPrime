Write-Host "Iniciando AutoPrime Seminovos (Porta 3334)..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
node server.js
