# Member A — Auth & RBAC, Vehicle Registry, Settings
**Screens owned:** 0 (Authentication), 2 (Vehicle Registry), 8 (Settings & RBAC)
**Build order position:** GO FIRST. Everything else depends on your schema + auth middleware.

---

## 0. Read this first — how the 4 files fit together

Integration order is **A → (B + C in parallel) → D**, because:
- A ships the DB, the auth token, and the RBAC middleware everyone else imports.
- B and C build off A's schema and can work side-by-side (they don't depend on each other).
- D builds the Dashboard/Analytics, which reads data produced by everyone — so D is last to integrate, but should build UI shell + chart components early against mocked numbers.

You are the **critical-path person for the first 20 minutes**. Nobody else can safely touch the DB until you push the shared schema.

---

## 1. Stack (whole team uses this — lock it in the 0:00–0:20 sync)

| Layer | Tool |
|---|---|
| Database | **MySQL 8** (local install or Docker `mysql:8`) |
| ORM | **Prisma** with `provider = "mysql"` in `schema.prisma` — fast migrations, type-safe, works identically to Postgres setup but targets MySQL |
| Backend | Node.js + Express |
| Auth | `bcrypt` (hashing) + `jsonwebtoken` (JWT) |
| Frontend | React + Vite + Tailwind CSS |
| API testing | Postman (share a Postman collection in the repo so B/C/D can hit your endpoints without asking) |
| Dates | `dayjs` |

Repo structure:
```
/backend
  /prisma/schema.prisma   ← YOU own this file first, then everyone adds their models to it
  /src/routes  /src/controllers  /src/middleware
/frontend
  /src/pages  /src/components  /src/api
```

---

## 2. Your DB tables (MySQL / Prisma) — push this within T+0:20

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Fleet Manager','Dispatcher','Safety Officer','Financial Analyst') NOT NULL,
  failed_attempts INT DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reg_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type ENUM('Van','Truck','Mini') NOT NULL,
  capacity_kg DECIMAL(10,2) NOT NULL,
  odometer INT DEFAULT 0,
  acquisition_cost DECIMAL(12,2) NOT NULL,
  status ENUM('Available','On Trip','In Shop','Retired') DEFAULT 'Available',
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  depot_name VARCHAR(150) DEFAULT 'Gandhinagar Depot GJ4',
  currency VARCHAR(10) DEFAULT 'INR (Rs)',
  distance_unit VARCHAR(20) DEFAULT 'Kilometers'
);
```

> **You also create the empty table stubs for `drivers`, `trips`, `maintenance_logs`, `fuel_logs`, `expenses` in the same `schema.prisma`/`schema.sql` file (just the CREATE TABLE, no logic) so B and C can `git pull` one complete schema instead of racing to append to the same file mid-build.** Get the exact column lists from files 2 and 3 below, copy them in, then push. This is the single most important thing you do in the first 20 minutes.

---

## 3. Screen 0 — Authentication (RBAC)

### Exact UI spec (from mockup)
- Left panel: dark navy background, amber/gold logo mark, "TransitOps" wordmark, tagline "Smart Transport Operations Platform"
- Copy block: **"One login, four roles:"** with bullets: Fleet Manager · Dispatcher · Safety Officer · Financial Analyst
- Right panel form: "Sign in to your account" / "Enter your credentials to continue"
  - Email field (placeholder: `you@transitops.in` style)
  - Password field
  - **Role (RBAC)** dropdown — Dispatcher / Fleet Manager / Safety Officer / Financial Analyst
  - "Remember me" checkbox + "Forgot password?" link
  - Amber "Sign In" button (full width)
  - Footer copy: **"Access is scoped by role after login:"**
    - Fleet Manager → Fleet, Maintenance
    - Dispatcher → Dashboard, Trips
    - Safety Officer → Drivers, Compliance
    - Financial Analyst → Fuel & Expenses, Analytics
- Error state (dashed red callout): **"Invalid credentials. Account locked after 5 failed attempts."**

Build this pixel-close — it's the first thing judges see and a clean dark-sidebar login is an easy, low-risk way to look more finished than teams that ship a bare unstyled form.

### Endpoints
```
POST /api/auth/signup   { name, email, password, role }
POST /api/auth/login    { email, password, role }
   → on 5th consecutive failure: set locked_until = now + 15min, return 423 Locked
   → on success: reset failed_attempts to 0, return { token, user: { id, name, role } }
