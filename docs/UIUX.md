# UI/UX Design Document
## Apna.co Job Application Tracker — Team 07, Squad 124

**Author:** Mayank Sharma
**Status:** Draft — pending mentor approval

---

## 1. Users

- **Candidate** — applies to jobs, tracks status of their applications
- **Employer** — posts jobs, views applicants, batch-updates statuses

## 2. Core Screens

### Candidate side
1. **Job Listings** — browse/search available jobs, "Apply" button per job
2. **My Applications (Dashboard)** — list of all applications with status badges (Pending / Viewed / Rejected), sorted by most recent
3. **Application Confirmation** — brief state shown right after applying, confirming it's now "Pending"

### Employer side
4. **Employer Dashboard** — table of all applications received across their job postings
5. **Applications Table (with batch actions)** — checkboxes per row, multi-select, a "Update Status" action bar appears when 1+ rows are selected
6. **Job Posting Form** — create/edit a job listing

## 3. Key User Flows

### Flow A — Candidate applies
Job Listings → tap "Apply" → Confirmation state → redirected to "My Applications" → sees new entry with `Pending` badge

### Flow B — Candidate checks status later
Opens app → My Applications loads → statuses refresh automatically (polling) → sees updated `Viewed` or `Rejected` badge without manual refresh

### Flow C — Employer batch-updates
Employer Dashboard → Applications Table → selects multiple checkboxes → clicks "Mark as Viewed" (or Rejected) → confirmation toast → table updates

## 4. Status Badge States (visual language)

| Status | Color cue | Meaning |
|---|---|---|
| Pending | Neutral/gray | Application received, not yet reviewed |
| Viewed | Blue/amber | Employer has opened/reviewed it |
| Rejected | Red | Application declined |

## 5. Layout Notes

- Candidate dashboard: card-based list, one card per application, status badge top-right of card
- Employer dashboard: table-based (not cards) since batch selection needs row-level checkboxes and scanability across many applicants
- Mobile-first for candidate side (most candidates will check status on phone); desktop-first acceptable for employer side (batch actions are easier with more screen space)

---
