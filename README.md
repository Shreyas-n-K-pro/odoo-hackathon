# TransitOps Fleet Management System

TransitOps is a Fleet Management backend API built with **Node.js + Express** and **Prisma ORM** (MySQL). It supports core operations such as authentication/roles, vehicles, drivers, trips, maintenance logs, fuel logs, expenses, operational cost calculations, and analytics.

---

## Project structure

- `backend/` – Express + Prisma backend
  - `server.js` – server entry point
  - `src/app.js` – Express app, middleware, and route mounting
  - `src/config/` – configuration (Prisma, constants)
  - `src/modules/` – feature modules (auth, vehicles, drivers, trips, etc.)
  - `prisma/` – database schema and seed

---

## Prerequisites

- Node.js (LTS)
- MySQL 8+

---

## Setup

### 1) Create the database (MySQL)

You can run the included script:

```sql
-- backend/setup_db.sql
CREATE DATABASE IF NOT EXISTS transitops_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'transitops_user'@'%' IDENTIFIED BY 'StrongPass123';
CREATE USER IF NOT EXISTS 'transitops_user'@'localhost' IDENTIFIED BY 'StrongPass123';

GRANT ALL PRIVILEGES ON transitops_db.* TO 'transitops_user'@'%';
GRANT ALL PRIVILEGES ON transitops_db.* TO 'transitops_user'@'localhost';

FLUSH PRIVILEGES;
```

### 2) Backend environment variables

Create `backend/.env` with (at minimum) the following:

```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Used by Prisma
DATABASE_URL="mysql://transitops_user:StrongPass123@localhost:3306/transitops_db"

# Used for CORS
CLIENT_URL=http://localhost:5173
```

> If your MySQL host/port/user differ, update `DATABASE_URL` accordingly.

### 3) Install dependencies

```bash
cd backend
npm install
```

### 4) Generate DB + seed

Run Prisma migrations by pushing schema to the DB:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Seeded demo credentials (password for all seeded users: `Transit@123`):

- Fleet Manager: `arjun@transitops.in`
- Dispatcher: `priya@transitops.in`
- Safety Officer: `ramesh@transitops.in`
- Financial Analyst: `sneha@transitops.in`

---

## Run the backend

Development:

```bash
cd backend
npm run dev
```

Production:

```bash
cd backend
npm start
```

Health check:

- `GET http://localhost:5000/health`

---

## API base paths

- Health: `GET /health`
- REST API: all routes are mounted under `/api`

Mounted route modules:

- `/api/auth` → authentication
- `/api/vehicles` → vehicles
- `/api/settings` → settings
- `/api/drivers` → drivers
- `/api/trips` → trips
- `/api/maintenance` → maintenance logs
- `/api/fuel` → fuel records
- `/api/fuel-logs` → (alias to fuel routes)
- `/api/expenses` → expenses
- `/api/operational-cost` → operational cost
- `/api/analytics` → analytics

---

## Notes

- The backend uses **Helmet**, **CORS**, **rate limiting**, and central **error handling**.
- Prisma uses `DATABASE_URL` from `.env`.

---

## Author

TransitOps Hackathon Team
