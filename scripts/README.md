# Scripts

This directory contains utility scripts for the Tastes Like Home project.

## Directory Structure

### `/node/`
- **Purpose**: JavaScript/Node.js utility scripts
- **Usage**: One-time data migrations and maintenance scripts
- **Note**: These are NOT schema migrations - they're data processing utilities

## Scripts

- `migrate-data.js` - Initial chef data migration script
- `cleanup-database.js` - Database cleanup utilities

## Usage

```bash
# Run from project root
cd /path/to/tastes-like-home
node scripts/node/script-name.js
```

## Environment

Make sure you have the required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
