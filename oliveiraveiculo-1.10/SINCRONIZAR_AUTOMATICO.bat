@echo off
chcp 65001 > nul
title Auto-Sync GitHub - Oliveira Veiculos
color 0a
cd /d "%~dp0"

echo =====================================================
echo    INICIANDO SINCRONIZAÇÃO AUTOMÁTICA COM O GITHUB
echo =====================================================
echo.
echo Este processo fica monitorando suas alteracoes em tempo real.
echo Qualquer foto adicionada ou texto alterado sera enviado sozinho!
echo.
echo Pode minimizar esta janela enquanto trabalha.
echo.

node auto-sync.js
pause
