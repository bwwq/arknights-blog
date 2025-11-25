# 明日方舟风格程序员博客 - 演示指南

## 🎮 完成的功能

### ✅ 前端
1. **明日方舟完整UI设计系统**
   - 橙黑配色方案
   - 切角设计（clip-path）
   - 扫描线、故障效果动画
   - 自定义滚动条和按钮

2. **主页 (`/`)**
   - 打字动画Hero区域
   - 自动获取GitHub用户数据（bwwq）
   - 仓库展示网格
   - 技能/技术栈展示

3. **服务器监控 (`/monitor`)**
   - 实时CPU使用率图表
   - 实时内存使用率图表
   - WebSocket连接状态
   - 明日方舟HUD风格仪表盘

4. **铃兰角色展示 (`/operators`)**
   - 完整游戏UI复刻
   - 角色立绘（来自PRTS Wiki）
   - 属性、天赋、技能展示
   - 角色背景故事

5. **博客系统**
   - 博客列表 (`/blog`)
   - Markdown编辑器 (`/editor`)
   - 文章详情页 (`/blog/:id`)

### ✅ 后端
1. **Express API服务器**
2. **WebSocket实时监控**（Socket.io）
3. **铃兰角色数据API**
4. **GitHub数据获取服务**（带缓存）
5. **博客CRUD API**

## 🚀 如何运行

### 方式1：手动安装依赖（推荐）

由于PowerShell执行策略限制，请使用cmd运行：

```cmd
# 安装前端依赖
cd frontend
cmd /c "npm install"

# 安装后端依赖
cd ../backend  
cmd /c "npm install"

# 启动后端（新终端）
cd backend
cmd /c "npm run dev"

# 启动前端（新终端）
cd frontend
cmd /c "npm run dev"
```

### 方式2：修改PowerShell执行策略

```powershell
# 以管理员身份运行PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后正常使用npm命令
cd frontend
npm install
npm run dev
```

## 📊 功能演示清单

运行成功后，访问 `http://localhost:5173` 并测试：

- [ ] 主页加载，查看打字动画
- [ ] 主页显示GitHub数据（bwwq的仓库和统计）
- [ ] 点击导航栏 MONITOR，查看实时监控
- [ ] 确认CPU和内存图表实时更新
- [ ] 点击 OPERATOR，查看铃兰角色卡片
- [ ] 查看铃兰的立绘、属性、技能
- [ ] 点击 BLOG，查看博客列表
- [ ] 点击 EDITOR，测试Markdown编辑器

## 🎨 设计特色

所有页面都采用明日方舟游戏UI设计：
- **切角容器**：所有卡片、按钮都有标志性切角
- **橙色主题**：`#FF6B00` 作为主色调
- **扫描线动画**：页面顶部持续扫描
- **悬停效果**：元素悬停时有发光和位移动画
- **HUD风格**：监控页面完全模仿游戏内HUD

## 🔧 已知问题和改进

### 当前限制
1. **博客存储**：使用内存数组（重启后数据丢失）
   - 改进：连接MongoDB持久化存储
2. **认证系统**：无用户登录
   - 改进：添加JWT认证保护编辑功能

### 未来增强
1. 添加更多明日方舟角色
2. 实现博客评论系统
3. 添加暗黑/光明主题切换
4. 优化移动端体验

## 📝 自定义说明

在 `README.md` 中已包含完整的自定义指南，包括：
- 修改GitHub用户名
- 添加更多角色
- 调整颜色主题
- 配置环境变量

## 🎯 项目亮点

1. **完整还原明日方舟UI** - 每个细节都追求游戏风格
2. **实时监控整合** - 真实的服务器数据展示
3. **PRTS数据集成** - 直接从Wiki获取角色信息
4. **全栈架构** - 前后端分离，易于扩展
5. **现代技术栈** - React 19 + Node.js + Socket.io

---

**准备好体验Rhodes Island了吗？Doctor，欢迎归来！** 🦊
