#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const KEEP_ASSET_VERSIONS = parseInt(process.env.KEEP_ASSET_VERSIONS || '2', 10);

/**
 * Ultra-reliable build system that ONLY uses proven working vanilla JavaScript
 * This prevents ES6 module transformation failures that cause white page issues
 */
class ReliableBuildSystem {
    constructor() {
        this.buildId = crypto.randomBytes(5).toString('hex');
    }

    async init() {
        console.log('🚀 Starting ultra-reliable build...');

        try {
            await fs.mkdir(DIST_DIR, { recursive: true });

            // Step 1: Use ONLY the proven working vanilla JS file
            const workingJS = await this.getWorkingJavaScript();

            // Step 2: Process CSS
            const cssFilename = await this.processCSS();

            // Step 3: Save JS with hash
            const jsHash = this.generateHash(workingJS);
            const jsFilename = `main.${jsHash}.js`;
            await fs.writeFile(path.join(DIST_DIR, jsFilename), workingJS, 'utf8');

            console.log(`📦 Generated: ${jsFilename} (${this.formatSize(workingJS.length)})`);

            // Step 4: Update ALL HTML files to reference the working assets
            await this.updateAllHTMLReferences(jsFilename, cssFilename);

            // Step 5: Create build manifest
            await this.createBuildManifest(jsFilename, cssFilename);

            // Step 6: Prune old assets in production
            if (IS_PRODUCTION) {
                await this.pruneOldAssets();
            }

            console.log('✅ Ultra-reliable build completed successfully');
            console.log('🛡️ No ES6 imports - guaranteed browser compatibility');
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    async getWorkingJavaScript() {
        // Always use the proven working vanilla JS file
        const legacyJS = path.join(ROOT_DIR, 'js', 'main.js');

        if (await this.fileExists(legacyJS)) {
            const content = await fs.readFile(legacyJS, 'utf8');
            console.log('✅ Using proven working vanilla JavaScript (no ES6 imports)');

            // Verify no ES6 imports exist
            if (content.includes('import ') || content.includes('export ')) {
                throw new Error('CRITICAL: ES6 imports detected in supposed vanilla JS file!');
            }

            return content;
        } else {
            throw new Error('CRITICAL: Working vanilla JavaScript file not found at js/main.js');
        }
    }

    async processCSS() {
        const distCSS = path.join(DIST_DIR, 'style.css');

        if (await this.fileExists(distCSS)) {
            const cssContent = await fs.readFile(distCSS, 'utf8');
            const cssHash = this.generateHash(cssContent);
            const cssFilename = `style.${cssHash}.css`;

            await fs.writeFile(path.join(DIST_DIR, cssFilename), cssContent, 'utf8');
            console.log(`🎨 Generated: ${cssFilename} (${this.formatSize(cssContent.length)})`);

            return cssFilename;
        } else {
            console.warn('⚠️ No CSS found, skipping CSS processing');
            return null;
        }
    }

    async updateAllHTMLReferences(jsFilename, cssFilename) {
        const htmlFiles = [
            { path: path.join(ROOT_DIR, 'index.html'), prefix: 'dist/' },
            { path: path.join(ROOT_DIR, 'ar', 'index.html'), prefix: '../dist/' }
        ];

        for (const { path: htmlPath, prefix } of htmlFiles) {
            if (await this.fileExists(htmlPath)) {
                let content = await fs.readFile(htmlPath, 'utf8');

                // Update JS reference with specific pattern matching
                content = content.replace(
                    /src="[^"]*dist\/main\.[a-f0-9]+\.js"/g,
                    `src="${prefix}${jsFilename}"`
                );

                // Update CSS reference if available
                if (cssFilename) {
                    content = content.replace(
                        /href="[^"]*dist\/style\.[a-f0-9]+\.css"/g,
                        `href="${prefix}${cssFilename}"`
                    );
                }

                await fs.writeFile(htmlPath, content, 'utf8');
                console.log(`📝 Updated: ${path.relative(ROOT_DIR, htmlPath)}`);
            }
        }
    }

    async createBuildManifest(jsFilename, cssFilename) {
        const manifest = {
            buildId: this.buildId,
            version: this.generateHash(this.buildId + Date.now()),
            timestamp: new Date().toISOString(),
            assets: {
                js: {
                    filename: jsFilename,
                    hash: jsFilename.split('.')[1]
                },
                css: cssFilename
                    ? {
                          filename: cssFilename,
                          hash: cssFilename.split('.')[1]
                      }
                    : null
            },
            environment: process.env.NODE_ENV || 'development',
            note: 'Built with ultra-reliable system - no ES6 imports'
        };

        await fs.writeFile(
            path.join(DIST_DIR, 'build-manifest.json'),
            JSON.stringify(manifest, null, 2),
            'utf8'
        );

        console.log('📄 Build manifest created');
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
    }

    formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    }

    async pruneOldAssets() {
        console.log('🧹 Pruning old assets...');

        const prunePatterns = [/^main\.[a-f0-9]{10}\.js$/, /^style\.[a-f0-9]{10}\.css$/];

        for (const pattern of prunePatterns) {
            await this.pruneAssetsByPattern(pattern);
        }
    }

    async pruneAssetsByPattern(pattern) {
        try {
            const files = await fs.readdir(DIST_DIR);
            const matchingFiles = files
                .filter((file) => pattern.test(file))
                .map((file) => ({
                    name: file,
                    path: path.join(DIST_DIR, file),
                    stat: null
                }));

            // Get file stats
            for (const file of matchingFiles) {
                try {
                    file.stat = await fs.stat(file.path);
                } catch (error) {
                    // File might have been deleted, skip
                }
            }

            // Sort by modification time (newest first)
            const sortedFiles = matchingFiles
                .filter((file) => file.stat)
                .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

            // Keep only the newest N files
            const toDelete = sortedFiles.slice(KEEP_ASSET_VERSIONS);

            for (const file of toDelete) {
                try {
                    await fs.unlink(file.path);
                    console.log(`   Removed: ${file.name}`);
                } catch (error) {
                    console.warn(`⚠️  Could not remove ${file.name}:`, error.message);
                }
            }
        } catch (error) {
            console.warn('⚠️  Asset pruning failed:', error.message);
        }
    }
}

// Run ultra-reliable build
const buildSystem = new ReliableBuildSystem();
buildSystem.init().catch(console.error);
