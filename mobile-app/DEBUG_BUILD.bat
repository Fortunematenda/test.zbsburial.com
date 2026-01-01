@echo off
REM Debug script to find out why BUILD_COMMANDS.bat closes immediately
REM This will show exactly where the script fails

echo ====================================
echo BUILD SCRIPT DEBUGGER
echo ====================================
echo.
echo This script will help identify why BUILD_COMMANDS.bat closes immediately.
echo.
echo Press any key to start debugging...
pause >nul
echo.

REM Change to script directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Test 1: Check if we can see output
echo [TEST 1] Testing basic echo...
echo This should be visible.
echo.

REM Test 2: Check Node.js
echo [TEST 2] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not found!
    echo This is likely why the script closes.
    echo.
    pause
    exit /b 1
) else (
    echo [PASS] Node.js found
    node --version
)
echo.

REM Test 3: Check npm
echo [TEST 3] Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] npm not found!
    echo This is likely why the script closes.
    echo.
    pause
    exit /b 1
) else (
    echo [PASS] npm found
    npm --version
)
echo.

REM Test 4: Check directory
echo [TEST 4] Checking for app.json...
if exist "app.json" (
    echo [PASS] Found app.json in current directory
) else if exist "mobile-app\app.json" (
    echo [INFO] Found mobile-app\app.json - need to change directory
) else (
    echo [FAIL] app.json not found!
    echo Current directory: %CD%
    echo This might be why the script closes.
    echo.
    pause
    exit /b 1
)
echo.

REM Test 5: Try running the actual script with error trapping
echo [TEST 5] Attempting to run BUILD_COMMANDS.bat...
echo.
echo If the window closes now, the error is in BUILD_COMMANDS.bat
echo.
echo Press any key to continue...
pause >nul
echo.

REM Use cmd /k to keep window open even on error
cmd /k "BUILD_COMMANDS.bat"

echo.
echo ====================================
echo Debug session complete
echo ====================================
echo.
pause

