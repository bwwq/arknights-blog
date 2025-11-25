# 罗德岛终端 | Rhodes Island Terminal

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?style=flat&logo=react)
![Node](https://img.shields.io/badge/Node.js-v18+-339933.svg?style=flat&logo=node.js)
![Style](https://img.shields.io/badge/Style-Arknights-orange.svg)

> **"博士，欢迎回到罗德岛。"**

一个深度还原《明日方舟》游戏UI风格的全栈个人博客系统。不仅仅是皮肤，更是从交互到动画的完整复刻。

---

## ✨ 核心特性

### 🎨 极致还原的 UI 设计
- **沉浸式体验**：标志性的橙黑配色、切角设计、扫描线与故障艺术效果。
- **动态交互**：打字机效果、HUD 数据面板、平滑的过渡动画。
- **响应式布局**：完美适配桌面端与移动端，随时随地访问终端。

### 🛠️ 强大的功能模块
- **🚀 初始化向导**：首次启动自动引导配置，无需修改代码即可设置 GitHub 用户名和管理员密码。
- **📊 实时监控系统**：基于 WebSocket 的服务器状态监控（CPU、内存、运行时间）。
- **🔗 GitHub 深度集成**：
  - 自动同步个人资料与仓库列表。
  - **真实活动统计**：直观展示最近的 GitHub 贡献动态（支持 API 限流自动降级）。
- **📝 Markdown 博客**：内置 SimpleMDE 编辑器，支持图片上传、标签管理。
- **🎮 干员档案**：精美的角色展示页面，还原游戏内档案查看体验。

---

## 🚀 快速开始

### Windows 用户 (推荐)

双击运行根目录下的 **`start.bat`** 即可。
脚本会自动：
1. 检查并安装所有依赖。
2. 启动后端 (Port 3001) 和前端 (Port 5173)。
3. 自动打开浏览器。

### Linux / VPS 用户

使用我们要一键部署脚本：

```bash
chmod +x deploy.sh
./deploy.sh
```

### 手动安装

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/arknights-blog.git
   cd arknights-blog
   ```

2. **安装依赖**
   ```bash
   # 后端
   cd backend
   npm install

   # 前端
   cd ../frontend
   npm install
   ```

3. **启动开发服务器**
   ```bash
   # 终端 1 (后端)
   cd backend
   npm run dev

   # 终端 2 (前端)
   cd frontend
   npm run dev
   ```

---

## ⚙️ 配置指南

### 系统初始化
首次访问时，系统会进入**初始化向导**：
1. **GitHub 用户名**：输入你的 GitHub ID，系统将自动拉取你的头像和公开仓库。
2. **GitHub Token (可选)**：
   - 推荐配置以提高 API 限流阈值（从 60次/小时 提升至 5000次/小时）。
   - 申请地址：[GitHub Settings > Tokens](https://github.com/settings/tokens) (只需 `public_repo` 权限)。
3. **管理员密码**：设置用于登录博客后台的密钥。

### 环境变量 (.env)
系统会自动生成 `.env` 文件。如果需要手动配置：

```env
PORT=3001
# 管理员密码 (初始化时自动设置)
ADMIN_PASSWORD=your_secure_password
# GitHub Token (可选，用于提高API限流)
GITHUB_TOKEN=ghp_xxxxxx
```

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | React 19, Vite | 现代化构建与组件化开发 |
| **样式** | CSS Modules, Arknights Theme | 纯 CSS 实现复杂 UI 效果 |
| **后端** | Node.js, Express | 轻量级 RESTful API |
| **通信** | Socket.io, Axios | 实时监控与数据请求 |
| **数据** | JSON / MongoDB | 灵活的数据存储方案 |

---

## 📂 项目结构

```
arknights-blog/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── routes/          # API 路由 (GitHub, Setup, Monitor...)
│   │   └── server.js        # 入口文件
│   └── data/                # 本地数据存储
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 复用组件 (Navbar, Cards...)
│   │   ├── pages/           # 页面 (Home, Blog, Setup...)
│   │   └── styles/          # 全局样式与主题变量
├── start.bat                # Windows 启动脚本
└── deploy.sh                # Linux 部署脚本
```

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！无论是修复 Bug、添加新功能还是改进 UI，都非常欢迎。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源。

---

<div align="center">
  <p>Created with ❤️ by <a href="https://github.com/bwwq">bwwq</a></p>
  <p><i>Inspired by Arknights (HyperGryph)</i></p>
</div>
