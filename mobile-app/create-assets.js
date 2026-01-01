const fs = require('fs');
const path = require('path');

// Create a simple SVG icon as placeholder
const createIcon = () => {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#FF2D20"/>
    <text x="512" y="512" font-family="Arial" font-size="400" fill="white" text-anchor="middle" dominant-baseline="middle">Z</text>
  </svg>`;
};

// Create a simple SVG splash screen
const createSplash = () => {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#ffffff"/>
    <text x="512" y="400" font-family="Arial" font-size="120" fill="#FF2D20" text-anchor="middle" dominant-baseline="middle">ZBS</text>
    <text x="512" y="500" font-family="Arial" font-size="40" fill="#666" text-anchor="middle" dominant-baseline="middle">Service Marketplace</text>
  </svg>`;
};

// Create favicon
const createFavicon = () => {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#FF2D20"/>
    <text x="16" y="20" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">Z</text>
  </svg>`;
};

// Create notification icon
const createNotificationIcon = () => {
  return `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="#FF2D20"/>
    <text x="48" y="60" font-family="Arial" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">Z</text>
  </svg>`;
};

// Create adaptive icon
const createAdaptiveIcon = () => {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#FF2D20"/>
    <text x="512" y="512" font-family="Arial" font-size="400" fill="white" text-anchor="middle" dominant-baseline="middle">Z</text>
  </svg>`;
};

// Create the assets
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write SVG files
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createIcon());
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createSplash());
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createFavicon());
fs.writeFileSync(path.join(assetsDir, 'notification-icon.png'), createNotificationIcon());
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createAdaptiveIcon());

console.log('Assets created successfully!');
