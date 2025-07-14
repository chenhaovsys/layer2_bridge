#!/usr/bin/env node

/**
 * Bridge Project Setup Script
 * This script will install all dependencies for the entire bridge project
 * Works from any directory by finding the project root
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runCommand = (command, args, cwd) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Running: ${command} ${args.join(' ')} in ${cwd}`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Completed: ${command} ${args.join(' ')}`);
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
};

async function setupProject() {
  try {
    console.log('🚀 Starting Bridge Project Setup...\n');
    console.log(`📁 Project directory: ${__dirname}\n`);

    // Use the script's directory as the project root
    const projectRoot = __dirname;

    // Install main project dependencies
    console.log('📦 Installing main project dependencies...');
    await runCommand('npm', ['install'], projectRoot);

    // Install js-vsys dependencies
    const jsVsysPath = path.join(projectRoot, 'js-vsys');
    if (existsSync(jsVsysPath)) {
      console.log('📦 Installing js-vsys dependencies...');
      await runCommand('npm', ['install'], jsVsysPath);
    } else {
      console.log('⚠️  js-vsys directory not found, skipping...');
    }

    // Install layer2-tutorial dependencies
    const layer2Path = path.join(projectRoot, 'layer2-tutorial-main');
    if (existsSync(layer2Path)) {
      console.log('📦 Installing layer2-tutorial dependencies...');
      await runCommand('npm', ['install'], layer2Path);
    } else {
      console.log('⚠️  layer2-tutorial-main directory not found, skipping...');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Available commands:');
    console.log('  npm start     - Start the bridge API server');
    console.log('  npm run dev   - Start with nodemon (auto-restart)');
    console.log('  node setup.js - Re-run this setup script');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupProject();
