# 1) Положи патчи в repo_root/patches/ (например: patches/1714400000.diff)
# 2) Запусти:
powershell -ExecutionPolicy Bypass -File .\apply-latest-diff.ps1
# или с явной папкой и форсом:
powershell -ExecutionPolicy Bypass -File .\apply-latest-diff.ps1 -PatchesDir ".\my-patches" -Force
powershell -ExecutionPolicy Bypass -File .\apply-all-diffs.ps1
# или:
powershell -ExecutionPolicy Bypass -File .\apply-all-diffs.ps1 -PatchesDir ".\my-patches" -Force -StopOnError:$false
