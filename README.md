# Job Tracker CRM — Career Operating System for Indian Job Seekers

> Replace Excel sheets. Track every application, referral, outreach, follow-up, and interview from one place — built specifically for the referral-first Indian hiring market.

---

## The Problem

Most candidates manage 100+ job applications across Excel sheets, Notion pages, and browser bookmarks. The result:

- Forget which companies they contacted
- Miss follow-up windows (no one responds to a cold DM after 10 days of silence)
- Don't know which resume version generated interviews
- Have no visibility into what's actually working

Job Tracker CRM turns job searching from a reactive, manual process into a **measurable, trackable system**.

---

## Demo

> 🔗 **[Live Demo](#)** · 📹 **[Watch Demo (Loom)](#)** · 🧩 **[Install Chrome Extension](#)**

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌─────────────────────┐      ┌──────────────────────────┐    │
│   │   React Dashboard   │      │    Chrome Extension      │    │
│   │   (Vite + React 19) │      │    (Manifest V3)         │    │
│   │   TanStack Query    │      │    Content Script        │    │
│   │   Zustand + Zod     │      │    Token Sync            │    │
│   └──────────┬──────────┘      └────────────┬─────────────┘    │
└──────────────┼──────────────────────────────┼──────────────────┘
               │ REST API (JWT)               │ REST API (JWT)
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                                                                 │
│   Express 5 + TypeScript                                        │
│   ┌─────────┐  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │
│   │  Routes │→ │Controllers │→ │ Services │→ │   Models    │  │
│   └─────────┘  └────────────┘  └──────────┘  └─────────────┘  │
│                                                                 │
│   Middleware Stack:                                             │
│   Helmet → CORS → Morgan → Auth → Zod Validation → ErrorHandler│
└──────────┬──────────────────────┬────────────────┬─────────────┘
           │                      │                │
           ▼                      ▼                ▼
┌──────────────────┐  ┌────────────────────┐  ┌────────────────┐
│     MongoDB      │  │   Redis (BullMQ)   │  │   S3 Storage   │
│                  │  │                    │  │  (Floci/Local) │
│  - Opportunities │  │  Notification Queue│  │                │
│  - Companies     │  │  Hourly Cron Job   │  │  Resume Files  │
│  - Outreaches    │  │  Worker Process    │  │  (versioned)   │
│  - Interviews    │  │  3-day / 7-day     │  │                │
│  - Resumes       │  │  Follow-up Alerts  │  │                │
│  - Templates     │  │                    │  │                │
│  - Followups     │  └────────────────────┘  └────────────────┘
└──────────────────┘            │
                                ▼
                    ┌────────────────────┐
                    │   Vertex AI        │
                    │  (Gemini 2.5 Flash)│
                    │                    │
                    │  - ATS Scoring     │
                    │  - Resume Parsing  │
                    │  - Outreach Gen    │
                    │  - Text Improve    │
                    └────────────────────┘
```

---

## Data Model

```
User
 └── Company (many)
      └── Opportunity (many)
           ├── resumeId → Resume
           ├── Outreach (many)
           │    └── Followup (many)
           └── Interview (many)

Resume
 ├── type: UPLOADED | BUILT
 ├── version: 1, 2, 3 ...
 ├── isLatest: boolean
 └── structuredData: { summary, experience, projects, skills, education }

Template
 └── type: REFERRAL | COLD_EMAIL | FOLLOWUP | LINKEDIN_DM
```

**Why this model matters:** Opportunities are scoped under Companies — because Indian job seekers often apply to multiple roles at the same company (Razorpay SDE-1, Razorpay SDE-2, Razorpay Platform). The Outreach model tracks every person contacted per opportunity — HR, recruiter, employee, EM — each with their own status and follow-up timeline.

---

## Features

### Opportunity Tracking

Track every job opportunity through a full lifecycle:

| Status | Meaning |
|--------|---------|
| `SAVED` | Bookmarked, not yet actioned |
| `CONTACTING` | Reaching out for referral |
| `APPLIED` | Application submitted |
| `INTERVIEW` | Active interview process |
| `OFFER` | Offer received |
| `REJECTED` | Application rejected |
| `GHOSTED` | No response after follow-ups |

Opportunities support filtering by status, company, job level, source, date range, and keyword search — with pagination and sorting.

Sources tracked: LinkedIn Job, LinkedIn Post, Naukri, Wellfound, Instahyre, Greenhouse, Lever, Workday, Manual.

---

### Outreach & Referral Management

The core differentiator. For each opportunity, track every person you contacted:

- **Contact types:** HR, Recruiter, Employee, Engineering Manager, CTO, Founder
- **Outreach types:** Referral Request, LinkedIn DM, Email, WhatsApp, Direct Apply
- **Status lifecycle:** Draft → Sent → Follow-up → Responded → Referral Given → Interview Scheduled

The system tracks `sentAt`, `respondedAt`, `lastInteractionAt`, and `followupCount` per outreach — giving you a complete contact history per opportunity.

---

### Automated Follow-up Reminders (BullMQ + Redis)

Background job queue that runs every hour and checks all active outreaches:

```
Outreach marked SENT or FOLLOWUP
        ↓
BullMQ Worker checks hourly (cron)
        ↓
3 days since last contact → send 3-day reminder email
7 days since last contact → send 7-day reminder email
        ↓
notified3Day / notified7Day flags prevent duplicate sends
```

Built with BullMQ + ioredis. Worker handles `completed` and `failed` events. Idempotency flags on the Outreach model ensure emails are never sent twice even if the worker retries.

---

### Resume Management

Two modes:

**Upload mode** — Upload an existing PDF resume. Gemini 2.5 Flash parses it into structured JSON (text extraction first via `pdf-parse`, multimodal fallback for scanned PDFs).

**Builder mode** — Build a resume directly in the app using a structured editor (summary, experience, projects, skills, education, certifications). AI can improve individual bullet points inline.

**Versioning:** Every time you upload a new version of the same resume name, the previous version is preserved with `isLatest: false`. Full version history is queryable.

**Resume-to-Opportunity linking:** When saving an opportunity, tag which resume variant you used. This enables future analytics on which resume version generates the most interviews.

Resume files are stored in S3-compatible object storage (Floci for local dev, AWS S3 for production).

---

### AI Features (Vertex AI / Gemini 2.5 Flash)

Three AI capabilities, all with mock fallbacks when no GCP project is configured:

**ATS Resume Analysis** — Input a built resume + job description → get a match score (0–100), list of missing skills, and improvement suggestions tailored to the JD.

**Outreach Message Tailoring** — Input a message template + job description + resume skills → get a tailored referral request or cold DM personalized to the specific role and company.

**Resume Text Improvement** — Select any bullet point in the resume builder → AI rewrites it to be more action-oriented and metrics-driven while preserving original facts.

---

### Interview Pipeline

Track every round of every interview per opportunity:

| Type | Status |
|------|--------|
| Technical Screening | Scheduled |
| System Design | Completed |
| HR Round | Passed |
| Manager Round | Failed |
| Bar Raiser | Cancelled |
| Final Round | Rescheduled |

Each round stores interviewer details, scheduled time, duration, notes, and feedback. Indexed on `userId + scheduledAt` for efficient calendar-style queries.

---

### Message Templates

Save reusable message templates for:
- Referral requests
- Cold emails
- LinkedIn DMs
- Follow-up messages

Templates support variable substitution (`{{company}}`, `{{role}}`, `{{name}}`) and can be combined with the AI tailoring feature to generate personalized messages per opportunity.

---

### Chrome Extension (Manifest V3)

Capture opportunities directly from job sites without leaving the page:

**Token sync** — Logs in once via the web dashboard. Content script detects the dashboard origin and syncs the JWT from `localStorage` to `chrome.storage.local` automatically. Throttled to sync at most once every 5 seconds.

**Field capture** — User clicks "Select" next to any field in the extension popup, selects text on the page, and the value is captured via `mouseup` event on the content script. No DOM scraping — works on every job site including LinkedIn.

**Supported sources:** LinkedIn, Naukri, Wellfound, Instahyre, Greenhouse, Lever, Internshala.

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 5 | API server |
| TypeScript | Type safety across all layers |
| MongoDB + Mongoose | Primary database |
| BullMQ + ioredis | Background job queue (follow-up reminders) |
| Zod | Runtime schema validation |
| Helmet | Security headers |
| Morgan | HTTP request logging |
| Nodemailer | Transactional email (follow-up reminders) |
| Multer | File upload handling |
| AWS SDK v3 | S3-compatible object storage |
| Passport + Google OAuth2 | Authentication |
| JWT | Session tokens |
| Vertex AI (Gemini 2.5 Flash) | ATS analysis, resume parsing, outreach generation |
| pdf-parse | PDF text extraction |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| TanStack Query v5 | Server state management + caching |
| Zustand | Client state (auth, sidebar, theme) |
| React Hook Form + Zod | Form handling + validation |
| Tailwind CSS v4 | Styling |
| Axios | HTTP client |
| Lucide React | Icons |

### Extension
| Technology | Purpose |
|-----------|---------|
| Manifest V3 | Chrome Extension platform |
| Content Script | Token sync + text selection capture |
| chrome.storage.local | Persisted auth token |
| Vanilla JS | No framework dependency |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker Compose | Local dev (Redis + S3) |
| Floci | S3-compatible local object storage |
| Redis 7 Alpine | BullMQ job queue backing store |

---

## API Routes

```
POST   /api/auth/google          Google OAuth login
GET    /api/auth/me              Current user

GET    /api/companies            List companies
POST   /api/companies            Create company
GET    /api/companies/:id        Company detail

GET    /api/opportunities        List opportunities (filter, sort, paginate)
POST   /api/opportunities        Create opportunity
GET    /api/opportunities/:id    Opportunity detail
PATCH  /api/opportunities/:id    Update opportunity / status
DELETE /api/opportunities/:id    Delete opportunity

GET    /api/outreaches           List outreaches
POST   /api/outreaches           Create outreach
PATCH  /api/outreaches/:id       Update outreach status
DELETE /api/outreaches/:id       Delete outreach

GET    /api/followups            List followups
POST   /api/followups            Create followup
DELETE /api/followups/:id        Delete followup

GET    /api/interviews           List interviews
POST   /api/interviews           Create interview
PATCH  /api/interviews/:id       Update interview
DELETE /api/interviews/:id       Delete interview

GET    /api/resumes              List resumes (versioned)
POST   /api/resumes/upload       Upload PDF resume (AI parsed)
POST   /api/resumes/build        Create built resume
GET    /api/resumes/:id          Resume detail
DELETE /api/resumes/:id          Delete resume

GET    /api/templates            List templates
POST   /api/templates            Create template
PATCH  /api/templates/:id        Update template
DELETE /api/templates/:id        Delete template

POST   /api/ai/analyze           ATS resume analysis
POST   /api/ai/tailor            Tailor outreach message
POST   /api/ai/improve           Improve resume text

POST   /api/capture              Capture job from extension
GET    /api/metadata             Enums (roles, levels, sources, skills)
```

---

## Backend Architecture — Key Patterns

**Layered architecture** — Every domain follows: `route → controller → service → model`. Controllers handle HTTP concerns only. Services contain all business logic. Models define schemas with compound indexes.

**DTO pattern** — Separate DTO interfaces for create/update/query operations on every entity. Zod schemas validate incoming requests before they reach controllers.

**Centralized error handling** — Custom `ApiError` class with HTTP status codes. Single `errorMiddleware` at the bottom of the Express chain. No scattered `try/catch` with `res.status(500)` in controllers.

**Standardized responses** — `APIResponse` utility wraps all success responses in a consistent `{ message, data }` shape.

**Compound MongoDB indexes** — Opportunities indexed on `(userId, status)` and `(userId, companyId)`. Outreaches indexed on `opportunityId` and `status`. Resumes indexed on `(userId, name, version)` descending for efficient version queries.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- MongoDB (Atlas free tier or local)

### 1. Clone and install

```bash
git clone https://github.com/17prateek12/jobtracker.git
cd jobtracker
```

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Start infrastructure

```bash
cd backend
docker-compose up -d   # starts Redis + Floci (S3)
```

### 3. Environment variables

```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
S3_ENDPOINT=http://localhost:4566
S3_BUCKET_NAME=jobtracker-resumes
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MAIL_USER=...
MAIL_PASS=...

# Optional — AI features require GCP project
GCP_PROJECT_ID=your-gcp-project
GCP_MODEL=gemini-2.5-flash
```

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=...
```

### 4. Run

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

### 5. Load Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `/extension` folder

---

## Project Structure

```
jobtracker/
├── backend/
│   ├── index.ts                    # App entry, middleware, queue init
│   ├── docker-compose.yml          # Redis + Floci
│   └── src/
│       ├── config/                 # DB, S3 config
│       ├── constants/              # HTTP status codes
│       ├── controllers/            # HTTP handlers (thin layer)
│       ├── dtos/                   # Data transfer object interfaces
│       ├── middlewares/            # auth, error, upload
│       ├── models/                 # Mongoose schemas + indexes
│       ├── queues/                 # BullMQ queue definition
│       ├── routes/                 # Express routers
│       ├── services/               # Business logic
│       ├── types/                  # Shared enums + TypeScript types
│       ├── utils/                  # ApiError, ApiResponse, JWT, etc.
│       ├── validators/             # Zod schemas per entity
│       └── workers/               # BullMQ worker (notification)
│
├── frontend/
│   └── src/
│       ├── api/                    # Axios API calls per domain
│       ├── components/             # Shared + page-level components
│       ├── pages/                  # Route-level page components
│       ├── store/                  # Zustand stores (auth, sidebar, theme)
│       └── types/                  # Frontend TypeScript types
│
└── extension/
    ├── manifest.json               # Manifest V3 config
    ├── content/
    │   └── selector.js             # Token sync + text selection capture
    ├── popup/                      # Extension UI (HTML + JS + CSS)
    ├── pages/                      # Extension inner pages (jobs, companies)
    └── service/
        ├── api.js                  # API calls from extension
        └── storage.js              # chrome.storage helpers
```

---

## Roadmap

- [ ] Rate limiting (express-rate-limit) on auth routes
- [ ] Kanban board with drag-and-drop status updates (optimistic UI)
- [ ] Analytics dashboard — application funnel, outreach conversion, resume performance
- [ ] Resume-to-interview conversion tracking
- [ ] Context menu capture in extension (right-click → save JD text)
- [ ] Tests (Jest + Supertest for API, unit tests for notification service)
- [ ] Production deployment (Render + Vercel + Upstash Redis)

---

## Why This Project

India's job market is referral-first. Most SDE roles at Razorpay, Groww, PhonePe, and similar companies are filled through employee referrals before the job post goes cold. Existing tools like Teal and Huntr are built for the US market — they don't account for WhatsApp outreach, Naukri as a primary source, or the specific workflow of requesting referrals from LinkedIn connections before applying.

This project is built from the experience of running a structured, data-driven job search campaign — and wanting tooling that actually fits how Indian job seekers operate.

---

## Author

**Prateek** — Full Stack Engineer  
[GitHub](https://github.com/17prateek12) · [LinkedIn](#)
