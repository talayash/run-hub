# RunHub Release Script
# Usage: .\scripts\release.ps1 -Version "0.2.0"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

Write-Host "Releasing RunHub v$Version" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Validate version format
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    Write-Host "Error: Version must be in format X.Y.Z (e.g., 0.2.0)" -ForegroundColor Red
    exit 1
}

# Update package.json
Write-Host "`n[1/5] Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$packageJson.version = $Version
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json" -Encoding UTF8

# Update tauri.conf.json
Write-Host "[2/5] Updating tauri.conf.json..." -ForegroundColor Yellow
$tauriConf = Get-Content "src-tauri/tauri.conf.json" -Raw | ConvertFrom-Json
$tauriConf.version = $Version
$tauriConf | ConvertTo-Json -Depth 100 | Set-Content "src-tauri/tauri.conf.json" -Encoding UTF8

# Commit version bump
Write-Host "[3/5] Committing version bump..." -ForegroundColor Yellow
git add package.json src-tauri/tauri.conf.json
git commit -m "Bump version to $Version"

# Create tag
Write-Host "[4/5] Creating tag v$Version..." -ForegroundColor Yellow
git tag -a "v$Version" -m "Release v$Version"

# Push
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git push origin master
git push origin "v$Version"

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Release v$Version initiated!" -ForegroundColor Green
Write-Host "`nGitHub Actions will now build and publish the release."
Write-Host "Watch progress at: https://github.com/talayash/run-hub/actions" -ForegroundColor Blue
Write-Host "`nRelease will be available at:" -ForegroundColor White
Write-Host "https://github.com/talayash/run-hub/releases/tag/v$Version" -ForegroundColor Blue
