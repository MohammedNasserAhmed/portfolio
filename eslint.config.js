import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';

// Flat config with per-environment globals so "no-undef" stops flagging browser / SW / Node built-ins.
export default [
    // Global ignores (build artifacts etc.)
    { ignores: ['dist/**', 'public/**'] },
    js.configs.recommended,
    // Generic JS / MJS (browser – site scripts)
    {
        files: ['js/**/*.js', 'ar/**/*.js', 'index.js', 'sw-register.js', 'sw.js', 'src/**/*.js'],
        ignores: ['js/vendor/**'],
        plugins: { import: pluginImport },
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                IntersectionObserver: 'readonly',
                MutationObserver: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                requestIdleCallback: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                navigator: 'readonly',
                THREE: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                Buffer: 'readonly',
                HTMLScriptElement: 'readonly',
                performance: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_{1,2}', varsIgnorePattern: '^_{1,2}', caughtErrors: 'none' }
            ],
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always'
                }
            ]
        }
    },
    // Serverless API endpoints (Node runtime)
    {
        files: ['api/**/*.js'],
        languageOptions: {
            globals: {
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                URL: 'readonly',
                fetch: 'readonly',
                Response: 'readonly',
                Headers: 'readonly',
                Request: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }
            ],
            'no-console': 'off'
        }
    },
    // Service worker (dedicated worker context)
    {
        files: ['sw.js'],
        languageOptions: {
            globals: {
                self: 'readonly',
                caches: 'readonly',
                fetch: 'readonly'
            }
        }
    },
    // Node-based build & utility scripts
    {
        files: ['*.config.js', 'tailwind.config.js', 'scripts/**/*.{js,mjs}', 'eslint.config.js'],
        languageOptions: {
            globals: {
                // Minimal Node globals we rely on
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                console: 'readonly',
                URL: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_{1,2}', varsIgnorePattern: '^_{1,2}', caughtErrors: 'none' }
            ],
            'no-console': 'off'
        }
    }
];
