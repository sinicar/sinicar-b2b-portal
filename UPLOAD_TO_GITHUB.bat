@echo off
chcp 65001 >nul
echo ========================================
echo    SiniCar - GitHub Upload Script
echo ========================================
echo.

cd /d "e:\مواقع تم تصميها اكرم\موقع الخدمة الذاتية الجديد\موقع الجملة بعد التقسيم\جديد\nDm-lkhdm-ldhty-1 (8)\nDm-lkhdm-ldhty-1"

echo [1/3] Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/sinicar/sinicar-b2b-portal.git
echo Done!
echo.

echo [2/3] Setting branch to main...
git branch -M main
echo Done!
echo.

echo [3/3] Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo    Upload Complete!
echo ========================================
echo.
echo Your code is now on GitHub:
echo https://github.com/sinicar/sinicar-b2b-portal
echo.
pause
