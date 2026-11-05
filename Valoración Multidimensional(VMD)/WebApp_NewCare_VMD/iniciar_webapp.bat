@echo off
title WebApp New Care VMD - Optimus Health
echo ==============================================================
echo    INICIANDO WEBAPP VALORACION MULTIDIMENSIONAL NEW CARE
echo           Optimus Health IPS & Fundacion NewHealth
echo ==============================================================
echo.
cd /d "%~dp0"

echo Abriendo la aplicacion WebApp New Care en tu navegador predeterminado...
start "" index.html

echo.
echo Aplicacion iniciada correctamente. Puedes cerrar esta ventana.
timeout /t 3 >nul
exit
