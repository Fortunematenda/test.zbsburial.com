#!/usr/bin/env node

/**
 * Test Setup Script for ZBS Mobile App
 * This script helps verify the mobile app setup
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ZBS Mobile App Setup Test\n');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Make sure you\'re in the mobile-app directory.');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Package Information:');
console.log(`   Name: ${packageJson.name}`);
console.log(`   Version: ${packageJson.version}`);
console.log('');

// Check for required dependencies
console.log('🔍 Checking Dependencies:');
const requiredDeps = [
  'expo',
  'react',
  'react-native',
  '@react-navigation/native',
  'react-native-paper',
  'axios',
  'react-query'
];

let allDepsPresent = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`   ❌ ${dep}: Missing`);
    allDepsPresent = false;
  }
});

if (!allDepsPresent) {
  console.log('\n⚠️  Some dependencies are missing. Run: npm install');
}

console.log('');

// Check for required files
console.log('📁 Checking Required Files:');
const requiredFiles = [
  'App.js',
  'app.json',
  'src/navigation/AuthNavigator.js',
  'src/navigation/MainNavigator.js',
  'src/services/ApiService.js',
  'src/services/AuthService.js',
  'src/screens/auth/LoginScreen.js',
  'src/screens/customer/CustomerDashboard.js'
];

let allFilesPresent = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}: Missing`);
    allFilesPresent = false;
  }
});

console.log('');

// Check API configuration
console.log('🔗 API Configuration:');
const apiServicePath = path.join(__dirname, 'src/services/ApiService.js');
if (fs.existsSync(apiServicePath)) {
  const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
  const apiUrlMatch = apiServiceContent.match(/API_BASE_URL.*?=.*?['"`]([^'"`]+)['"`]/);
  if (apiUrlMatch) {
    console.log(`   ✅ API Base URL: ${apiUrlMatch[1]}`);
  } else {
    console.log('   ⚠️  API Base URL not found in ApiService.js');
  }
} else {
  console.log('   ❌ ApiService.js not found');
}

console.log('');

// Summary
console.log('📋 Setup Summary:');
if (allDepsPresent && allFilesPresent) {
  console.log('   ✅ All dependencies and files are present');
  console.log('   🎉 Your mobile app is ready for testing!');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Run: npm install');
  console.log('   2. Run: npm start');
  console.log('   3. Scan QR code with Expo Go app');
  console.log('   4. Test the authentication flow');
} else {
  console.log('   ⚠️  Some issues found. Please fix them before testing.');
}

console.log('');
console.log('📱 Testing Checklist:');
console.log('   □ Install dependencies (npm install)');
console.log('   □ Start development server (npm start)');
console.log('   □ Test on device with Expo Go');
console.log('   □ Test login/register flow');
console.log('   □ Test customer dashboard');
console.log('   □ Test lead creation');
console.log('   □ Verify API connectivity');
console.log('');

console.log('🔧 Troubleshooting:');
console.log('   • If Metro bundler issues: npx expo start --clear');
console.log('   • If dependency issues: rm -rf node_modules && npm install');
console.log('   • If API connection issues: Check your Laravel backend is running');
console.log('   • If authentication issues: Check API routes in Laravel');
