# TransitOps - Smart Transport Operations Platform

TransitOps is an end-to-end transport operations platform for managing vehicles, drivers, dispatch, maintenance, fuel, expenses, and analytics from one secure role-based dashboard.

This project is designed for an 8-hour hackathon. The goal is to showcase strong logic, clean database design, robust APIs, dynamic data, polished UI, and teamwork.

## Problem Statement

Many logistics and transport teams still depend on spreadsheets and manual logbooks. This creates common operational problems:

- Scheduling conflicts
- Underutilized vehicles
- Missed maintenance
- Expired driver licenses
- Inaccurate fuel and expense tracking
- Poor operational visibility

TransitOps solves this by digitizing the complete transport lifecycle:

- Vehicle registration
- Driver and safety profile management
- Trip dispatch
- Automatic status transitions
- Maintenance workflow
- Fuel and expense logging
- Operational reports and analytics
- Role-based access control

## Project Goal

Build a centralized web platform where transport teams can:

- Securely log in based on role
- Manage fleet assets and driver profiles
- Dispatch trips only when business rules pass
- Automatically update vehicle and driver statuses
- Track maintenance, fuel, and expenses
- View real-time KPIs and analytics
- Export operational data for reporting

## Why This Project Can Win

TransitOps directly matches the hackathon judging areas:

- Database Design: normalized PostgreSQL schema with relationships, constraints, and indexes
- Backend APIs: modular REST APIs with validation and RBAC
- Local Database: PostgreSQL, not Firebase/Supabase/BaaS
- Dynamic Data: real API-driven UI with realtime Socket.IO updates
- Input Validation: clear errors for invalid dispatch, duplicate registration, expired licenses, and overloaded cargo
- UI Quality: clean operational dashboard based on the rough Excalidraw screens
- Logic: strict business rules implemented server-side
- Scalability: service-based architecture, pagination, indexes, and role permissions
- Security: hashed passwords, JWT, RBAC, account lockout, environment secrets
- Teamwork: four clear workstreams with Git branches and ownership

## Core Users

### Fleet Manager

Owns vehicle registry, maintenance workflow, fleet lifecycle, and utilization.

### Dispatcher

Creates trips, assigns available vehicles and drivers, and monitors active trips.

### Safety Officer

Manages driver compliance, license validity, safety scores, and driver status.

### Financial Analyst

Tracks fuel, expenses, maintenance cost, operational cost, revenue, and ROI.

## Recommended Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui or Radix UI
- Lucide React icons
- React Router
- TanStack Query
- React Hook Form
- Zod
- Recharts
- Socket.IO client

### Backend

- Node.js
- TypeScript
- Express or Fastify
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Zod validation
- Socket.IO
- Swagger/OpenAPI or Postman collection

### Database and DevOps

- PostgreSQL local database
- Docker Compose
- Prisma migrations
- Prisma seed script
- `.env` configuration

### Testing and Quality

- Vitest or Jest
- Supertest
- Playwright smoke tests if time permits
- ESLint
- Prettier

### Exports and Bonus

- CSV export using `json2csv` or frontend Blob export
- PDF export using pdfmake or jsPDF
- Email reminders using Nodemailer with Ethereal, Mailtrap, or logged dev emails
- Vehicle documents stored locally with metadata in PostgreSQL

## Suggested Monorepo Structure

```text
TransitOps/
  README.md
  docker-compose.yml
  .env.example
  package.json
  apps/
    api/
      src/
        app.ts
        server.ts
        config/
        modules/
          auth/
          dashboard/
          vehicles/
          drivers/
          trips/
          maintenance/
          expenses/
          analytics/
          settings/
        middleware/
        realtime/
        utils/
      prisma/
        schema.prisma
        seed.ts
    web/
      src/
        main.tsx
        app/
        routes/
        components/
        features/
          auth/
          dashboard/
          fleet/
          drivers/
          trips/
          maintenance/
          expenses/
          analytics/
          settings/
        lib/
        styles/
  docs/
    01-backend-database-auth.md
    02-frontend-dashboard-rbac-ui.md
    03-dispatch-maintenance-realtime.md
    04-analytics-exports-qa-presentation.md
```

