@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Oliveira Veiculos - Teste no Celular

echo ==============================================
echo      OLIVEIRA VEICULOS - TESTAR NO CELULAR
echo ==============================================
echo.

echo IMPORTANTE:
echo - Deixe o PC e o celular no mesmo Wi-Fi.
echo - Nao feche esta janela enquanto estiver testando.
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao foi encontrado.
    pause
    exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
    echo Instalando dependencias do projeto...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERRO] Nao foi possivel instalar as dependencias.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando o site para acesso pelo celular...
echo.
echo QUANDO APARECER "Network:", abra ESSE endereco no celular.
echo Exemplo: http://192.168.1.10:5173/
echo.
echo Se o Windows Firewall perguntar, permita em redes privadas.
echo.
call npm run dev -- --host

echo.
pause
