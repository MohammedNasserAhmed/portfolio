#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');

async function verifyBuildIntegrity() {
    console.log('🔍 Verifying build integrity...');
    
    try {
        // Check if build manifest exists
        const manifestPath = path.join(ROOT_DIR, 'dist', 'build-manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
        
        const jsFile = path.join(ROOT_DIR, 'dist', manifest.assets.js.filename);
        const cssFile = path.join(ROOT_DIR, 'dist', manifest.assets.css.filename);
        
        // Verify assets exist
        await fs.access(jsFile);
        await fs.access(cssFile);
        
        console.log(`✅ JS asset verified: ${manifest.assets.js.filename}`);
        console.log(`✅ CSS asset verified: ${manifest.assets.css.filename}`);
        
        // Verify HTML references
        const htmlFiles = [
            path.join(ROOT_DIR, 'index.html'),
            path.join(ROOT_DIR, 'ar', 'index.html')
        ];
        
        for (const htmlFile of htmlFiles) {
            const content = await fs.readFile(htmlFile, 'utf8');
            
            if (!content.includes(manifest.assets.js.filename)) {
                throw new Error(`${path.basename(htmlFile)} does not reference correct JS file`);
            }
            
            if (!content.includes(manifest.assets.css.filename)) {
                throw new Error(`${path.basename(htmlFile)} does not reference correct CSS file`);
            }
            
            console.log(`✅ HTML references verified: ${path.basename(htmlFile)}`);
        }
        
        console.log('🎉 Build integrity verified successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Build integrity check failed:', error.message);
        return false;
    }
}

// Run verification if called directly
if (process.argv[1] && process.argv[1].endsWith('verify-build.mjs')) {
    verifyBuildIntegrity().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });
}

export { verifyBuildIntegrity };