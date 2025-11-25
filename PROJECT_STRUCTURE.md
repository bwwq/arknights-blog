# 项目文件结构总览

```
d:/boke/
│
├── 📁 frontend/                    # 前端项目（React + Vite）
│   ├── 📁 src/
│   │   ├── 📁 components/          # 可复用组件
│   │   │   ├── ArkPanel.jsx        # 明日方舟面板组件
│   │   │   ├── ArkPanel.css
│   │   │   ├── Navbar.jsx          # 导航栏
│   │   │   └── Navbar.css
│   │   │
│   │   ├── 📁 pages/               # 页面组件
│   │   │   ├── Home.jsx            # 🏠 主页（GitHub集成）
│   │   │   ├── Home.css
│   │   │   ├── Monitor.jsx         # 📊 服务器监控
│   │   │   ├── Monitor.css
│   │   │   ├── Operators.jsx       # 🦊 铃兰角色展示
│   │   │   ├── Operators.css
│   │   │   ├── Blog.jsx            # 📝 博客列表
│   │   │   ├── Blog.css
│   │   │   ├── BlogPost.jsx        # 📄 博客详情
│   │   │   ├── BlogPost.css
│   │   │   ├── BlogEditor.jsx      # ✏️ Markdown编辑器
│   │   │   └── BlogEditor.css
│   │   │
│   │   ├── 📁 styles/
│   │   │   └── arknights-theme.css # 🎨 完整设计系统
│   │   │
│   │   ├── App.jsx                 # React主应用
│   │   └── main.jsx                # 入口文件
│   │
│   ├── index.html                  # HTML模板
│   ├── package.json                # 前端依赖配置
│   └── vite.config.js              # Vite配置
│
├── 📁 backend/                     # 后端项目（Node.js + Express）
│   ├── 📁 src/
│   │   ├── 📁 routes/              # API路由
│   │   │   ├── operators.js        # 角色数据API
│   │   │   ├── github.js           # GitHub集成API
│   │   │   └── blog.js             # 博客CRUD API
│   │   │
│   │   └── server.js               # Express主服务器 + WebSocket
│   │
│   └── package.json                # 后端依赖配置
│
├── 📄 start.bat                    # ⚡ 一键启动脚本
├── 📄 stop.bat                     # 🛑 停止服务脚本
├── 📄 install.bat                  # 📦 安装依赖脚本
│
├── 📄 README.md                    # 项目文档
├── 📄 QUICKSTART.md                # 快速开始指南
├── 📄 DEMO_GUIDE.md                # 演示指南
├── 📄 .env.example                 # 环境变量示例
└── 📄 .gitignore                   # Git忽略文件
```

## 🎯 核心文件说明

### 前端核心文件

| 文件 | 功能 | 亮点 |
|------|------|------|
| `arknights-theme.css` | 设计系统 | 完整的明日方舟UI风格（切角、动画、配色） |
| `Home.jsx` | 主页 | 打字动画、GitHub API集成 |
| `Monitor.jsx` | 监控页 | WebSocket实时图表、HUD风格 |
| `Operators.jsx` | 角色页 | 铃兰完整数据展示、PRTS立绘 |
| `ArkPanel.jsx` | 面板组件 | 可复用的明日方舟风格容器 |

### 后端核心文件

| 文件 | 功能 | 技术 |
|------|------|------|
| `server.js` | 主服务器 | Express + Socket.io + 路由配置 |
| `operators.js` | 角色API | 铃兰数据（基于PRTS Wiki） |
| `github.js` | GitHub API | Octokit + 缓存机制 |
| `blog.js` | 博客API | 完整CRUD操作 |

### 启动脚本

| 脚本 | 用途 | 说明 |
|------|------|------|
| `start.bat` | 一键启动 | 检查依赖→启动前后端→打开浏览器 |
| `stop.bat` | 停止服务 | 关闭所有Node.js进程 |
| `install.bat` | 安装依赖 | 仅安装npm包 |

## 📊 技术栈分布

```
前端 (frontend/)
├── React 19          → UI框架
├── Vite              → 构建工具
├── React Router      → 路由管理
├── Axios             → HTTP客户端
├── Socket.io-client  → WebSocket客户端
├── Recharts          → 图表可视化
├── SimpleMDE         → Markdown编辑
└── Octokit           → GitHub API

后端 (backend/)
├── Express           → Web框架
├── Socket.io         → WebSocket服务器
├── systeminformation → 系统监控
├── Octokit           → GitHub API
└── node-cache        → 缓存管理
```

## 🎨 页面路由

| 路径 | 组件 | 功能 |
|------|------|------|
| `/` | Home | 主页、GitHub展示 |
| `/monitor` | Monitor | 实时服务器监控 |
| `/operators` | Operators | 铃兰角色展示 |
| `/blog` | Blog | 博客文章列表 |
| `/blog/:id` | BlogPost | 博客文章详情 |
| `/editor` | BlogEditor | Markdown编辑器 |

## 🔌 API端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/operators/suzuran` | GET | 获取铃兰数据 |
| `/api/github/user/:username` | GET | 获取GitHub用户 |
| `/api/github/repos/:username` | GET | 获取GitHub仓库 |
| `/api/blogs` | GET | 获取所有博客 |
| `/api/blogs/:id` | GET | 获取单篇博客 |
| `/api/blogs` | POST | 创建博客 |
| `/api/blogs/:id` | PUT | 更新博客 |
| `/api/blogs/:id` | DELETE | 删除博客 |

## 🌐 WebSocket事件

| 事件 | 方向 | 数据 |
|------|------|------|
| `connect` | Client→Server | 建立连接 |
| `serverStats` | Server→Client | `{ cpu, memory }` |
| `disconnect` | Client→Server | 断开连接 |

---

**快速开始**：双击 `start.bat` 🚀
