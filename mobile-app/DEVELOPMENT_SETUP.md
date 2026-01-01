# Development Setup Guide

## API URL Configuration for Development

When running the app in development mode (Expo Go), you need to configure the API URL correctly.

### Option 1: Use Production API (Easiest)
The app will automatically use `https://test.zbsburial.com/api` in production builds. For development, you can force it by setting environment variable.

### Option 2: Connect to Local Laravel Server

#### For Physical Device:
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Example: `192.168.1.100`

2. Make sure your Laravel server is accessible from the network:
   - If using WAMP: Ensure Apache is running
   - Check Windows Firewall allows port 80
   - Your device and computer must be on the same network

3. Create `.env` file in `mobile-app` directory:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100/api
   ```
   (Replace `192.168.1.100` with your computer's IP)

4. Restart Expo server:
   ```bash
   npm start
   ```

#### For Android Emulator:
- Uses `http://10.0.2.2/api` (maps to localhost on host machine)
- Make sure WAMP is running and accessible on localhost

#### For iOS Simulator:
- Uses `http://localhost/api`
- Make sure WAMP is running on port 80

### Option 3: Use Tunnel (ngrok)
If you want to test with production-like setup:
1. Install ngrok
2. Run: `ngrok http 80`
3. Use the ngrok URL in `.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok.io/api
   ```

## Running the App

### Option 1: Expo Go (Recommended for Development)

The easiest way to run the app during development is using Expo Go on your physical device:

1. **Start the Expo dev server:**
   ```bash
   cd mobile-app
   npm start
   # or
   npx expo start
   ```

2. **Connect your device:**
   - **Android**: Install "Expo Go" from Google Play Store, then scan the QR code shown in terminal
   - **iOS**: Install "Expo Go" from App Store, then scan the QR code with Camera app
   - Make sure your device and computer are on the same Wi-Fi network

3. The app will automatically reload when you make code changes.

### Option 2: Android Emulator

If you need to run on an Android emulator, you'll need to set up Android SDK first:

1. **Install Android Studio** (includes Android SDK):
   - Download from: https://developer.android.com/studio
   - During installation, make sure to install Android SDK, Android SDK Platform, and Android Virtual Device

2. **Set up environment variables:**
   - Add Android SDK to your PATH:
     - `ANDROID_HOME` = `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
     - Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

3. **Create an Android Virtual Device (AVD):**
   - Open Android Studio → Tools → Device Manager
   - Click "Create Device"
   - Select a device (e.g., Pixel 5)
   - Select a system image (API 33 or 34 recommended)
   - Finish setup

4. **Start the emulator:**
   - From Android Studio: Device Manager → Click play button on your AVD
   - Or from command line: `emulator -avd <AVD_NAME>`

5. **Run the app:**
   ```bash
   cd mobile-app
   npx expo run:android
   ```

   Or if emulator is already running:
   ```bash
   npm start
   # Then press 'a' to open on Android emulator
   ```

### Option 3: iOS Simulator (macOS only)

1. Make sure Xcode is installed
2. Start the simulator:
   ```bash
   open -a Simulator
   ```
3. Run the app:
   ```bash
   cd mobile-app
   npx expo run:ios
   ```

## Troubleshooting

### No Android Device/Emulator Found:
- Make sure Android Studio is installed and Android SDK is set up
- Verify `adb` is in your PATH: `adb devices`
- Start an emulator manually before running `npx expo run:android`
- Or use Expo Go on a physical device instead (easier setup)

### Services not loading:
1. Check the Metro bundler console for API errors
2. Verify the API URL is correct in the logs
3. Test the API endpoint in browser: `http://your-ip/api/all-services`
4. Check Laravel CORS settings if using different domain/port
5. Verify database connection in Laravel `.env`

### SDK Version Mismatch:
- Current project: SDK 50
- Use Expo Go SDK 50 or upgrade project to SDK 54

### Metro Bundler Errors:
- These are usually harmless symbolication errors
- Already filtered by `start-with-error-filter.js`
- If persistent, clear cache: `npx expo start --clear`

