#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Update Process..."

# 1. Clean and Pull code from Git
echo "📥 Cleaning local conflicts and pulling from Git..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Force discard changes in schema.prisma as prepare-db.js will regenerate them
git checkout backend/prisma/schema.prisma 2>/dev/null || true
git pull origin $CURRENT_BRANCH

# 2. Update Backend
echo "⚙️ Updating Backend..."
cd backend
npm install
npm run prisma:push
npm run build
pm2 restart ai-backend
cd ..

# 3. Update Frontend
echo "💻 Updating Frontend..."
cd frontend
npm install
npm run build
pm2 restart ai-frontend
cd ..

echo "✅ Update Completed Successfully!"
pm2 status
