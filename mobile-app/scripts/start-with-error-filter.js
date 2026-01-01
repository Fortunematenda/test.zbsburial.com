#!/usr/bin/env node

/**
 * Metro bundler startup script with error filtering
 * Filters out harmless Metro symbolication JSON parsing errors
 */

const { spawn } = require('child_process');
const path = require('path');

// Filter function to suppress Metro symbolication errors and non-critical network errors
function shouldSuppressError(line) {
  if (!line || typeof line !== 'string') return false;
  
  // Check for Metro symbolication JSON parsing errors
  const hasSyntaxError = line.includes('SyntaxError');
  const hasJsonError = line.includes('not valid JSON');
  const hasSymbolicate = line.includes('_symbolicate') || line.includes('symbolicate');
  const isSymbolicationError = hasSyntaxError && hasJsonError && hasSymbolicate;
  
  // Check for non-critical Expo API fetch errors (dependency validation)
  const isFetchError = (
    line.includes('TypeError: fetch failed') ||
    line.includes('getNativeModuleVersionsAsync') ||
    line.includes('validateDependenciesVersionsAsync')
  );
  
  return isSymbolicationError || isFetchError;
}

// Buffer for incomplete lines
let stdoutBuffer = '';
let stderrBuffer = '';

// Start Expo with error filtering
// Note: Fetch errors during dependency validation are non-critical and filtered out
const expoProcess = spawn('npx', ['expo', 'start', ...process.argv.slice(2)], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  cwd: path.join(__dirname, '..'),
});

// Filter stdout
expoProcess.stdout.on('data', (data) => {
  stdoutBuffer += data.toString();
  const lines = stdoutBuffer.split('\n');
  stdoutBuffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  lines.forEach((line) => {
    if (line && !shouldSuppressError(line)) {
      process.stdout.write(line + '\n');
    }
  });
});

// Filter stderr
expoProcess.stderr.on('data', (data) => {
  stderrBuffer += data.toString();
  const lines = stderrBuffer.split('\n');
  stderrBuffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  lines.forEach((line) => {
    if (line && !shouldSuppressError(line)) {
      process.stderr.write(line + '\n');
    }
  });
});

// Flush buffers on close
expoProcess.on('close', (code) => {
  if (stdoutBuffer && !shouldSuppressError(stdoutBuffer)) {
    process.stdout.write(stdoutBuffer);
  }
  if (stderrBuffer && !shouldSuppressError(stderrBuffer)) {
    process.stderr.write(stderrBuffer);
  }
  process.exit(code);
});

expoProcess.on('error', (error) => {
  console.error('Failed to start Expo:', error);
  process.exit(1);
});