## Role-Based Access Control

| Role | Fleet | Drivers | Trips | Maintenance | Fuel/Expenses | Analytics | Settings |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fleet Manager | Full | View | View | Full | View | Full | View |
| Dispatcher | View | View | Full | View | None | View | None |
| Safety Officer | None | Full | View | None | None | View | None |
| Financial Analyst | View | None | View | None | Full | Full | None |

RBAC must be enforced in two places:

- Frontend: hide menu items and protect routes
- Backend: block unauthorized API access with middleware

## Functional Modules

### 1. Authentication and RBAC

Required features:

- Secure login using email and password
- JWT access token
- bcrypt password hashing
- Role-based access control
- Only authenticated users can access the app
- Account lockout after 5 failed login attempts
- Friendly login error messages

Login screen design:

- Left dark TransitOps brand panel
- Role list: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
- Right login form
- Email, password, role selector
- Remember me and forgot password UI
- Clear error state for invalid credentials or locked account

### 2. Dashboard

Dashboard KPIs:

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization %

Filters:

- Vehicle type
- Status
- Region

Dashboard widgets:

- KPI cards
- Recent trips table
- Vehicle status bars
- Live updates after dispatch, maintenance, and expense changes

### 3. Vehicle Registry

Vehicle fields:

- Registration Number, unique
- Vehicle Name/Model
- Type
- Maximum Load Capacity
- Odometer
- Acquisition Cost
- Region
- Status
- Optional document metadata

Vehicle statuses:

- Available
- On Trip
- In Shop
- Retired

Required features:

- Create vehicle
- View vehicle list
- Edit vehicle
- Retire vehicle
- Search by registration or model
- Filter by type, status, and region
- Sort table columns

Validation:

- Registration number is required and unique
- Capacity must be positive
- Odometer cannot be negative
- Acquisition cost must be positive
- Retired and In Shop vehicles cannot appear in dispatch selection

### 4. Driver Management

Driver fields:

- Name
- License Number, unique
- License Category
- License Expiry Date
- Contact Number
- Safety Score
- Status

Driver statuses:

- Available
- On Trip
- Off Duty
- Suspended

Required features:

- Add driver
- Edit driver
- View driver table
- Search and filter drivers
- Highlight expired licenses
- Show safety score
- Quick status updates

Validation:

- License number is required and unique
- Contact number is required
- Safety score must be between 0 and 100
- Suspended drivers cannot be assigned
- Expired license drivers cannot be assigned
- On Trip drivers cannot be assigned to another trip

### 5. Trip Dispatch

Trip fields:

- Trip Code
- Source
- Destination
- Vehicle
- Driver
- Cargo Weight
- Planned Distance
- Revenue
- Final Odometer
- Fuel Consumed
- Status

Trip lifecycle:

```text
Draft -> Dispatched -> Completed
Draft -> Cancelled
Dispatched -> Cancelled
```

Required features:

- Create trip draft
- Select only available vehicles
- Select only available drivers
- Validate cargo weight against vehicle capacity
- Dispatch trip
- Complete trip
- Cancel trip
- Show live trip board
- Update statuses automatically

Dispatch rules:

- Vehicle must be Available
- Vehicle cannot be In Shop
- Vehicle cannot be Retired
- Driver must be Available
- Driver cannot be Suspended
- Driver license must not be expired
- Vehicle cannot already be On Trip
- Driver cannot already be On Trip
- Cargo weight must be less than or equal to vehicle capacity

Automatic transitions:

- Dispatching a trip sets vehicle and driver to On Trip
- Completing a trip sets vehicle and driver to Available
- Cancelling a dispatched trip restores vehicle and driver to Available

### 6. Maintenance

Maintenance fields:

- Vehicle
- Service Type
- Cost
- Start Date
- End Date
- Status
- Notes

Maintenance statuses:

- Active
- Completed

Required features:

- Create maintenance record
- Automatically mark vehicle as In Shop
- Remove In Shop vehicle from dispatch pool
- Close maintenance
- Restore vehicle to Available unless Retired
- Add maintenance cost to analytics

