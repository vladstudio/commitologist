// Simple test to verify the extension can be loaded
const fs = require('fs');
const path = require('path');

// Check if the extension build output exists
const extensionPath = path.join(__dirname, '../../dist/extension/extension/extension.js');
console.log('Extension path:', extensionPath);

if (fs.existsSync(extensionPath)) {
  console.log('✅ Extension build output exists');
  
  // Try to load the extension
  try {
    const extension = require(extensionPath);
    console.log('✅ Extension can be loaded');
    console.log('Extension exports:', Object.keys(extension));
    
    if (extension.activate && typeof extension.activate === 'function') {
      console.log('✅ Extension has activate function');
    } else {
      console.log('❌ Extension missing activate function');
    }
    
    if (extension.deactivate && typeof extension.deactivate === 'function') {
      console.log('✅ Extension has deactivate function');
    } else {
      console.log('❌ Extension missing deactivate function');
    }
    
  } catch (error) {
    console.log('❌ Error loading extension:', error.message);
  }
} else {
  console.log('❌ Extension build output not found');
}

// Check if package.json exists and is valid
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ Extension package.json exists');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('Extension name:', packageJson.name);
    console.log('Extension version:', packageJson.version);
    console.log('Main entry point:', packageJson.main);
    console.log('Commands:', packageJson.contributes?.commands?.length || 0);
    console.log('Configuration properties:', Object.keys(packageJson.contributes?.configuration?.properties || {}));
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
} else {
  console.log('❌ Extension package.json not found');
}