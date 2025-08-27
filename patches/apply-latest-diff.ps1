param(
  [string]$PatchesDir = "diffs",
  [switch]$Force = $false
)

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

# Ensure git repo
git rev-parse --is-inside-work-tree *>$null 2>&1
if ($LASTEXITCODE -ne 0) { Fail "Not a git repository." }

# Ensure clean working tree
$dirty = (git status --porcelain)
if (-not $Force -and $dirty) {
  Fail "Working tree is not clean. Commit/stash or run with -Force."
}

# Find patches
if (-not (Test-Path $PatchesDir)) { Fail "Folder '$PatchesDir' not found." }

$patches = Get-ChildItem -Path $PatchesDir -File -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -in ".diff", ".patch" }
if (-not $patches -or $patches.Count -eq 0) { Fail "No .diff/.patch files in '$PatchesDir'." }

# Select "latest" by numeric base name (unix time) if all numeric; otherwise by LastWriteTime
$allNumeric = $true
foreach ($p in $patches) {
  if ( ($p.BaseName -as [long]) -eq $null ) { $allNumeric = $false; break }
}

$selected = $null
if ($allNumeric) {
  $selected = $patches | Sort-Object { [long]$_.BaseName } -Descending | Select-Object -First 1
} else {
  $selected = $patches | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}

Write-Host "Selected patch: $($selected.FullName)" -ForegroundColor Cyan

# Validate
git apply --check --whitespace=fix --ignore-space-change --ignore-whitespace "$($selected.FullName)"
if ($LASTEXITCODE -ne 0) { Fail "Patch validation failed (git apply --check)." }

# Apply
git apply --whitespace=fix --ignore-space-change --ignore-whitespace "$($selected.FullName)"
if ($LASTEXITCODE -ne 0) { Fail "Failed to apply patch (git apply)." }

# Commit & push
git add -A
if ($LASTEXITCODE -ne 0) { Fail "git add failed." }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { Fail "Cannot determine current branch." }

$commitMsg = "Apply patch: $($selected.Name)"
git commit -m "$commitMsg"
if ($LASTEXITCODE -ne 0) { Fail "git commit failed." }

git push origin "$branch"
if ($LASTEXITCODE -ne 0) { Fail "git push failed." }

Write-Host "Done. Patch applied, committed and pushed: $($selected.Name)" -ForegroundColor Green
