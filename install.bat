@echo off
echo ================================
echo 明日方舟博客 - 快速安装脚本
echo ================================
echo.

echo [1/4] 安装前端依赖...
cd frontend
call npm install
if errorlevel 1 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] 安装后端依赖...
cd backend
call npm install
if errorlevel 1 (
    echo 后端依赖安装失败！
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] 创建环境变量文件...
if not exist .env (
    copy .env.example .env
    echo .env 文件已创建，请按需修改
)

echo.
echo [4/4] 安装完成！
echo.
echo ================================
echo 如何运行项目：
echo ================================
echo.
echo 1. 打开第一个终端，运行：
echo    cd backend
echo    npm run dev
echo.
echo 2. 打开第二个终端，运行：
echo    cd frontend  
echo    npm run dev
echo.
echo 3. 访问 http://localhost:5173
echo.
echo ================================
pause
