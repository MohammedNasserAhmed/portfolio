# Development Guide

This guide covers development practices, coding standards, and architectural decisions for the AI Engineer Portfolio project.

## Table of Contents

1. [Development Environment](#development-environment)
2. [Code Organization](#code-organization)
3. [Coding Standards](#coding-standards)
4. [Component Development](#component-development)
5. [Build System](#build-system)
6. [Testing Strategy](#testing-strategy)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility](#accessibility)

## Development Environment

### Prerequisites

- **Node.js 16+** (Required for ES modules and build tools)
- **Modern Browser** with ES6 module support
- **Git** for version control
- **VS Code** (Recommended) with extensions:
  - ESLint
  - Prettier
  - JavaScript (ES6) code snippets

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd portfolio
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build:production
   ```

### Development Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build:new        # Build with enhanced system
npm run build           # Legacy build system

# Quality Assurance
npm run lint            # ESLint analysis
npm run format          # Prettier formatting
npm run clean           # Clean build artifacts

# Production
npm run build:production  # Production build
npm run preview          # Preview production build
```

## Code Organization

### Directory Structure

```
src/
├── components/          # Reusable UI components
├── modules/            # Core application modules
├── utils/              # Utility functions and helpers
├── config/             # Configuration files
├── styles/             # Modular CSS files
├── templates/          # HTML templates
└── main.js             # Application entry point
```

### Module Types

1. **Components** (`src/components/`)
   - Self-contained UI components
   - Manage their own state and DOM
   - Follow component lifecycle pattern

2. **Modules** (`src/modules/`)
   - Core application functionality
   - Shared services and managers
   - Cross-cutting concerns

3. **Utils** (`src/utils/`)
   - Pure functions
   - No side effects
   - Reusable across the application

### Import Conventions

```javascript
// External dependencies first
import { someExternalLib } from 'external-lib';

// Internal modules (relative imports)
import { helperFunction } from '../utils/helpers.js';
import { ComponentClass } from './component.js';

// Configuration last
import { APP_CONFIG } from '../config/app-config.js';
```

## Coding Standards

### JavaScript

#### ES6+ Features

- **Use ES6 modules** for all new code
- **Prefer const/let** over var
- **Use arrow functions** for callbacks
- **Template literals** for string interpolation
- **Destructuring** for object/array access
- **Async/await** for asynchronous operations

```javascript
// Good
const { name, category } = skill;
const message = `Processing ${name} in ${category}`;
const data = await loadContent();

// Avoid
var skillName = skill.name;
var message = 'Processing ' + skillName + ' in ' + skill.category;
loadContent().then(data => { /* ... */ });
```

#### Naming Conventions

- **camelCase** for variables and functions
- **PascalCase** for classes and constructors
- **UPPER_CASE** for constants
- **kebab-case** for CSS classes and HTML attributes

```javascript
// Variables and functions
const skillCount = 10;
function calculateProgress() { }

// Classes
class SkillsComponent { }

// Constants
const MAX_SKILLS = 100;
const ERROR_TYPES = { /* ... */ };
```

#### JSDoc Documentation

All public methods and classes must have JSDoc comments:

```javascript
/**
 * Renders skills data with validation and error handling
 * @param {Array<Object>} items - Array of skill objects
 * @param {string} items[].name - Skill name (required)
 * @param {number} [items[].percent] - Proficiency percentage (0-100)
 * @returns {void}
 * @throws {Error} When invalid data is provided
 */
render(items) {
    // Implementation
}
```

### Error Handling

#### Error Categories

Use the predefined error types:

```javascript
import { ErrorTypes } from '../utils/helpers.js';

// Component errors
throw handleError(error, 'Component initialization failed', ErrorTypes.COMPONENT);

// Network errors
throw handleError(error, 'Failed to load content', ErrorTypes.NETWORK);

// Validation errors
throw handleError(error, 'Invalid parameters', ErrorTypes.INITIALIZATION);
```

#### Graceful Degradation

Always provide fallback mechanisms:

```javascript
try {
    await this.loadDynamicContent();
} catch (error) {
    handleError(error, 'Failed to load dynamic content');
    this.renderFallbackContent();
}
```

### CSS Standards

#### Utility-First Approach

Use Tailwind CSS utilities for styling:

```html
<!-- Good -->
<div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg">

<!-- Avoid custom CSS when utilities exist -->
<div class="custom-header">
```

#### Custom CSS Organization

When custom CSS is needed:

```css
/* Component-specific styles */
.skills-matrix {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
}

/* Use CSS custom properties for theming */
.skill-arc {
    --ring-color: theme('colors.red.500');
    --ring-progress: 0%;
}
```

## Component Development

### Component Lifecycle

1. **Constructor** - Initialize properties
2. **init()** - Set up DOM references and event listeners
3. **render()** - Render data with validation
4. **destroy()** - Clean up resources (if needed)

### Component Template

```javascript
import { validateParams, handleError, ErrorTypes } from '../utils/helpers.js';

/**
 * Component description
 * @class ComponentName
 */
export class ComponentName {
    /**
     * Create component instance
     * @constructor
     */
    constructor() {
        /** @type {HTMLElement|null} Component container */
        this.container = null;
        
        /** @type {boolean} Initialization state */
        this.isInitialized = false;
    }
    
    /**
     * Initialize the component
     * @returns {void}
     * @throws {Error} When initialization fails
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.container = document.getElementById('component-id');
            
            if (!this.container) {
                throw new Error('Component container not found');
            }
            
            this.setupEventListeners();
            this.isInitialized = true;
            
        } catch (error) {
            throw handleError(error, 'Component initialization failed', ErrorTypes.COMPONENT);
        }
    }
    
    /**
     * Render component data
     * @param {Array} items - Data to render
     * @returns {void}
     */
    render(items) {
        try {
            validateParams({ items }, {
                items: { required: true, type: 'array' }
            });
            
            // Render implementation
            
        } catch (error) {
            handleError(error, 'Render failed', ErrorTypes.COMPONENT);
            this.renderFallback();
        }
    }
    
    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        // Event listener setup
    }
    
    /**
     * Render fallback content
     * @private
     */
    renderFallback() {
        // Fallback implementation
    }
}
```

### State Management

- **Local state** in component properties
- **Shared state** through event system
- **Persistent state** in localStorage with error handling

```javascript
// Local state
this.activeFilters = new Set();

// Shared state via events
document.dispatchEvent(new CustomEvent('filterChanged', {
    detail: { filters: Array.from(this.activeFilters) }
}));

// Persistent state
try {
    const saved = localStorage.getItem('app-state');
    this.state = saved ? JSON.parse(saved) : this.getDefaultState();
} catch (error) {
    logWarn('Failed to restore state:', error.message);
    this.state = this.getDefaultState();
}
```

## Build System

### Enhanced Build System

The enhanced build system provides:

- **ES module bundling** with dependency resolution
- **CSS processing** with import resolution
- **Template building** for HTML generation
- **Asset optimization** with cache busting
- **Development server** with hot reload

### Build Configuration

```javascript
// Build environment detection
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Asset versioning
const KEEP_ASSET_VERSIONS = parseInt(process.env.KEEP_ASSET_VERSIONS || '3', 10);
```

### Custom Build Steps

1. **Module Loading** - Recursively load ES modules
2. **Bundling** - Create CommonJS-compatible bundle
3. **CSS Processing** - Resolve imports and optimize
4. **Template Building** - Generate HTML from templates
5. **Asset Optimization** - Hash and optimize assets
6. **HTML Updates** - Update references to hashed assets

## Testing Strategy

### Manual Testing

1. **Functionality Testing**
   - All components render correctly
   - Interactive features work
   - Error states display properly

2. **Accessibility Testing**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast ratios

3. **Performance Testing**
   - Page load times
   - Animation smoothness
   - Memory usage

4. **Cross-browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers

### Automated Testing (Future)

Recommended testing framework setup:

```javascript
// Component testing with Jest
describe('SkillsComponent', () => {
    let component;
    
    beforeEach(() => {
        component = new SkillsComponent();
        document.body.innerHTML = '<div id="skills-track"></div>';
        component.init();
    });
    
    test('renders skills correctly', () => {
        const skills = [{ name: 'Python', percent: 90 }];
        component.render(skills);
        
        expect(component.container.children.length).toBe(1);
    });
});
```

## Performance Guidelines

### Core Principles

1. **Minimize DOM Manipulation**
   ```javascript
   // Good: Batch DOM updates
   const fragment = document.createDocumentFragment();
   items.forEach(item => fragment.appendChild(createItem(item)));
   container.appendChild(fragment);
   
   // Avoid: Individual DOM updates in loops
   items.forEach(item => container.appendChild(createItem(item)));
   ```

2. **Use Intersection Observer**
   ```javascript
   // Efficient animation triggering
   const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
           if (entry.isIntersecting) {
               entry.target.classList.add('animate');
               observer.unobserve(entry.target);
           }
       });
   });
   ```

3. **Respect User Preferences**
   ```javascript
   // Reduced motion support
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (!prefersReducedMotion) {
       startAnimations();
   }
   ```

### Image Optimization

- Use appropriate formats (WebP, AVIF)
- Implement lazy loading
- Provide fallback mechanisms
- Optimize dimensions for display size

### Bundle Optimization

- Code splitting for large components
- Tree shaking for unused code
- Asset compression
- Cache headers for static assets

## Accessibility

### Guidelines

1. **Semantic HTML**
   ```html
   <button type="button" aria-label="Filter by Python skills">
       <img src="python-icon.svg" alt="Python" />
   </button>
   ```

2. **ARIA Attributes**
   ```html
   <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="85">
       <div class="progress-bar" style="width: 85%"></div>
   </div>
   ```

3. **Keyboard Navigation**
   ```javascript
   element.addEventListener('keydown', (event) => {
       if (event.key === 'Enter' || event.key === ' ') {
           event.preventDefault();
           handleClick();
       }
   });
   ```

4. **Focus Management**
   ```javascript
   // Announce dynamic content changes
   const announcer = document.getElementById('sr-announcer');
   announcer.textContent = 'Content updated';
   ```

### Testing Tools

- **axe-core** for automated accessibility testing
- **WAVE** browser extension
- **Screen readers** (NVDA, JAWS, VoiceOver)
- **Keyboard-only navigation**

## Deployment

### Production Checklist

- [ ] Run production build
- [ ] Test all functionality
- [ ] Validate performance metrics
- [ ] Check accessibility compliance
- [ ] Verify responsive design
- [ ] Test error scenarios
- [ ] Confirm analytics tracking

### Build Commands

```bash
# Production build
NODE_ENV=production npm run build:new

# Validate build
npm run lint
npm run build:new && echo "Build successful"

# Deploy assets
# (Specific to hosting platform)
```

This development guide ensures consistent, maintainable, and high-quality code across the portfolio project.