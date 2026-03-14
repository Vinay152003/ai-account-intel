# AI Account Intelligence & Enrichment System

> **Fello AI Builder Hackathon 2026** — Built with Claude AI (Anthropic API)

An AI-powered B2B account intelligence platform that enriches company data and analyzes website visitor behavior using Claude AI. Transform minimal company names into comprehensive business intelligence with AI-generated insights, intent scoring, and actionable sales recommendations.

---

## Features

### Company Intelligence
- **AI-Powered Enrichment**: Enter a company name and get full business intelligence — industry, tech stack, leadership, funding, revenue range, and more
- **Batch Processing**: Enrich multiple companies simultaneously with parallel AI processing
- **Intent Scoring**: AI-calculated intent scores (0-100) with buyer journey stage classification
- **Sales Action Plans**: Auto-generated recommended next steps for sales teams
- **Business Signals**: AI-detected signals like hiring trends, expansion plans, funding rounds

### Visitor Analytics
- **Behavioral Analysis**: Analyze visitor browsing patterns to determine buyer persona and intent
- **Persona Detection**: AI classifies visitors into personas (Technical Evaluator, Decision Maker, Researcher, etc.)
- **Intent Classification**: Automatic buyer journey stage detection (Awareness, Consideration, Decision, Purchase)
- **Company Identification**: Link anonymous visitors to companies via IP-based identification

### Dashboard
- **Real-time Stats**: Total companies, enrichment rates, visitor counts, average intent scores
- **Industry Distribution**: Visual breakdown of tracked companies by industry
- **Intent Distribution**: Funnel visualization of buyer journey stages
- **Recent Activity Feed**: Latest enrichment actions and results

### Authentication
- **Email/Password**: Secure credential-based authentication with bcrypt hashing
- **GitHub OAuth**: One-click sign-in with GitHub
- **Session Management**: JWT-based sessions with NextAuth.js

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Frontend** | React 19, Tailwind CSS 4 |
| **AI Engine** | Anthropic Claude 3.5 Sonnet API |
| **Database** | Supabase PostgreSQL |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (JWT Strategy) |
| **Language** | TypeScript |
| **Deployment** | Vercel |

---

## Architecture

```
User --> Next.js Frontend (React 19 + Tailwind CSS 4)
           |
        API Routes (Next.js App Router)
           |
        Authentication Layer (NextAuth.js + JWT)
           |
    +----------------+------------------+
    |                |                  |
 Prisma ORM    Claude AI API    Hunter.io API
    |                |              (optional)
 Supabase DB    AI Enrichment
                & Analysis
```

### Key Modules

- **src/lib/enrichment.ts** — Core AI logic: company enrichment, visitor analysis, IP identification
- **src/lib/auth.ts** — NextAuth configuration with Prisma adapter, GitHub + Credentials providers
- **src/lib/prisma.ts** — Prisma client singleton
- **src/lib/getOrCreateUser.ts** — Auto-provisioning user helper with upsert pattern

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/companies | GET | List all companies (paginated) |
| /api/companies | POST | Add a new company |
| /api/companies/[id] | GET | Get company details with visitors |
| /api/companies/[id] | DELETE | Delete a company |
| /api/companies/[id]/enrich | POST | AI-enrich a single company |
| /api/enrich/batch | POST | Batch enrich multiple companies |
| /api/visitors | GET | List all visitors (paginated) |
| /api/visitors | POST | Track a new visitor |
| /api/visitors/[id]/analyze | POST | AI-analyze visitor behavior |
| /api/dashboard/stats | GET | Dashboard statistics |
| /api/auth/[...nextauth] | * | Authentication endpoints |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for PostgreSQL database)
- Anthropic API key (for Claude AI)
- GitHub OAuth app (optional, for GitHub sign-in)

### 1. Clone the Repository

```bash
git clone https://github.com/Vinay152003/ai-account-intel.git
cd ai-account-intel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Supabase)
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Anthropic AI
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Hunter.io (optional)
HUNTER_API_KEY="your-hunter-api-key"
```

### 4. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

### Models

- **User** — Authentication and ownership
- **Account** — OAuth provider accounts (GitHub)
- **Session** — User sessions
- **Company** — Business entities with enrichment data, AI analysis, intent scoring
- **Visitor** — Website visitors with behavioral data, persona classification

### Company Fields (Post-Enrichment)

| Field | Description |
|-------|-------------|
| industry | Business sector classification |
| size | Employee count range |
| headquarters | Company location |
| techStack | Technologies used (JSON array) |
| leadership | Key executives (JSON array) |
| businessSignals | Detected business signals (JSON array) |
| fundingInfo | Funding details |
| revenueRange | Estimated revenue bracket |
| intentScore | AI-calculated intent (0-100) |
| intentStage | Buyer journey stage |
| aiSummary | AI-generated business summary |
| salesAction | Recommended sales actions |

---

## How It Works

### Company Enrichment Flow

1. User enters a company name (e.g., "Tesla")
2. System sends the name to Claude AI with a structured prompt
3. Claude researches and returns comprehensive business intelligence as JSON
4. Data is parsed, validated, and stored in Supabase PostgreSQL
5. Dashboard updates with enriched company data, intent scores, and recommendations

### Visitor Analysis Flow

1. Visitor data is tracked (pages visited, time on site, device, referrer)
2. User clicks "Analyze" on a visitor record
3. Claude AI analyzes the browsing behavior pattern
4. AI returns: persona type, confidence score, intent score, intent stage, behavior summary
5. If IP is available, AI attempts company identification

### AI Prompt Engineering

The system uses carefully crafted prompts that instruct Claude to:
- Return structured JSON responses
- Provide confidence scores for all classifications
- Generate actionable sales recommendations
- Classify intent into standard B2B buyer journey stages
- Identify technology stack and business signals from company research

---

## Hackathon Checklist

- [x] Full-stack application with frontend and backend
- [x] Claude AI API integration (Anthropic SDK)
- [x] Database with Prisma ORM (Supabase PostgreSQL)
- [x] Authentication system (NextAuth.js with JWT)
- [x] Multiple API endpoints with CRUD operations
- [x] AI-powered company enrichment with structured output
- [x] AI-powered visitor behavior analysis
- [x] Batch processing capability
- [x] Dashboard with real-time statistics
- [x] Intent scoring and buyer journey classification
- [x] Responsive UI with Tailwind CSS
- [x] Error handling and loading states
- [x] TypeScript throughout
- [x] Production-ready code structure

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set all `.env` variables in your Vercel project settings. Update `NEXTAUTH_URL` to your production domain.

---

## License

MIT License

---

## Author

**Vinay Hipparge**
Built for the Fello AI Builder Hackathon 2026

---

## Acknowledgments

- [Anthropic](https://anthropic.com) — Claude AI API
- [Supabase](https://supabase.com) — PostgreSQL Database
- [Vercel](https://vercel.com) — Deployment Platform
- [Next.js](https://nextjs.org) — React Framework
- [Prisma](https://prisma.io) — Database ORM