Maintenance rules:

- Creating active maintenance changes vehicle status to In Shop
- Closing maintenance changes vehicle status to Available
- Retired vehicles remain Retired
- In Shop vehicles cannot be dispatched

### 7. Fuel and Expense Management

Fuel log fields:

- Vehicle
- Trip, optional
- Liters
- Cost
- Date
- Odometer, optional

Expense fields:

- Vehicle, optional
- Trip, optional
- Category
- Amount
- Date
- Notes

Expense categories:

- Toll
- Maintenance
- Parking
- Misc
- Other

Required features:

- Log fuel
- Add expense
- View fuel logs
- View expense logs
- Compute operational cost
- Link trip completion to fuel log when fuel data is entered

Operational cost formula:

```text
Operational Cost = Fuel Cost + Maintenance Cost + Other Expenses
```

### 8. Reports and Analytics

Analytics KPIs:

- Fuel Efficiency
- Fleet Utilization
- Operational Cost
- Vehicle ROI
- Monthly Revenue
- Top Costliest Vehicles

Fuel efficiency:

```text
Fuel Efficiency = Completed Trip Distance / Fuel Liters
```

Fleet utilization:

```text
Fleet Utilization % = Vehicles On Trip / Non-Retired Vehicles * 100
```

Vehicle ROI:

```text
Vehicle ROI % = (Revenue - (Maintenance + Fuel + Other Expenses)) / Acquisition Cost * 100
```

Required features:

- KPI cards
- Monthly revenue chart
- Top costliest vehicles chart
- CSV export
- Optional PDF export

## Innovative Feature: Smart Dispatch Score

Smart Dispatch Score is the standout innovation for this project.

Instead of only showing vehicle and driver dropdowns, TransitOps recommends the best vehicle-driver pair for a trip. The score is transparent and explainable.

### Inputs

- Source
- Destination
- Cargo weight
- Planned distance
- Available vehicles
- Available drivers
- Vehicle capacity
- Driver safety score
- License validity
- Historical fuel efficiency
- Recent maintenance cost
- Recent workload

### Hard Blocks

A pair is not considered if:

- Vehicle is not Available
- Vehicle is In Shop or Retired
- Driver is not Available
- Driver is Suspended
- Driver license is expired
- Cargo exceeds vehicle capacity

### Scoring Logic

Vehicle score:

- Capacity fit: prefer enough capacity without wasting a huge vehicle
- Fuel efficiency: prefer better km/l
- Cost efficiency: prefer lower cost/km
- Maintenance risk: reduce score if vehicle recently had high maintenance cost
- Availability: only Available vehicles qualify

Driver score:

- Safety score: higher is better
- License validity: required
- Workload balance: prefer fewer recent trips
- Availability: only Available drivers qualify

### Example Output

```text
Recommended: Van-05 + Alex
Confidence: 92%
Reasons:
- Vehicle capacity fits with 50 kg spare capacity
- Driver license is valid
- Driver safety score is 96
- Vehicle has lower recent cost per km
```

### Why Judges Will Like It

- It adds genuine value, not random AI buzzwords
- It uses real database data
- It explains decisions
- It proves business logic
- It helps dispatchers avoid mistakes

## Database Design