POST /api/auth/logout   (optional, client can just drop token)
```

### Middleware (everyone imports this)
```js
requireAuth(req,res,next)        // verifies JWT, attaches req.user
requirePermission(module, level) // checks RBAC map below against req.user.role
```

### RBAC permission map — build exactly this, from the Settings screen matrix

| Role | Fleet | Drivers | Trips | Fuel/Exp | Analytics |
|---|---|---|---|---|---|
| Fleet Manager | edit | edit | none | none | edit |
| Dispatcher | view | none | edit | none | none |
| Safety Officer | none | edit | view | none | none |
| Financial Analyst | view | none | none | edit | edit |

> Dashboard is visible to all roles (it's the shared home screen). Maintenance follows the same permission as Fleet (Fleet Manager edits, others view or none per their Fleet column). Settings is Fleet-Manager-only (admin action). **Confirm this inference with the team at the 0:20 sync** — the mockup doesn't spell out Dashboard/Maintenance/Settings explicitly, this is the most reasonable read of it.

### Definition of done
- 5 wrong-password attempts on the same account returns the locked message and blocks a 6th attempt even with the correct password
- Logging in as each of the 4 roles returns a token that `requirePermission` correctly allows/blocks against

---

## 4. Screen 2 — Vehicle Registry

### Exact UI spec
- Filters row: **Type: All** dropdown, **Status: All** dropdown, **Search reg no...** text box
- **+ Add Vehicle** button (top right, amber)
- Table columns: Reg. No. (unique) · Name/Model · Type · Capacity · Odometer · Acq. Cost · Status
- Status badge colors: **Available = green, On Trip = blue, In Shop = orange, Retired = red**
- Footer rule text (render it, it reads well in a demo): *"Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher"*

### Endpoints
```
GET  /api/vehicles?type=&status=&search=
POST /api/vehicles          { regNumber, name, type, capacityKg, odometer, acquisitionCost, region }
PATCH /api/vehicles/:id     (edit fields; status changes here should be rare — status is normally driven by Trips/Maintenance actions owned by B and C)
```

- Enforce `reg_number` UNIQUE at the DB level (already in the DDL above) — return a clean 409 error, don't let a raw MySQL duplicate-key error leak to the frontend.
- Seed 4–6 vehicles matching the mockup's exact look (`VAN-05`, `TRUCK-11`, `MINI-03`, `VAN-09` with statuses Available/On Trip/In Shop/Retired) — B needs real "Available" vehicles to build Trip Dispatcher against by hour 1.

### Definition of done
- `GET /api/vehicles?status=Available` returns only Available vehicles — this exact query is what B's Trip Dispatcher dropdown calls
- Duplicate reg number attempt is rejected with a readable error, not a 500

---

## 5. Screen 8 — Settings & RBAC

### Exact UI spec
- Left card "General": Depot Name, Currency, Distance Unit fields + "Save changes" button
- Right card "Role-Based Access (RBAC)": read-only table rendering the exact matrix from section 3 above (✓ / view / —)

### Endpoints
```
GET   /api/settings
PATCH /api/settings   { depotName, currency, distanceUnit }
GET   /api/settings/rbac   → returns the permission map as JSON (frontend just renders it as a table)
```

Keep the RBAC table **read-only display** — don't build an editable permission UI, it's not worth the time and isn't asked for.

---

## 6. Integration & Commit Timeline

> Timestamps are relative (**T+0:00 = whenever your team starts this sync right now**). Map T+0:00 to your actual clock and everyone follows the same relative schedule. Adjust proportionally if you have more/less than ~4 hours left.

| Time | Everyone | Your specific job |
|---|---|---|
| T+0:00–0:20 | All 4: lock schema, API contract, Tailwind color tokens (green/blue/orange/gray/red per status) | Merge full `schema.prisma`/`schema.sql` (all 8 tables) and push to `main`. Push a working `/api/auth/login` stub even if unfinished. **Commit #1.** |
| T+0:20–1:00 | Solo build | Finish auth + lockout logic + RBAC middleware. **Commit #2 at T+1:00**, push branch. |
| T+1:00–1:40 | Solo build | Vehicle Registry CRUD + seed data. **Commit #3 at T+1:40.** |
| T+1:40–2:00 | Solo build | Settings screen + login/settings frontend polish. **Commit #4 at T+2:00.** |
| T+2:00–2:15 | **Checkpoint 1** — sync, unblock whoever's stuck | Confirm B and C's dropdowns are correctly pulling `Available` vehicles/drivers from your API |
| T+2:15–2:30 | Start real integration | Merge your branch into `main` first — you're the base everyone else's routes mount on |
| T+2:30–4:00 | **Integration & push window (1.5 hrs)** | 2:30–2:50: help D wire RBAC into the frontend route guards. 2:50–3:30: full-team run of the 9-step workflow live, fix anything in auth/vehicles/settings as it surfaces. 3:30–3:50: polish (error states, lockout banner, status badge colors exact). 3:50–4:00: final commit + push. |

---

## 7. How this module helps you stand out (500+ teams are on this same brief)

- Most teams will skip the 5-attempts lockout entirely, or fake it. Implementing it for real (with `locked_until` actually enforced server-side) is a small, visible detail judges notice when they poke at the demo.
- Match the dark-sidebar login and the amber accent color exactly — a distinctive, on-brand login screen reads as "finished product" in the first 5 seconds of a demo, before a judge has read a single feature.
- Render the RBAC matrix as an actual table on the Settings screen instead of just enforcing it silently in code — it's proof to judges that RBAC isn't just a login dropdown, it's a real permission system.