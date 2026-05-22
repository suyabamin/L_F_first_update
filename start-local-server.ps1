$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath $PSScriptRoot

$env:PORT = '8000'
$logPath = Join-Path $PSScriptRoot 'server-runtime.log'

"[$(Get-Date -Format s)] Lost & Found server launcher started" | Add-Content -LiteralPath $logPath

while ($true) {
  Write-Host ''
  Write-Host 'Starting Lost & Found local server at http://127.0.0.1:8000/Login.html'
  Write-Host 'Keep this window open. Closing it stops the project.'
  Write-Host ''

  "[$(Get-Date -Format s)] Starting node dev-server.js" | Add-Content -LiteralPath $logPath
  node dev-server.js 2>&1 | Tee-Object -FilePath $logPath -Append

  Write-Host ''
  Write-Host 'Server stopped. Restarting in 3 seconds...'
  "[$(Get-Date -Format s)] Server stopped, restarting" | Add-Content -LiteralPath $logPath
  Start-Sleep -Seconds 3
}