### User

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| name | String | User name |
| email | String | Unique |
| passwordHash | String | bcrypt hash |
| role | Enum | RBAC role |
| failedLoginAttempts | Int | Lockout support |
| lockedUntil | DateTime | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Vehicle

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| registrationNumber | String | Unique |
| nameModel | String | Example: Van-05 |
| type | Enum | Van, Truck, Mini, Bus, Other |
| maxLoadKg | Decimal | Capacity |
| odometerKm | Decimal | Current odometer |
| acquisitionCost | Decimal | Purchase cost |
| region | String | Filtering |
| status | Enum | Available, On Trip, In Shop, Retired |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Driver

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| name | String | Driver name |
| licenseNumber | String | Unique |
| licenseCategory | String | LMV, HMV, etc. |
| licenseExpiryDate | DateTime | Compliance |
| contactNumber | String | Contact |
| safetyScore | Int | 0 to 100 |
| status | Enum | Available, On Trip, Off Duty, Suspended |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Trip

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| tripCode | String | Unique |
| source | String | Start location |
| destination | String | End location |
| vehicleId | UUID | Vehicle relation |
| driverId | UUID | Driver relation |
| cargoWeightKg | Decimal | Must fit vehicle |
| plannedDistanceKm | Decimal | Planned distance |
| finalOdometerKm | Decimal | Completion |
| fuelConsumedLiters | Decimal | Optional completion data |
| revenue | Decimal | ROI calculation |
| status | Enum | Draft, Dispatched, Completed, Cancelled |
| dispatchedAt | DateTime | Optional |
| completedAt | DateTime | Optional |
| cancelledAt | DateTime | Optional |
| createdByUserId | UUID | User relation |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### MaintenanceLog

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| vehicleId | UUID | Vehicle relation |
| serviceType | String | Oil change, repair, etc. |
| cost | Decimal | Maintenance cost |
| startDate | DateTime | Start |
| endDate | DateTime | Optional |
| status | Enum | Active, Completed |
| notes | String | Optional |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### FuelLog

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| vehicleId | UUID | Vehicle relation |
| tripId | UUID | Optional |
| liters | Decimal | Fuel quantity |
| cost | Decimal | Fuel cost |
| logDate | DateTime | Date |
| odometerKm | Decimal | Optional |
| createdAt | DateTime | Auto |

### Expense

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| vehicleId | UUID | Optional |
| tripId | UUID | Optional |
| category | Enum | Toll, Maintenance, Misc, Parking, Other |
| amount | Decimal | Expense value |
| expenseDate | DateTime | Date |
| notes | String | Optional |
| createdAt | DateTime | Auto |

### VehicleDocument

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| vehicleId | UUID | Vehicle relation |
| documentType | Enum | RC, Insurance, PUC, Permit |
| fileName | String | Uploaded filename |
| filePath | String | Local path |
| expiryDate | DateTime | Optional |
| createdAt | DateTime | Auto |

### AuditLog

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Primary key |
| actorUserId | UUID | User relation |
| action | String | Action name |
| entityType | String | Vehicle, Driver, Trip, etc. |
| entityId | String | Target id |
| metadataJson | Json | Extra info |
| createdAt | DateTime | Auto |

## API Design

Base path:

```text
/api
```

### Auth APIs

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user |
| POST | `/auth/logout` | Logout |

### Dashboard APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/dashboard/summary` | KPI summary and recent trips |

Supported filters:

- vehicleType
- status
- region

### Vehicle APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/vehicles` | List vehicles |
| GET | `/vehicles/:id` | Vehicle detail |
| POST | `/vehicles` | Create vehicle |
| PATCH | `/vehicles/:id` | Update vehicle |
| DELETE | `/vehicles/:id` | Retire or delete vehicle |

### Driver APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/drivers` | List drivers |
| GET | `/drivers/:id` | Driver detail |
| POST | `/drivers` | Create driver |
| PATCH | `/drivers/:id` | Update driver |
| DELETE | `/drivers/:id` | Delete or deactivate driver |

### Dispatch APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/dispatch/available-vehicles` | Vehicles allowed for dispatch |
| GET | `/dispatch/available-drivers` | Drivers allowed for dispatch |
| POST | `/dispatch/recommendations` | Smart Dispatch Score |

### Trip APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/trips` | List trips |
| GET | `/trips/:id` | Trip detail |
| POST | `/trips` | Create draft trip |
| POST | `/trips/:id/dispatch` | Dispatch trip |
| POST | `/trips/:id/complete` | Complete trip |
| POST | `/trips/:id/cancel` | Cancel trip |

### Maintenance APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/maintenance` | List maintenance logs |
| POST | `/maintenance` | Create maintenance |
| POST | `/maintenance/:id/close` | Close maintenance |

### Fuel and Expense APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/fuel-logs` | List fuel logs |
| POST | `/fuel-logs` | Add fuel log |
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Add expense |

