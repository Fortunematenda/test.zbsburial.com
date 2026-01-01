@echo off
REM Wrapper script that ensures the window stays open
REM This script will run BUILD_COMMANDS.bat and keep the window open

echo ====================================
echo Build Script Wrapper
echo ====================================
echo.
echo This script will run the build process and keep the window open
echo so you can see any error messages.
echo.
echo Current directory: %CD%
echo Script location: %~dp0
echo.
echo Press any key to start...
pause >nul
echo.

REM Change to the script directory
cd /d "%~dp0"
if %errorlevel% neq 0 (
    echo ERROR: Could not change to script directory
    echo Script location: %~dp0
    pause
    exit /b 1
)

echo Changed to: %CD%
echo.

REM Use cmd /k to keep window open even if script fails
REM This ensures we can see error messages
cmd /k "BUILD_COMMANDS.bat"

REM This should never be reached if cmd /k works, but just in case:
echo.
echo ====================================
echo Wrapper script finished
echo ====================================
echo.
pause

