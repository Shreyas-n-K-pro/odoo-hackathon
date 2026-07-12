# TransitOps — Smart Transport Operations Platform

A role-based fleet management system built for the Odoo Hackathon.

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MySQL 8 (shared by all 4 team members) |
| ORM | Prisma 5 |
| Backend | Node.js + Express |
| Auth | bcrypt + JSON Web Tokens |
| Validation | Zod |
| Logging | Winston |
| Security | Helmet + express-rate-limit |
| Frontend | React 18 + Vite + Tailwind CSS |
| HTTP Client | Axios |

## Quick Start

### 1. Clone & Configure

```bash
git clone <repo-url>
cd transitops

# Copy env template
cp .env.example .env
# Edit .env with the shared MySQL host IP
```

### 2. Start MySQL

**Option A — Docker (recommended):**
```bash
docker compose up -d
```

**Option B — Local MySQL install:**
```sql
CREATE DATABASE transitops_db;
CREATE USER 'transitops_user'@'%' IDENTIFIED BY 'StrongPass123';
GRANT ALL PRIVILEGES ON transitops_db.* TO 'transitops_user'@'%';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

```bash
cd backend
npm install
npx prisma db push       # Create all 8 tables
node prisma/seed.js      # Seed demo data
npm run dev              # Starts on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Fleet Manager | arjun@transitops.in | Transit@123 |
| Dispatcher | priya@transitops.in | Transit@123 |
| Safety Officer | ramesh@transitops.in | Transit@123 |
| Financial Analyst | sneha@transitops.in | Transit@123 |

## API Reference

Base URL: `http://localhost:5000/api`

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/signup` | POST | None | Register a new user |
| `/auth/login` | POST | None | Login (5 failed → 15min lockout) |
| `/auth/me` | GET | JWT | Get current user |
| `/vehicles` | GET | JWT | List vehicles (filter + paginate) |
| `/vehicles/stats` | GET | JWT | Stat counts by status |
| `/vehicles/:id` | GET | JWT | Single vehicle |
| `/vehicles` | POST | Fleet Manager | Create vehicle |
| `/vehicles/:id` | PATCH | Fleet Manager | Update vehicle |
| `/vehicles/:id` | DELETE | Fleet Manager | Retire vehicle |
| `/settings` | GET | JWT | Depot settings |
| `/settings` | PATCH | Fleet Manager | Update settings |
| `/settings/rbac` | GET | JWT | RBAC matrix |
| `/health` | GET | None | Health check |

## Project Structure

```
transitops/
├── backend/        ← Node.js + Express API
│   ├── prisma/     ← Schema (all 8 tables) + seed
│   └── src/
│       ├── config/       ← DB singleton, constants/RBAC
│       ├── middleware/   ← auth, rbac, validate, rateLimit, error
│       ├── modules/      ← auth, vehicles, settings, (stubs: drivers, trips, maintenance, fuel, analytics)
│       └── utils/        ← apiResponse, logger, pagination
├── frontend/       ← React 18 + Vite
│   └── src/
│       ├── api/          ← Axios modules
│       ├── context/      ← AuthContext
│       ├── hooks/        ← useAuth, usePermission
│       ├── components/   ← UI + Layout components
│       └── pages/        ← Login, Vehicles, Settings, (stubs for B/C/D)
└── docker-compose.yml
```

## RBAC Matrix

| Role | Fleet | Drivers | Trips | Fuel/Exp | Analytics | Settings |
|---|---|---|---|---|---|---|
| Fleet Manager | ✅ edit | ✅ edit | — | — | ✅ edit | ✅ edit |
| Dispatcher | 👁 view | — | ✅ edit | — | — | — |
| Safety Officer | — | ✅ edit | 👁 view | — | — | — |
| Financial Analyst | 👁 view | — | — | ✅ edit | ✅ edit | — |

## Team

- **Member A** — Auth, Vehicle Registry, Settings (this branch)
- **Member B** — Driver Management, Trip Dispatcher
- **Member C** — Maintenance Logs, Fuel & Expenses
- **Member D** — Analytics Dashboard
