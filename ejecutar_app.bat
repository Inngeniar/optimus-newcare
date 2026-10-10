@echo off
chcp 65001 >nul
title GAP Analysis NewCare - Optimus Health IPS
color 0A
echo ======================================================================
echo    OPTIMUS HEALTH IPS - GAP ANALYSIS NEWCARE
echo    Verificacion de Estandares Fundacion New Health (IOCC)
echo ======================================================================
echo.

cd /d "%~dp0"

:: 0. Validar si se está ejecutando dentro de un archivo temporal / sin descomprimir
echo %cd% | findstr /i "Temp1_ \Temp\ \AppData\Local\Temp" >nul
if %errorlevel% equ 0 (
    color 0C
    echo [ERROR CRITICO] Parece que esta ejecutando la aplicacion directamente desde el archivo comprimido (ZIP).
    echo.
    echo Por favor:
    echo 1. Cierre esta ventana.
    echo 2. Haga clic derecho sobre el archivo .ZIP descargado.
    echo 3. Seleccione "Extraer todo...".
    echo 4. Ingrese a la carpeta extraida y vuelva a hacer doble clic en este archivo.
    echo.
    pause
    exit /b 1
)

:: 1. Si existe python_portable integrado (Modo autonomo 100% sin instalacion)
if exist "%~dp0python_portable\python.exe" (
    echo [INFO] Iniciando con motor Python integrado (Modo Autonomo, Cero Instalacion)...
    echo [INFO] El servidor local se esta iniciando, espere unos segundos...
    echo [INFO] Su navegador web se abrira automaticamente en cuanto la aplicacion este lista.
    echo.
    echo IMPORTANTE: Mantenga esta ventana negra abierta mientras use la aplicacion.
    echo ======================================================================
    echo.
    "%~dp0python_portable\python.exe" -s -m streamlit run app.py --server.headless false --browser.gatherUsageStats false
    goto :fin
)

:: 2. Verificar si existe entorno virtual, de lo contrario usar python global
if exist "env_newcare\Scripts\activate.bat" (
    echo [INFO] Iniciando con entorno virtual dedicado...
    call env_newcare\Scripts\activate.bat
) else (
    echo [INFO] Iniciando con instalacion de Python del sistema...
)

echo [INFO] Inicializando servidor local (esto toma unos segundos)...
echo [INFO] Su navegador web se abrira automaticamente cuando este listo.
echo.
echo Si el navegador no se abre solo tras unos instantes, ingrese manualmente a:
echo        http://localhost:8501
echo.
echo IMPORTANTE: No cierre esta ventana negra mientras trabaje en la aplicacion.
echo ======================================================================
echo.

python -m streamlit run app.py --server.headless false --browser.gatherUsageStats false

:fin
pause


