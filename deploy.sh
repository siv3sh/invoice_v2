#!/bin/bash
# Quick deployment script for Render

echo "🚀 Preparing for Render deployment..."

# Check if we're in the right directory
if [ ! -f "backend/server.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️ No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Deploy to Render - $(date)"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "🔗 Adding GitHub remote..."
    echo "Please provide your GitHub repository URL:"
    read -p "GitHub URL: " github_url
    git remote add origin $github_url
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Create a new Blueprint"
echo "3. Connect your GitHub repository"
echo "4. Set your MONGO_URL environment variable"
echo "5. Deploy!"
