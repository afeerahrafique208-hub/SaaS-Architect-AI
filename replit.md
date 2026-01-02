# RankAI - SEO Audit Platform

## Overview

RankAI is an AI-powered audit platform designed for agencies, SaaS founders, and local businesses. It performs comprehensive SEO, AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), and Google Business Profile audits. The platform analyzes websites and provides actionable insights explaining why a website or business isn't ranking in search, map pack, or AI answers—and exactly how to fix it.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with custom configuration
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for score visualizations and data display

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth (OpenID Connect with Passport.js)
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **AI Integration**: OpenAI API (via Replit AI integrations) for analyzing website content

### Data Storage
- **Database**: PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Key Tables**:
  - `users` - User accounts (Replit Auth)
  - `sessions` - Session storage
  - `audits` - Audit records with URL, business info, and status
  - `auditResults` - Module-specific results (SEO, AEO, GEO, GMB, Local)
  - `conversations` / `messages` - Chat functionality

### Authentication Flow
- Replit Auth via OpenID Connect
- Session-based authentication stored in PostgreSQL
- Protected routes use `isAuthenticated` middleware
- User data synced via upsert on login

### Build Process
- Development: Vite dev server with HMR
- Production: Custom build script (`script/build.ts`) using esbuild for server, Vite for client
- Output: `dist/` directory with bundled server and static client files

## External Dependencies

### AI Services
- **OpenAI API**: Used for content analysis (SEO, AEO, GEO, GMB audits)
- Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables

### Database
- **PostgreSQL**: Primary data store
- Connection via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations (`db:push` command)

### Authentication
- **Replit Auth**: OpenID Connect provider
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### Web Scraping
- **Cheerio**: HTML parsing for website content extraction during audits

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and validation
- `@tanstack/react-query`: Data fetching and caching
- `wouter`: Client-side routing
- `zod`: Schema validation
- `express-session` / `connect-pg-simple`: Session management
- `passport` / `openid-client`: Authentication