# Backend Schema & Architecture Specification
## Apna.co Job Application Tracker — Team 07, Squad 124

**Owner:** Mayank Sharma  
**Status:** Implemented & Verified  
**Stack:** Next.js App Router (TypeScript) + Prisma ORM + PostgreSQL (Supabase)  

---

## 1. Entity Overview

Four core entities define the data model: `Candidate`, `Employer`, `Job`, `Application`, and `Session`.

```
Candidate ──< Application >── Job ──< Employer
    │                                    │
    └───< Session >──────────────────────┘
```

- One **Candidate** → many **Applications** & many active **Sessions**
- One **Employer** → many **Jobs** & many active **Sessions**
- One **Job** → many **Applications**
- One **Candidate** can apply to a given **Job** at most once (`@@unique([candidateId, jobId])`)

---

## 2. Production Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Candidate {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  passwordHash String
  applications Application[]
  sessions     Session[]
  createdAt    DateTime      @default(now())
}

model Employer {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  jobs         Job[]
  sessions     Session[]
  createdAt    DateTime  @default(now())
}

model Session {
  id               String     @id @default(cuid())
  refreshTokenHash String     @unique
  candidateId      String?
  employerId       String?
  candidate        Candidate? @relation(fields: [candidateId], references: [id])
  employer         Employer?  @relation(fields: [employerId], references: [id])
  expiresAt        DateTime
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
}

model Job {
  id           String        @id @default(cuid())
  title        String
  employerId   String
  employer     Employer      @relation(fields: [employerId], references: [id])
  applications Application[]
  createdAt    DateTime      @default(now())
}

model Application {
  id          String    @id @default(cuid())
  status      String    @default("pending") // pending | viewed | rejected
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([candidateId, jobId])
}
```

---

## 3. Entity Field Details

### `Candidate`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Unique candidate identifier |
| `name` | `String` | Required | Full name |
| `email` | `String` | `@unique` | Normalized lowercase email for login |
| `passwordHash` | `String` | Required | Bcrypt-hashed password (10 salt rounds) |
| `applications` | `Application[]` | Relation | Linked job applications |
| `sessions` | `Session[]` | Relation | Active refresh token sessions |

### `Employer`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Unique employer identifier |
| `name` | `String` | Required | Company or recruiter name |
| `email` | `String` | `@unique` | Normalized lowercase email for login |
| `passwordHash` | `String` | Required | Bcrypt-hashed password |
| `jobs` | `Job[]` | Relation | Posted job opportunities |
| `sessions` | `Session[]` | Relation | Active refresh token sessions |

### `Session`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Unique session record ID |
| `refreshTokenHash` | `String` | `@unique` | SHA-256 hash of active refresh token |
| `candidateId` | `String?` | Optional FK | Link to candidate account (if candidate) |
| `employerId` | `String?` | Optional FK | Link to employer account (if employer) |
| `expiresAt` | `DateTime` | Required | Expiration timestamp (7 days) |

### `Job`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Unique job posting ID |
| `title` | `String` | Required | Job title |
| `employerId` | `String` | Foreign Key | Owner employer ID |
| `applications` | `Application[]` | Relation | Received applications |

### `Application`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(cuid())` | Unique application ID |
| `status` | `String` | `@default("pending")` | Current status (`pending`, `viewed`, `rejected`) |
| `candidateId` | `String` | Foreign Key | Applicant candidate ID |
| `jobId` | `String` | Foreign Key | Target job ID |
| `@@unique` | `[candidateId, jobId]` | Unique Index | Strict duplicate application prevention |

---

## 4. Authentication Architecture & Session Design (Resolved)

1. **Dual-Token Pattern:**
   - **Access Token:** Short-lived (15 minutes), containing `{ userId, role }`. Used for authenticating stateless API requests.
   - **Refresh Token:** Long-lived (7 days), containing `{ userId, sessionId }`. Used solely on `/api/auth/refresh` to issue new access tokens.
2. **Storage:**
   - Both tokens are transmitted via secure, `HttpOnly`, `SameSite=Lax` cookies, preventing client-side XSS exfiltration.
3. **Database Token Rotation:**
   - The database stores a SHA-256 hash of the valid refresh token in the `Session` table. Upon token refresh, the old token is invalidated and a new hashed token is stored.
4. **Server-Side Revocation:**
   - Calling `POST /api/auth/logout` deletes the `Session` record from PostgreSQL and sets cookie `maxAge=0`.

---

## 5. Status State Machine & Constraints

```
[Candidate Applies] ────> ( pending )
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
       ( viewed )                        ( rejected )
```

- Initial state upon creation is always **`pending`**.
- Employer batch updates can transition applications to **`viewed`** or **`rejected`**.
- Input validation at the API layer rejects any unauthorized status with `400 Bad Request`.

---

## 6. Resolved Architectural Questions

- **Duplicate Prevention:** Solved via compound unique index `@@unique([candidateId, jobId])` in PostgreSQL and pre-check in API route.
- **Role Enforcement:** Handled via token payload inspection in Next.js API routes with strict 401/403 guards.
- **Batch Isolation:** Scoped queries guarantee employers can only mutate applications belonging to jobs they created (`where: { id: { in: ids }, job: { employerId } }`).
