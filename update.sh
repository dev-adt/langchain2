#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting DEEP CLEAN Update Process..."

# 1. Clean and Pull code from Git
echo "📥 Cleaning local conflicts and pulling from Git..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git checkout backend/prisma/schema.prisma 2>/dev/null || true
git pull origin $CURRENT_BRANCH

# 2. Update Backend
echo "⚙️ Updating Backend..."
cd backend
rm -rf dist
npm install
npm run prisma:push
npm run build

pm2 delete ai-backend 2>/dev/null || true
pm2 start dist/app.js --name "ai-backend" -- --port 3003
cd ..

# 3. Update Frontend
echo "💻 Updating Frontend (DEEP CLEAN)..."
cd frontend
# Xóa sạch thư mục build cũ
rm -rf .next
npm install
npm run build

# Đổi tên tiến trình để ép PM2 chạy luồng mới hoàn toàn
pm2 delete ai-frontend 2>/dev/null || true
pm2 start npm --name "ai-frontend-v3" -- start -- -p 3002
cd ..

echo "✅ DEEP CLEAN Update Completed Successfully!"
pm2 save
pm2 status
