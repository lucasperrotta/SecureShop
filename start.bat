@echo off
echo.
echo 🔒 SecureShop - Iniciando sistema completo...
echo.

REM Verifica se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado. Instale em: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js instalado
echo.

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências do frontend...
    call npm install
    echo.
)

if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do backend...
    cd backend
    call npm install
    cd ..
    echo.
)

echo 🚀 Iniciando Backend (porta 3001)...
start "SecureShop Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🚀 Iniciando Frontend (porta 5173)...
start "SecureShop Frontend" cmd /k "npm run dev"

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🖥️  Backend:  http://localhost:3001
echo 🏥 Health:    http://localhost:3001/health
echo.
echo Feche as janelas do terminal para parar os servidores.
echo.
pause
