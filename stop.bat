@echo off
title 停止明日方舟博客服务

echo.
echo  ========================================
echo    停止所有服务...
echo  ========================================
echo.

:: 关闭所有node进程（谨慎使用！）
echo [*] 正在关闭Node.js进程...
taskkill /F /IM node.exe >nul 2>&1

if errorlevel 1 (
    echo [!] 没有发现运行中的Node.js进程
) else (
    echo [√] 所有Node.js进程已停止
)

echo.
echo  ========================================
echo    服务已停止
echo  ========================================
echo.
pause
