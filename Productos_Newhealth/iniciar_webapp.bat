@echo off
title Portafolio & Disenador NEWCARE - Optimus Health IPS
echo ==============================================================
echo    INICIANDO APP PORTAFOLIO Y COSTEO NEWCARE - OPTIMUS HEALTH
echo           Optimus Health IPS & Fundacion NewHealth
echo ==============================================================
echo.
cd /d "%~dp0"

echo Abriendo la aplicacion Web en tu navegador predeterminado...
start "" "app\index.html"

echo.
echo Aplicacion iniciada correctamente. Puedes cerrar esta ventana.
timeout /t 3 >nul
exit

