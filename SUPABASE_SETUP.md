# Supabase Integration Guide

This portfolio site supports fetching project data from Supabase as an alternative to the local JSON data source.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Create a new project or use an existing one
3. Wait for the project to finish setting up

### 2. Create the Projects Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql` file from this repository
3. Paste it into the SQL Editor and run it
4. This will:
    - Create the `projects` table with the required schema
    - Insert 5 real sample projects from the portfolio
    - Set up Row Level Security (RLS) for public read access
    - Create indexes for better performance
    - Add triggers for automatic timestamp updates

### 3. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the **Project URL** and **anon/public key**
3. Create `.env` and `.env.local` files in the project root (you can copy from `.env.example`)
4. Update the following values:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DATA_SOURCE=supabase  # Change to 'supabase' to enable Supabase data fetching
```

### 4. Environment Variable Configuration

The site loads the Supabase client from CDN (already included in `index.html` and `ar/index.html`) and uses `window.__ENV__` for configuration.

**Option 1: Direct HTML Configuration (Development/Quick Testing)**

The configuration is already in the HTML files. Edit the `window.__ENV__` object in `index.html` and `ar/index.html`:

```html
<script>
    window.__ENV__ = {
        VITE_SUPABASE_URL: 'https://your-project.supabase.co', // Replace with your URL
        VITE_SUPABASE_ANON_KEY: 'your-anon-key-here', // Replace with your key
        VITE_DATA_SOURCE: 'supabase' // Change from 'local' to 'supabase' to enable
    };
</script>
```

**Option 2: Separate Config File (Recommended for Production)**

Create a `config.js` file that sets `window.__ENV__` and load it before the main script in your HTML:

```javascript
// config.js
window.__ENV__ = {
    VITE_SUPABASE_URL: 'https://your-project.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'your-anon-key-here',
    VITE_DATA_SOURCE: 'supabase'
};
```

Then in your HTML:

```html
<script src="config.js"></script>
```

**Option 3: Environment Variable Injection (CI/CD)**

During deployment, use your CI/CD pipeline to replace the placeholder values with actual credentials from secure environment variables.

### 5. Test the Integration

1. Run the development server: `npm run dev`
2. Open your browser's console
3. Look for log messages indicating whether projects are being loaded from Supabase or local data
4. Check the Network tab to see if requests are being made to Supabase

## Data Source Switching

You can switch between Supabase and local JSON data by changing the `VITE_DATA_SOURCE` environment variable:

- `local` - Uses the local `data/content.json` file (default)
- `supabase` - Fetches projects from Supabase database

## Database Schema

The projects table has the following structure:

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    tech TEXT[] NOT NULL,
    github_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    display_order INTEGER,
    is_active BOOLEAN
);
```

### Fields Mapping

- `title` - Project title
- `description` - Detailed project description
- `image` - URL to project image/thumbnail
- `tech` - Array of technology tags (e.g., ['Python', 'React', 'Docker'])
- `github_url` - Link to GitHub repository
- `display_order` - Order in which projects appear (lower numbers first)
- `is_active` - Whether the project should be displayed (only `true` projects are fetched)

## Adding New Projects

To add new projects to your Supabase database:

1. Go to **Table Editor** in Supabase dashboard
2. Select the `projects` table
3. Click **Insert row**
4. Fill in the required fields
5. Make sure `is_active` is set to `true`
6. Set `display_order` to control where it appears in the list

Or use SQL:

```sql
INSERT INTO projects (title, description, image, tech, github_url, display_order)
VALUES (
    'Your Project Title',
    'Your project description here',
    'https://example.com/image.jpg',
    ARRAY['Tech1', 'Tech2', 'Tech3'],
    'https://github.com/yourusername/your-repo',
    10
);
```

## Security

- The Supabase **anon/public key** is safe to use in client-side code
- Row Level Security (RLS) is enabled to ensure only active projects are publicly accessible
- Never commit your `.env` files to version control (they're already in `.gitignore`)
- Use the `.env.example` file as a template for other developers
- The Supabase client is loaded from **CDN with a pinned version** (2.39.3) to prevent automatic updates to potentially compromised versions

## Troubleshooting

**Projects not loading from Supabase:**

1. Check browser console for error messages
2. Verify your Supabase URL and key are correct
3. Ensure `VITE_DATA_SOURCE` is set to `supabase`
4. Check that the `projects` table exists and has data
5. Verify RLS policies allow public read access

**Build errors:**

1. Make sure `@supabase/supabase-js` is installed: `npm install`
2. Check that all import paths are correct
3. Run `npm run build` to test the build process

## Files Modified/Created

### Core Integration Files

- `src/utils/supabase-client.js` - Supabase client initialization and API calls (uses CDN version)
- `src/config/env-config.js` - Environment variable loader
- `src/modules/content-manager.js` - Modified to support Supabase data fetching

### Database and Configuration

- `supabase-setup.sql` - Complete database schema with 6 sample projects
- `.env.example`, `.env`, `.env.local` - Environment configuration templates

### HTML Files

- `index.html` - Added Supabase CDN script and environment configuration
- `ar/index.html` - Added Supabase CDN script and environment configuration

### Documentation

- `SUPABASE_SETUP.md` - This comprehensive setup guide

### Dependencies

- `package.json` - Added `@supabase/supabase-js` (optional, CDN version is used in production)

## Implementation Notes

This integration uses the **Supabase JavaScript client from CDN** for maximum compatibility with the vanilla JavaScript build system. The client is loaded from `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3` (pinned version for security). The `@supabase/supabase-js` npm package is installed for development purposes, but the CDN version is used in production.

The integration is **fully backward compatible** - if Supabase is not configured, the site falls back to loading projects from the local `data/content.json` file.
