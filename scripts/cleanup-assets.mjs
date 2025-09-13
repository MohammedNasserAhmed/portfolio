#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

/**
 * Standalone script to clean up old asset files
 * Usage: node scripts/cleanup-assets.mjs [--keep=N]
 */
class AssetCleanup {
    constructor() {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const keepArg = args.find((arg) => arg.startsWith('--keep='));
        this.keepCount = keepArg ? parseInt(keepArg.split('=')[1], 10) : 2;
    }

    async init() {
        console.log(`🧹 Starting asset cleanup (keeping ${this.keepCount} versions)...`);

        try {
            await this.pruneOldAssets();
            console.log('✅ Asset cleanup completed successfully');
        } catch (error) {
            console.error('❌ Asset cleanup failed:', error);
            process.exit(1);
        }
    }

    async pruneOldAssets() {
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

            console.log(`📁 Found ${sortedFiles.length} files matching ${pattern}`);

            // Keep only the newest N files
            const toDelete = sortedFiles.slice(this.keepCount);

            if (toDelete.length === 0) {
                console.log(`   ✅ No files need to be removed (${sortedFiles.length} <= ${this.keepCount})`);
                return;
            }

            console.log(`   🗑️  Removing ${toDelete.length} old files...`);
            for (const file of toDelete) {
                try {
                    await fs.unlink(file.path);
                    console.log(`   Removed: ${file.name}`);
                } catch (error) {
                    console.warn(`   ⚠️  Could not remove ${file.name}:`, error.message);
                }
            }
        } catch (error) {
            console.warn('⚠️  Asset pruning failed:', error.message);
        }
    }
}

// Run cleanup
const cleanup = new AssetCleanup();
cleanup.init().catch(console.error);