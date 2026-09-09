# JobTracker - Next.js Job Board & Application Platform

A full-stack, role-based job tracking and recruitment platform built with **Next.js 16 (App Router)**, **React 19**, **Prisma ORM**, **Supabase (PostgreSQL)**, and **Tailwind CSS**.

---

## 🚀 Features

### 👤 Candidate Portal
- **Authentication**: Secure registration and login with JWT access & refresh tokens stored in HTTP-only cookies.
- **Onboarding Wizard**: Guided setup for profile completion (`headline`, `skills`, `bio`, `phone`, `location`).
- **Profile Management**: Live profile editing and updates (`/candidate/profile`).
- **Job Discovery**: Browse, search, filter, and view detailed job listings.
- **Job Applications**: Apply to jobs with custom cover letter and resume tracking.
- **Application Dashboard**: Real-time status tracking (`pending`, `reviewing`, `interviewing`, `accepted`, `rejected`).

### 🏢 Employer Portal
- **Employer Onboarding & Settings**: Manage company name, website, bio, and location.
- **Job Management**: Create, view, and delete job postings.
- **Applicant Review**: Review applicant profiles, view resumes, cover letters, and update application statuses.
- **Recruiter Dashboard**: Live statistics on active jobs, total applications, and applicant pipeline.

### 🛡️ Security & Architecture
- **Route Protection**: Next.js Edge Middleware protecting role-specific candidate and employer routes.
- **Robust Role Guards**: Server-side JWT role validation (`requireRole`, `requireAuth`).
- **Prisma + Supabase**: Strongly-typed database access with connection pooling via `@prisma/adapter-pg`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (Turbopack, App Router)](https://nextjs.org/)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [Prisma ORM 7](https://www.prisma.io/), [Supabase PostgreSQL](https://supabase.com/)
- **Authentication**: Custom JWT (Access + Refresh Token cookies with bcrypt password hashing)

---

## 📦 Project Structure

```
SW2627-Nextjs-JobTracker/
├── my-app/                 # Next.js application root
│   ├── app/                # App Router pages and API routes
│   │   ├── (auth)/         # Login, Signup, Role Selection
│   │   ├── candidate/      # Candidate dashboard, jobs, profile, applications
│   │   ├── employer/       # Employer dashboard, job creation, applicant review
│   │   └── api/            # REST API endpoints
│   ├── components/         # Reusable UI components
│   ├── lib/                # Auth guards, JWT helpers, prisma client
│   ├── prisma/             # Prisma schema and configuration
│   └── package.json        # Dependencies and scripts
├── docs/                   # Documentation and project plans
└── README.md
```

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kalviumcommunity/SW2627-Nextjs-JobTracker.git
   cd SW2627-Nextjs-JobTracker/my-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in `my-app/` with the following variables:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
   ACCESS_TOKEN_SECRET="your-access-token-secret"
   REFRESH_TOKEN_SECRET="your-refresh-token-secret"
   JWT_SECRET="your-jwt-secret"
   ```

4. **Synchronize Database:**
   ```bash
   npx prisma db push
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 🚀 Deployment to Vercel

### Step 1: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
2. Select the GitHub repository: `kalviumcommunity/SW2627-Nextjs-JobTracker`.

### Step 2: Configure Root Directory
> ⚠️ **Important**: Because the Next.js app is inside the `my-app` subfolder:
- In the **Root Directory** field, click **Edit** and select **`my-app`**.

### Step 3: Set Environment Variables
In the Vercel **Environment Variables** section, add the following:
| Variable Name | Description |
| :--- | :--- |
| `DATABASE_URL` | Supabase pooled connection string (port 5432 or 6543) |
| `DIRECT_URL` | Supabase direct database connection string |
| `ACCESS_TOKEN_SECRET` | Secret key for access token signing |
| `REFRESH_TOKEN_SECRET` | Secret key for refresh token signing |
| `JWT_SECRET` | Optional/fallback JWT secret |

### Step 4: Deploy
Click **Deploy**. Vercel will:
1. Run `npm install` (which executes `postinstall: prisma generate`).
2. Run `npm run build` (compiles all static & dynamic Next.js routes).
3. Provide your live production URL!
