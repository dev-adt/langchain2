# AI Chat Platform (LangChain V2)

Hệ thống Chatbot AI đa năng được xây dựng với Next.js (Frontend), Node.js/Express (Backend), Prisma (ORM) và LangChain.

## 🚀 Tính năng chính
- 💬 Chat với AI (GPT-4, GPT-3.5, etc.) qua giao diện hiện đại.
- 🤖 Tạo và tùy chỉnh bot riêng với System Prompt.
- 📂 Hỗ trợ RAG (Retrieval-Augmented Generation) - Chat với tài liệu.
- 🔐 Đăng nhập qua Google OAuth.
- 📱 Giao diện Responsive (tương thích mobile/desktop).

---

## 🛠️ Cấu trúc dự án
- `/frontend`: Next.js application.
- `/backend`: Node.js Express server.

---

## 💻 Hướng dẫn chạy Local

### 1. Yêu cầu hệ thống
- Node.js (v18 trở lên)
- npm hoặc yarn

### 2. Cài đặt Backend
```bash
cd backend
npm install
# Tạo file .env và điền các thông số cần thiết (DATABASE_URL, OPENAI_API_KEY, etc.)
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Cài đặt Frontend
```bash
cd ../frontend
npm install
# Tạo file .env.local và cấu hình NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```
Truy cập: `http://localhost:3000`

---

## 📤 Hướng dẫn đẩy lên Git

Để đẩy toàn bộ dự án lên GitHub/GitLab:

1. **Khởi tạo Git:**
   ```bash
   git init
   ```
2. **Thêm các file vào commit:**
   ```bash
   git add .
   ```
3. **Commit lần đầu:**
   ```bash
   git commit -m "Initial commit: AI Chat Platform with RAG"
   ```
4. **Tạo Repo trên GitHub và kết nối:**
   ```bash
   git branch -M main
   git remote add origin <URL_REPO_CUA_BAN>
   git push -u origin main
   ```

---

## 🌐 Hướng dẫn Deploy lên VPS (Ubuntu/Linux)

### 1. Chuẩn bị VPS
- Cài đặt Node.js: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`
- Cài đặt PM2: `sudo npm install -g pm2`
- Cài đặt Nginx: `sudo apt install nginx`

### 2. Clone dự án và Cài đặt
```bash
git clone <URL_REPO>
cd langchain2

# Cài đặt Backend
cd backend
npm install
# Tạo file .env
# Hệ thống sẽ tự động nhận diện DATABASE_URL:
# - Nếu là 'mysql://...' -> Dùng MySQL
# - Nếu là 'file:...' -> Dùng SQLite
npm run prisma:generate
npm run prisma:push
npm run build
pm2 start dist/app.js --name "ai-backend"

# Cài đặt Frontend
cd ../frontend
npm install
# Tạo file .env.local với các biến môi trường production
npm run build
# Mặc định chạy cổng 3000. Nếu cổng 3000 đã bị chiếm, đổi sang 3002 bằng lệnh:
pm2 start npm --name "ai-frontend" -- start -- -p 3002
```

### 3. Lưu cấu hình PM2
```bash
pm2 save
pm2 startup
```

### 4. Cấu hình Nginx (Reverse Proxy)
Tạo file cấu hình: `sudo nano /etc/nginx/sites-available/aichat`
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Kích hoạt:
```bash
sudo ln -s /etc/nginx/sites-available/aichat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ⚙️ Cấu hình Environment (.env)

Dự án sử dụng các file `.env.example` làm mẫu. Khi triển khai lên VPS hoặc máy mới:

1. **Backend**:
   - Copy `backend/.env.example` thành `backend/.env`.
   - Cập nhật các giá trị: `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`, và các thông tin Google OAuth (nếu dùng).
   - Đảm bảo `FRONTEND_URL` trỏ về domain của frontend.

2. **Frontend**:
   - Copy `frontend/.env.example` thành `frontend/.env.local`.
   - Cập nhật `NEXT_PUBLIC_API_URL` trỏ về domain của backend (ví dụ: `https://api.yourdomain.com/api`).

---

## ⚠️ Lưu ý bảo mật
- KHÔNG commit các file `.env` chứa thông tin thực tế lên Git.
- Thay đổi các khóa bí mật (`JWT_SECRET`) trước khi deploy bản sản phẩm.
- Sử dụng HTTPS cho môi trường production để bảo vệ dữ liệu người dùng.
