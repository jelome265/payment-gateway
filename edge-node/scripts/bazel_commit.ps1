# Bazel-driven commit script for Windows (PowerShell).
# This script is called via 'bazelisk run //:commit -- -m "message"'

param (
    [string]$m
)

$ErrorActionPreference = "Stop"

if (-not $m) {
    Write-Error "Usage: bazelisk run //:commit -- -m `"commit message`""
    exit 1
}

# ============================================================
# SECRET FILE GUARD — abort if any secret file is staged
# ============================================================
$forbiddenExtensions = @("*.env", "*.pem", "*.key", "*.p12", "*.jks", "*.pfx")
$offendingFiles = @()

$statusOutput = git status --porcelain 2>$null
if ($statusOutput) {
    foreach ($line in $statusOutput) {
        $file = ($line -replace '^\s*\S+\s+', '').Trim()
        foreach ($pattern in $forbiddenExtensions) {
            if ($file -like $pattern) {
                $offendingFiles += $file
            }
        }
    }
}

if ($offendingFiles.Count -gt 0) {
    Write-Error "[BAZEL-COMMIT] ABORT: Secret files detected in working tree!"
    Write-Error "[BAZEL-COMMIT] The following files must NOT be committed:"
    foreach ($f in $offendingFiles) {
        Write-Error "  - $f"
    }
    Write-Error "[BAZEL-COMMIT] Add them to .gitignore or remove them."
    exit 1
}

Write-Host "[BAZEL-COMMIT] Staging all changes in $(Get-Location)..."
git add .

Write-Host "[BAZEL-COMMIT] Committing with message: $m"
git commit -m "$m"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[BAZEL-COMMIT] Success."
} else {
    Write-Host "[BAZEL-COMMIT] Commit failed (possibly no changes to commit)."
}
