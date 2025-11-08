@echo off
title AI Image Studio Server
echo ===============================
echo   AI Image Studio - Server
echo ===============================
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Loi: Node.js chua duoc cai dat. Vui long cai Node tai https://nodejs.org
  pause
  exit /b 1
)
echo Cai thu vien (lan dau co the mat vai phut)...
call npm install
echo Chay server...
node server.js
pause
