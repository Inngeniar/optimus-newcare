@echo off
chcp 65001 >nul
title Instalador y Configurador - GAP Analysis NewCare
color 0B
echo ======================================================================
echo    OPTIMUS HEALTH IPS - PROGRAMA NEWCARE
echo    CONFIGURADOR AUTOMATICO DE ENTORNO PARA EL PATROCINADOR
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Verificar si Python esta instalado en el sistema
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python ya esta instalado en este equipo:
    python --version
    goto :PREPARAR_ENTORNO
)

:: 2. Si no esta instalado, intentar descargarlo e instalarlo de forma automatica
echo [AVISO] Python no fue detectado en su equipo.
echo.
echo ======================================================================
echo    DESCARGANDO E INSTALANDO PYTHON AUTOMATICAMENTE...
echo ======================================================================
echo Descargando instalador oficial de Python para Windows (64-bit)...

set "PYTHON_URL=https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
set "INSTALLER=python_installer.exe"

curl.exe -L -o "%INSTALLER%" "%PYTHON_URL%"
if not exist "%INSTALLER%" (
    echo.
    echo [ERROR] No se pudo descargar el instalador automaticamente.
    echo Por favor descargue e instale Python manualmente desde:
    echo     https://www.python.org/downloads/
    echo Asegurese de marcar: "Add Python to PATH" durante la instalacion.
    echo.
    pause
    exit /b 1
)

echo.
echo Instalando Python en segundo plano de forma desatendida...
echo (Por favor espere unos instantes mientras Windows completa la instalacion)
start /wait %INSTALLER% /quiet InstallAllUsers=0 PrependPath=1 Include_test=0

:: Eliminar el instalador temporal
del /f /q "%INSTALLER%" >nul 2>&1

:: Actualizar variable PATH en la sesion actual
set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;%LOCALAPPDATA%\Programs\Python\Python311\Scripts;%PATH%"

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ATENCION] La instalacion de Python ha finalizado.
    echo Para que Windows reconozca Python por primera vez, cierre esta ventana
    echo y vuelva a hacer doble clic en: INSTALADOR_AUTOMATICO.bat
    echo.
    pause
    exit /b 0
)

:PREPARAR_ENTORNO
echo.
echo ======================================================================
echo [1/3] Creando entorno virtual aislado (env_newcare)...
echo ======================================================================
if not exist "env_newcare" (
    python -m venv env_newcare
    echo Entorno virtual creado exitosamente.
) else (
    echo El entorno virtual ya existe.
)
echo.

echo ======================================================================
echo [2/3] Instalando librerias requeridas (Streamlit, Plotly, Excel, Word)...
echo ======================================================================
call env_newcare\Scripts\activate.bat
"%~dp0env_newcare\Scripts\python.exe" -m pip install --upgrade pip
"%~dp0env_newcare\Scripts\python.exe" -m pip install -r requirements.txt
echo.

echo ======================================================================
echo [3/3] Creando carpetas de datos, evidencias y repositorio...
echo ======================================================================
if not exist "data" mkdir data
if not exist "evidencias" mkdir evidencias
if not exist "repositorio_central" mkdir repositorio_central
echo Carpetas operativas listas.
echo.

echo ======================================================================
echo    ¡INSTALACION Y CONFIGURACION COMPLETADA CON EXITO!
echo ======================================================================
echo.
echo Ahora puede iniciar la aplicacion haciendo doble clic en:
echo     ejecutar_app.bat
echo.
pause
