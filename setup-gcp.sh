#!/bin/bash

# Quick Setup Script for Google App Engine Deployment

echo "🚀 Google App Engine Deployment Setup"
echo "======================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found. Installing..."
    curl https://sdk.cloud.google.com | bash
    exec -l $SHELL
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "🔐 Please authenticate with Google Cloud:"
    gcloud auth login
fi

# Set project
PROJECT_ID="g1sivesh"
echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Check if App Engine is initialized
if ! gcloud app describe &> /dev/null; then
    echo "🏗️  Initializing App Engine..."
    gcloud app create --region=us-central
fi

echo ""
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "1. Set up MongoDB Atlas database"
echo "2. Update environment variables in app.yaml"
echo "3. Run: ./deploy-gcp.sh"
echo ""
echo "🔗 Your app will be available at:"
echo "   https://g1sivesh.appspot.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
