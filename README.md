# 明日方舟风格博客 | Arknights Blog

一个以《明日方舟》游戏UI为灵感的全栈个人博客平台，featuring实时服务器监控、Markdown博客系统、GitHub集成和角色展示。

## ✨ 特色功能

- 🎨 **明日方舟UI风格**：完整还原游戏界面的设计语言
  - 标志性橙黑配色
  - 切角设计元素
  - 扫描线、故障效果等动画
  - HUD风格数据面板

- 📊 **实时服务器监控**：WebSocket实时推送CPU和内存使用率
- 📝 **Markdown博客系统**：内置SimpleMDE编辑器
- 🔗 **GitHub自动集成**：自动获取并展示你的GitHub仓库和统计数据
- 🎮 **角色展示**：完整角色卡片，数据可自定义

## 🛠️ 技术栈

### 前端
- React 19 + Vite
- React Router (路由)
- Axios (API调用)
- Socket.io-client (实时通信)
- Recharts (数据可视化)
- SimpleMDE (Markdown编辑)
- Octokit (GitHub API)

### 后端
- Node.js + Express
- Socket.io (WebSocket)
- systeminformation (系统监控)
- MongoDB (可选，用于博客存储)

## 📦 安装步骤

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd boke
```

### 2. 安装前端依赖
```bash
cd frontend
npm install
```

### 3. 安装后端依赖
```bash
cd ../backend
npm install
```

### 4. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的配置
```

## 🚀 运行项目

### ⚡ 一键启动（推荐）

**最简单的方式**：双击运行 `start.bat`

这个脚本会自动：
1. 检查并安装依赖（如果需要）
2. 启动后端服务器（新窗口）
3. 启动前端服务器（新窗口）
4. 自动打开浏览器访问 `http://localhost:5173`

**停止服务**：双击运行 `stop.bat`

---

### 开发模式（手动启动）

**终端1 - 启动后端服务器：**
```bash
cd backend
npm run dev
```
后端将运行在 `http://localhost:3001`

**终端2 - 启动前端开发服务器：**
```bash
cd frontend
npm run dev
```
前端将运行在 `http://localhost:5173`

## 🎯 功能说明

### 主页 (/)
- 打字动画效果
- GitHub用户信息和仓库展示
- 技能/技术栈展示

### 服务器监控 (/monitor)
- 实时CPU使用率图表
- 实时内存使用率图表
- WebSocket连接状态指示

### 铃兰角色展示 (/operators)
- 角色立绘展示（来自PRTS Wiki）
- 完整属性面板
- 天赋和技能详情
- 角色背景故事

### 博客系统 (/blog, /editor)
- 博客文章列表
- Markdown编辑器
- 文章详情页

## 📝 自定义配置

### 更改GitHub用户名
编辑 `frontend/src/pages/Home.jsx`，将 `bwwq` 替换为你的GitHub用户名。

### 添加更多角色
编辑 `backend/src/routes/operators.js`，添加更多角色数据。

### 修改颜色主题
编辑 `frontend/src/styles/arknights-theme.css` 中的CSS变量。

## 🎨 明日方舟设计元素

项目中使用的主要设计元素：
- **配色**：`#FF6B00` (明日方舟橙)、`#0A0A0A` (深色背景)
- **字体**：Rajdhani (标题)、Share Tech Mono (正文)
- **切角效果**：使用 `clip-path` 实现标志性切角
- **动画**：扫描线、故障效果、边框脉冲

## 📸 截图

*(建议运行项目后添加截图)*

## 🤝 贡献

欢迎提交Issue和Pull Request!

## 📄 许可证

MIT License

## 🙏 致谢

- 明日方舟游戏UI设计灵感
- PRTS Wiki提供角色数据
- GitHub API

---

**Created with ❤️ and ☕ | Inspired by Arknights**
