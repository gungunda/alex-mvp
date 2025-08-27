@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0apply-latest-diff.ps1" -PatchesDir "%~dp0diffs" -Force
pause

