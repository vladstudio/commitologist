// Test script to debug extension loading
const path = require('path');
const fs = require('fs');

console.log('=== Extension Loading Test ===');

// Check main entry point
const mainPath = path.resolve(__dirname, '../../dist/extension/extension/extension.js');
console.log('Main entry point:', mainPath);
console.log('Main exists:', fs.existsSync(mainPath));

// Check for core dependencies
const corePath = path.resolve(__dirname, '../../dist/extension/core');
console.log('Core path:', corePath);
console.log('Core exists:', fs.existsSync(corePath));

if (fs.existsSync(corePath)) {
  console.log('Core files:', fs.readdirSync(corePath));
}

// Check for provider dependencies
const providersPath = path.resolve(__dirname, '../../dist/extension/providers');
console.log('Providers path:', providersPath);
console.log('Providers exists:', fs.existsSync(providersPath));

if (fs.existsSync(providersPath)) {
  console.log('Provider files:', fs.readdirSync(providersPath));
}

// Try to load the extension (this will fail in Node.js but show us the error)
try {
  console.log('\n=== Attempting to load extension ===');
  const extension = require(mainPath);
  console.log('Extension loaded successfully');
} catch (error) {
  console.log('Extension loading error:', error.message);
  console.log('Stack:', error.stack);
}