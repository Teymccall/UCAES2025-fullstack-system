@echo off
echo Setting up Git repository for UCAES2025...
cd /d "c:\Users\Admin\Desktop\UCAES 1ST\UCAES2025"

echo Initializing git repository...
git init

echo Configuring git user...
git config user.name "UCAES2025"
git config user.email "admin@ucaes.edu.gh"

echo Adding all files to staging...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Complete UCAES2025 fullstack system"

echo Adding remote repository...
git remote add origin https://github.com/Teymccall/UCAES2025-fullstack-system.git

echo Setting up main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Git repository setup complete!
pause