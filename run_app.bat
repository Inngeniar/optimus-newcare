@echo off
title GAP Analysis NewCare - Optimus Health IPS
echo ========================================================
echo   INICIANDO APLICACION GAP ANALYSIS NEWCARE
echo   Optimus Health IPS - Sede Sincelejo
echo   Ente Certificador: Fundacion New Health
echo ========================================================
echo.
cd /d "%~dp0"
echo Iniciando servidor local (espere unos segundos)...
echo El navegador web se abrira de forma automatica cuando este listo.
python -m streamlit run app.py --server.headless false --browser.gatherUsageStats false
pause
