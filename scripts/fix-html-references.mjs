#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');

async function fixHTMLReferences() {
    console.log('🔧 Fixing HTML asset references...');

    try {
        // Read build manifest to get latest asset hashes
        const manifestPath = path.join(ROOT_DIR, 'dist', 'build-manifest.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);

        const jsFilename = manifest.assets.js.filename;
        const cssFilename = manifest.assets.css.filename;

        console.log(`📦 Latest JS: ${jsFilename}`);
        console.log(`🎨 Latest CSS: ${cssFilename}`);

        // Update main index.html
        await updateHTMLFile(path.join(ROOT_DIR, 'index.html'), jsFilename, cssFilename, 'dist/');

        // Update Arabic index.html
        await updateHTMLFile(
            path.join(ROOT_DIR, 'ar', 'index.html'),
            jsFilename,
            cssFilename,
            '../dist/'
        );

        console.log('✅ HTML references updated successfully');
    } catch (error) {
        console.error('❌ Failed to fix HTML references:', error);
        process.exit(1);
    }
}

async function updateHTMLFile(htmlPath, jsFilename, cssFilename, distPrefix) {
    try {
        let content = await fs.readFile(htmlPath, 'utf8');

        // Update CSS reference
        content = content.replace(
            /href="[^"]*dist\/style\.[a-f0-9]+\.css"/g,
            `href="${distPrefix}${cssFilename}"`
        );

        // Update JS reference
        content = content.replace(
            /src="[^"]*dist\/main\.[a-f0-9]+\.js"/g,
            `src="${distPrefix}${jsFilename}"`
        );

        await fs.writeFile(htmlPath, content, 'utf8');
        console.log(`✅ Updated ${path.relative(ROOT_DIR, htmlPath)}`);
    } catch (error) {
        console.error(`❌ Failed to update ${htmlPath}:`, error);
        throw error;
    }
}

// Run the fix
fixHTMLReferences().catch(console.error);
