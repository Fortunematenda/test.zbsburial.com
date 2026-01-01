@echo off
setlocal ENABLEDELAYEDEXPANSION
REM Fortai Android APK Build Script

echo ====================================
echo Fortai Android APK Build Process
echo ====================================
echo.

echo Step 1: Checking EAS CLI installation...
call npm list -g eas-cli >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g eas-cli
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install EAS CLI
        pause
        exit /b 1
    )
    echo EAS CLI installed successfully!
) else (
    echo EAS CLI is already installed.
)
echo.

echo Step 2: Checking current directory...
if exist "app.json" (
    echo Already in mobile-app directory.
    echo Current directory: %CD%
) else (
    echo Navigating to mobile-app directory...
    if exist "mobile-app\app.json" (
        cd mobile-app
    ) else (
        echo ERROR: Could not find mobile-app directory or app.json
        echo Current directory: %CD%
        echo Please run this script from the project root or mobile-app directory.
        pause
        exit /b 1
    )
    rem Use delayed expansion so we see the updated folder
    echo Current directory: !CD!
)
echo.

echo Step 3: Installing/updating dependencies...
call npm install
if %errorlevel% neq 0 (
    echo WARNING: npm install had issues, but continuing...
) else (
    echo Dependencies installed successfully!
)
echo.

echo Step 4: Validating Expo project configuration...
call npx expo config --type introspect >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: expo config validation had issues, but this may not be critical.
    echo Run "npx expo config" manually to see details.
    echo Continuing with build...
) else (
    echo Project configuration is valid!
)
echo.

echo Step 4b: Running expo-doctor for additional checks...
call npx expo-doctor >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: expo-doctor found some issues, but they may not be critical.
    echo Run "npx expo-doctor" manually for details.
) else (
    echo All expo-doctor checks passed!
)
echo.

echo Step 5: Checking if logged into Expo...
call eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Not logged in. Please login to Expo...
    echo.
    echo Run: eas login
    echo Then run this script again.
    pause
    exit /b 1
) else (
    echo Already logged into Expo.
    echo.
)

echo Step 6: Starting Android APK build...
echo This will take a while...
echo Build will be uploaded to EAS servers and processed in the cloud.
echo You can monitor progress at: https://expo.dev
echo.

call eas build --platform android --profile preview --clear-cache
set BUILD_ERROR=!errorlevel!
echo.

if not "!BUILD_ERROR!"=="0" (
    echo ====================================
    echo ERROR: Build failed!
    echo ====================================
    echo.
    echo The build failed during one of the EAS build phases.
    echo.
    echo IMPORTANT: Check the detailed error logs at:
    echo   https://expo.dev/accounts/fortunematenda/projects/fortai/builds
    echo.
    echo Look especially for the "Prebuild" phase logs to see the specific error.
    echo Common issues:
    echo   - Missing or invalid app.json configuration
    echo   - Missing required assets (icon.png, splash.png, etc.)
    echo   - Plugin compatibility issues
    echo   - Node version mismatch
    echo.
    echo You can also run locally to test:
    echo   npx expo prebuild --platform android --clean
    echo.
) else (
    echo ====================================
    echo SUCCESS: Build completed!
    echo ====================================
    echo.
    echo Check the output above for the APK download link.
    echo You can also find it at:
    echo   https://expo.dev/accounts/fortunematenda/projects/fortai/builds
    echo.
)

pause
endlocal
