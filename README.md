# Tastes Like Home

A modern marketplace platform connecting families with authentic home chefs who specialize in traditional home-cooked meals. Built with Next.js 15, Supabase, and TypeScript.

## Overview

Tastes Like Home is a marketplace platform that helps families discover and book talented home chefs for authentic, home-cooked meals. The platform features chef profiles with photos and videos, a review system, and an admin dashboard for managing chef applications and profiles.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Email**: Resend
- **Deployment**: Vercel
- **Version Control**: GitHub

## Features

### For Customers
- Browse chef profiles with photos and intro videos
- View chef specialties, cuisines, and pricing
- Read verified customer reviews
- Submit reviews for chefs (with email verification)
- Contact chefs directly

### For Chefs
- Apply to join the platform
- Professional profile pages with photo galleries
- Video introductions (up to 30 seconds)
- Display specialties, cuisines, and service areas
- Receive customer reviews and ratings

### Admin Dashboard
- Review and approve/reject chef applications
- Manage chef profiles (edit details, photos, cuisines)
- Moderate customer reviews (approve/reject)
- Upload chef photos and videos
- Update chef verification status

## Project Structure

```
tastes-like-home/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard
│   │   ├── applications/    # Chef application review
│   │   ├── chefs/          # Chef profile management
│   │   ├── login/          # Admin authentication
│   │   └── actions.ts      # Server actions for admin operations
│   ├── apply/              # Chef application form
│   ├── chef/[id]/          # Individual chef profile pages
│   ├── reviews/            # Review submission and verification
│   ├── onboarding/         # Chef onboarding guide
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── admin/             # Admin-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── supabase-*.ts     # Supabase client configurations
│   ├── email.ts          # Email sending functions
│   └── storage.ts        # File upload utilities
├── public/               # Static assets
│   ├── chefs/           # Chef profile photos
│   └── food/            # Food dish photos
├── scripts/             # Database migration scripts
└── supabase/            # Supabase configuration and migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account and project
- A Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tastes-like-home.git
   cd tastes-like-home
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Admin Configuration
   ADMIN_EMAIL=your_admin_email@example.com
   
   # Optional: Test Mode (bypasses email sending)
   REVIEW_TEST_MODE=true
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `RESEND_API_KEY` | Resend API key for email sending | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site's base URL | Yes |
| `ADMIN_EMAIL` | Email address for admin notifications | Yes |
| `REVIEW_TEST_MODE` | Set to `true` to bypass email sending in development | No |

## Database Setup

The project uses Supabase PostgreSQL with the following main tables:

- `chefs` - Chef profiles and details
- `chef_applications` - Chef application submissions
- `chef_cuisines` - Chef cuisine specialties (many-to-many)
- `chef_food_photos` - Food photo gallery
- `chef_videos` - Chef introduction videos
- `reviews` - Customer reviews (with verification)

Database migrations and scripts are located in:
- `/supabase/migrations/` - Supabase migration files
- `/scripts/` - Ad-hoc SQL scripts and Node.js utilities

## Deployment

### Vercel Deployment

This project is optimized for deployment on Vercel:

1. **Connect your GitHub repository to Vercel**

2. **Configure environment variables** in Vercel project settings (same as `.env.local`)

3. **Deploy**
   ```bash
   git push origin main
   ```
   Vercel will automatically build and deploy your changes.

### Production Checklist

- [ ] Set all environment variables in Vercel
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Configure Supabase RLS (Row Level Security) policies
- [ ] Set up custom domain in Vercel
- [ ] Verify email sending works (disable `REVIEW_TEST_MODE`)
- [ ] Test admin authentication
- [ ] Review Supabase database backups

## Development Workflow

This project follows specific development practices documented in `DEVELOPMENT-WORKFLOW.md`:

- **Keep it simple** - Prioritize minimal viable implementations
- **Step-by-step execution** - One feature at a time with confirmation
- **Professional git practices** - Feature branches, descriptive commits, proper cleanup
- **Phase-by-phase development** - Database → Backend → Frontend → Admin

See [DEVELOPMENT-WORKFLOW.md](./DEVELOPMENT-WORKFLOW.md) for complete guidelines.

## Additional Documentation

- [BACKEND-MIGRATION.md](./BACKEND-MIGRATION.md) - Details on the Supabase migration and data model
- [VIDEO-UPLOAD-FEATURE.md](./VIDEO-UPLOAD-FEATURE.md) - Chef video upload implementation
- [PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md) - Production deployment guide
- [TURNSTILE-SETUP.md](./TURNSTILE-SETUP.md) - Cloudflare Turnstile configuration (currently disabled)

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Make your changes
3. Commit with descriptive messages (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private project - All rights reserved.

## Contact

For questions or support, contact: [your-email@example.com]

---


