@echo off
REM Simple test script to check if the build environment is set up correctly

echo ====================================
echo Testing Build Environment
echo ====================================
echo.

echo Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not found in PATH
    pause
    exit /b 1
) else (
    node --version
    echo [OK] Node.js is installed
)
echo.

echo Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] npm not found in PATH
    pause
    exit /b 1
) else (
    npm --version
    echo [OK] npm is installed
)
echo.

echo Checking current directory...
echo Current: %CD%
if exist "app.json" (
    echo [OK] Found app.json - in mobile-app directory
) else if exist "mobile-app\app.json" (
    echo [OK] Found mobile-app\app.json - in project root
) else (
    echo [FAIL] Could not find app.json
    echo Please run this from project root or mobile-app directory
    pause
    exit /b 1
)
echo.

echo Checking EAS CLI...
call npm list -g eas-cli >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] EAS CLI not installed globally
    echo Run: npm install -g eas-cli
) else (
    echo [OK] EAS CLI is installed
)
echo.

echo Checking Expo login...
call eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Not logged into Expo
    echo Run: eas login
) else (
    echo [OK] Logged into Expo
)
echo.

echo ====================================
echo Environment check complete!
echo ====================================
echo.
echo If all checks passed, you can run BUILD_COMMANDS.bat
echo.
pause

