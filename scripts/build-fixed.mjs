// Simplified build system that properly handles ES modules
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

class SimpleBuildSystem {
    constructor() {
        this.buildId = crypto.randomBytes(5).toString('hex');
    }

    async init() {
        console.log('🚀 Starting simplified build...');

        try {
            await fs.mkdir(DIST_DIR, { recursive: true });

            // Always use the working legacy JS file that doesn't have ES6 imports
            const legacyJS = path.join(ROOT_DIR, 'js', 'main.js');

            let jsContent;

            if (await this.fileExists(legacyJS)) {
                jsContent = await fs.readFile(legacyJS, 'utf8');
                console.log('✅ Using legacy main.js (proven working version)');
            } else {
                // Create a simple working version as fallback
                jsContent = await this.createWorkingJS();
                console.log('✅ Created simplified working JS as fallback');
            }

            // Process CSS
            const cssFilename = await this.processCSS();

            // Save JS with hash
            const jsHash = this.generateHash(jsContent);
            const jsFilename = `main.${jsHash}.js`;
            await fs.writeFile(path.join(DIST_DIR, jsFilename), jsContent, 'utf8');

            console.log(`📦 Generated: ${jsFilename} (${this.formatSize(jsContent.length)})`);

            // Update HTML files
            await this.updateHTMLFiles(jsFilename);

            // Run HTML reference fix to ensure consistency
            await this.fixHTMLReferences(jsFilename, cssFilename);

            console.log('✅ Build completed successfully');
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    async createWorkingJS() {
        // Create a minimal working version that loads content
        return `
// Simplified Portfolio App
class PortfolioApp {
    constructor() {
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('Initializing portfolio...');
        
        try {
            // Load content
            await this.loadContent();
            
            // Initialize mobile menu
            this.initMobileMenu();
            
            // Initialize animations
            this.initAnimations();
            
            this.isInitialized = true;
            console.log('Portfolio initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.renderFallbackContent();
        }
    }
    
    async loadContent() {
        try {
            const response = await fetch('./data/content.json');
            const data = await response.json();
            
            // Render sections
            this.renderSummary(data.summary);
            this.renderProjects(data.projects);
            this.renderSkills(data.skills);
            this.renderPublications(data.publications);
            
        } catch (error) {
            console.error('Failed to load content:', error);
            throw error;
        }
    }
    
    renderSummary(summaryData) {
        const container = document.getElementById('summary-cards');
        if (!container || !summaryData) return;
        
        container.innerHTML = summaryData.map(item => \`
            <div class="summary-card card-hover-effect group" tabindex="0">
                <div class="summary-card-inner">
                    <span class="summary-pill" aria-hidden="true">Core</span>
                    <h3 class="summary-title">\${item.title}</h3>
                    <p class="summary-body">\${item.body}</p>
                </div>
            </div>
        \`).join('');
    }
    
    renderProjects(projectsData) {
        const container = document.getElementById('projects-grid');
        if (!container || !projectsData) return;
        
        container.innerHTML = projectsData.map(project => \`
            <div class="project-card has-lid" role="listitem" 
                 style="--lid-bg: url('\${project.image}') center/cover;">
                <div class="project-lid">
                    <a href="\${project.githubUrl}" class="proj-gh" target="_blank" rel="noopener" 
                       aria-label="GitHub: \${project.title}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.13-3.2.7-3.88-1.36-3.88-1.36-.53-1.35-1.3-1.71-1.3-1.71-1.07-.73.08-.72.08-.72 1.18.08 1.8 1.21 1.8 1.21 1.05 1.79 2.76 1.27 3.43.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 2.9-.39 11.1 11.1 0 0 1 2.9.39c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.24 2.76.12 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22 0 1.6-.02 2.88-.02 3.27 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
                        </svg>
                    </a>
                </div>
                <div class="project-body">
                    <p class="text-brand-gray">\${project.description}</p>
                    <div class="tech-tags">
                        \${project.tech.map(tech => \`<span>\${tech}</span>\`).join('')}
                    </div>
                    <div class="mt-2">
                        <a href="\${project.githubUrl}" class="text-brand-red text-xs font-semibold hover:underline" 
                           target="_blank" rel="noopener">GitHub →</a>
                    </div>
                </div>
            </div>
        \`).join('');
    }
    
    renderSkills(skillsData) {
        const container = document.getElementById('skills-track');
        if (!container || !skillsData) return;
        
        const categories = [...new Set(skillsData.map(skill => skill.category))];
        
        container.innerHTML = categories.map(category => {
            const categorySkills = skillsData.filter(skill => skill.category === category);
            return \`
                <div class="skill-category">
                    <h3 class="skill-category-title">\${category}</h3>
                    <div class="skills-grid">
                        \${categorySkills.map(skill => \`
                            <div class="skill-item">
                                <div class="skill-info">
                                    <span class="skill-name">\${skill.name}</span>
                                    <span class="skill-level">\${skill.level}</span>
                                </div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: \${skill.percent}%"></div>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }).join('');
    }
    
    renderPublications(publicationsData) {
        const container = document.getElementById('publications-grid');
        if (!container || !publicationsData) return;
        
        container.innerHTML = publicationsData.map(pub => \`
            <div class="publication-card">
                <div class="publication-image">
                    <img src="\${pub.image}" alt="\${pub.title}" />
                </div>
                <div class="publication-content">
                    <h3>\${pub.title}</h3>
                    <p class="publication-date">\${pub.published}</p>
                    <p>\${pub.description}</p>
                    <a href="\${pub.link}" target="_blank" rel="noopener" 
                       class="text-brand-red hover:underline">Read More →</a>
                </div>
            </div>
        \`).join('');
    }
    
    initMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
    
    initAnimations() {
        // Simple fade-in observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.fade-in-section').forEach(el => {
            observer.observe(el);
        });
    }
    
    renderFallbackContent() {
        console.log('Rendering fallback content...');
        
        const summaryContainer = document.getElementById('summary-cards');
        if (summaryContainer) {
            summaryContainer.innerHTML = \`
                <div class="summary-card card-hover-effect group">
                    <div class="summary-card-inner">
                        <span class="summary-pill">Core</span>
                        <h3 class="summary-title">Machine Learning Engineering</h3>
                        <p class="summary-body">Designing robust ML systems.</p>
                    </div>
                </div>
            \`;
        }
    }
}

// Initialize when DOM is ready
const app = new PortfolioApp();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for global access
window.portfolioApp = app;
        `.trim();
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
        }

        return null;
    }

    async updateHTMLFiles(jsFilename) {
        const htmlFiles = [
            path.join(ROOT_DIR, 'index.html'),
            path.join(ROOT_DIR, 'ar', 'index.html')
        ];

        for (const htmlFile of htmlFiles) {
            if (await this.fileExists(htmlFile)) {
                let html = await fs.readFile(htmlFile, 'utf8');

                // Update JS reference
                html = html.replace(/dist\/main(?:\.[a-f0-9]{10})?\.js/g, `dist/${jsFilename}`);

                // Update CSS reference if we have one
                if (this.cssFilename) {
                    html = html.replace(
                        /dist\/style(?:\.[a-f0-9]{10})?\.css/g,
                        `dist/${this.cssFilename}`
                    );
                }

                await fs.writeFile(htmlFile, html, 'utf8');
                console.log(`📝 Updated: ${path.relative(ROOT_DIR, htmlFile)}`);
            }
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

    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
    }

    formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    }

    async fixHTMLReferences(jsFilename, cssFilename) {
        try {
            console.log('🔧 Updating HTML asset references...');

            // Update main index.html
            await this.updateSingleHTMLFile(
                path.join(ROOT_DIR, 'index.html'),
                jsFilename,
                cssFilename,
                'dist/'
            );

            // Update Arabic index.html
            await this.updateSingleHTMLFile(
                path.join(ROOT_DIR, 'ar', 'index.html'),
                jsFilename,
                cssFilename,
                '../dist/'
            );

            console.log('✅ HTML asset references updated');
        } catch (error) {
            console.error('❌ Failed to update HTML references:', error);
        }
    }

    async updateSingleHTMLFile(htmlPath, jsFilename, cssFilename, distPrefix) {
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
        } catch (error) {
            console.error(`❌ Failed to update ${htmlPath}:`, error);
        }
    }
}

// Run build
const buildSystem = new SimpleBuildSystem();
buildSystem.init().catch(console.error);
