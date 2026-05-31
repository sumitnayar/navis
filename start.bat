@echo off
title RiskOS V2 Local Server
echo ==============================================
echo Booting RiskOS Board Risk Intelligence Server...
echo ==============================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
