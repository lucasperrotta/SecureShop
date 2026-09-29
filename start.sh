#!/bin/bash

echo "🔒 SecureShop - Iniciando sistema completo..."
echo ""

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo ""

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
    echo ""
fi

echo "🚀 Iniciando Backend (porta 3001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "🚀 Iniciando Frontend (porta 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🖥️  Backend:  http://localhost:3001"
echo "🏥 Health:    http://localhost:3001/health"
echo ""
echo "Pressione Ctrl+C para parar ambos os servidores"
echo ""

# Aguarda Ctrl+C
trap "echo ''; echo '🛑 Parando servidores...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait
