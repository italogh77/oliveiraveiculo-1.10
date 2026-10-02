@echo off
chcp 65001 > nul
title Sincronizador GitHub - Oliveira Veículos
color 0b

echo =======================================================
echo     SINCRONIZAÇÃO AUTOMÁTICA COM O GITHUB
echo =======================================================
echo.

:: Garantir que o Git do GitHub Desktop esteja acessível se necessário
call "%~dp0CONFIGURAR_GIT.bat"

:: 1. Puxar alterações recentes da nuvem
echo [1/3] Verificando se há atualizações no GitHub...
git pull origin main --rebase
if %errorlevel% neq 0 (
    echo [AVISO] Tentando pull padrão...
    git pull origin main
)

echo.
:: 2. Verificar se há alterações locais
echo [2/3] Verificando alterações feitas neste computador...
git status -s > "%temp%\git_status.txt"
for %%A in ("%temp%\git_status.txt") do if %%~zA==0 (
    echo.
    echo Tudo já está atualizado e sincronizado!
    echo =======================================================
    del "%temp%\git_status.txt"
    pause
    exit /b 0
)
del "%temp%\git_status.txt"

:: 3. Salvar e enviar alterações
echo.
echo [3/3] Enviando alterações para o GitHub...
git add .
set "data_hora=%date% %time%"
git commit -m "Auto sync: %data_hora%"
git push origin main

echo.
if %errorlevel% equ 0 (
    echo =======================================================
    echo    Sincronizado com sucesso com o GitHub!
    echo =======================================================
) else (
    echo =======================================================
    echo    Houve uma pendência no envio.
    echo    Abra o GitHub Desktop para verificar.
    echo =======================================================
)

echo.
pause
