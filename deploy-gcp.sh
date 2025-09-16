#!/bin/bash

# Google App Engine Deployment Script for Invoice Management System

echo "🚀 Deploying Invoice Management System to Google App Engine..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud SDK not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set project ID (you need to change this to your project ID)
PROJECT_ID="g1sivesh"
echo "📋 Using project: $PROJECT_ID"

# Set project
gcloud config set project $PROJECT_ID

echo ""
echo "🔧 Step 1: Deploying Backend (FastAPI) to App Engine..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Deploy backend
echo "🚀 Deploying backend to App Engine..."
gcloud app deploy ../app.yaml --quiet

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
    BACKEND_URL="https://$PROJECT_ID.appspot.com"
    echo "🔗 Backend URL: $BACKEND_URL"
else
    echo "❌ Backend deployment failed!"
    exit 1
fi

echo ""
echo "🔧 Step 2: Building Frontend (React)..."

# Navigate to frontend directory
cd ../frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps --force

# Build React app
echo "🏗️  Building React application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo ""
echo "🔧 Step 3: Deploying Frontend to App Engine..."

# Update frontend app.yaml with backend URL
sed -i.bak "s/your-backend-app-id/$PROJECT_ID/g" app.yaml

# Deploy frontend
echo "🚀 Deploying frontend to App Engine..."
gcloud app deploy app.yaml --quiet

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully!"
    FRONTEND_URL="https://$PROJECT_ID.appspot.com"
    echo "🔗 Frontend URL: $FRONTEND_URL"
else
    echo "❌ Frontend deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Backend API:  $BACKEND_URL"
echo "🔗 Frontend App: $FRONTEND_URL"
echo "📚 API Docs:     $BACKEND_URL/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "1. Update your MongoDB connection string in App Engine environment variables"
echo "2. Test the deployed application"
echo "3. Set up custom domain (optional)"
echo "4. Configure SSL certificates (optional)"
echo ""
echo "🔧 To manage your app:"
echo "   gcloud app browse"
echo "   gcloud app logs tail"
echo "   gcloud app versions list"
echo ""
echo "✅ Deployment completed successfully!"
