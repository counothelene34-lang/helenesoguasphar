@echo off
setlocal EnableExtensions
title SOGUASPHAR - Commandes

set "APP_DIR=%~dp0"
set "NODE_EXE=C:\Users\SOGUASPHAR\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE_EXE%" (
  set "NODE_EXE=node"
)

cd /d "%APP_DIR%"
echo.
echo ======================================================
echo Site SOGUASPHAR lance sur : http://127.0.0.1:56651
echo Laissez cette fenetre ouverte pendant l'utilisation.
echo ======================================================
echo.

start "" "http://127.0.0.1:56651"
"%NODE_EXE%" server.js

pause
