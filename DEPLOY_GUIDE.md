# VPS 部署指南

本项目提供了一键部署脚本，可以快速在 VPS 上部署明日方舟博客。

## 📋 前置要求

- **操作系统**: Ubuntu 20.04+ 或 Debian 11+
- **权限**: Root 或 sudo 权限
- **内存**: 至少 1GB RAM
- **存储**: 至少 2GB 可用空间

## 🚀 快速部署

### 1. 连接到您的 VPS

```bash
ssh root@your-server-ip
```

### 2. 下载部署脚本

```bash
wget https://raw.githubusercontent.com/bwwq/arknights-blog/master/deploy.sh
# 或使用 curl
curl -O https://raw.githubusercontent.com/bwwq/arknights-blog/master/deploy.sh
```

### 3. 运行部署脚本

```bash
chmod +x deploy.sh
sudo bash deploy.sh
```

脚本将自动完成以下操作：

1. ✅ 更新系统包
2. ✅ 安装 Node.js 20.x
3. ✅ 安装 Git
4. ✅ 安装 PM2 进程管理器
5. ✅ 克隆项目代码
6. ✅ 配置环境变量
7. ✅ 安装依赖并构建前端
8. ✅ 启动后端服务
9. ✅ (可选) 配置 Nginx 反向代理

## 🔧 部署后配置

### 查看服务状态

```bash
pm2 status
```

### 查看日志

```bash
pm2 logs arknights-blog-backend
```

### 重启服务

```bash
pm2 restart arknights-blog-backend
```

### 停止服务

```bash
pm2 stop arknights-blog-backend
```

## 🌐 配置域名 (可选)

如果您在部署时选择了配置 Nginx，可以进一步配置 SSL 证书：

### 安装 Certbot

```bash
apt-get install -y certbot python3-certbot-nginx
```

### 获取 SSL 证书

```bash
certbot --nginx -d your-domain.com
```

Certbot 会自动配置 HTTPS 并设置自动续期。

## 📁 项目结构

部署后的项目位于：`/var/www/arknights-blog`

```
/var/www/arknights-blog/
├── backend/              # 后端代码
│   ├── src/
│   ├── public/uploads/   # 上传的图片
│   └── data/            # 博客数据
├── frontend/            # 前端代码
│   └── dist/           # 构建后的静态文件
├── logs/               # 日志文件
└── ecosystem.config.js # PM2 配置
```

## 🔐 安全建议

1. **修改默认密码**
   ```bash
   nano /var/www/arknights-blog/.env
   # 修改 ADMIN_PASSWORD
   ```

2. **配置防火墙**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

3. **定期更新**
   ```bash
   cd /var/www/arknights-blog
   git pull
   cd frontend && npm run build
   pm2 restart arknights-blog-backend
   ```

## 🔄 更新部署

当您更新了代码后，在 VPS 上执行：

```bash
cd /var/www/arknights-blog
git pull
cd frontend
npm install
npm run build
cd ../backend
npm install
pm2 restart arknights-blog-backend
```

## 🐛 故障排查

### 服务无法启动

```bash
# 查看详细日志
pm2 logs arknights-blog-backend --lines 100

# 检查端口占用
netstat -tulpn | grep 3001
```

### Nginx 配置错误

```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 内存不足

```bash
# 查看内存使用
free -h

# 如果内存不足，可以添加 swap
dd if=/dev/zero of=/swapfile bs=1G count=2
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 📊 性能优化

### 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 配置缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📞 获取帮助

如果遇到问题，请：

1. 查看日志: `pm2 logs arknights-blog-backend`
2. 检查服务状态: `pm2 status`
3. 提交 Issue: https://github.com/bwwq/arknights-blog/issues

---

**祝您部署顺利！** 🚀
