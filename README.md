# AI-Powered Job Portal

A full-stack job portal with two modules — **Candidate** and **Recruiter** — plus AI features
powered by Google Gemini (resume analysis, job-fit scoring, and cover letter generation).

**Stack:** Django + Django REST Framework · React (Vite) · PostgreSQL · JWT Auth (SimpleJWT) · Gemini API

---

## 1. Features

### Candidate
- Register / login (JWT)
- Profile: personal info, education, experience, skills, resume upload (PDF/DOCX, text auto-extracted)
- Browse jobs with **search, filters** (location, job type, experience level, skills, salary) and **pagination**
- **One-click apply** (resume snapshotted automatically)
- **My Applications** — track status (Applied → Under Review → Shortlisted → Interview → Hired/Rejected)
- **AI Features (Gemini)**
  - "Check My Profile" — resume summary, strengths, weaknesses, suggestions
  - "Check Against This Job" — match score + gap analysis vs. a specific job posting
  - AI Cover Letter Generator (optional, tailored per job)
- Per-user **rate limiting** on AI endpoints (separate throttle scope from general API)

### Recruiter
- Register / login (JWT)
- Company profile (name, logo, about, size, industry, contacts)
- Full **Job CRUD** (title, description, responsibilities, requirements, skills, salary range, deadline, status)
- View applicants per job, **download resumes**, and **change application status**

---

## 2. Project Structure

```
jobportal/
├── backend/                 # Django + DRF API
│   ├── apps/
│   │   ├── users/            # custom user model + JWT auth
│   │   ├── candidates/       # profile, education, experience, skills, resume
│   │   ├── recruiters/       # company profile
│   │   ├── jobs/             # job CRUD, filters
│   │   ├── applications/     # apply, status, resume download
│   │   └── ai_features/      # Gemini integration + rate limiting
│   ├── config/                # settings, urls
│   ├── requirements.txt
│   └── .env.example
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── api/               # axios client with JWT refresh interceptor
    │   ├── context/           # AuthContext
    │   ├── components/        # Navbar, ProtectedRoute, StatusBadge
    │   └── pages/
    │       ├── auth/          # Login, Register
    │       ├── candidate/     # Profile, JobsList, JobDetail, MyApplications
    │       └── recruiter/     # Company, JobsManage, JobForm, Applicants
    └── .env.example
```

---

## 3. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create your `.env` file from the example and fill in real values:

```bash
cp .env.example .env
```

```ini
SECRET_KEY=generate-a-long-random-string
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=jobportal_db
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173

GEMINI_API_KEY=your-gemini-api-key   # https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-1.5-flash

THROTTLE_USER_RATE=100/day
THROTTLE_AI_RATE=10/day
```

Create the PostgreSQL database (matching the `.env` values above):

```bash
createdb jobportal_db
# or, in psql:  CREATE DATABASE jobportal_db;
```

Run migrations and create an admin user:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is now live at `http://localhost:8000/api/` (Django admin at `/admin/`).

---

## 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE_URL if not using the default
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 5. API Overview

| Area | Endpoint | Notes |
|---|---|---|
| Auth | `POST /api/auth/register/` | body: `email, username, password, password2, role (CANDIDATE|RECRUITER)` |
| Auth | `POST /api/auth/login/` | returns `access`, `refresh`, `user` |
| Auth | `POST /api/auth/login/refresh/` | refresh access token |
| Auth | `GET/PATCH /api/auth/me/` | account info |
| Candidate | `GET/PATCH /api/candidates/profile/` | profile (auto-created) |
| Candidate | `POST /api/candidates/profile/resume/` | multipart resume upload |
| Candidate | `/api/candidates/education/`, `/experience/`, `/skills/` | full CRUD |
| Recruiter | `GET/PATCH /api/recruiters/company/` | company profile |
| Jobs | `GET /api/jobs/` | public list — filters: `location, job_type, experience_level, is_remote, skills, salary_min, salary_max, company`; `search=`; pagination via `page` |
| Jobs | `GET /api/jobs/?mine=true` | recruiter's own jobs (any status) |
| Jobs | `POST/PATCH/DELETE /api/jobs/<id>/` | recruiter only, own jobs |
| Applications | `POST /api/applications/apply/` | body: `job` (job id) — one-click apply |
| Applications | `GET /api/applications/my-applications/` | candidate's applications |
| Applications | `GET /api/applications/job/<job_id>/applicants/` | recruiter view |
| Applications | `PATCH /api/applications/<id>/status/` | recruiter changes status |
| Applications | `GET /api/applications/<id>/resume/` | recruiter downloads resume |
| AI | `POST /api/ai/resume-summary/` | "Check My Profile" |
| AI | `POST /api/ai/job-match/` | body: `job_id` |
| AI | `POST /api/ai/cover-letter/` | body: `job_id` |

All endpoints except register/login require `Authorization: Bearer <access_token>`.

---

## 6. Rate Limiting

Configured in `backend/config/settings.py` via DRF throttling:
- **General API**: `THROTTLE_USER_RATE` (default `100/day` per authenticated user)
- **AI endpoints**: separate, stricter `THROTTLE_AI_RATE` scope (default `10/day` per user), since Gemini calls are the most expensive operation in the app.

Both are tunable from `.env` without code changes.

---

## 7. Security Notes

- All secrets (DB credentials, Django `SECRET_KEY`, Gemini API key) are loaded from `.env` — never hardcoded.
- JWT access tokens are short-lived; refresh tokens rotate and are blacklisted after use.
- File uploads are validated (extension + 5MB size limit) both for resumes and company logos.
- Recruiters can only manage jobs/applications they own (`IsOwnerRecruiterOrReadOnly` and per-view ownership checks).
- Before deploying: set `DEBUG=False`, configure real `ALLOWED_HOSTS`, and put `SECRET_KEY`/`GEMINI_API_KEY` in a secret manager rather than a committed `.env`.

---

## 8. What's Included vs. Left for You

Included and tested end-to-end (registration, login, job CRUD, filtering/pagination, one-click apply,
status updates, resume upload/download, AI endpoint wiring, and per-scope rate limiting):
everything listed in "Features" above.

Left as straightforward follow-ups depending on your deployment needs:
- Email verification / password reset flows
- Deployment config (Dockerfile, gunicorn + nginx, S3-backed media storage)
- Automated test suite (pytest-django) — the manual smoke test performed during development covered
  the full candidate + recruiter + AI flow, but no `tests.py` assertions were written
