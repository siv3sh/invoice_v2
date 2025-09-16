#!/bin/bash
# Start development servers

echo "🚀 Starting Activus Invoice Management System..."

# Check if we're in the right directory
if [ ! -f "backend/server.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️ Warning: backend/.env not found. Copy backend/env.example to backend/.env and configure it."
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️ Warning: frontend/.env not found. Copy frontend/env.example to frontend/.env and configure it."
fi

echo "🔧 Starting backend server..."
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "🔧 Starting frontend server..."
cd ../frontend
yarn start &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
