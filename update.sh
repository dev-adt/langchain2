#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Production Update Process with Port Config..."

# 1. Clean and Pull code from Git
echo "📥 Cleaning local conflicts and pulling from Git..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Force discard changes in schema.prisma as prepare-db.js will regenerate them
git checkout backend/prisma/schema.prisma 2>/dev/null || true
git pull origin $CURRENT_BRANCH

# 2. Update Backend
echo "⚙️ Updating Backend (Port 3003)..."
cd backend
npm install
npm run prisma:push
npm run build

# Start Backend on Port 3003
pm2 delete ai-backend 2>/dev/null || true
PORT=3003 pm2 start dist/app.js --name "ai-backend"
cd ..

# 3. Update Frontend
echo "💻 Updating Frontend (Port 3002)..."
cd frontend
npm install
npm run build

# Start Frontend on Port 3002
pm2 delete ai-frontend 2>/dev/null || true
pm2 start npm --name "ai-frontend" -- start -- -p 3002
cd ..

echo "✅ Production Update Completed Successfully!"
pm2 save
pm2 status
