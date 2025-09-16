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

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🔧 Starting backend server..."
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "🔧 Starting frontend server..."
cd ../frontend

# Check if node_modules exists and is properly installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --legacy-peer-deps --force
fi

# Try to start frontend, but don't fail if it doesn't work
echo "📦 Attempting to start frontend..."
npm run start &
FRONTEND_PID=$!

# Give frontend a moment to start, then check if it's working
sleep 5
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Frontend failed to start due to dependency issues."
    echo "📝 To start frontend manually, run:"
    echo "   cd frontend && npm run start"
    echo "   or try: cd frontend && yarn start"
    FRONTEND_PID=""
fi

echo "✅ Servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
