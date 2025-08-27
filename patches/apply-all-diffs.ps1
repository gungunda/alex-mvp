param(
  [string]$PatchesDir = "diffs",
  [switch]$Force = $false,
  [switch]$StopOnError = $true
)

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

git rev-parse --is-inside-work-tree *>$null 2>&1
if ($LASTEXITCODE -ne 0) { Fail "Текущая директория не является git-репозиторием." }

$dirty = (git status --porcelain)
if (-not $Force -and $dirty) {
  Fail "Дерево не чистое. Закоммить/стэшни изменения или запусти с флагом -Force."
}

if (-not (Test-Path $PatchesDir)) { Fail "Папка '$PatchesDir' не найдена." }

$patches = Get-ChildItem -Path $PatchesDir -File -Include *.diff, *.patch -ErrorAction SilentlyContinue
if (-not $patches -or $patches.Count -eq 0) { Fail "В '$PatchesDir' нет файлов .diff/.patch" }

# Разделим на "числовые" и прочие
$numeric = @()
$others  = @()
foreach ($p in $patches) {
  if ( ($p.BaseName -as [long]) -ne $null ) { $numeric += $p } else { $others += $p }
}

$ordered = @()
if ($numeric.Count -gt 0) { $ordered += ($numeric | Sort-Object { [long]$_.BaseName }) }
if ($others.Count  -gt 0) { $ordered += ($others  | Sort-Object LastWriteTime) }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { Fail "Не удалось определить текущую ветку." }

foreach ($patch in $ordered) {
  Write-Host "==> Патч: $($patch.Name)" -ForegroundColor Cyan

  git apply --check --whitespace=fix --ignore-space-change --ignore-whitespace "$($patch.FullName)"
  if ($LASTEXITCODE -ne 0) {
    $msg = "Валидация патча не прошла: $($patch.Name)"
    if ($StopOnError) { Fail $msg } else { Write-Host $msg -ForegroundColor Yellow; continue }
  }

  git apply --whitespace=fix --ignore-space-change --ignore-whitespace "$($patch.FullName)"
  if ($LASTEXITCODE -ne 0) {
    $msg = "Не удалось применить патч: $($patch.Name)"
    if ($StopOnError) { Fail $msg } else { Write-Host $msg -ForegroundColor Yellow; continue }
  }

  git add -A
  if ($LASTEXITCODE -ne 0) { Fail "git add ошибка." }

  git commit -m "Apply patch: $($patch.Name)"
  if ($LASTEXITCODE -ne 0) { Fail "git commit ошибка." }
}

# Один общий push в конце
git push origin "$branch"
if ($LASTEXITCODE -ne 0) { Fail "git push завершился с ошибкой." }

Write-Host "Готово ✔ Все применённые патчи закоммичены и запушены." -ForegroundColor Green
