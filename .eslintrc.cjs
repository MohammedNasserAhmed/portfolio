module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: false },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended'
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['import'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
    'import/order': ['warn', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], 'newlines-between': 'always' }]
  },
  overrides: [
    {
      files: ['**/*.cjs'],
      env: { node: true }
    }
  ]
};