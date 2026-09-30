@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Ativar sincronizacao automatica - Oliveira Veiculos

echo =====================================================
echo   ATIVAR ENVIO AUTOMATICO PARA O GITHUB
echo =====================================================
echo.
echo Esta configuracao e feita apenas uma vez.
echo O GitHub podera abrir uma janela ou o navegador para confirmar sua conta.
echo.

set "PATH=%PATH%;%LOCALAPPDATA%\GitHubDesktop\bin"

where git >nul 2>nul
if errorlevel 1 (
    echo [ERRO] GitHub Desktop nao foi encontrado.
    echo Instale ou atualize o GitHub Desktop e tente novamente.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%G in ('git --exec-path') do set "GIT_EXEC_PATH=%%G"
for %%G in ("%GIT_EXEC_PATH%\..\..\bin\git-credential-manager.exe") do set "GCM=%%~fG"

if not exist "%GCM%" (
    echo [ERRO] O gerenciador de acesso do GitHub nao foi encontrado.
    echo Abra o GitHub Desktop, atualize-o e tente novamente.
    echo.
    pause
    exit /b 1
)

echo Entrando na conta do GitHub...
"%GCM%" github login
if errorlevel 1 (
    echo.
    echo [ERRO] Nao foi possivel autorizar a conta.
    pause
    exit /b 1
)

echo.
echo Enviando as alteracoes que estao aguardando...
git push origin main
if errorlevel 1 (
    echo.
    echo [ERRO] A conta foi autorizada, mas o envio nao terminou.
    echo Abra o GitHub Desktop para verificar a mensagem apresentada.
    pause
    exit /b 1
)

echo.
echo =====================================================
echo   PRONTO! ENVIO AUTOMATICO ATIVADO COM SUCESSO
echo =====================================================
echo Agora basta usar ABRIR_SITE.bat enquanto estiver editando.
echo.
pause
