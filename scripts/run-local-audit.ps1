<#
run-local-audit.ps1
Run local checks and Lighthouse audits for the site.
Usage (from project root):
  PowerShell -ExecutionPolicy Bypass -File .\scripts\run-local-audit.ps1
  or
  .\scripts\run-local-audit.ps1 -Pages @('http://localhost:8080','http://localhost:8080/subjects.html')

This script:
 - validates Node/npm and Chrome presence
 - runs `npm install`
 - runs image preparation and icon generation
 - verifies assets with `node scripts/check-assets.js`
 - starts a local static server (npx http-server -p 8080 -c-1)
 - runs Lighthouse on a set of pages and saves HTML reports into /reports
 - stops the server and prints a summary
#>

param(
  [string[]]$Pages = @('http://localhost:8080/','http://localhost:8080/subjects.html','http://localhost:8080/gallery.html'),
  [string]$ChromePath
)

$ErrorActionPreference = 'Stop'
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Resolve-Path "$ScriptRoot\.."
$LogsDir = "$ProjectRoot\logs"
$ReportsDir = "$ProjectRoot\reports"
$LogFile = Join-Path $LogsDir "audit-$(Get-Date -Format yyyyMMdd-HHmmss).log"

if (!(Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }
if (!(Test-Path $ReportsDir)) { New-Item -ItemType Directory -Path $ReportsDir | Out-Null }

function Write-Log { param($m) $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"; "$ts - $m" | Tee-Object -FilePath $LogFile -Append; Write-Host $m }

Write-Log "Starting local audit script"
Write-Log "Project root: $ProjectRoot"

# 1) Check tools
try {
  $node = (node -v) 2>$null
  $npm = (npm -v) 2>$null
  Write-Log "Node: $node"
  Write-Log "npm: $npm"
} catch {
  Write-Log "ERROR: Node or npm not found on PATH. Install Node.js (LTS) and re-run."
  exit 2
}

if (-not $ChromePath) {
  try { $chromePath = (where.exe chrome | Select-Object -First 1).Trim() } catch { $chromePath = $null }
} else { $chromePath = $ChromePath }

if (-not $chromePath) {
  Write-Log "ERROR: Chrome not found on PATH. Please install Google Chrome and re-run."
  exit 3
}
Write-Log "Chrome path: $chromePath"

# 2) Install dependencies
Write-Log "Running npm install..."
npm install 2>&1 | Tee-Object -FilePath $LogFile -Append
Write-Log "npm install completed"

# 3) Prepare images & icons
Write-Log "Running image preparation (images:prepare)..."
npm run images:prepare 2>&1 | Tee-Object -FilePath $LogFile -Append
Write-Log "Image preparation complete"

# 4) Check assets
Write-Log "Running asset check (check:assets)..."
node scripts/check-assets.js 2>&1 | Tee-Object -FilePath $LogFile -Append

# 5) Start server
Write-Log "Starting static server: npx http-server -p 8080 -c-1"
$serverProc = Start-Process -FilePath npx -ArgumentList 'http-server','-p','8080','-c-1' -PassThru
Write-Log "Server process id: $($serverProc.Id)"

# Wait for server to be up (max 20 seconds)
$ok = $false
for ($i=0; $i -lt 20; $i++) {
  try {
    Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 2 | Out-Null
    $ok = $true; break
  } catch { Start-Sleep -Seconds 1 }
}
if (-not $ok) {
  Write-Log "ERROR: Could not reach http://localhost:8080 (server may not have started). Check logs and rerun."; exit 4
}
Write-Log "Server is responding on http://localhost:8080"

# 6) Run Lighthouse for each page
Write-Log "Running Lighthouse audits..."
foreach ($p in $Pages) {
  try {
    $uri = $p
    $safeName = ($p -replace 'https?://','') -replace '[^A-Za-z0-9_\-]','_' -replace '__','_'
    $out = Join-Path $ReportsDir "${safeName}-lighthouse.html"
    $args = @('lighthouse', "`$uri`", '--output', 'html', '--output-path', "$out", '--chrome-flags=--headless', '--chrome-path', "`"$chromePath`"")
    Write-Log "Audit: $uri -> $out"
    # run via npx so local installation is used
    Start-Process -FilePath npx -ArgumentList $args -NoNewWindow -Wait -PassThru | Out-Null
    Write-Log "Saved report: $out"
  } catch {
    Write-Log "ERROR: Lighthouse audit failed for $p - $($_.Exception.Message)"
  }
}

# 7) Stop server
try {
  Write-Log "Stopping server process $($serverProc.Id)"
  Stop-Process -Id $serverProc.Id -ErrorAction SilentlyContinue
} catch { }

Write-Log "Audit complete. Reports saved to: $ReportsDir"
Write-Log "Log file: $LogFile"
Write-Host "\nDone. Open the HTML reports in $ReportsDir and upload the relevant report or paste the top-line scores here for triage."