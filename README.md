# 🚛 TransitOps — Smart Transport Operations Platform

> **8-Hour Hackathon Project** | End-to-end fleet management system that digitizes vehicle, driver, dispatch, maintenance, expense, and document management with real-time operational insights.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [RBAC — Role-Based Access Control](#-rbac--role-based-access-control)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)

---

## 🌟 Overview

**TransitOps** is a centralized platform for logistics organizations to manage the complete lifecycle of transport operations — from vehicle registration and driver management to live dispatching, maintenance tracking, fuel logging, compliance document management, and analytics.

### Target Users

| Role | Capabilities |
|---|---|
| **Fleet Manager** | Full access — vehicles, drivers, trips, maintenance, fuel, documents, analytics, settings |
| **Dispatcher** | Create & manage trips, view dashboard, view vehicles & drivers |
| **Safety Officer** | View all data, check driver compliance & license expiry |
| **Financial Analyst** | View fuel logs, expenses, and analytics reports; export PDF/CSV |

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v22 | Runtime |
| **Express.js** | 4.x | REST API framework |
| **Prisma ORM** | 5.14 | Database access & migrations |
| **MySQL** | 8.x | Primary database |
| **JWT** | jsonwebtoken 9.x | Authentication |
| **bcrypt** | 5.x | Password hashing |
| **Zod** | 3.x | Request validation |
| **Helmet** | 7.x | HTTP security headers |
| **express-rate-limit** | 7.x | API rate limiting |
| **Winston** | 3.x | Structured logging |
| **Brevo (Sendinblue)** | SDK 8.x | Email notifications |
| **nodemon** | 3.x | Dev hot-reload |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Recharts** | 2.x | Charts & data visualization |
| **Axios** | 1.7 | HTTP client |
| **jsPDF + autotable** | 4.x / 5.x | PDF export |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Lucide React** | 0.263 | Icon library |
| **Day.js** | 1.x | Date formatting |

---

## ✅ Features

### 1. 🔐 Authentication & Security
- JWT-based login with 1-day token expiry
- bcrypt password hashing (10 salt rounds)
- Account lockout after 5 failed login attempts (30-minute lock)
- RBAC middleware enforcing permission gates on every route
- Helmet HTTP security headers
- API rate limiting: 1000 req/15 min (general), 2000 req/15 min (dashboard)

### 2. 🚛 Vehicle Management
- Register vehicles: Reg No., model, type (Van / Truck / Mini), capacity (kg), odometer, acquisition cost, region
- Status lifecycle: `Available → On Trip → In Shop → Retired`
- Fleet stat cards: Total / Available / On Trip / In Shop / Retired
- Filter by type, status, search by reg number
- Retire vehicle (soft status change)
- **📋 Document Management** per vehicle (see below)
- **Export fleet to PDF**

### 3. 📋 Vehicle Document Management *(Bonus Feature)*
- Track compliance docs per vehicle: **RC · Insurance · PUC · Permit · Fitness Certificate · Road Tax · Other**
- Store: doc type, policy/reg number, issue date, expiry date, notes
- Auto-computed status: 🟢 **Valid** (>30 days) · 🟡 **Expiring Soon** (≤30 days) · 🔴 **Expired**
- Add / Edit / Delete docs via per-vehicle Documents modal
- Dashboard alert widget shows all expiring/expired docs with vehicle reg + days badge

### 4. 👨‍✈️ Driver Management
- Register drivers: name, license number, category, expiry date, phone, email, region, status
- License expiry checker: bulk check all active drivers, flag expiring within 30 days
- Safety score (0-100) with color-coded indicators
- Driver status: Active / Available / On Trip / On Leave / Off Duty / Suspended / Inactive
- License expiry banner: expired count + expiring soon count
- **Export drivers to PDF**

### 5. 🗺️ Trip Dispatch & Management
- Create trips: select available vehicle + driver, origin, destination, scheduled time, cargo weight, notes
- Business rules:
  - Cargo weight must not exceed vehicle capacity
  - Only `Available` vehicles and drivers are offered during scheduling
  - Vehicle and driver status auto-updated to `On Trip` when trip starts
- Status flow: `Scheduled → In Progress → Completed / Cancelled`
- Complete trip: record actual distance (km) → driver status restored to `Available`
- Role-based actions: Fleet Manager & Dispatcher can create/start/cancel; Drivers can complete
- Tab filters: All / Scheduled / In Progress / Completed / Cancelled
- Live polling every 15 seconds
- **Export trips to PDF**

### 6. 🔧 Maintenance Management
- Log service records: vehicle, service type (Routine / Repair / Inspection), cost, odometer, vendor, description, next service date
- Vehicle set to `In Shop` when maintenance is logged
- Close maintenance → vehicle returns to `Available`
- Filter by vehicle, type, status; sort by date
- Pagination with 10 records/page
- Fleet status flow visualization
- **Export maintenance log to PDF**

### 7. ⛽ Fuel & Expense Management
- Log fuel fills: vehicle, trip, liters, price/liter, odometer, station, date
- Log other expenses: toll, other charges, maintenance-linked costs
- Auto-computes: `total_cost = liters × price_per_liter`
- Fleet-wide total operational cost KPI (fuel + maintenance, auto-aggregated)
- **Export fuel report to PDF**

### 8. 📊 Analytics & Reports
- **ROI Calculator**: per-vehicle revenue, cost, net profit/loss
- **Cost Breakdown**: fuel vs. maintenance cost per vehicle (bar chart)
- **Fleet Efficiency**: distance per trip, on-time rate, utilization percentage
- **Fleet Utilization**: utilization % per vehicle (gauge-style bars)
- Export full analytics report to **PDF** and **CSV**

### 9. 📈 Dashboard
- KPI cards: Active Vehicles, Available, In Maintenance, On Trip, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization %, Total Fuel Cost, Maintenance Cost, Total Operational Cost, Revenue, Profit
- Vehicle status breakdown (pie chart)
- Monthly fuel cost trend (line chart)
- Monthly trips trend (bar chart)
- Recent trips table with status badges
- ⚠️ **Document Expiry Alert widget** — appears when docs are expiring/expired
- Filters: type, status, region
- Dark / light theme toggle (persisted in `localStorage`)
- Auto-refresh every 30 seconds

### 10. 📄 PDF Export (All Modules)
Branded PDF reports across all pages with navy + amber TransitOps header, data tables, and page footers:

| Module | Function |
|---|---|
| Trips | Export visible/filtered trips |
| Vehicles | Export full fleet list |
| Drivers | Export visible/filtered drivers |
| Maintenance | Export current service log page |
| Fuel & Expenses | Export fuel log report |
| Analytics | Export KPI + ROI + cost breakdown |

### 11. ⚙️ Settings
- Depot name, currency, distance unit configuration
- Persisted in DB (single-row settings table)

---

## 🏗 Architecture

```
odoohackathon/
├── backend/                    # Express.js REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Full DB schema (9 models)
│   │   └── seed.js             # Demo data seeder
│   ├── src/
│   │   ├── app.js              # Express app, middleware, route registry
│   │   ├── server.js           # Entry point
│   │   ├── config/
│   │   │   ├── database.js     # Prisma singleton
│   │   │   └── constants.js    # RBAC permission map
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── rbac.middleware.js   # Permission enforcement
│   │   │   └── rateLimit.middleware.js
│   │   ├── utils/
│   │   │   └── apiResponse.js  # Standardised JSON response helpers
│   │   └── modules/
│   │       ├── auth/           # Login, token issuance
│   │       ├── vehicles/       # Fleet CRUD + stats
│   │       ├── drivers/        # Driver CRUD + expiry check
│   │       ├── trips/          # Trip dispatch lifecycle
│   │       ├── maintenance/    # Service log CRUD
│   │       ├── fuel/           # Fuel logs + expenses
│   │       ├── cost/           # Operational cost aggregation
│   │       ├── analytics/      # ROI, efficiency, dashboard endpoints
│   │       ├── documents/      # Vehicle document management (bonus)
│   │       └── settings/       # Depot settings
│   └── package.json
│
└── frontend/                   # React + TypeScript + Vite
    ├── src/
    │   ├── api/                # Axios API modules per domain
    │   ├── components/
    │   │   └── ui/             # Modal, Badge, Spinner, Sidebar, Navbar
    │   ├── context/            # AuthContext
    │   ├── hooks/              # useAuth, usePermission
    │   ├── pages/              # One page per feature
    │   ├── utils/
    │   │   └── pdfExport.ts    # Shared branded PDF utility
    │   └── App.tsx             # Routes + RBAC guards
    └── package.json
```

---

## 🗄 Database Schema

```
users              — Authentication & roles
vehicles           — Fleet registry
drivers            — Driver profiles
trips              — Dispatch records
maintenance_logs   — Service history
fuel_logs          — Fuel fill records
expenses           — Toll, other, misc costs
vehicle_documents  — Compliance doc tracking (RC, Insurance, PUC…)
settings           — Depot configuration
```

All tables managed via **Prisma schema** with enum types, cascaded deletes, and indexed foreign keys.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT token |

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles` | List vehicles (filter: type, status, search, page) |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| PATCH | `/api/vehicles/:id/retire` | Retire vehicle |
| GET | `/api/vehicles/stats` | Fleet stat counts |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/drivers` | List drivers |
| POST | `/api/drivers` | Create driver |
| PUT | `/api/drivers/:id` | Update driver |
| POST | `/api/drivers/check-expiry` | Check & notify expiring licenses |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | List trips (filter: status) |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Edit trip |
| PATCH | `/api/trips/:id/start` | Start trip → In Progress |
| PATCH | `/api/trips/:id/complete` | Complete trip |
| PATCH | `/api/trips/:id/cancel` | Cancel trip |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/maintenance` | List service logs (filter, sort, paginate) |
| POST | `/api/maintenance` | Log service record |
| PATCH | `/api/maintenance/:id/close` | Mark service completed |

### Fuel & Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/fuel/logs` | List fuel logs |
| POST | `/api/fuel/logs` | Add fuel fill |
| GET | `/api/fuel/expenses` | List expenses |
| POST | `/api/fuel/expenses` | Add expense |
| GET | `/api/fuel/fleet-total-cost` | Total operational cost |

### Documents *(Bonus)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents?vehicleId=X` | List docs for a vehicle |
| GET | `/api/documents/expiring?days=30` | Docs expiring within N days |
| POST | `/api/documents` | Add document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

### Analytics & Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/roi` | Vehicle ROI data |
| GET | `/api/analytics/cost-breakdown` | Fuel vs maintenance costs |
| GET | `/api/analytics/fleet-efficiency` | Distance, on-time, utilization |
| GET | `/api/dashboard/kpis` | All KPI numbers |
| GET | `/api/dashboard/recent-trips` | Last 10 trips |
| GET | `/api/dashboard/vehicle-status-breakdown` | Pie chart data |
| GET | `/api/dashboard/monthly-fuel` | Monthly fuel cost trend |
| GET | `/api/dashboard/monthly-trips` | Monthly trip count trend |

---

## 🔒 RBAC — Role-Based Access Control

Permissions are defined in `backend/src/config/constants.js` and enforced by `rbac.middleware.js` on every write route.

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Vehicles (view) | ✅ | ✅ | ✅ | ✅ |
| Vehicles (edit) | ✅ | ❌ | ❌ | ❌ |
| Drivers (view) | ✅ | ✅ | ✅ | ❌ |
| Drivers (edit) | ✅ | ❌ | ❌ | ❌ |
| Trips (view) | ✅ | ✅ | ✅ | ✅ |
| Trips (create/edit) | ✅ | ✅ | ❌ | ❌ |
| Maintenance (view) | ✅ | ✅ | ✅ | ✅ |
| Maintenance (edit) | ✅ | ❌ | ❌ | ❌ |
| Fuel / Expenses | ✅ | ✅ | ✅ | ✅ |
| Documents (view) | ✅ | ✅ | ✅ | ✅ |
| Documents (edit) | ✅ | ❌ | ❌ | ❌ |
| Analytics | ✅ | ❌ | ❌ | ✅ |
| Settings | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (v22 recommended)
- **MySQL** 8.x running instance
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone https://github.com/Shreyas-n-K-pro/odoo-hackathon.git
cd odoo-hackathon
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment (see Environment Variables section)
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# Push database schema to MySQL
npm run db:push

# (Optional) Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Backend runs at: **http://localhost:4000**
Health check: **http://localhost:4000/health**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 4. Default Login Credentials

After seeding (`npm run db:seed`):

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `fleet@transitops.com` | `password123` |
| Dispatcher | `dispatch@transitops.com` | `password123` |
| Safety Officer | `safety@transitops.com` | `password123` |
| Financial Analyst | `finance@transitops.com` | `password123` |

---

## 🔐 Environment Variables

Create `backend/.env` with the following:

```env
# Server
PORT=4000

# Database — MySQL connection string
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME"

# Authentication
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="1d"

# Email notifications (Brevo / Sendinblue) — optional
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="noreply@yourdomain.com"
BREVO_SENDER_NAME="TransitOps"
```

---

## 📁 Project Structure

```
backend/src/
├── app.js                          # Express app setup
├── server.js                       # HTTP server entry
├── config/
│   ├── constants.js                # RBAC_MAP, enums
│   └── database.js                 # Prisma client
├── middleware/
│   ├── auth.middleware.js           # JWT guard
│   ├── rbac.middleware.js           # Permission guard
│   └── rateLimit.middleware.js      # Rate limiter config
├── utils/
│   └── apiResponse.js              # sendSuccess / sendError
└── modules/
    ├── auth/           {controller, routes, service}
    ├── vehicles/       {controller, routes, service}
    ├── drivers/        {controller, routes, service, validation}
    ├── trips/          {controller, routes, service}
    ├── maintenance/    {controller, routes, service}
    ├── fuel/           {controller, routes, service}
    ├── expenses/       {controller, routes, service, validation}
    ├── cost/           {controller, routes, service}
    ├── analytics/      {analytics.*, dashboard.*}
    ├── documents/      {controller, routes, service}
    └── settings/       {controller, routes, service}

frontend/src/
├── api/                            # Axios modules per domain
│   ├── axiosInstance.ts            # Base axios with auth header
│   ├── vehicle.api.js
│   ├── trips.api.js
│   ├── fuel.api.js
│   ├── maintenance.api.js
│   ├── driver.api.js
│   └── documents.api.ts
├── components/ui/
│   ├── Modal.jsx
│   ├── Badge.jsx
│   ├── Spinner.jsx
│   ├── Sidebar.tsx
│   └── Navbar.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── usePermission.ts
├── pages/
│   ├── Login.jsx
│   ├── DashboardPage.tsx
│   ├── Vehicles.jsx
│   ├── Drivers.jsx
│   ├── Trips.jsx
│   ├── Maintenance.jsx
│   ├── Fuel.jsx
│   ├── ReportsPage.tsx
│   └── Settings.jsx
└── utils/
    └── pdfExport.ts                # Branded PDF generator (all modules)
```

---

## 🖥 Scripts Reference

### Backend
```bash
npm run dev          # Start with nodemon (hot-reload)
npm run start        # Production start
npm run db:push      # Sync schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:generate  # Regenerate Prisma client
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build (tsc + vite)
npm run preview      # Preview production build
```

---

## 🧩 Key Business Rules Implemented

1. **Cargo weight validation** — Cannot assign trip if cargo > vehicle capacity
2. **Driver/Vehicle availability** — Only `Available` status vehicles/drivers appear in dispatch
3. **Account lockout** — 5 failed logins → 30-minute lock
4. **License expiry alerts** — Drivers with license expiring ≤30 days flagged with email notification
5. **Maintenance status flow** — Logging maintenance sets vehicle to `In Shop`; closing maintenance restores to `Available`
6. **Trip status cascade** — Starting a trip sets vehicle + driver to `On Trip`; completing restores to `Available`
7. **Document expiry** — Status auto-computed daily: Valid / Expiring Soon / Expired
8. **Total operational cost** — Auto-aggregated from all fuel logs + maintenance costs (no manual entry)

---

## 👥 Team

Built during an **8-hour hackathon** for the **Odoo Hackathon 2026**.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
