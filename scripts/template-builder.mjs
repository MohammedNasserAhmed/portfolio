// Template builder for generating HTML files from templates
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __file = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__file), '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'src', 'templates');
const CONTENT_DIR = path.join(ROOT_DIR, 'data');

class TemplateBuilder {
    constructor() {
        this.templates = new Map();
        this.partials = new Map();
        this.helpers = new Map();
        this.contentData = null;

        this.registerHelpers();
    }

    async init() {
        console.log('📝 Initializing template builder...');

        await this.loadTemplates();
        await this.loadContent();

        console.log(`   Loaded ${this.templates.size} templates`);
        console.log(`   Loaded ${this.partials.size} partials`);
    }

    async loadTemplates() {
        const templatesPath = TEMPLATES_DIR;

        try {
            await this.loadTemplateDirectory(templatesPath);
        } catch (error) {
            console.warn('Could not load templates:', error.message);
        }
    }

    async loadTemplateDirectory(dirPath, prefix = '') {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const templateName = prefix + entry.name.replace('.html', '');

                if (entry.isDirectory()) {
                    await this.loadTemplateDirectory(fullPath, templateName + '/');
                } else if (entry.name.endsWith('.html')) {
                    const content = await fs.readFile(fullPath, 'utf8');

                    if (templateName.includes('/')) {
                        this.partials.set(templateName, content);
                    } else {
                        this.templates.set(templateName, content);
                    }
                }
            }
        } catch (error) {
            // Directory might not exist
        }
    }

    async loadContent() {
        try {
            const contentPath = path.join(CONTENT_DIR, 'content.json');
            const content = await fs.readFile(contentPath, 'utf8');
            this.contentData = JSON.parse(content);
        } catch (error) {
            console.warn('Could not load content data:', error.message);
            this.contentData = {};
        }
    }

    registerHelpers() {
        // Register template helpers
        this.helpers.set('escapeHtml', (text) => {
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        });

        this.helpers.set('json', (obj) => {
            return JSON.stringify(obj);
        });

        this.helpers.set('formatDate', (dateString) => {
            try {
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch {
                return dateString;
            }
        });

        this.helpers.set('truncate', (text, length = 100) => {
            if (text.length <= length) return text;
            return text.substring(0, length) + '...';
        });
    }

    render(templateName, data = {}) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }

        return this.renderTemplate(template, data);
    }

    renderTemplate(template, data) {
        let result = template;

        // Process conditionals
        result = this.processConditionals(result, data);

        // Process loops
        result = this.processLoops(result, data);

        // Process variable substitutions
        result = this.processVariables(result, data);

        // Process partials
        result = this.processPartials(result, data);

        // Process helpers
        result = this.processHelpers(result, data);

        return result;
    }

    processConditionals(template, data) {
        // Handle {{#if condition}} ... {{/if}}
        return template.replace(
            /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g,
            (match, condition, content) => {
                const value = this.getValue(condition.trim(), data);
                return value ? content : '';
            }
        );
    }

    processLoops(template, data) {
        // Handle {{#each array}} ... {{/each}}
        return template.replace(
            /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g,
            (match, arrayPath, content) => {
                const array = this.getValue(arrayPath.trim(), data);
                if (!Array.isArray(array)) return '';

                return array
                    .map((item, index) => {
                        const itemData = {
                            ...data,
                            this: item,
                            '@index': index,
                            '@first': index === 0,
                            '@last': index === array.length - 1
                        };

                        // If item is an object, merge its properties
                        if (typeof item === 'object' && item !== null) {
                            Object.assign(itemData, item);
                        }

                        return this.renderTemplate(content, itemData);
                    })
                    .join('');
            }
        );
    }

    processVariables(template, data) {
        // Handle {{variable}} and {{{variable}}} (unescaped)
        return template.replace(/{{{([^}]+)}}}|{{([^}]+)}}/g, (match, unescaped, escaped) => {
            const variable = (unescaped || escaped).trim();
            const value = this.getValue(variable, data);

            if (value === undefined || value === null) return '';

            const stringValue = String(value);

            // Return unescaped for {{{variable}}}
            if (unescaped) return stringValue;

            // Return escaped for {{variable}}
            return this.helpers.get('escapeHtml')(stringValue);
        });
    }

    processPartials(template, data) {
        // Handle {{> partialName}}
        return template.replace(/{{>\s*([^}]+)}}/g, (match, partialName) => {
            const partial = this.partials.get(partialName.trim());
            if (!partial) {
                console.warn(`Partial not found: ${partialName.trim()}`);
                return '';
            }

            return this.renderTemplate(partial, data);
        });
    }

    processHelpers(template, data) {
        // Handle {{helper arg1 arg2}}
        return template.replace(
            /{{([a-zA-Z_][a-zA-Z0-9_]*)\s+([^}]+)}}/g,
            (match, helperName, args) => {
                const helper = this.helpers.get(helperName);
                if (!helper) return match;

                try {
                    const argValues = args.split(/\s+/).map((arg) => this.getValue(arg, data));
                    return helper(...argValues);
                } catch (error) {
                    console.warn(`Helper error (${helperName}):`, error.message);
                    return '';
                }
            }
        );
    }

    getValue(path, data) {
        if (path === 'this') return data.this;

        // Handle string literals
        if (
            (path.startsWith('"') && path.endsWith('"')) ||
            (path.startsWith("'") && path.endsWith("'"))
        ) {
            return path.slice(1, -1);
        }

        // Handle boolean literals
        if (path === 'true') return true;
        if (path === 'false') return false;

        // Handle number literals
        if (/^\d+(\.\d+)?$/.test(path)) {
            return Number(path);
        }

        // Navigate object path
        const parts = path.split('.');
        let value = data;

        for (const part of parts) {
            if (value === undefined || value === null) return undefined;
            value = value[part];
        }

        return value;
    }

    async buildPage(templateName, outputPath, pageData = {}) {
        console.log(`🔨 Building page: ${templateName} -> ${outputPath}`);

        // Combine content data with page-specific data
        const data = {
            ...this.getDefaultData(),
            ...this.contentData,
            ...pageData
        };

        try {
            const html = this.render(templateName, data);

            // Ensure output directory exists
            await fs.mkdir(path.dirname(outputPath), { recursive: true });

            // Write file
            await fs.writeFile(outputPath, html, 'utf8');

            console.log(`   ✅ Generated: ${path.relative(ROOT_DIR, outputPath)}`);
        } catch (error) {
            console.error(`   ❌ Failed to build ${templateName}:`, error.message);
            throw error;
        }
    }

    getDefaultData() {
        return {
            // Site metadata
            siteName: 'M. N.',
            siteNameAccent: 'Jaber',
            title: 'M. N. Jaber - AI Engineer Portfolio',
            description:
                'Portfolio of M. N. Jaber, PhD-level AI Engineer specializing in LLMs, Retrieval-Augmented Generation, and end-to-end machine learning solutions.',
            author: 'M. N. Jaber',
            keywords: 'AI Engineer, Machine Learning, LLM, RAG, Generative AI, Portfolio',
            themeColor: '#121212',

            // URLs and paths
            canonicalUrl: 'https://mohammednasserahmed.github.io/portfolio/',
            baseUrl: 'https://mohammednasserahmed.github.io/portfolio',
            assetPath: 'dist',
            cssPath: 'dist/style.css',
            jsPath: 'dist/main.js',
            manifestPath: 'manifest.webmanifest',
            serviceWorkerPath: '/portfolio/sw.js',

            // Open Graph
            ogTitle: 'M. N. Jaber - AI Engineer Portfolio',
            ogDescription:
                'PhD-level AI Engineer focused on LLM systems, retrieval architectures, and production ML pipelines.',
            ogImage: 'images/website-photo.png',
            ogImageAlt: 'Portrait of M.N. Jaber',
            ogUrl: 'https://mohammednasserahmed.github.io/portfolio/',
            ogSiteName: 'M. N. Jaber Portfolio',
            ogLocale: 'en_US',

            // Twitter
            twitterTitle: 'M. N. Jaber - AI Engineer Portfolio',
            twitterDescription: 'AI Engineer (PhD) building impactful LLM & ML solutions.',
            twitterImage: 'images/website-photo.png',

            // Navigation
            navigationItems: [
                { href: '#summary', text: 'Summary' },
                { href: '#projects', text: 'Projects' },
                { href: '#skills', text: 'Skills' },
                { href: '#publications', text: 'Publications' },
                { href: '#contact', text: 'Contact' }
            ],

            // Hero section
            heroTitle: 'AI Engineer &',
            heroDescription:
                'PhD-level AI Engineer with deep expertise in AI and ML, specializing in scalable, real-world solutions across supervised, unsupervised, and reinforcement learning.',
            primaryCTA: 'Get In Touch',
            secondaryCTA: 'View Work',
            profileImageSmall: 'images/website-photo.png',
            profileImageLarge: 'images/website-photo.png',
            profileImageAlt: 'Portrait of M. N. Jaber',
            heroImage: 'images/website-photo.png',

            // Footer
            footerTitle: "Let's Build the Future of",
            footerAccent: 'AI',
            footerAccentWords: 'AI|Intelligence|Innovation',
            footerDescription:
                "I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Feel free to reach out.",
            contactEmail: 'mohnasgr@ainarabic.io',
            copyright:
                '© 2025 M. N. Jaber. All Rights Reserved. Designed & Coded with a passion for AI.',

            // Social links
            socialLinks: [
                {
                    name: 'GitHub',
                    url: 'https://github.com/mohammedNasserAhmed',
                    icon: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>'
                }
            ],

            // Language alternatives
            languageAlternates: [
                { hreflang: 'en', href: 'https://mohammednasserahmed.github.io/portfolio/' },
                { hreflang: 'ar', href: 'https://mohammednasserahmed.github.io/portfolio/ar/' },
                { hreflang: 'x-default', href: 'https://mohammednasserahmed.github.io/portfolio/' }
            ],

            // Feature flags
            enableServiceWorker: false, // Disabled temporarily
            enableThemeToggle: false, // Dark mode only
            enableLanguageSwitcher: false,

            // Environment
            environment: process.env.NODE_ENV || 'development',
            isDevelopment: process.env.NODE_ENV !== 'production',
            buildVersion: 'dev-build',
            assetVersion: Date.now().toString(36),

            // Accessibility
            skipToContentText: 'Skip to content'
        };
    }

    async buildHTML(options = {}) {
        const { templatesDir, data = {}, buildId = 'dev' } = options;

        console.log('🏗️  Building HTML from templates...');

        // Set template directory if provided
        if (templatesDir) {
            this.templates.clear();
            this.partials.clear();
            await this.loadTemplateDirectory(templatesDir);
        }

        // Load content data if provided
        if (data && Object.keys(data).length > 0) {
            this.contentData = data;
        }

        // Build HTML content
        const content = await this.buildMainContent();

        // Use base template if available, otherwise create simple HTML structure
        if (this.templates.has('base')) {
            return this.render('base', {
                lang: 'en',
                content,
                buildVersion: buildId,
                assetVersion: buildId
            });
        } else {
            // Create a simple HTML structure
            return this.createSimpleHTML(content, buildId);
        }
    }

    createSimpleHTML(content, buildId) {
        const defaultData = this.getDefaultData();

        return `<!doctype html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${defaultData.title}</title>
    <meta name="description" content="${defaultData.description}" />
    <meta name="theme-color" content="${defaultData.themeColor}" />
    <link rel="stylesheet" href="${defaultData.cssPath}" />
    <meta name="asset-version" content="${buildId}" />
</head>
<body class="bg-brand-dark text-brand-light-gray font-sans">
    <main class="container mx-auto px-6 py-12">
        ${content}
    </main>
    <script defer src="${defaultData.jsPath}"></script>
</body>
</html>`;
    }

    async buildMainContent() {
        const sections = [];

        // Build hero section
        if (this.partials.has('sections/hero')) {
            sections.push(this.partials.get('sections/hero'));
        }

        // Build summary section
        if (this.partials.has('sections/summary')) {
            sections.push(this.partials.get('sections/summary'));
        }

        // Build projects section
        if (this.partials.has('sections/projects')) {
            sections.push(this.partials.get('sections/projects'));
        }

        // Build skills section
        if (this.partials.has('sections/skills')) {
            sections.push(this.partials.get('sections/skills'));
        }

        // Build publications section
        if (this.partials.has('sections/publications')) {
            sections.push(this.partials.get('sections/publications'));
        }

        // Build education section
        if (this.partials.has('sections/education')) {
            sections.push(this.partials.get('sections/education'));
        }

        // Build outreach section
        if (this.partials.has('sections/outreach')) {
            sections.push(this.partials.get('sections/outreach'));
        }

        return sections.join('\n\n');
    }
}

// Build pages if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const builder = new TemplateBuilder();

    builder
        .init()
        .then(() => builder.buildAllPages())
        .catch(console.error);
}

export { TemplateBuilder };
