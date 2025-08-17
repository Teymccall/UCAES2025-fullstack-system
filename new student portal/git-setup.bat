@echo off
cd "c:\Users\Admin\Desktop\UCAES 1ST\UCAES2025\new student portal"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Teymccall/UCAES2025-fullstack-system.git
git branch -M main
git push -u origin main
pause