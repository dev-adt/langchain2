#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Production Update Process..."

# 1. Clean and Pull code from Git
echo "📥 Cleaning local conflicts and pulling from Git..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Force discard changes in schema.prisma as prepare-db.js will regenerate them
git checkout backend/prisma/schema.prisma 2>/dev/null || true
git pull origin $CURRENT_BRANCH

# 2. Update Backend
echo "⚙️ Updating Backend (Production)..."
cd backend
npm install
npm run prisma:push
npm run build

# Delete existing PM2 process if exists and start new production one
pm2 delete ai-backend 2>/dev/null || true
pm2 start dist/index.js --name "ai-backend"
cd ..

# 3. Update Frontend
echo "💻 Updating Frontend (Production)..."
cd frontend
npm install
npm run build

# Delete existing PM2 process if exists and start new production one
pm2 delete ai-frontend 2>/dev/null || true
pm2 start npm --name "ai-frontend" -- start
cd ..

echo "✅ Production Update Completed Successfully!"
pm2 save
pm2 status
