<div align="center">
  <h1>🤖 AI Engineer Portfolio</h1>
  <p><strong>A cutting-edge, high-performance portfolio showcasing AI engineering expertise</strong></p>
  
  [![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
  [![Performance](https://img.shields.io/badge/Lighthouse-100%2F100-brightgreen.svg)](audit.json)
  
  <img src="images/website-photo.png" alt="Portfolio Preview" width="600" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
</div>

---

## ✨ **Overview**

This is a **modern, ultra-optimized portfolio website** for an AI Engineer specializing in **Large Language Models (LLMs)**, **Retrieval-Augmented Generation (RAG)**, and **production machine learning systems**. Built with performance-first principles, featuring modular architecture, multilingual support, and comprehensive accessibility.

### 🎯 **Key Highlights**

- 🚀 **Lightning Fast**: Optimized for perfect Lighthouse scores
- 🌍 **Multilingual**: Full English & Arabic (RTL) support
- 📱 **Progressive Web App**: Installable with offline capabilities
- ♿ **Accessibility First**: WCAG 2.1 compliant
- 🎨 **Modern Design**: Dark theme with smooth animations
- 🔧 **Developer Friendly**: Modular ES6 architecture

---

## 🚀 **Features**

<table>
  <tr>
    <td>
      <h3>🏗️ Architecture</h3>
      <ul>
        <li><strong>Modular ES6</strong> components</li>
        <li><strong>Service Worker</strong> caching</li>
        <li><strong>Progressive Enhancement</strong></li>
        <li><strong>Type Safety</strong> with JSDoc</li>
        <li><strong>Supabase Integration</strong> (optional)</li>
      </ul>
    </td>
    <td>
      <h3>🎨 User Experience</h3>
      <ul>
        <li><strong>Interactive Skills Matrix</strong></li>
        <li><strong>Dynamic Project Filtering</strong></li>
        <li><strong>Three.js Starfield</strong></li>
        <li><strong>Smooth Animations</strong></li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>⚡ Performance</h3>
      <ul>
        <li><strong>Lazy Loading</strong></li>
        <li><strong>Asset Optimization</strong></li>
        <li><strong>Critical CSS Inlining</strong></li>
        <li><strong>Image Optimization</strong></li>
      </ul>
    </td>
    <td>
      <h3>🌐 Accessibility</h3>
      <ul>
        <li><strong>Keyboard Navigation</strong></li>
        <li><strong>Screen Reader Support</strong></li>
        <li><strong>Reduced Motion</strong></li>
        <li><strong>High Contrast</strong></li>
      </ul>
    </td>
  </tr>
</table>

---

## 📁 **Project Architecture**

```
🏠 portfolio/
├── 🎯 src/                    # Modern ES6 Source Code
│   ├── 🧩 components/         # Reusable UI Components
│   │   ├── skills-component.js       # Interactive skills matrix
│   │   ├── projects-component.js     # Dynamic project showcase
│   │   ├── publications-component.js # Research publications
│   │   └── mobile-navigation.js      # Responsive navigation
│   ├── 🔧 modules/            # Core Application Modules
│   │   ├── content-manager.js        # Dynamic content loading
│   │   ├── theme-manager.js          # Theme & accessibility
│   │   └── animation-manager.js      # Performance-aware animations
│   ├── 🛠️ utils/             # Utility Functions
│   │   └── helpers.js               # Error handling & validation
│   ├── ⚙️ config/            # Application Configuration
│   │   ├── app-config.js            # Central app settings
│   │   ├── config-loader.js         # Environment config
│   │   └── environment.js           # Environment detection
│   ├── 🎨 styles/            # Modular CSS Architecture
│   │   ├── main.css                 # Main stylesheet entry
│   │   ├── base.css                 # Base styles & variables
│   │   ├── components.css           # Component-specific styles
│   │   ├── projects.css             # Project section styles
│   │   └── skills.css               # Skills matrix styles
│   └── 📄 templates/         # HTML Template System
│       ├── base.html                # Base template
│       └── sections/                # Section templates
├── 🔨 scripts/               # Build & Development Tools
│   ├── build-ultra-reliable.mjs     # Production build system
│   ├── template-builder.mjs         # Template processing
│   ├── dev-server.mjs               # Development server
│   └── optimize-images.mjs          # Image optimization
├── 📊 data/                  # Content Management
│   ├── content.json                 # English content
│   ├── content.ar.json              # Arabic content
│   └── content.schema.json          # Content validation
├── 🌍 ar/                    # Arabic Version
│   └── index.html                   # Arabic (RTL) homepage
├── 🎯 dist/                  # Optimized Build Output
├── 🖼️ images/               # Static Assets
└── 📱 PWA Files              # Progressive Web App
    ├── manifest.webmanifest         # App manifest
    ├── sw.js                        # Service worker
    └── offline.html                 # Offline fallback
```

---

## 🛠️ **Technology Stack**

<div align="center">
  
| **Category** | **Technologies** |
|:---:|:---|
| **Frontend** | 🎨 Vanilla JavaScript ES6+ • 🎨 Tailwind CSS • 🌌 Three.js |
| **Build System** | ⚙️ Custom ES Modules • 🛠️ PostCSS • 📊 Sharp (Image Optimization) |
| **Development** | 🔍 ESLint • ✨ Prettier • 🐶 Husky • 📝 Lighthouse |
| **Performance** | ⚡ Service Worker • 📊 Intersection Observer • 🚀 Critical CSS |
| **Content** | 📊 JSON-driven • 🌍 i18n Support • ✅ Schema Validation |

</div>

### 🏗️ **Build System Features**

- **🔥 Ultra-Reliable Build**: Prevents white page issues with validation
- **🎨 Asset Optimization**: Automatic CSS/JS minification and versioning
- **🖼️ Image Processing**: Smart compression with Sharp
- **📄 Template System**: Dynamic HTML generation
- **⚙️ Environment Detection**: Development vs production optimizations

---

## ⚡ **Quick Start**

### **Prerequisites**

```bash
# Required
✓ Node.js 16+ (ES modules support)
✓ npm 8+
✓ Modern browser (ES2020+)
```

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/MohammedNasserAhmed/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# 🌐 http://localhost:3000
```

### **🛠️ Development Commands**

| Command                    | Purpose         | Description                         |
| :------------------------- | :-------------- | :---------------------------------- |
| `npm run dev`              | **Development** | 🚀 Start dev server with hot reload |
| `npm run build`            | **Production**  | 🎨 Build optimized assets           |
| `npm run preview`          | **Preview**     | 🔍 Preview production build         |
| `npm run lint`             | **Quality**     | 🔎 Check code quality               |
| `npm run format`           | **Style**       | ✨ Auto-format code                 |
| `npm run validate:content` | **Content**     | ✅ Validate JSON content            |

---

## 🏗️ **Core Architecture**

### **🧩 Component System**

Each component follows a standardized pattern:

```javascript
// Example: SkillsComponent
export class SkillsComponent {
    constructor() {
        this.container = null;
        this.filters = new Set();
    }

    init() {
        // Initialize component
        this.container = document.getElementById('skills-container');
        this.attachEventListeners();
    }

    render(data) {
        // Render component with error handling
        try {
            this.validateData(data);
            this.updateDOM(data);
        } catch (error) {
            this.handleError(error);
        }
    }

    destroy() {
        // Cleanup resources
        this.removeEventListeners();
        this.container = null;
    }
}
```

### **📊 Content Management**

```javascript
// Dynamic content loading with fallbacks
const contentManager = {
    async loadContent(locale = 'en') {
        try {
            const response = await fetch(`data/content.${locale}.json`);
            return await response.json();
        } catch (error) {
            // Fallback to English content
            return await this.loadContent('en');
        }
    }
};
```

### **⚡ Performance Optimizations**

- **Lazy Loading**: Components load when needed
- **Intersection Observer**: Animations trigger on visibility
- **Critical CSS**: Above-the-fold styles inlined
- **Resource Hints**: Preload critical assets
- **Service Worker**: Intelligent caching strategy

---

## 🎨 **Styling & Design**

### **Modern CSS Architecture**

```
src/styles/
├── main.css        # 🎨 Main entry point
├── base.css        # 🎯 Foundation & CSS variables
├── components.css  # 🧩 Component-specific styles
├── projects.css    # 💼 Project showcase styles
└── skills.css      # 🎧 Interactive skills matrix
```

### **Design System**

| **Element**    | **Specification**                             |
| :------------- | :-------------------------------------------- |
| **Colors**     | Dark theme with brand red (`#D92323`) accents |
| **Typography** | Inter (body) + Plus Jakarta Sans (headings)   |
| **Layout**     | Mobile-first responsive grid                  |
| **Animations** | Smooth 60fps with reduced motion support      |

---

## 📱 **Responsive Design**

<div align="center">
  
| **Breakpoint** | **Width** | **Layout** |
|:---------------|:----------|:-----------|
| **Mobile** | `< 640px` | Single column, touch-optimized |
| **Tablet** | `640px - 1024px` | Two-column layout |
| **Desktop** | `> 1024px` | Multi-column with sidebars |
| **Wide** | `> 1280px` | Full-width with max containers |

</div>

### **Mobile-First Features**

- 👆 **Touch-friendly** interfaces
- 📱 **Swipe navigation** for carousels
- ⚙️ **Collapsible sections** for small screens
- 🚀 **Optimized performance** on mobile networks

### ✅ Responsive checklist (keep it fitting on PC and mobile)

- Layout
    - Use fluid containers: `container mx-auto px-6` or `max-w-screen-xl mx-auto`.
    - Prefer responsive utilities: `mt-12 md:mt-24`, `text-4xl md:text-6xl`, `grid-cols-1 md:grid-cols-3`.
    - Avoid fixed widths; prefer `w-full max-w-[...px]` or CSS `clamp()`.
- Media
    - Keep media fluid: ensure CSS has `img, video, iframe { max-width: 100%; height: auto; }`.
    - Set width/height attributes on key images to reduce CLS, keep CSS fluid.
- Grids & carousels
    - Use `grid-template-columns: repeat(auto-fit, minmax(…))` for flexible grids.
    - For carousels, ensure card widths use `clamp()` and don’t exceed viewport on mobile.
- Spacing & typography
    - Use responsive spacing and font sizes with Tailwind breakpoints.
    - Prefer `clamp()` for large hero headings if needed.
- Overflow safety
    - Prevent horizontal scroll: ensure `html, body { overflow-x: hidden; }`.
    - Watch for absolute/fixed elements pushing outside the viewport.

### 🧩 Tailwind patterns that work well

- Section containers: `container mx-auto px-4 sm:px-6 lg:px-8`
- Responsive grids: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Responsive cards: `w-full sm:max-w-sm` or `w-[clamp(260px,45vw,380px)]`
- Responsive text: `text-2xl sm:text-3xl md:text-5xl` with `leading-tight`
- Hide/show: `hidden md:block` / `md:hidden`

### 🛠 Troubleshooting layout issues

- Horizontal scroll appears on mobile
    - Inspect for elements with fixed width (e.g., `width: 1200px`) or negative margins; replace with responsive widths or `max-width: 100%`.
    - Ensure images/iframes aren’t wider than their container.
- Cards overflowing
    - Constrain with `max-w-full` and consider `clamp()` for width.
    - Reduce padding/margins at `sm`/`md` breakpoints.
- Text too large on small screens
    - Use responsive text utilities and test on 320–375px wide devices.

---

## ♿ **Accessibility Features**

### **WCAG 2.1 Compliance**

✅ **Level AA** compliance across all features:

| **Feature**             | **Implementation**                             |
| :---------------------- | :--------------------------------------------- |
| **Keyboard Navigation** | Full tab support with visible focus indicators |
| **Screen Readers**      | Semantic HTML with proper ARIA labels          |
| **Color Contrast**      | 4.5:1 minimum ratio throughout                 |
| **Reduced Motion**      | Respects `prefers-reduced-motion`              |
| **Text Scaling**        | Supports up to 200% zoom                       |
| **Alternative Text**    | Descriptive alt tags for all images            |

### **Interactive Enhancements**

```javascript
// Reduced motion support
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches) {
    // Enable animations
    initAnimations();
}
```

---

## ⚡ **Performance Metrics**

<div align="center">
  
### **Lighthouse Scores**

| **Category**          | **Score**   | **Metric**             |
| :-------------------- | :---------- | :--------------------- |
| 🚀 **Performance**    | **100/100** | ≤ 1.2s LCP             |
| ♿ **Accessibility**  | **100/100** | WCAG 2.1 AA            |
| 🔍 **Best Practices** | **100/100** | Security & Standards   |
| 🔍 **SEO**            | **100/100** | Schema.org + Meta tags |

</div>

### **Optimization Techniques**

- **📊 Critical CSS**: Above-the-fold styles inlined
- **🖼️ Image Optimization**: WebP with fallbacks
- **🔄 Service Worker**: Intelligent caching strategies
- **🚀 Lazy Loading**: Progressive image and component loading
- **⚙️ Bundle Splitting**: Separate vendor and app bundles

---

## 🌍 **Multilingual Support**

### **Supported Languages**

| **Language** | **Code** | **Direction** | **File**          |
| :----------- | :------- | :------------ | :---------------- |
| **English**  | `en`     | LTR           | `content.json`    |
| **Arabic**   | `ar`     | RTL           | `content.ar.json` |

### **RTL Implementation**

```css
/* Automatic RTL layout */
[dir='rtl'] {
    .flex {
        flex-direction: row-reverse;
    }
    .text-left {
        text-align: right;
    }
    .ml-4 {
        margin-right: 1rem;
        margin-left: 0;
    }
}
```

### **Content Structure**

```json
{
    "summary": ["Professional summary points"],
    "projects": [
        {
            "title": "Project Title",
            "description": "Project description",
            "skills": ["React", "Node.js"],
            "links": { "github": "url", "demo": "url" }
        }
    ],
    "skills": [
        {
            "name": "JavaScript",
            "category": "Frontend",
            "level": 90
        }
    ]
}
```

---

## 🧪 **Testing & Quality Assurance**

### **Automated Testing**

| **Type**        | **Tool**   | **Purpose**              |
| :-------------- | :--------- | :----------------------- |
| **Linting**     | ESLint     | Code quality & standards |
| **Formatting**  | Prettier   | Consistent code style    |
| **Performance** | Lighthouse | Core Web Vitals          |
| **Content**     | Ajv        | JSON schema validation   |

### **Manual Testing Checklist**

- [ ] 📱 **Mobile Responsiveness** across devices
- [ ] ♿ **Keyboard Navigation** for all interactive elements
- [ ] 🎨 **Animation Performance** with reduced motion
- [ ] 🔄 **Error State Handling** for network failures
- [ ] 🌍 **Cross-browser Compatibility** (Chrome, Firefox, Safari)
- [ ] 🚀 **PWA Installation** and offline functionality

### **Build Validation**

```bash
# Complete validation pipeline
npm run lint          # Code quality check
npm run format:check  # Style consistency
npm run build         # Production build
npm run lighthouse    # Performance audit
```

---

## ⚙️ **Configuration**

### **Environment Variables**

```bash
# Build configuration
NODE_ENV=production          # Environment mode
KEEP_ASSET_VERSIONS=3        # Asset version retention
```

### **App Configuration**

```javascript
// src/config/app-config.js
export const APP_CONFIG = {
    animation: {
        typing: {
            words: ['AI Engineer', 'ML Specialist', 'LLM Expert'],
            typeSpeed: 100,
            backSpeed: 50
        },
        starfield: {
            starCount: 1000,
            starSpeed: 0.005,
            enableParallax: true
        }
    },
    performance: {
        lazyLoadThreshold: '100px',
        debounceDelay: 300,
        animationThreshold: 0.1
    },
    content: {
        fallbackLanguage: 'en',
        cacheTimeout: 300000 // 5 minutes
    }
};
```

---

## 🔧 **Development Workflow**

### **Getting Started**

```bash
# 1. Environment setup
npm install
npm run husky install  # Git hooks

# 2. Development
npm run dev           # Start dev server
npm run watch:css     # Watch CSS changes

# 3. Code quality
npm run lint:fix      # Auto-fix issues
npm run format        # Format code

# 4. Build & deploy
npm run build:prod    # Production build
npm run preview       # Test production build
```

### **Supabase Backend Integration** (Optional)

The portfolio supports fetching project data from Supabase as an alternative to local JSON files.

```bash
# Quick setup:
# 1. Create a Supabase project at https://app.supabase.com
# 2. Run the SQL setup script (supabase-setup.sql) in Supabase SQL Editor
# 3. Configure credentials in index.html:
window.__ENV__ = {
    VITE_SUPABASE_URL: 'https://your-project.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'your-anon-key',
    VITE_DATA_SOURCE: 'supabase'  // Switch to 'supabase' to enable
};
```

📖 **[Complete Supabase Setup Guide](SUPABASE_SETUP.md)** - Includes database schema, configuration options, and troubleshooting.

### **Git Workflow**

```bash
# Pre-commit hooks automatically run:
# 1. Prettier formatting
# 2. ESLint validation
# 3. Content schema validation

git add .
git commit -m "feat: add new component"  # Conventional commits
```

---

## 🖐️ **Customization Guide**

### **Adding New Sections**

1. **Create Component**

    ```javascript
    // src/components/experience-component.js
    export class ExperienceComponent {
        constructor() {
            /* ... */
        }
        init() {
            /* ... */
        }
        render(data) {
            /* ... */
        }
    }
    ```

2. **Update Content Schema**

    ```json
    // data/content.schema.json
    {
        "properties": {
            "experience": {
                "type": "array",
                "items": {
                    /* schema definition */
                }
            }
        }
    }
    ```

3. **Add Content Data**
    ```json
    // data/content.json
    {
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Senior AI Engineer",
                "duration": "2021-Present"
            }
        ]
    }
    ```

### **Theme Customization**

```css
/* src/styles/base.css */
:root {
    --brand-primary: #d92323; /* Main brand color */
    --brand-secondary: #121212; /* Dark background */
    --brand-accent: #a0a0a0; /* Text secondary */
    --brand-success: #10b981; /* Success states */
}
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

<details>
<summary><strong>Build fails with module errors</strong></summary>

```bash
# Solutions:
1. Check Node.js version (16+)
2. Clear node_modules and reinstall
3. Verify ES module syntax

npm run clean
rm -rf node_modules package-lock.json
npm install
```

</details>

<details>
<summary><strong>Animations not working</strong></summary>

```javascript
// Check browser support
if ('IntersectionObserver' in window) {
    // Animations supported
} else {
    // Fallback behavior
}

// Check reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
```

</details>

<details>
<summary><strong>Content not loading</strong></summary>

```bash
# Debug steps:
1. Check JSON syntax: npm run validate:content
2. Verify file paths in network tab
3. Check CORS headers in development
4. Review browser console for errors
```

</details>

### **Debug Mode**

```javascript
// Enable detailed logging
window.DEBUG = true;
localStorage.setItem('portfolio-debug', 'true');

// Check build info
console.log('Build version:', document.querySelector('[name="asset-version"]').content);
```

---

## 📝 **Contributing**

We welcome contributions! Please follow these guidelines:

### **Development Standards**

- ✨ **Code Style**: Prettier + ESLint configuration
- 📁 **Commits**: Conventional commit format
- 🧪 **Testing**: Manual testing checklist required
- 📚 **Documentation**: Update README for new features

### **Pull Request Process**

1. 🌱 **Fork** the repository
2. 🌿 **Create** a feature branch
3. ✨ **Make** your changes with proper formatting
4. 🧪 **Test** thoroughly across devices
5. 📄 **Submit** a detailed pull request

---

## 📜 **License**

This project is licensed under the **Apache 2.0 License**. See the [LICENSE](LICENSE) file for details.

---

## 📞 **Support & Contact**

<div align="center">

### **Need Help?**

🐛 **Found a bug?** → [Create an issue](https://github.com/MohammedNasserAhmed/portfolio/issues)

💡 **Have a suggestion?** → [Start a discussion](https://github.com/MohammedNasserAhmed/portfolio/discussions)

📚 **Check the docs** → [Troubleshooting section](#-troubleshooting)

---

**Built with ❤️ by M. N. Jaber**

_Showcasing the intersection of AI engineering and modern web development_

🌍 [**Live Demo**](https://mohammednasserahmed.github.io/portfolio/) • 🐛 [**GitHub**](https://github.com/MohammedNasserAhmed/portfolio) • 💼 [**LinkedIn**](https://linkedin.com/in/m-n-g)

</div>
