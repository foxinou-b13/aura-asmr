@echo off
chcp 65001 >nul
cd /d %~dp0
echo ========================================
echo    Demarrage du bot Discord
echo ========================================
echo.

if not exist node_modules (
    echo [1/3] Installation des dependances...
    call npm install
) else (
    echo [1/3] Dependances deja installees.
)

echo.
echo [2/3] Enregistrement des commandes sur Discord...
node deploy-commands.js

echo.
echo [3/3] Demarrage du bot...
echo Laisse cette fenetre ouverte pour que le bot reste en ligne.
echo.
node index.js

echo.
echo Le bot s'est arrete. Appuie sur une touche pour fermer.
pause >nul
