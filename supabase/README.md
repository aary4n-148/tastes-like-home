# Database Management

This directory contains all database-related files for the Tastes Like Home project.

## Directory Structure

### `/migrations/`
- **Purpose**: The ONLY place that defines database schema
- **Usage**: Applied in order to production database
- **Naming**: Use format `YYYYMMDD_HHMM_description.sql`
- **Rule**: Every structural change = one migration file + code PR

### `/sql-ad-hoc/`
- **Purpose**: Historical SQL files for reference only
- **Usage**: Never auto-run, kept for documentation
- **Contents**: Old migration scripts that were run manually in Supabase Studio

## Workflow

1. **Schema Changes**: Create new migration in `/migrations/`
2. **Testing**: Test on staging environment first
3. **Review**: Submit PR with both code and migration
4. **Deploy**: Apply to production manually after merge

## Commands

```bash
# Link to project (one-time setup)
supabase link --project-ref pcyjfhfjsyljbsqfavrj

# Apply migrations to staging
supabase link --project-ref <STAGING_REF>
supabase db push

# Apply migrations to production
supabase link --project-ref pcyjfhfjsyljbsqfavrj
supabase db push
```

## Rules

- ✅ GitHub is the single source of truth for schema
- ✅ All schema changes live as SQL migrations
- ✅ Supabase Studio is for browsing/debugging only
- ❌ Never make structural changes directly in Studio
- ❌ Never use `IF NOT EXISTS` in migrations (want failures if out of sync)
