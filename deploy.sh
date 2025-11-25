#!/bin/bash

# 明日方舟博客 VPS 一键部署脚本
# 适用于 Ubuntu/Debian 系统

set -e

echo "================================"
echo "明日方舟博客 - VPS 一键部署"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo bash deploy.sh"
    exit 1
fi

# 获取部署目录
DEPLOY_DIR="/var/www/arknights-blog"
echo -e "${YELLOW}部署目录: ${DEPLOY_DIR}${NC}"

# 1. 更新系统
echo -e "\n${GREEN}[1/8] 更新系统包...${NC}"
apt-get update -y
apt-get upgrade -y

# 2. 安装 Node.js (使用 NodeSource)
echo -e "\n${GREEN}[2/8] 安装 Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 3. 安装 Git
echo -e "\n${GREEN}[3/8] 安装 Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
fi
echo "Git 版本: $(git --version)"

# 4. 安装 PM2 (进程管理器)
echo -e "\n${GREEN}[4/8] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "PM2 版本: $(pm2 -v)"

# 5. 克隆或更新项目
echo -e "\n${GREEN}[5/8] 获取项目代码...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo "项目目录已存在，拉取最新代码..."
    cd "$DEPLOY_DIR"
    git pull
else
    echo "克隆项目..."
    git clone https://github.com/bwwq/arknights-blog.git "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# 6. 配置环境变量
echo -e "\n${GREEN}[6/8] 配置环境变量...${NC}"

# 根目录 .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}请编辑 .env 文件设置管理员密码${NC}"
    read -p "请输入管理员密码 (默认: admin123): " ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    sed -i "s/your_admin_password_here/$ADMIN_PASSWORD/" .env
fi

# 后端 .env
if [ ! -f "backend/.env" ]; then
    echo "PORT=3001" > backend/.env
fi

# 7. 安装依赖并构建
echo -e "\n${GREEN}[7/8] 安装依赖...${NC}"

# 安装后端依赖
echo "安装后端依赖..."
cd "$DEPLOY_DIR/backend"
npm install --production

# 安装前端依赖并构建
echo "安装前端依赖并构建..."
cd "$DEPLOY_DIR/frontend"
npm install
npm run build

# 8. 配置 PM2 并启动服务
echo -e "\n${GREEN}[8/8] 配置并启动服务...${NC}"

# 创建 PM2 配置文件
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'arknights-blog-backend',
      cwd: './backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
EOF

# 创建日志目录
mkdir -p "$DEPLOY_DIR/logs"

# 停止旧进程
pm2 delete arknights-blog-backend 2>/dev/null || true

# 启动服务
cd "$DEPLOY_DIR"
pm2 start ecosystem.config.js

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root
pm2 save

# 9. 安装并配置 Nginx
echo -e "\n${GREEN}[额外] 配置 Nginx 反向代理...${NC}"
read -p "是否安装并配置 Nginx? (y/n): " INSTALL_NGINX

if [ "$INSTALL_NGINX" = "y" ] || [ "$INSTALL_NGINX" = "Y" ]; then
    # 安装 Nginx
    if ! command -v nginx &> /dev/null; then
        apt-get install -y nginx
    fi

    # 获取域名
    read -p "请输入您的域名 (留空使用服务器IP): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        DOMAIN=$(curl -s ifconfig.me)
    fi

    # 创建 Nginx 配置
    cat > "/etc/nginx/sites-available/arknights-blog" << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # 前端静态文件
    location / {
        root ${DEPLOY_DIR}/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # WebSocket 支持
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # 上传的图片
    location /uploads {
        alias ${DEPLOY_DIR}/backend/public/uploads;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/arknights-blog /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx

    echo -e "${GREEN}Nginx 配置完成！${NC}"
    echo -e "访问地址: http://${DOMAIN}"
fi

# 10. 配置防火墙
echo -e "\n${GREEN}[额外] 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    echo "y" | ufw enable
    echo -e "${GREEN}防火墙配置完成${NC}"
fi

# 完成
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "后端服务: ${GREEN}运行中${NC}"
echo -e "PM2 状态: ${YELLOW}pm2 status${NC}"
echo -e "查看日志: ${YELLOW}pm2 logs arknights-blog-backend${NC}"
echo ""

if [ "$INSTALL_NGINX" = "y" ] || [ "$INSTALL_NGINX" = "Y" ]; then
    echo -e "访问地址: ${GREEN}http://${DOMAIN}${NC}"
else
    echo -e "后端 API: ${GREEN}http://$(curl -s ifconfig.me):3001${NC}"
    echo -e "${YELLOW}提示: 建议配置 Nginx 反向代理${NC}"
fi

echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  pm2 restart arknights-blog-backend  # 重启服务"
echo "  pm2 stop arknights-blog-backend     # 停止服务"
echo "  pm2 logs arknights-blog-backend     # 查看日志"
echo "  pm2 monit                            # 监控面板"
echo ""
echo -e "${GREEN}感谢使用！${NC}"
