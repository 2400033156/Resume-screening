# ResumeAI — AI-Powered Resume Screening Platform

An intelligent resume screening system built with **Next.js 16**, **AI Evaluation Engine**, **Prisma**, and **Tailwind CSS**.

## Features
- 🔐 **Authentication** — Sign up / sign in with JWT sessions (NextAuth.js)
- 📄 **Resume Upload** — Drag-and-drop PDF/TXT upload with real-time parsing
- 🤖 **AI Evaluation** — Automated AI analyzes resumes for skills, experience, and role fit
- 🎯 **Role Recommendations** — Top 3 best-fit job roles with match percentages
- 💪 **Strength & Gap Analysis** — Detailed strengths and areas to improve
- 📊 **Analytics Dashboard** — Score distributions, top roles, and history charts

## Microservices (API Routes)

| Service | Endpoint | Description |
|---|---|---|
| Auth Service | `POST /api/auth/register` | User registration |
| Auth Service | `POST /api/auth/[...nextauth]` | NextAuth sign-in/out |
| Upload Service | `POST /api/upload` | Resume file upload + PDF parsing |
| Screening Service | `POST /api/screen` | Automated AI screening |
| Analytics Service | `GET /api/analytics` | Dashboard statistics |
| Candidates Service | `GET /api/candidates` | List all evaluations |

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env.local` and add your credentials:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
MINIMAX_API_KEY="your-minimax-api-key"
MINIMAX_GROUP_ID="your-minimax-group-id"
```

> **Get MiniMax API Key**: Sign up at https://www.minimaxi.com/
> Navigate to API → Create API Key. Copy your API Key and Group ID.

### 3. Set Up Database
```bash
npx prisma generate
npx prisma db push
```
> Set `DATABASE_URL` env var first, or run via powershell:
> `$env:DATABASE_URL="file:./dev.db"; .\node_modules\.bin\prisma db push`

### 4. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Auth**: NextAuth.js v5 (beta)
- **Database**: SQLite via Prisma ORM
- **AI**: MiniMax Chat API (`abab6.5s-chat`)
- **PDF Parsing**: pdf-parse
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **File Upload**: react-dropzone

## Project Structure

```
app/
├── api/
│   ├── auth/[...nextauth]/   ← Auth service
│   ├── auth/register/        ← User registration
│   ├── upload/               ← Upload microservice
│   ├── screen/               ← AI screening microservice
│   ├── analytics/            ← Analytics microservice
│   └── candidates/           ← Candidates microservice
├── auth/
│   ├── signin/               ← Sign-in page
│   └── signup/               ← Sign-up page
├── dashboard/                ← Main dashboard
├── results/[id]/             ← Evaluation results
└── analytics/                ← Analytics page

components/
├── Navbar.tsx
└── ResumeUploader.tsx

lib/
├── auth.ts                   ← NextAuth config
├── minimax.ts                ← MiniMax API client
└── prisma.ts                 ← Prisma client singleton

prisma/
└── schema.prisma             ← Database schema
```
