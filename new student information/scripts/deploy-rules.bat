@echo off
echo === Deploying Firestore Rules ===
echo.
echo Make sure you have installed Firebase CLI with: npm install -g firebase-tools
echo.
firebase login
firebase use ucaes2025
firebase deploy --only firestore:rules
echo.
echo Done! Press any key to exit.
pause > nul
