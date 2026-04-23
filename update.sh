#!/bin/bash

echo "🚀 Starting Update Process..."

# 1. Pull code from Git
echo "📥 Pulling latest code from Git..."
git pull origin main

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
