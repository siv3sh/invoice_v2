#!/bin/bash
# Build script for local development

echo "🚀 Building Activus Invoice Management System..."

# Check if we're in the right directory
if [ ! -f "backend/server.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build backend
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
echo "✅ Backend dependencies installed"

# Build frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
yarn install
echo "✅ Frontend dependencies installed"

# Build frontend
echo "🏗️ Building frontend..."
yarn build
echo "✅ Frontend built successfully"

cd ..
echo "🎉 Build completed successfully!"
echo ""
echo "To start the development servers:"
echo "Backend:  cd backend && uvicorn server:app --reload"
echo "Frontend: cd frontend && yarn start"
