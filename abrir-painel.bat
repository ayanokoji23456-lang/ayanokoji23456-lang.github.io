@echo off
setlocal
cd /d "%~dp0"

title Painel local - Petala Floricultura

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js nao foi encontrado.
    echo Instale Node.js em https://nodejs.org/ e execute este arquivo novamente.
    pause
    exit /b 1
)

if not exist "node_modules\express" (
    echo Instalando as dependencias pela primeira vez...
    call npm install
    if errorlevel 1 (
        echo Nao foi possivel instalar as dependencias.
        pause
        exit /b 1
    )
)

start "Petala - servidor local" /min cmd /c "npm start"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/painel.html"

echo Painel aberto em http://localhost:3000/painel.html
echo Para encerrar o servidor, feche a janela Petala - servidor local.