### Analytics APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/analytics/summary` | Analytics KPIs |
| GET | `/analytics/monthly-revenue` | Monthly revenue chart |
| GET | `/analytics/top-cost-vehicles` | Costliest vehicles |
| GET | `/analytics/fuel-efficiency` | Fuel efficiency data |

### Export APIs

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/exports/vehicles.csv` | Export vehicles |
| GET | `/exports/drivers.csv` | Export drivers |
| GET | `/exports/trips.csv` | Export trips |
| GET | `/exports/analytics.pdf` | Export analytics PDF |

## Realtime Events

Use Socket.IO to prove the platform is dynamic.

Events emitted by backend:

- `dashboard.updated`
- `vehicle.updated`
- `driver.updated`
- `trip.updated`
- `maintenance.updated`
- `expense.updated`

Frontend behavior:

- Refetch dashboard when `dashboard.updated` is received
- Update trip board when `trip.updated` is received
- Refresh dispatch dropdowns when vehicle or driver status changes
- Refresh analytics after expenses, fuel logs, or trip completion

## UI Screens

The UI should follow the rough Excalidraw design and stay clean, operational, and easy to scan.

### Auth Screen

- Split layout
- Dark brand panel on left
- Login form on right
- Role selector
- Error state for invalid credentials
- Lockout warning after repeated failed attempts

### Dashboard

- Left sidebar
- Top search
- User role pill and avatar
- Filters
- KPI cards
- Recent trips table
- Vehicle status bars

### Vehicle Registry

- Search and filters
- Add Vehicle button
- Vehicle table
- Status badges
- Rule note: Retired/In Shop vehicles are hidden from dispatch

### Driver Profiles

- Add Driver button
- Driver table
- Safety score
- Expiry warning
- Status toggles
- Rule note: expired or suspended drivers are blocked from dispatch

### Trip Dispatcher

- Trip lifecycle progress
- Create trip form
- Smart Dispatch Score recommendation
- Validation messages
- Live board

### Maintenance

- Service log form
- Service log table
- Automatic status transition note

### Fuel and Expenses

- Fuel logs table
- Expense logs table
- Add fuel and expense buttons
- Operational cost total

### Analytics

- KPI cards
- Monthly revenue chart
- Costliest vehicle chart
- CSV/PDF export

### Settings and RBAC

- Depot settings
- Currency
- Distance unit
- RBAC matrix

## Seed Data for Demo

Create seed data that matches the demo flow.

### Users

| Name | Email | Role |
| --- | --- | --- |
| Fleet Manager | fleet@transitops.in | Fleet Manager |
| Dispatcher | dispatch@transitops.in | Dispatcher |
| Safety Officer | safety@transitops.in | Safety Officer |
| Financial Analyst | finance@transitops.in | Financial Analyst |

Suggested password for demo:

```text
Transit@123
```

### Vehicles

| Registration | Model | Type | Capacity | Odometer | Cost | Status |
| --- | --- | --- | --- | --- | --- | --- |
| GJ01AB4521 | Van-05 | Van | 500 kg | 74000 | 620000 | Available |
| GJ01AB9987 | Truck-11 | Truck | 5000 kg | 182000 | 2450000 | Available |
| GJ01AB1120 | Mini-03 | Mini | 1000 kg | 66000 | 410000 | In Shop |
| GJ01AB0088 | Van-09 | Van | 750 kg | 241900 | 590000 | Retired |

### Drivers

| Name | License | Category | Status | Safety |
| --- | --- | --- | --- | --- |
| Alex | DL-88213 | LMV | Available | 96 |
| John | DL-44120 | HMV | Suspended | 81 |
| Priya | DL-77051 | LMV | On Trip | 99 |
| Suresh | DL-10045 | HMV | Available | 88 |

### Demo Trips

| Trip | Vehicle | Driver | Route | Status |
| --- | --- | --- | --- | --- |
| TR001 | Van-05 | Alex | Gandhinagar Depot to Ahmedabad Hub | Draft |
| TR002 | Truck-11 | Suresh | Vatva Industrial Area to Sanand Warehouse | Completed |
| TR003 | Mini-03 | Priya | Mansa to Kalol Depot | Dispatched |

## Mandatory Business Rules

These must be implemented server-side and mirrored in the frontend for immediate feedback.

- Vehicle registration number must be unique
- Retired vehicles cannot be assigned to trips
- In Shop vehicles cannot be assigned to trips
- Suspended drivers cannot be assigned to trips
- Drivers with expired licenses cannot be assigned to trips
- A vehicle already On Trip cannot be assigned again
- A driver already On Trip cannot be assigned again
- Cargo weight must not exceed max vehicle capacity
- Dispatching a trip changes vehicle and driver to On Trip
- Completing a trip changes vehicle and driver to Available
- Cancelling a dispatched trip restores vehicle and driver to Available
- Creating active maintenance changes vehicle to In Shop
- Closing maintenance restores vehicle to Available unless Retired

## Validation Examples

### Duplicate Registration

```json
{
  "message": "Vehicle registration number already exists",
  "field": "registrationNumber"
}
```

### Overloaded Cargo

```json
{
  "message": "Capacity exceeded by 200 kg - dispatch blocked",
  "field": "cargoWeightKg"
}
```

### Expired License

```json
{
  "message": "Driver license expired - dispatch blocked",
  "field": "driverId"
}
```

### Vehicle in Maintenance

```json
{
  "message": "Vehicle is in maintenance - dispatch blocked",
  "field": "vehicleId"
}
```

## Setup Instructions

### 1. Initialize Git

```bash
git init
```

### 2. Install Dependencies

From the project root:

```bash
npm install
```

### 3. Create Environment File

Create `.env` from `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transitops"
JWT_SECRET="replace-with-a-secure-secret"
JWT_EXPIRES_IN="1d"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Run Prisma Migration and Seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 6. Start Backend

