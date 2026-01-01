@echo off
setlocal ENABLEDELAYEDEXPANSION
REM Fix Development Errors Script for Fortai Mobile App

echo ====================================
echo Fixing Development Errors
echo ====================================
echo.

echo Step 1: Clearing Metro bundler cache...
call npx expo start --clear
if %errorlevel% neq 0 (
    echo Clearing cache...
    call npx expo start --clear --reset-cache
)
echo.

echo Step 2: Clearing watchman cache (if installed)...
call watchman watch-del-all >nul 2>&1
if %errorlevel% equ 0 (
    echo Watchman cache cleared.
) else (
    echo Watchman not installed, skipping...
)
echo.

echo Step 3: Removing Metro bundler cache...
if exist "%TEMP%\metro-*" (
    del /q /s "%TEMP%\metro-*" >nul 2>&1
    echo Metro temp files cleared.
)
if exist "%TEMP%\haste-map-*" (
    del /q /s "%TEMP%\haste-map-*" >nul 2>&1
    echo Haste map temp files cleared.
)
echo.

echo Step 4: Checking SDK version compatibility...
findstr /C:"\"expo\"" package.json | findstr /C:"50" >nul 2>&1
if %errorlevel% equ 0 (
    echo Current SDK: 50
    echo.
    echo ====================================
    echo SDK VERSION MISMATCH DETECTED
    echo ====================================
    echo Your Expo Go app is SDK 54, but your project uses SDK 50.
    echo.
    echo OPTIONS:
    echo   1. Upgrade project to SDK 54 (Recommended)
    echo   2. Use Expo Go SDK 50 on your device
    echo.
    echo To upgrade to SDK 54:
    echo   npx expo install expo@latest
    echo   npx expo install --fix
    echo.
    echo To use SDK 50:
    echo   Install Expo Go SDK 50 from:
    echo   https://expo.dev/go?sdkVersion=50^&platform=android^&device=true
    echo.
) else (
    echo SDK version check passed.
)
echo.

echo Step 5: Checking node_modules...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies exist.
)
echo.

echo Step 6: Verifying App.js structure...
findstr /C:"export default function App" App.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] App.js has correct export.
) else (
    echo [WARNING] App.js structure may be incorrect.
)
echo.

echo ====================================
echo Fix Summary
echo ====================================
echo.
echo To fix the issues, try:
echo   1. Clear cache: npx expo start --clear
echo   2. Reset cache: npx expo start --reset-cache
echo   3. Fix SDK mismatch (choose one):
echo      - Upgrade: npx expo install expo@latest
echo      - Or use SDK 50 Expo Go on device
echo.
echo Then restart the development server:
echo   npm start
echo.

pause

