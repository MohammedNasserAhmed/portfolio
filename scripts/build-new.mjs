// Enhanced build system with module bundling and optimization
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { TemplateBuilder } from './template-builder.mjs';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const LEGACY_JS_DIR = path.join(ROOT_DIR, 'js');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const KEEP_ASSET_VERSIONS = parseInt(process.env.KEEP_ASSET_VERSIONS || '3', 10);

class BuildSystem {
    constructor() {
        this.buildId = this.generateBuildId();
        this.assets = new Map();
        this.modules = new Map();
        this.templateBuilder = new TemplateBuilder();
    }

    generateBuildId() {
        return crypto.randomBytes(5).toString('hex');
    }

    async init() {
        console.log(`🚀 Starting build (${IS_PRODUCTION ? 'production' : 'development'})...`);

        try {
            await this.ensureDirectories();
            await this.loadModules();
            await this.buildTemplates();
            await this.bundleJS();
            await this.processCSS();
            await this.updateHTMLFiles();
            await this.generateManifest();

            if (IS_PRODUCTION) {
                await this.pruneOldAssets();
            }

            console.log(`✅ Build completed successfully (${this.buildId})`);
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    async ensureDirectories() {
        await fs.mkdir(DIST_DIR, { recursive: true });
        await fs.mkdir(path.join(DIST_DIR, 'templates'), { recursive: true });
    }

    async buildTemplates() {
        console.log('🎨 Building HTML templates...');

        const templatesDir = path.join(SRC_DIR, 'templates');
        if (!(await this.fileExists(templatesDir))) {
            console.log('   No templates directory found, skipping template build');
            return;
        }

        try {
            // Load content data
            const contentPath = path.join(ROOT_DIR, 'data', 'content.json');
            let contentData = {};

            if (await this.fileExists(contentPath)) {
                const contentJson = await fs.readFile(contentPath, 'utf8');
                contentData = JSON.parse(contentJson);
            }

            // Build complete HTML from templates
            const generatedHTML = await this.templateBuilder.buildHTML({
                templatesDir,
                data: contentData,
                buildId: this.buildId
            });

            // Save generated HTML to dist for inspection
            const outputPath = path.join(DIST_DIR, 'generated-index.html');
            await fs.writeFile(outputPath, generatedHTML, 'utf8');

            console.log(
                `   Generated: generated-index.html (${this.formatSize(generatedHTML.length)})`
            );
        } catch (error) {
            console.warn('⚠️  Template building failed:', error.message);
        }
    }

    async loadModules() {
        console.log('📦 Loading modules...');

        const mainFile = path.join(SRC_DIR, 'main.js');
        await this.loadModuleRecursively(mainFile, new Set());

        console.log(`   Loaded ${this.modules.size} modules`);
    }

    async loadModuleRecursively(filePath, visited) {
        if (visited.has(filePath)) return;
        visited.add(filePath);

        try {
            const content = await fs.readFile(filePath, 'utf8');
            this.modules.set(filePath, content);

            // Extract import statements
            const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g);

            for (const match of importMatches) {
                const importPath = match[1];

                // Skip external imports
                if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
                    continue;
                }

                // Resolve relative import
                const resolvedPath = path.resolve(path.dirname(filePath), importPath);
                const jsPath = resolvedPath.endsWith('.js') ? resolvedPath : resolvedPath + '.js';

                if (await this.fileExists(jsPath)) {
                    await this.loadModuleRecursively(jsPath, visited);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Could not load module: ${filePath}`);
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async bundleJS() {
        console.log('🔧 Bundling JavaScript...');

        // Check if we have new modular structure
        const hasModularStructure = this.modules.size > 0;

        let bundledCode;

        if (hasModularStructure) {
            bundledCode = await this.createModuleBundle();
        } else {
            // Fallback to legacy main.js
            const legacyMainPath = path.join(LEGACY_JS_DIR, 'main.js');
            if (await this.fileExists(legacyMainPath)) {
                bundledCode = await fs.readFile(legacyMainPath, 'utf8');
                console.log('   Using legacy main.js');
            } else {
                throw new Error('No JavaScript source files found');
            }
        }

        // Process code for production
        if (IS_PRODUCTION) {
            bundledCode = this.stripDevCode(bundledCode);
            bundledCode = this.minifyJS(bundledCode);
        }

        // Generate hash and save
        const hash = this.generateHash(bundledCode);
        const filename = `main.${hash}.js`;
        const outputPath = path.join(DIST_DIR, filename);

        await fs.writeFile(outputPath, bundledCode, 'utf8');

        this.assets.set('js', {
            filename,
            path: outputPath,
            hash
        });

        console.log(`   Generated: ${filename} (${this.formatSize(bundledCode.length)})`);
    }

    async createModuleBundle() {
        console.log('   Creating ES module bundle...');

        const bundleCode = [];
        const moduleMap = new Map();
        let moduleId = 0;

        // Create module registry
        bundleCode.push('// ES Module Bundle');
        bundleCode.push('const moduleRegistry = new Map();');
        bundleCode.push('const moduleCache = new Map();');
        bundleCode.push('');

        // Add module loader function
        bundleCode.push(this.getModuleLoaderCode());
        bundleCode.push('');

        // Process each module
        for (const [filePath, content] of this.modules) {
            const id = moduleId++;
            moduleMap.set(filePath, id);

            const processedContent = this.processModuleContent(content, filePath, moduleMap);
            bundleCode.push(`// Module ${id}: ${path.relative(SRC_DIR, filePath)}`);
            bundleCode.push(`moduleRegistry.set(${id}, function(module, exports, require) {`);
            bundleCode.push(processedContent);
            bundleCode.push('});');
            bundleCode.push('');
        }

        // Bootstrap main module
        const mainModuleId = moduleMap.get(path.join(SRC_DIR, 'main.js'));
        if (mainModuleId !== undefined) {
            bundleCode.push(`// Bootstrap main module`);
            bundleCode.push(`loadModule(${mainModuleId});`);
        }

        return bundleCode.join('\n');
    }

    getModuleLoaderCode() {
        return `
function loadModule(id) {
    if (moduleCache.has(id)) {
        return moduleCache.get(id).exports;
    }
    
    const moduleFactory = moduleRegistry.get(id);
    if (!moduleFactory) {
        throw new Error('Module not found: ' + id);
    }
    
    const module = { exports: {} };
    const exports = module.exports;
    
    const require = (request) => {
        // Handle relative imports
        if (typeof request === 'number') {
            return loadModule(request);
        }
        throw new Error('Dynamic imports not supported: ' + request);
    };
    
    moduleCache.set(id, module);
    moduleFactory(module, exports, require);
    
    return module.exports;
}`;
    }

    processModuleContent(content, filePath, moduleMap) {
        // Convert ES6 imports/exports to CommonJS-style
        let processed = content;

        // Handle exports
        processed = processed.replace(/export\s+default\s+(.+);?$/gm, 'module.exports = $1;');
        processed = processed.replace(/export\s+\{([^}]+)\}/g, (match, exports) => {
            const namedExports = exports.split(',').map((exp) => {
                const [local, external] = exp.split(' as ').map((s) => s.trim());
                return `exports.${external || local} = ${local};`;
            });
            return namedExports.join('\n');
        });
        processed = processed.replace(
            /export\s+(const|let|var|function|class)\s+(\w+)/g,
            (match, type, name) => {
                return `${type} ${name}`;
            }
        );

        // Handle imports
        processed = processed.replace(
            /import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`];?/g,
            (match, defaultImport, importPath) => {
                const moduleId = this.resolveModuleId(importPath, filePath, moduleMap);
                if (moduleId !== null) {
                    return `const ${defaultImport} = loadModule(${moduleId});`;
                }
                return match; // Keep external imports as-is
            }
        );

        processed = processed.replace(
            /import\s+\{([^}]+)\}\s+from\s+['"`]([^'"`]+)['"`];?/g,
            (match, namedImports, importPath) => {
                const moduleId = this.resolveModuleId(importPath, filePath, moduleMap);
                if (moduleId !== null) {
                    const imports = namedImports.split(',').map((imp) => {
                        const [external, local] = imp.split(' as ').map((s) => s.trim());
                        return `${local || external}: ${external}`;
                    });
                    return `const { ${imports.join(', ')} } = loadModule(${moduleId});`;
                }
                return match;
            }
        );

        return processed;
    }

    resolveModuleId(importPath, currentFile, moduleMap) {
        if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
            return null; // External module
        }

        const resolvedPath = path.resolve(path.dirname(currentFile), importPath);
        const jsPath = resolvedPath.endsWith('.js') ? resolvedPath : resolvedPath + '.js';

        return moduleMap.get(jsPath) ?? null;
    }

    stripDevCode(code) {
        // Remove dev overlay and development-only code
        return code.replace(
            /\/\* DEV-OVERLAY-START \*\/[\s\S]*?\/\* DEV-OVERLAY-END \*\//g,
            '\n// Dev overlay stripped for production\n'
        );
    }

    minifyJS(code) {
        // Basic minification - remove comments and extra whitespace
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
            .trim();
    }

    async processCSS() {
        console.log('🎨 Processing CSS...');

        // Check for new modular CSS structure
        const newCSSPath = path.join(SRC_DIR, 'styles', 'main.css');
        const legacyCSSPath = path.join(ROOT_DIR, 'css', 'style.css');
        const distCSSPath = path.join(DIST_DIR, 'style.css');

        let cssContent;

        if (await this.fileExists(newCSSPath)) {
            cssContent = await this.bundleCSS(newCSSPath);
            console.log('   Using modular CSS structure');
        } else if (await this.fileExists(legacyCSSPath)) {
            cssContent = await fs.readFile(legacyCSSPath, 'utf8');
            console.log('   Using legacy CSS file');
        } else if (await this.fileExists(distCSSPath)) {
            cssContent = await fs.readFile(distCSSPath, 'utf8');
            console.log('   Using existing dist CSS');
        } else {
            console.warn('⚠️  No CSS source found, skipping CSS processing');
            return;
        }

        // Generate hash and save
        const hash = this.generateHash(cssContent);
        const filename = `style.${hash}.css`;
        const outputPath = path.join(DIST_DIR, filename);

        await fs.writeFile(outputPath, cssContent, 'utf8');

        this.assets.set('css', {
            filename,
            path: outputPath,
            hash
        });

        console.log(`   Generated: ${filename} (${this.formatSize(cssContent.length)})`);
    }

    async bundleCSS(mainCSSPath) {
        const cssContent = await fs.readFile(mainCSSPath, 'utf8');
        const cssDir = path.dirname(mainCSSPath);

        // Process CSS imports asynchronously
        const importMatches = [...cssContent.matchAll(/@import\s+['"`]([^'"`]+)['"`];?/g)];
        let bundledCSS = cssContent;

        for (const match of importMatches) {
            const [fullMatch, importPath] = match;
            const resolvedPath = path.resolve(cssDir, importPath);

            try {
                if (await this.fileExists(resolvedPath)) {
                    const importedCSS = await fs.readFile(resolvedPath, 'utf8');
                    bundledCSS = bundledCSS.replace(
                        fullMatch,
                        `/* Imported from ${importPath} */\n${importedCSS}`
                    );
                    console.log(`   ✅ Resolved CSS import: ${importPath}`);
                } else {
                    console.warn(`⚠️  CSS import file not found: ${resolvedPath}`);
                }
            } catch (error) {
                console.warn(`⚠️  Could not resolve CSS import: ${importPath} - ${error.message}`);
            }
        }

        return bundledCSS;
    }

    async updateHTMLFiles() {
        console.log('📝 Updating HTML files...');

        const htmlFiles = [
            path.join(ROOT_DIR, 'index.html'),
            path.join(ROOT_DIR, 'ar', 'index.html')
        ];

        for (const htmlFile of htmlFiles) {
            if (await this.fileExists(htmlFile)) {
                await this.updateSingleHTMLFile(htmlFile);
            }
        }
    }

    async updateSingleHTMLFile(htmlPath) {
        let html = await fs.readFile(htmlPath, 'utf8');

        // Update JavaScript reference
        const jsAsset = this.assets.get('js');
        if (jsAsset) {
            html = html.replace(
                /dist\/main(?:\.[a-f0-9]{10})?\.js[^"']*/g,
                `dist/${jsAsset.filename}`
            );
        }

        // Update CSS reference
        const cssAsset = this.assets.get('css');
        if (cssAsset) {
            html = html.replace(
                /dist\/style(?:\.[a-f0-9]{10})?\.css/g,
                `dist/${cssAsset.filename}`
            );
        }

        // Update asset version meta tag
        const versionHash = this.generateHash(this.buildId + Date.now());
        if (/meta name="asset-version"/i.test(html)) {
            html = html.replace(
                /<meta name="asset-version"[^>]*>/i,
                `<meta name="asset-version" content="${versionHash}">`
            );
        } else {
            html = html.replace(
                /<meta name="apple-mobile-web-app-status-bar-style"[^>]*>/i,
                (match) => `${match}\n        <meta name="asset-version" content="${versionHash}">`
            );
        }

        await fs.writeFile(htmlPath, html, 'utf8');
        console.log(`   Updated: ${path.relative(ROOT_DIR, htmlPath)}`);
    }

    async generateManifest() {
        const manifest = {
            buildId: this.buildId,
            version: this.generateHash(this.buildId + Date.now()),
            timestamp: new Date().toISOString(),
            assets: Object.fromEntries(
                Array.from(this.assets.entries()).map(([type, asset]) => [
                    type,
                    {
                        filename: asset.filename,
                        hash: asset.hash
                    }
                ])
            ),
            environment: IS_PRODUCTION ? 'production' : 'development'
        };

        const manifestPath = path.join(DIST_DIR, 'build-manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

        console.log(`📋 Generated build manifest: ${manifest.version}`);
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

    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
    }

    formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

// Run build
const buildSystem = new BuildSystem();
buildSystem.init().catch(console.error);
