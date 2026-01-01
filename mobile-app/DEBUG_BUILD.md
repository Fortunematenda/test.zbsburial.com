# Debugging EAS Build Failures

## JavaScript Bundling Errors

If your build fails at the "Bundle JavaScript" phase, follow these steps:

### 1. Check Build Logs
Visit: https://expo.dev/accounts/fortunematenda/projects/fortai/builds
- Look for the failed build
- Scroll to the "Bundle JavaScript" phase
- Copy the exact error message

### 2. Test Bundling Locally
```bash
# Test if the bundle can be created locally
npx expo export --platform android

# If that works, try:
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output test.bundle
```

### 3. Common Issues and Fixes

#### Syntax Errors
- Check all `.js` and `.jsx` files for syntax errors
- Look for unclosed brackets, parentheses, or quotes
- Check for missing semicolons (if using strict mode)

#### Import/Export Errors
```bash
# Check for circular dependencies
npx madge --circular src/

# Check for missing imports
grep -r "import.*from.*undefined" src/
```

#### Dependency Issues
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency warnings
npm install --legacy-peer-deps
```

#### Metro Bundler Configuration
Check `metro.config.js` for:
- Incorrect transformer settings
- Missing asset extensions
- Wrong source extensions

### 4. Build-Specific Fixes

#### For EAS Build
- Ensure `.easignore` excludes unnecessary files
- Verify `eas.json` configuration is correct
- Check that all required files are included

#### Reduce Bundle Size
The build mentioned 153 MB archive size. To reduce:
- Update `.easignore` to exclude more files
- Remove unused assets
- Exclude test files and documentation

### 5. Get Detailed Error
```bash
# Build with verbose logging
eas build --platform android --profile preview --clear-cache --non-interactive
```

### 6. Common Error Patterns

**"Cannot find module"**
- Missing dependency in package.json
- Incorrect import path
- Case sensitivity issues (Windows vs Linux)

**"SyntaxError: Unexpected token"**
- JSX in `.js` file (should be `.jsx`)
- Missing Babel transformation
- Incorrect babel.config.js

**"Cannot read property of undefined"**
- Runtime error during bundling
- Check for undefined imports
- Verify all required props are passed

**"Maximum call stack size exceeded"**
- Circular dependency
- Infinite recursion in code
- Deeply nested imports

## Quick Diagnostic Commands

```bash
# Check for obvious errors
npm run start:raw

# Verify configuration
npx expo config --type introspect

# Check for dependency conflicts
npm ls --depth=0

# Test bundle creation
npx expo export --platform android
```

