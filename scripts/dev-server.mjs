// Enhanced development server with hot reload and build integration
import { createServer } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');

class DevServer {
    constructor() {
        this.port = parseInt(process.env.PORT || '5500', 10);
        this.host = process.env.HOST || 'localhost';
        this.watchers = new Map();
        this.isBuilding = false;
        this.buildQueue = [];
        this.clients = new Set();
    }
    
    async start() {
        console.log('🚀 Starting development server...');
        
        // Initial build
        await this.runBuild();
        
        // Create HTTP server
        this.server = createServer(this.handleRequest.bind(this));
        
        // Setup file watchers
        this.setupWatchers();
        
        // Start server
        this.server.listen(this.port, this.host, () => {
            console.log(`✅ Development server running at http://${this.host}:${this.port}`);
            console.log('📂 Serving files from:', ROOT_DIR);
            console.log('👀 Watching for changes...');
        });
        
        // Graceful shutdown
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }
    
    async handleRequest(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        let filePath = path.join(ROOT_DIR, url.pathname);
        
        // Default to index.html for directory requests
        if (url.pathname === '/' || url.pathname.endsWith('/')) {
            filePath = path.join(filePath, 'index.html');
        }
        
        // Security check - prevent directory traversal
        if (!filePath.startsWith(ROOT_DIR)) {
            this.sendError(res, 403, 'Forbidden');
            return;
        }
        
        try {
            const stat = await fs.stat(filePath);
            
            if (stat.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            
            await this.serveFile(res, filePath);
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Try to serve index.html for SPA routing
                try {
                    await this.serveFile(res, path.join(ROOT_DIR, 'index.html'));
                } catch {
                    this.sendError(res, 404, 'Not Found');
                }
            } else {
                console.error('Server error:', error);
                this.sendError(res, 500, 'Internal Server Error');
            }
        }
    }
    
    async serveFile(res, filePath) {
        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = this.getContentType(ext);
        
        // Inject hot reload script for HTML files
        if (ext === '.html') {
            const htmlContent = content.toString();
            const injectedContent = this.injectHotReload(htmlContent);
            
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': Buffer.byteLength(injectedContent),
                'Cache-Control': 'no-cache'
            });
            res.end(injectedContent);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': content.length,
                'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=3600'
            });
            res.end(content);
        }
    }
    
    injectHotReload(html) {
        const hotReloadScript = `
<script>
(function() {
    const eventSource = new EventSource('/dev/events');
    let reloadTimer = null;
    
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'reload') {
            console.log('🔄 File changes detected, scheduling reload...');
            // Debounce reloads to prevent interference with CSS animations
            if (reloadTimer) clearTimeout(reloadTimer);
            reloadTimer = setTimeout(() => {
                // Only reload if not during animation
                if (!document.querySelector('.hero-section-animated')) {
                    window.location.reload();
                } else {
                    console.log('⏸️ Skipping reload during hero animation');
                    // Retry in 2 seconds
                    setTimeout(() => window.location.reload(), 2000);
                }
            }, 500);
        } else if (data.type === 'css-update') {
            console.log('🎨 Updating CSS...');
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => {
                const url = new URL(link.href);
                url.searchParams.set('t', Date.now());
                link.href = url.toString();
            });
        }
    };
    eventSource.onerror = function() {
        console.log('❌ Hot reload connection lost, retrying in 5s...');
        // Don't auto-reload on connection errors to prevent interrupting animations
    };
})();
</script>`;
        
        // Inject before closing body tag
        return html.replace('</body>', `${hotReloadScript}</body>`);
    }
    
    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
        res.end(`${statusCode} ${message}`);
    }
    
    getContentType(ext) {
        const types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
        
        return types[ext] || 'application/octet-stream';
    }
    
    setupWatchers() {
        const watchPaths = [
            { path: 'src', pattern: /\.(js|css)$/, action: 'build' },
            { path: 'js', pattern: /\.js$/, action: 'build' },
            { path: 'css', pattern: /\.css$/, action: 'css-update' },
            { path: 'data', pattern: /\.json$/, action: 'reload' },
            { path: '.', pattern: /\.html$/, action: 'reload', recursive: false }
        ];
        
        watchPaths.forEach(({ path: watchPath, pattern, action, recursive = true }) => {
            this.watchDirectory(path.join(ROOT_DIR, watchPath), pattern, action, recursive);
        });
    }
    
    async watchDirectory(dirPath, pattern, action, recursive = true) {
        try {
            const watcher = fs.watch(dirPath, { recursive });
            
            watcher.on('change', (eventType, filename) => {
                if (filename && pattern.test(filename)) {
                    this.handleFileChange(path.join(dirPath, filename), action);
                }
            });
            
            this.watchers.set(dirPath, watcher);
            
        } catch (error) {
            // Directory might not exist, that's okay
            console.log(`📁 Watching ${dirPath}: ${error.message}`);
        }
    }
    
    async handleFileChange(filePath, action) {
        const relativePath = path.relative(ROOT_DIR, filePath);
        console.log(`📝 Changed: ${relativePath}`);
        
        if (action === 'build') {
            await this.runBuild();
            this.notifyClients({ type: 'reload' });
        } else if (action === 'css-update') {
            this.notifyClients({ type: 'css-update' });
        } else if (action === 'reload') {
            this.notifyClients({ type: 'reload' });
        }
    }
    
    async runBuild() {
        if (this.isBuilding) {
            this.buildQueue.push(Date.now());
            return;
        }
        
        this.isBuilding = true;
        
        try {
            console.log('🔨 Building...');
            
            const buildScript = path.join(ROOT_DIR, 'scripts', 'build-ultra-reliable.mjs');
            const buildProcess = spawn('node', [buildScript], {
                cwd: ROOT_DIR,
                stdio: 'pipe',
                env: { ...process.env, NODE_ENV: 'development' }
            });
            
            let output = '';
            buildProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            buildProcess.stderr.on('data', (data) => {
                console.error(data.toString());
            });
            
            await new Promise((resolve, reject) => {
                buildProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Build completed');
                        resolve();
                    } else {
                        console.error(`❌ Build failed with code ${code}`);
                        reject(new Error(`Build failed with code ${code}`));
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Build error:', error.message);
        } finally {
            this.isBuilding = false;
            
            // Process queued builds
            if (this.buildQueue.length > 0) {
                this.buildQueue = [];
                setTimeout(() => this.runBuild(), 500);
            }
        }
    }
    
    notifyClients(data) {
        // This would be used for Server-Sent Events
        // For now, we'll use the simpler approach of just reloading
        console.log(`📡 Notifying clients: ${data.type}`);
    }
    
    shutdown() {
        console.log('\n🛑 Shutting down development server...');
        
        // Close file watchers
        for (const watcher of this.watchers.values()) {
            watcher.close();
        }
        
        // Close server
        if (this.server) {
            this.server.close(() => {
                console.log('✅ Server stopped');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    }
}

// Start development server
const devServer = new DevServer();
devServer.start().catch(console.error);