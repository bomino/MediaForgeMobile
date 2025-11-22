/**
 * Simple build script for MediaForge Mobile
 * Copies src files to dist with manifest
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Create dist directory
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy function
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy src to dist
console.log('Copying src to dist...');
copyDir(srcDir, distDir);

// Copy public files to dist root
console.log('Copying public files...');
const publicFiles = fs.readdirSync(publicDir);
for (const file of publicFiles) {
    fs.copyFileSync(
        path.join(publicDir, file),
        path.join(distDir, file)
    );
}

console.log('Build complete! Files in dist/');
