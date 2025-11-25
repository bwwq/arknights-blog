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
    echo -e "${YELLOW}.env 文件已创建，请通过网页端初始化向导设置密码${NC}"
fi

# 确保 config.json 存在且可写
if [ ! -f "config.json" ]; then
    echo '{"isInitialized": false}' > config.json
    chmod 666 config.json
    echo -e "${GREEN}已创建 config.json${NC}"
else
    # 确保已有文件也是可写的
    chmod 666 config.json
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
npm install --legacy-peer-deps
npm run build

# 8. 配置 PM2 并启动服务
echo -e "\n${GREEN}[8/8] 配置并启动服务...${NC}"

# 安装 serve 用于托管前端
if ! command -v serve &> /dev/null; then
    echo "安装 serve..."
    npm install -g serve
fi

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
    },
    {
      name: 'arknights-blog-frontend',
      cwd: './frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log'
    }
  ]
};
EOF

# 创建日志目录
mkdir -p "$DEPLOY_DIR/logs"

# 停止旧进程
pm2 delete arknights-blog-backend 2>/dev/null || true
pm2 delete arknights-blog-frontend 2>/dev/null || true

# 启动服务
cd "$DEPLOY_DIR"
pm2 start ecosystem.config.js

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root
pm2 save

# 9. 完成
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "后端服务: ${GREEN}运行中 (Port 3001)${NC}"
echo -e "前端服务: ${GREEN}运行中 (Port 5173)${NC}"
echo -e "PM2 状态: ${YELLOW}pm2 status${NC}"
echo ""
echo -e "后端 API: ${GREEN}http://$(curl -s ifconfig.me):3001${NC}"
echo -e "前端访问: ${GREEN}http://$(curl -s ifconfig.me):5173${NC}"
echo -e "${YELLOW}提示: 请在您的反向代理软件中将域名指向 http://localhost:5173${NC}"

echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  pm2 restart all                     # 重启所有服务"
echo "  pm2 stop all                        # 停止所有服务"
echo "  pm2 logs                            # 查看日志"
echo "  pm2 monit                           # 监控面板"
echo ""
echo -e "${GREEN}感谢使用！${NC}"
