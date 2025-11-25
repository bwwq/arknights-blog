@echo off
chcp 65001
title 明日方舟博客 - 启动器
color 0A

echo.
echo  ========================================
echo    明日方舟风格博客
echo    RHODES ISLAND BLOG LAUNCHER
echo  ========================================
echo.

:: 检查依赖是否已安装
if not exist "frontend\node_modules\" (
    echo [!] 检测到前端依赖未安装
    echo [*] 正在安装前端依赖...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo [X] 前端依赖安装失败！
        pause
        exit /b 1
    )
    cd ..
)

if not exist "backend\node_modules\" (
    echo [!] 检测到后端依赖未安装
    echo [*] 正在安装后端依赖...
    cd backend
    call npm install
    if errorlevel 1 (
        echo [X] 后端依赖安装失败！
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo [√] 依赖检查完成
echo.
echo  ========================================
echo    正在启动服务...
echo  ========================================
echo.

:: 启动后端服务器（新窗口）
echo [*] 启动后端服务器 (端口 3001)...
start "Rhodes Island Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: 等待2秒让后端先启动
timeout /t 2 /nobreak >nul

:: 启动前端服务器（新窗口）
echo [*] 启动前端服务器 (端口 5173)...
start "Rhodes Island Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  ========================================
echo    启动完成！
echo  ========================================
echo.
echo  [√] 后端服务器运行在: http://localhost:3001
echo  [√] 前端服务器运行在: http://localhost:5173
echo.
echo  [*] 正在打开浏览器...

:: 等待3秒后自动打开浏览器并退出
timeout /t 3 /nobreak >nul
start http://localhost:5173

exit
