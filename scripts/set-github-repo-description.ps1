<#.SYNOPSIS
  Sets the GitHub repository About description via REST API.
  Prefer: node scripts/set-github-repo-description.mjs (same as npm run repo:description)
#>
param(
  [string]$Owner = "Sergi-e",
  [string]$Repo = "FUTURE_FS_01",
  [string]$Description = "Full-stack portfolio: React, Vite, GSAP, Lenis, Express, SQLite API, projects, testimonials, contact, admin dashboard."
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = ($env:GITHUB_TOKEN).Trim()
if (-not $token) {
  Write-Error "Set GITHUB_TOKEN to a Personal Access Token, or run: npm run repo:description"
  exit 1
}

$uri = "https://api.github.com/repos/$Owner/$Repo"
# Avoid ConvertTo-Json quirks with quotes in description
$bodyObj = [ordered]@{ description = $Description }
$body = $bodyObj | ConvertTo-Json -Compress

function Invoke-Patch([string]$AuthValue) {
  $headers = @{
    Authorization              = $AuthValue
    Accept                     = "application/vnd.github+json"
    "User-Agent"               = "portfolio-set-description-script"
    "X-GitHub-Api-Version"     = "2022-11-28"
  }
  try {
    return Invoke-RestMethod -Uri $uri -Method Patch -Headers $headers -Body $body -ContentType "application/json; charset=utf-8"
  } catch {
    $resp = $_.Exception.Response
    $reader = $null
    $detail = $_.Exception.Message
    if ($resp -and $resp.GetResponseStream()) {
      try {
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $detail = $reader.ReadToEnd()
        $reader.Close()
      } catch { }
    }
    return @{ Error = $true; Detail = $detail; Status = if ($resp) { [int]$resp.StatusCode } else { 0 } }
  }
}

$r1 = Invoke-Patch "Bearer $token"
if (-not $r1.Error) {
  Write-Host "OK (Bearer): $($r1.full_name)"
  Write-Host $r1.description
  exit 0
}

$r2 = Invoke-Patch "token $token"
if (-not $r2.Error) {
  Write-Host "OK (token): $($r2.full_name)"
  Write-Host $r2.description
  exit 0
}

Write-Host "Bearer failed ($($r1.Status)): $($r1.Detail)"
Write-Host "token failed ($($r2.Status)): $($r2.Detail)"
Write-Error "GitHub API rejected both auth styles. Use a PAT with scope 'repo' (classic) or Administration Read+Write (fine-grained) for this repository."
Write-Host ""
Write-Host "Easier: npm run repo:description"
exit 1
