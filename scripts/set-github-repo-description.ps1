<#.SYNOPSIS
  Sets the GitHub repository "About" description via the REST API (use when the website will not save).

.EXAMPLE
  $env:GITHUB_TOKEN = "github_pat_..."   # or classic ghp_...
  .\scripts\set-github-repo-description.ps1

.EXAMPLE
  .\scripts\set-github-repo-description.ps1 -Description "My custom one-liner."
#>
param(
  [string]$Owner = "Sergi-e",
  [string]$Repo = "FUTURE_FS_01",
  [string]$Description = "Full-stack portfolio: React, Vite, GSAP, Lenis, Express, SQLite API, projects, testimonials, contact, admin dashboard."
)

$token = $env:GITHUB_TOKEN
if (-not $token) {
  Write-Error "Set environment variable GITHUB_TOKEN to a Personal Access Token (see README)."
  exit 1
}

$headers = @{
  Authorization    = "Bearer $token"
  Accept           = "application/vnd.github+json"
  "User-Agent"     = "portfolio-set-description-script"
}

$uri = "https://api.github.com/repos/$Owner/$Repo"
$body = @{ description = $Description } | ConvertTo-Json

try {
  $result = Invoke-RestMethod -Uri $uri -Method Patch -Headers $headers -Body $body -ContentType "application/json; charset=utf-8"
  Write-Host "OK: description updated for $($result.full_name)"
  Write-Host $result.description
} catch {
  $err = $_.ErrorDetails.Message
  if (-not $err) { $err = $_.Exception.Message }
  Write-Error "GitHub API error: $err"
  if ($err -match '401|403') {
    Write-Host ""
    Write-Host "Token needs permission to change repository settings:"
    Write-Host "  Classic PAT: scope 'repo'"
    Write-Host "  Fine-grained: Repository -> Administration: Read and write"
  }
  exit 1
}
