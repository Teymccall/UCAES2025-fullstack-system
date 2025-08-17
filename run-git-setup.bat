@echo off
title UCAES2025 GitHub Setup
color 0A
echo ====================================
echo    UCAES2025 GitHub Repository Setup
echo ====================================
echo.
echo Setting up Git repository for UCAES2025...
echo.

REM Change to the correct directory
cd /d "c:\Users\Admin\Desktop\UCAES 1ST\UCAES2025"

echo Initializing git repository...
git init
if errorlevel 1 goto error

echo Adding all files...
git add .
if errorlevel 1 goto error

echo Creating initial commit...
git commit -m "Initial commit: Complete UCAES2025 fullstack system"
if errorlevel 1 goto error

echo Adding remote repository...
git remote add origin https://github.com/Teymccall/UCAES2025-fullstack-system.git
if errorlevel 1 goto error

echo Setting main branch...
git branch -M main
if errorlevel 1 goto error

echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 goto error

echo.
echo ====================================
echo    Setup Complete! 
echo ====================================
echo Repository: https://github.com/Teymccall/UCAES2025-fullstack-system.git
echo.
pause
exit

:error
echo.
echo ====================================
echo    Error occurred during setup
echo ====================================
echo Check the error messages above and try again.
echo.
pause