```bash
npm run dev:api
```

### 7. Start Frontend

```bash
npm run dev:web
```

## Git Workflow

Each teammate should work on a separate branch.

| Member | Branch | Ownership |
| --- | --- | --- |
| Member 1 | `feature/backend-db-auth` | Database, auth, RBAC, APIs |
| Member 2 | `feature/frontend-ui-rbac` | UI, dashboard, navigation |
| Member 3 | `feature/dispatch-maintenance-realtime` | Trips, maintenance, realtime |
| Member 4 | `feature/analytics-qa-presentation` | Analytics, exports, QA, demo |

Recommended commands:

```bash
git checkout -b feature/backend-db-auth
git add .
git commit -m "Add backend database auth foundation"
```

Merge frequently to avoid last-minute conflicts.

## 8-Hour Hackathon Execution Plan

### Hour 0 to 1: Foundation

- Initialize repo
- Create Vite frontend
- Create Node backend
- Set up PostgreSQL and Prisma
- Create schema and seed data
- Add basic app shell

### Hour 1 to 2: Auth and Core Layout

- Login API
- JWT auth
- RBAC middleware
- Login screen
- Role-based sidebar
- Dashboard skeleton

### Hour 2 to 4: CRUD and Business Data

- Vehicle CRUD
- Driver CRUD
- Dashboard summary API
- Search and filters
- Basic validation

### Hour 4 to 6: Dispatch and Maintenance Logic

- Trip creation
- Dispatch validation
- Status transitions
- Maintenance workflow
- Smart Dispatch Score
- Socket.IO events

### Hour 6 to 7: Analytics and Exports

- Fuel logs
- Expenses
- Analytics formulas
- Charts
- CSV export
- Optional PDF export

### Hour 7 to 8: QA and Presentation

- Test critical rules
- Fix UI polish
- Seed demo data
- Rehearse presentation
- Ensure every teammate speaks

## Team Work Files

Detailed teammate plans are available here:

- [Team Member 1 - Backend, Database, Auth, and RBAC](docs/01-backend-database-auth.md)
- [Team Member 2 - Frontend UI, Dashboard, Navigation, and RBAC Experience](docs/02-frontend-dashboard-rbac-ui.md)
- [Team Member 3 - Trip Dispatch, Maintenance Workflow, and Realtime Logic](docs/03-dispatch-maintenance-realtime.md)
- [Team Member 4 - Analytics, Exports, Bonus Features, QA, and Presentation](docs/04-analytics-exports-qa-presentation.md)

