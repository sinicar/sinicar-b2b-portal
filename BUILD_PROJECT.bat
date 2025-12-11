@echo off
chcp 65001 >nul
echo ========================================
echo    SiniCar - Build Script
echo ========================================
echo.

cd /d "e:\مواقع تم تصميها اكرم\موقع الخدمة الذاتية الجديد\موقع الجملة بعد التقسيم\جديد\nDm-lkhdm-ldhty-1 (8)\nDm-lkhdm-ldhty-1"

echo [1/2] Installing dependencies...
call npm install
echo Done!
echo.

echo [2/2] Building the project...
call npm run build
echo.

echo ========================================
echo    Build Complete!
echo ========================================
echo.
echo Your files are ready in the "dist" folder.
echo.
echo Now upload the contents of "dist" folder to Hostinger.
echo.

start "" "dist"

pause
