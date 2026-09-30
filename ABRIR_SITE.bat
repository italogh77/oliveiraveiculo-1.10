@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Oliveira Veiculos - Servidor Local

echo ==============================================
echo      OLIVEIRA VEICULOS - INICIAR SITE
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao foi encontrado neste computador.
    echo.
    echo Instale o Node.js 22 ou superior e execute este arquivo novamente.
    echo Site oficial: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node encontrado:
node -v
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERRO] npm nao foi encontrado.
    echo Reinstale o Node.js marcando a opcao para adicionar ao PATH.
    pause
    exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
    echo Instalando dependencias do projeto...
    echo Isso so precisa ser feito na primeira vez.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERRO] Nao foi possivel instalar as dependencias.
        echo Verifique sua internet e tente novamente.
        pause
        exit /b 1
    )
)

echo.
echo [GitHub] Verificando se ha atualizacoes do outro PC...
call "%~dp0CONFIGURAR_GIT.bat"
git pull --rebase origin main >nul 2>&1

echo [GitHub] Ativando sincronizador automatico em segundo plano...
start /min "AutoSync-GitHub" cmd /c "node auto-sync.js"

echo.
echo Iniciando o site...
echo O endereco sera mostrado abaixo, normalmente http://localhost:5173/
echo Salve qualquer alteracao em src ou public para atualizar o navegador automaticamente.
echo Mantenha esta janela aberta enquanto edita.
echo Para fechar o site, pressione CTRL+C nesta janela.
echo.
start "" cmd /c "timeout /t 3 /nobreak >nul & start \"\" http://localhost:5173/"
call npm run dev

echo.
pause
