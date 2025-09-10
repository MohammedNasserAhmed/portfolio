# AI Engineer Portfolio

A modern, highly-optimized portfolio website for an AI Engineer, built with modular architecture and comprehensive build system.

## 🚀 Features

- **Modular Architecture**: ES6 module-based codebase with clear separation of concerns
- **Advanced Build System**: Multiple build strategies with asset optimization and templating
- **Enhanced Performance**: Lazy loading, intersection observers, and reduced motion support
- **Type Safety**: JSDoc annotations with comprehensive error handling
- **Responsive Design**: Mobile-first approach with accessible components
- **Interactive Animations**: Three.js starfield, typing animations, and smooth transitions
- **Content Management**: Dynamic content loading with fallback mechanisms

## 📁 Project Structure

```
portfolio/
├── src/                      # Source code (ES6 modules)
│   ├── components/           # UI components
│   │   ├── skills-component.js
│   │   ├── projects-component.js
│   │   ├── summary-component.js
│   │   ├── publications-component.js
│   │   └── mobile-navigation.js
│   ├── modules/              # Core modules
│   │   ├── theme-manager.js
│   │   ├── content-manager.js
│   │   └── animation-manager.js
│   ├── utils/                # Utility functions
│   │   └── helpers.js
│   ├── config/               # Configuration
│   │   └── app-config.js
│   ├── styles/               # Modular CSS
│   │   ├── main.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── projects.css
│   │   └── skills.css
│   ├── templates/            # HTML templates
│   │   ├── base.html
│   │   └── sections/
│   └── main.js               # Application entry point
├── scripts/                  # Build tools
│   ├── build-new.mjs         # Enhanced build system
│   ├── template-builder.mjs  # Template engine
│   ├── dev-server.mjs        # Development server
│   └── build.mjs             # Legacy build script
├── data/                     # Content data
│   ├── content.json          # Main content
│   └── content.ar.json       # Arabic content
├── dist/                     # Build output
├── js/                       # Legacy JavaScript (fallback)
├── css/                      # Legacy CSS (fallback)
└── images/                   # Static assets
```

## 🛠️ Build System

### Enhanced Build System (Recommended)

```bash
# Development build
npm run build:new

# Production build
NODE_ENV=production npm run build:new

# Development server
npm run dev
```

### Legacy Build System (Fallback)

```bash
# Legacy build
npm run build

# Production build
NODE_ENV=production npm run build
```

## 🔧 Development

### Prerequisites

- Node.js 16+ (for ES modules support)
- Modern browser with ES6 module support

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build:production
   ```

### Development Scripts

- `npm run build:new` - Enhanced build system
- `npm run dev` - Development server with hot reload
- `npm run build` - Legacy build system
- `npm run clean` - Clean build artifacts
- `npm run lint` - ESLint code analysis

## 🏗️ Architecture

### Core Modules

#### PortfolioApp (main.js)
Main application orchestrator that manages component lifecycle and inter-component communication.

```javascript
/**
 * Main portfolio application class
 * @class PortfolioApp
 */
class PortfolioApp {
    async init() { /* ... */ }
    initializeComponents() { /* ... */ }
    loadContent() { /* ... */ }
}
```

#### Component System

**SkillsComponent**: Interactive skill matrix with filtering and animations
- Progressive arc visualizations
- Category-based filtering
- Keyboard accessibility
- Performance-aware animations

**ProjectsComponent**: Project carousel with dynamic filtering
- Auto-scrolling carousel
- Project filtering by skills
- Fallback image handling

**AnimationManager**: Centralized animation control
- Three.js starfield background
- Typing animations
- Intersection Observer-based triggers
- Reduced motion support

### Error Handling

Comprehensive error handling with:
- Type validation with JSDoc
- Graceful degradation
- Error categorization
- Fallback content rendering

```javascript
import { handleError, ErrorTypes, validateParams } from './utils/helpers.js';

// Parameter validation
validateParams({ items }, {
    items: { required: true, type: 'array' }
});

// Error handling with context
throw handleError(error, 'Context description', ErrorTypes.COMPONENT);
```

### Configuration Management

Centralized configuration in `app-config.js`:
- Animation settings
- Performance thresholds
- Feature toggles
- Environment detection

## 🎨 Styling

### Modular CSS Architecture

```
src/styles/
├── main.css        # Main entry point
├── base.css        # Base styles and variables
├── components.css  # Component-specific styles
├── projects.css    # Project section styles
└── skills.css      # Skills component styles
```

### Tailwind CSS Integration

The project uses Tailwind CSS for utility-first styling:
- Custom brand colors
- Responsive design utilities
- Dark mode support
- Accessibility features

## 📱 Responsive Design

- **Mobile-first approach**
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly interactions**
- **Reduced motion support**

## ♿ Accessibility

- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Reduced motion preferences
- Semantic HTML structure

## 🚀 Performance

### Optimization Features

- **Lazy loading** for images and components
- **Intersection Observer** for efficient animations
- **Asset bundling** with cache busting
- **Reduced motion support**
- **Efficient DOM updates**

### Build Optimizations

- ES module bundling
- CSS optimization
- Image optimization
- Asset versioning
- Legacy fallbacks

## 🔄 Content Management

### Dynamic Content Loading

Content is loaded from JSON files with fallback mechanisms:

```javascript
// content.json structure
{
    "summary": [/* summary items */],
    "projects": [/* project data */],
    "skills": [/* skill objects */],
    "publications": [/* publication info */]
}
```

### Multilingual Support

- English (default): `data/content.json`
- Arabic: `data/content.ar.json`
- RTL layout support
- Language-specific fonts

## 🧪 Testing

### Manual Testing Checklist

- [ ] All components render correctly
- [ ] Animations respect reduced motion
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Error state handling
- [ ] Fallback content display

### Build Validation

```bash
# Check for syntax errors
npm run lint

# Validate build output
npm run build:new && echo "Build successful"

# Test production build
NODE_ENV=production npm run build:new
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: `development` | `production`
- `KEEP_ASSET_VERSIONS`: Number of asset versions to retain (default: 3)

### App Configuration

Key configuration options in `src/config/app-config.js`:

```javascript
export const APP_CONFIG = {
    animation: {
        typing: { words: [...], typeSpeed: 100 },
        starfield: { starCount: 1000, starSpeed: 0.005 }
    },
    skills: {
        filterStorageKey: 'portfolio-skill-filters'
    },
    timeouts: {
        initialization: 10000
    }
};
```

## 🐛 Troubleshooting

### Common Issues

**Build Fails with Module Errors**
- Ensure Node.js 16+ is installed
- Check ES module syntax in source files
- Verify import/export statements

**Animations Not Working**
- Check browser support for IntersectionObserver
- Verify reduced motion preferences
- Check console for JavaScript errors

**Content Not Loading**
- Verify JSON syntax in content files
- Check network requests in browser dev tools
- Ensure proper CORS headers in development

### Debug Mode

Enable debug logging by setting:
```javascript
window.DEBUG = true;
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

Built with ❤️ using modern web technologies and best practices.