## Demo Flow

Use this story during judging:

1. Login as Dispatcher.
2. Show dashboard KPIs loaded from PostgreSQL.
3. Open Fleet and show `Van-05` with 500 kg capacity.
4. Open Drivers and show Alex as Available and John as Suspended.
5. Create a trip with 700 kg cargo for Van-05.
6. Show validation: capacity exceeded and dispatch blocked.
7. Change cargo to 450 kg.
8. Use Smart Dispatch Score to recommend Van-05 and Alex.
9. Dispatch the trip.
10. Show Van-05 and Alex automatically become On Trip.
11. Complete the trip with final odometer and fuel consumed.
12. Show Van-05 and Alex return to Available.
13. Create Oil Change maintenance for Van-05.
14. Show Van-05 becomes In Shop and disappears from dispatch.
15. Open Analytics and show fuel efficiency, cost, and ROI updates.
16. Export CSV or PDF report.

## Presentation Split

### Speaker 1: Backend and Database

- PostgreSQL schema
- Prisma models
- Auth and RBAC
- Server-side validation

### Speaker 2: Frontend and UX

- Login screen
- Role-based navigation
- Dashboard
- Vehicle and driver screens

### Speaker 3: Dispatch Logic

- Trip lifecycle
- Business rule validation
- Maintenance automation
- Smart Dispatch Score

### Speaker 4: Analytics and Quality

- Fuel and expenses
- Analytics formulas
- CSV/PDF export
- QA checklist and scalability

## QA Checklist

Before final submission, verify:

- Login works for all roles
- Invalid login shows error
- Account lockout works after 5 failed attempts
- Role-based sidebar works
- Unauthorized API access is blocked
- Duplicate vehicle registration is rejected
- Vehicle CRUD persists to PostgreSQL
- Driver CRUD persists to PostgreSQL
- Expired license driver cannot be dispatched
- Suspended driver cannot be dispatched
- In Shop vehicle cannot be dispatched
- Retired vehicle cannot be dispatched
- On Trip vehicle cannot be assigned again
- On Trip driver cannot be assigned again
- Over-capacity cargo is blocked
- Dispatch changes vehicle and driver to On Trip
- Completion changes vehicle and driver to Available
- Cancel restores vehicle and driver when needed
- Maintenance changes vehicle to In Shop
- Closing maintenance restores vehicle to Available
- Dashboard KPIs update after changes
- Analytics formulas show correct values
- CSV export works
- PDF export works if implemented
- UI is responsive
- Forms show clear validation errors

## Security Checklist

- Passwords are hashed with bcrypt
- JWT secret is stored in `.env`
- `.env` is not committed
- Backend validates all writes
- RBAC is enforced server-side
- Pagination is used for list endpoints
- Unique indexes exist for registration number and license number
- Errors are clear but do not leak sensitive internals
- File uploads are restricted by file type and size if document upload is implemented

## Performance and Scalability Notes

- Use database filters instead of frontend-only filtering
- Add indexes on:
  - vehicle registration number
  - vehicle status
  - driver license number
  - driver status
  - trip status
  - maintenance status
- Use pagination for large tables
- Keep analytics queries grouped in the database
- Use transactions for dispatch and maintenance transitions
- Emit realtime events only after successful database commits

## Bonus Feature Priority

If time is limited, implement bonus features in this order:

1. Smart Dispatch Score
2. CSV export
3. Email reminders for expiring licenses
4. PDF analytics report
5. Vehicle document management
6. Dark mode

## Final Submission Checklist

- Working frontend
- Working backend
- PostgreSQL database
- Seed data
- Login credentials documented
- CRUD for vehicles and drivers
- Trip dispatch with validation
- Maintenance workflow
- Fuel and expense tracking
- Dashboard KPIs
- Analytics charts
- CSV export
- At least one bonus feature
- Clean UI
- Clear README
- Team presentation prepared

## One-Line Pitch

TransitOps is a real-time transport operations platform that prevents dispatch mistakes, automates fleet status changes, tracks cost and compliance, and gives managers the analytics needed to run a smarter fleet.

