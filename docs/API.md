# API Documentation

This document provides detailed API documentation for the portfolio application components and modules.

## Table of Contents

1. [PortfolioApp](#portfolioapp)
2. [Components](#components)
3. [Modules](#modules)
4. [Utilities](#utilities)
5. [Configuration](#configuration)

## PortfolioApp

The main application class that orchestrates all components and modules.

### Constructor

```javascript
new PortfolioApp();
```

Creates a new portfolio application instance.

### Properties

- `components: Object<string, any>` - Registry of initialized components
- `animationManager: AnimationManager|null` - Animation manager instance
- `isInitialized: boolean` - Application initialization state

### Methods

#### init()

```javascript
async init(): Promise<void>
```

Initializes the complete application including core systems, components, content loading, and animations.

**Throws:** `Error` when initialization fails

**Example:**

```javascript
const app = new PortfolioApp();
await app.init();
```

#### handleInitializationError(error)

```javascript
handleInitializationError(error: Error): void
```

Handles initialization errors with graceful degradation.

**Parameters:**

- `error: Error` - The initialization error

---

## Components

### SkillsComponent

Interactive skills matrix with filtering and progressive arc animations.

#### Constructor

```javascript
new SkillsComponent();
```

#### Properties

- `container: HTMLElement|null` - Main skills container element
- `activeFilters: Set<string>` - Currently active skill filters
- `tooltip: HTMLElement|null` - Tooltip element for skill details

#### Methods

##### init()

```javascript
init(): void
```

Initializes the skills component and sets up DOM references.

**Throws:** `Error` when required DOM elements are missing

##### render(items)

```javascript
render(items: SkillItem[]): void
```

Renders skills data with validation and error handling.

**Parameters:**

- `items: SkillItem[]` - Array of skill objects

**SkillItem Interface:**

```typescript
interface SkillItem {
    name: string; // Required - skill name
    percent?: number; // Optional - proficiency (0-100)
    category?: string; // Optional - skill category
    level?: string; // Optional - skill level description
    xp?: string; // Optional - experience duration
}
```

**Example:**

```javascript
const skills = [
    { name: 'Python', percent: 92, category: 'ML/AI', level: 'Expert', xp: '6y' },
    { name: 'PyTorch', percent: 88, category: 'ML/AI', level: 'Advanced', xp: '4y' }
];

skillsComponent.render(skills);
```

##### setFilterChangeCallback(callback)

```javascript
setFilterChangeCallback(callback: (filters: string[]) => void): void
```

Sets callback function for filter change events.

**Parameters:**

- `callback: Function` - Function called when filters change

##### clearFilters()

```javascript
clearFilters(): void
```

Clears all active skill filters.

---

### ProjectsComponent

Project carousel with dynamic filtering and auto-scroll capabilities.

#### Constructor

```javascript
new ProjectsComponent();
```

#### Methods

##### render(items)

```javascript
render(items: ProjectItem[]): void
```

Renders project data with carousel functionality.

**Parameters:**

- `items: ProjectItem[]` - Array of project objects

**ProjectItem Interface:**

```typescript
interface ProjectItem {
    title: string; // Project title
    description: string; // Project description
    image?: string; // Project image URL
    tech: string[]; // Technology stack
    githubUrl?: string; // GitHub repository URL
    liveUrl?: string; // Live demo URL
}
```

##### filterBySkills(skillFilters)

```javascript
filterBySkills(skillFilters: string[]): number
```

Filters projects by skill tags.

**Parameters:**

- `skillFilters: string[]` - Array of skill names to filter by

**Returns:** `number` - Count of matching projects

---

### SummaryComponent

Professional summary section with dynamic content rendering.

#### Methods

##### render(items)

```javascript
render(items: SummaryItem[]): void
```

Renders summary cards with icons and descriptions.

**SummaryItem Interface:**

```typescript
interface SummaryItem {
    title: string; // Summary card title
    body: string; // Summary description
    metric?: string; // Optional metric/badge
}
```

---

### PublicationsComponent

Publications section with search, filtering, and hero layouts.

#### Methods

##### render(items)

```javascript
render(items: PublicationItem[]): void
```

Renders publications with search and filter controls.

**PublicationItem Interface:**

```typescript
interface PublicationItem {
    title: string; // Publication title
    description: string; // Publication description
    published: string; // Publication date
    link: string; // Publication URL
    image?: string; // Publication cover image
}
```

---

## Modules

### AnimationManager

Manages all animations and visual effects.

#### Constructor

```javascript
new AnimationManager();
```

#### Properties

- `prefersReducedMotion: boolean` - User's motion preference
- `activeAnimations: Map<string, Function>` - Active animations registry

#### Methods

##### init()

```javascript
init(): void
```

Initializes all animations including typing, starfield, and section animations.

**Throws:** `Error` when animation initialization fails

##### destroy()

```javascript
destroy(): void
```

Cleans up all active animations and event listeners.

---

### ThemeManager

Manages application theme and appearance settings.

#### Properties (Singleton)

- `currentTheme: string` - Current theme name
- `root: HTMLElement` - Document root element

#### Methods

##### applyTheme(theme)

```javascript
applyTheme(theme: 'light' | 'dark'): void
```

Applies the specified theme to the application.

##### toggleTheme()

```javascript
toggleTheme(): void
```

Toggles between light and dark themes.

---

### ContentManager

Handles content loading and caching.

#### Methods

##### loadContent()

```javascript
async loadContent(): Promise<ContentData>
```

Loads content data with fallback mechanisms.

**Returns:** `Promise<ContentData>` - Loaded content data

**ContentData Interface:**

```typescript
interface ContentData {
    summary: SummaryItem[];
    projects: ProjectItem[];
    skills: SkillItem[];
    publications: PublicationItem[];
}
```

---

## Utilities

### Error Handling

#### handleError(error, context, type)

```javascript
handleError(
    error: Error | string,
    context?: string,
    type?: ErrorType
): Error
```

Enhanced error handling with context and categorization.

**Parameters:**

- `error: Error | string` - Error instance or message
- `context?: string` - Additional context information
- `type?: ErrorType` - Error category

**Returns:** `Error` - Processed error object

#### validateParams(params, schema)

```javascript
validateParams(params: Object, schema: ValidationSchema): void
```

Validates function parameters with type checking.

**Throws:** `Error` when validation fails

**Example:**

```javascript
validateParams(
    { items },
    {
        items: {
            required: true,
            type: 'array',
            validate: (arr) => arr.length > 0
        }
    }
);
```

#### safeAsync(asyncFn, timeout, context)

```javascript
async safeAsync(
    asyncFn: Function,
    timeout?: number,
    context?: string
): Promise<any>
```

Safe async execution with timeout and error handling.

**Parameters:**

- `asyncFn: Function` - Async function to execute
- `timeout?: number` - Timeout in milliseconds (default: 5000)
- `context?: string` - Error context description

### DOM Utilities

#### createDOMElement(tag, options)

```javascript
createDOMElement(tag: string, options?: ElementOptions): HTMLElement
```

Creates DOM element with options.

**ElementOptions Interface:**

```typescript
interface ElementOptions {
    className?: string;
    attributes?: Record<string, string>;
    innerHTML?: string;
    textContent?: string;
}
```

#### waitForElement(selector, timeout)

```javascript
async waitForElement(
    selector: string,
    timeout?: number
): Promise<HTMLElement>
```

Waits for element to appear in DOM.

**Returns:** `Promise<HTMLElement>` - Found element

---

## Configuration

### APP_CONFIG

Main application configuration object.

```javascript
export const APP_CONFIG = {
    animation: {
        typing: {
            words: string[];        // Words for typing animation
            typeSpeed: number;      // Typing speed (ms)
            deleteSpeed: number;    // Delete speed (ms)
            delay: number;          // Delay between words (ms)
        },
        starfield: {
            starCount: number;      // Number of stars
            starSpeed: number;      // Star movement speed
            rotationSpeed: number;  // Rotation speed
            mouseInfluence: number; // Mouse interaction strength
        }
    },
    skills: {
        filterStorageKey: string;   // LocalStorage key for filters
    },
    timeouts: {
        initialization: number;     // App init timeout (ms)
        content: number;           // Content load timeout (ms)
    }
};
```

### PERFORMANCE_CONFIG

Performance-related configuration.

```javascript
export const PERFORMANCE_CONFIG = {
    prefersReducedMotion(): boolean;    // Checks user motion preference
    observers: {
        fadeIn: IntersectionObserverInit;    // Fade-in observer config
        sections: IntersectionObserverInit;  // Section observer config
    }
};
```

---

## Error Types

```javascript
export const ErrorTypes = {
    NETWORK: 'network',
    PARSING: 'parsing',
    INITIALIZATION: 'initialization',
    COMPONENT: 'component',
    ANIMATION: 'animation',
    CONTENT: 'content',
    TIMEOUT: 'timeout'
};
```

---

## Events

### Component Events

Components emit custom events for inter-component communication:

#### 'skillsFilterChanged'

Fired when skill filters change.

**Detail:**

```typescript
{
    filters: string[];      // Active filter names
    count: number;          // Number of active filters
}
```

#### 'projectsFiltered'

Fired when projects are filtered.

**Detail:**

```typescript
{
    matches: number; // Number of matching projects
    total: number; // Total number of projects
}
```

### Usage Example

```javascript
document.addEventListener('skillsFilterChanged', (event) => {
    console.log('Active filters:', event.detail.filters);
});
```

---

## HTTP Stats API (Visitors & Stars)

The site uses a small HTTP API to persist accurate counts for visitors and stars across devices. The frontend calls these endpoints via `src/modules/stats-service.js`.

Base URL: configured in `src/config/environment.js` as `apiBaseUrl`.

### Endpoints

- GET `${apiBaseUrl}/stats?cid={clientId}`
    - Returns the current totals and whether this client has starred.
    - Response: `{ visitors: number, stars: number, userHasStarred: boolean }`

- POST `${apiBaseUrl}/stats/visit`
    - Body: `{ clientId: string }`
    - Increments the visitors count at most once per 24 hours per `clientId`.
    - Response: `{ visitors: number, stars: number, userHasStarred: boolean }`

- POST `${apiBaseUrl}/stats/star`
    - Body: `{ clientId: string, desired: boolean }`
    - Toggles a star for this client; increments or decrements the total accordingly.
    - Response: `{ visitors: number, stars: number, userHasStarred: boolean }`

### Deployment

- Recommended: deploy on a serverless platform (e.g., Vercel, Netlify, Cloudflare Workers).
- In this repo, a Vercel-style scaffold is provided under `api/`:
    - `api/stats.js` (GET)
    - `api/stats/visit.js` (POST)
    - `api/stats/star.js` (POST)
    - Shared helpers in `api/_lib/` for storage and HTTP.

### Storage

- Optional Redis (Upstash) support via environment variables:
    - `UPSTASH_REDIS_REST_URL`
    - `UPSTASH_REDIS_REST_TOKEN`
- If not set, an in-memory fallback is used (suitable for local dev only).

### Rate limiting & bot filtering

- Visits: limited to once per 24 hours per `clientId`.
- You can extend `api/_lib/storage.js` to add IP/user-agent based throttling, Captcha challenges, or bot detection.
- Add a CDN rule (e.g., Vercel Edge / Cloudflare) for additional abuse protection if needed.

### CORS & caching

- All endpoints return `Access-Control-Allow-Origin: *` and `Cache-Control: no-store` by default.
- Adjust CORS origin to your site domain(s) before production.

### Notes

- GitHub Pages cannot host server code. Deploy these endpoints elsewhere and update `apiBaseUrl` to point to that host.
