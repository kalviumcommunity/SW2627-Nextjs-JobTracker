# App Flow Document

**Project:** Job Tracker Application
**Owner:** Vidit Kochar,Mayank Sharma
**Date:** August 20, 2026

---

## 1. User Types

- Candidate
- Employer

---

## 2. Candidate Flow — Screens

1. Landing / Home page
2. Sign up
3. Login
4. Role selection (candidate vs employer) — only needed if signup is shared
5. Candidate onboarding / profile setup (name, resume upload, skills, etc.)
6. Candidate dashboard
7. Job listings page (browse/search jobs)
8. Job detail page
9. Apply to job screen/modal
10. Application status/tracker page
11. Profile/settings page

### Candidate Flow — Order

Landing → Sign up → Role selection → Onboarding → Dashboard → Job listings → Job detail → Apply → Status tracker

---

## 3. Employer Flow — Screens

1. Landing / Home page (shared with candidate)
2. Sign up
3. Login
4. Employer onboarding (company name, logo, details)
5. Employer dashboard
6. Post a job screen
7. Manage job postings (edit/delete/close)
8. View applicants for a job
9. Applicant detail/profile view
10. Settings page

### Employer Flow — Order

Landing → Sign up → Role selection → Onboarding → Dashboard → Post job / Manage postings → View applicants → Applicant detail

---

## 4. Decision Points

- **New user vs existing user:** New user → Onboarding. Existing user → straight to Dashboard.
- **Already applied to a job?** → Show "Applied" status instead of the Apply button.
- **Candidate vs Employer at signup:** Role selection determines which onboarding and dashboard the user sees.
- **Empty states:** No jobs posted yet (employer) / no applications yet (candidate) → show empty-state prompts.

---

## 5. Navigation Map

```
                        ┌───────────────┐
                        │  Landing Page │
                        └───────┬───────┘
                                │
                     ┌──────────┴──────────┐
                     ▼                     ▼
               ┌──────────┐          ┌──────────┐
               │  Sign Up │          │  Login   │
               └────┬─────┘          └────┬─────┘
                    │                     │
                    ▼                     │
            ┌───────────────┐             │
            │ Role Selection │◄────────────┘ (if new)
            └───┬───────┬───┘
                │       │
     Candidate  │       │  Employer
                ▼       ▼
     ┌──────────────┐ ┌───────────────────┐
     │ Candidate     │ │ Employer          │
     │ Onboarding    │ │ Onboarding        │
     └──────┬───────┘ └─────────┬─────────┘
            ▼                    ▼
     ┌──────────────┐ ┌───────────────────┐
     │ Candidate     │ │ Employer          │
     │ Dashboard     │ │ Dashboard         │
     └──────┬───────┘ └─────────┬─────────┘
            ▼                    ▼
     ┌──────────────┐ ┌───────────────────┐
     │ Job Listings  │ │ Post Job /        │
     │              │ │ Manage Postings    │
     └──────┬───────┘ └─────────┬─────────┘
            ▼                    ▼
     ┌──────────────┐ ┌───────────────────┐
     │ Job Detail    │ │ View Applicants    │
     └──────┬───────┘ └─────────┬─────────┘
            ▼                    ▼
     ┌──────────────┐ ┌───────────────────┐
     │ Apply to Job  │ │ Applicant Detail   │
     └──────┬───────┘ └───────────────────┘
            ▼
     ┌──────────────┐
     │ Status        │
     │ Tracker       │
     └──────────────┘
```

*(Note: replace this ASCII map with a Figma/Miro/draw.io diagram for the final version if a visual tool is preferred.)*

---

## 6. Next Steps

- Validate this flow with the team
- Convert routes into the Next.js folder structure for scaffolding
- Confirm shared vs role-specific components (navbar, layout)
