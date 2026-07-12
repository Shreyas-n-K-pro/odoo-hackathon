# Team Member 1 - Backend, Database, Auth, and RBAC

## Mission
Own the foundation of TransitOps: local PostgreSQL database, secure authentication, role-based access control, core REST APIs, validation, seed data, and reliable business-rule enforcement.

Your work is the backbone for every other teammate. Keep APIs clean, predictable, and demo-ready.

## Recommended Tech Stack
- Backend: Node.js, TypeScript, Express or Fastify
- ORM: Prisma
- Database: PostgreSQL running locally with Docker Compose
- Validation: Zod request schemas
- Auth: JWT access token, bcrypt password hashing
- RBAC: middleware-based route permissions
- Realtime: Socket.IO server events after key data changes
- API docs: Swagger/OpenAPI or a simple Postman collection
- Tests: Vitest or Jest with Supertest

## Why This Stack Wins
- PostgreSQL satisfies the hackathon preference for local SQL databases.
- Prisma gives fast schema design, migrations, seed data, and type-safe queries.
- Zod gives clear input validation and friendly error messages.
- JWT plus RBAC proves security and role separation.
- Socket.IO helps show dynamic data instead of static JSON.

## Branch
Use:

```bash
git checkout -b feature/backend-db-auth
```

## Database Entities
Create Prisma models for these entities.

### User
- id
- name
- email, unique
- passwordHash
- role: `FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`
- failedLoginAttempts
- lockedUntil
- createdAt
- updatedAt

### Vehicle
- id
- registrationNumber, unique
- nameModel
- type: `VAN`, `TRUCK`, `MINI`, `BUS`, `OTHER`
- maxLoadKg
- odometerKm
- acquisitionCost
- region
- status: `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`
- documentUrl, optional bonus field
- createdAt
- updatedAt

### Driver
- id
- name
- licenseNumber, unique
- licenseCategory
- licenseExpiryDate
- contactNumber
- safetyScore
- status: `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`
- createdAt
- updatedAt

### Trip
- id
- tripCode, unique
- source
- destination
- vehicleId
- driverId
- cargoWeightKg
- plannedDistanceKm
- finalOdometerKm, optional
- fuelConsumedLiters, optional
- revenue, optional
- status: `DRAFT`, `DISPATCHED`, `COMPLETED`, `CANCELLED`
- dispatchedAt
- completedAt
- cancelledAt
- createdByUserId
- createdAt
- updatedAt

### MaintenanceLog
- id
- vehicleId
- serviceType
- cost
- startDate
- endDate, optional
- status: `ACTIVE`, `COMPLETED`
- notes
- createdAt
- updatedAt

### FuelLog
- id
- vehicleId
- tripId, optional
- liters
- cost
- logDate
- odometerKm, optional
- createdAt

### Expense
- id
- vehicleId, optional
- tripId, optional
- category: `TOLL`, `MAINTENANCE`, `MISC`, `PARKING`, `OTHER`
- amount
- expenseDate
- notes
- createdAt

### AuditLog
- id
- actorUserId
- action
- entityType
- entityId
- metadataJson
- createdAt

## Core API Routes
Use `/api` as the base path.

### Auth
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Login rules:
- Validate email and password.
- Hash passwords with bcrypt.
- Lock account after 5 failed attempts.
- Return clear error: `Invalid credentials` or `Account locked until <time>`.
- Include role in the login response.

### Dashboard
- `GET /dashboard/summary?vehicleType=&status=&region=`
- Return:
  - activeVehicles
  - availableVehicles
  - vehiclesInMaintenance
  - activeTrips
  - pendingTrips
  - driversOnDuty
  - fleetUtilizationPercent
  - recentTrips
  - vehicleStatusBreakdown

### Vehicles
- `GET /vehicles?search=&type=&status=&region=&page=&limit=`
- `GET /vehicles/:id`
- `POST /vehicles`
- `PATCH /vehicles/:id`
- `DELETE /vehicles/:id` or soft-retire with status `RETIRED`

Validation:
- Registration number must be unique.
- maxLoadKg, odometerKm, and acquisitionCost must be positive.
- Retired and In Shop vehicles must not appear in dispatch availability APIs.

### Drivers
- `GET /drivers?search=&status=&licenseCategory=&page=&limit=`
- `GET /drivers/:id`
- `POST /drivers`
- `PATCH /drivers/:id`
- `DELETE /drivers/:id` or set inactive if you add an inactive state

Validation:
- License number must be unique.
- Safety score should be 0 to 100.
- Suspended or expired-license drivers must not appear in dispatch availability APIs.

### Availability
These endpoints help Team Member 3 build trip dispatch quickly.

- `GET /dispatch/available-vehicles?cargoWeightKg=&type=&region=`
- `GET /dispatch/available-drivers?licenseCategory=`

### Settings and RBAC
- `GET /settings/rbac`
- `PATCH /settings/company`

RBAC matrix:

| Role | Fleet | Drivers | Trips | Maintenance | Fuel/Expenses | Analytics | Settings |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Fleet Manager | full | view | view | full | view | full | view |
| Dispatcher | view | view | full | view | none | view | none |
| Safety Officer | none | full | view | none | none | view | none |
| Financial Analyst | view | none | view | none | full | full | none |

## Business Rules to Enforce Server-Side
Do not trust only frontend disabling. Enforce these in backend services, preferably inside database transactions.

- Vehicle registration number must be unique.
- Retired or In Shop vehicles must never be assignable to a trip.
- Drivers with expired licenses or Suspended status cannot be assigned.
- A driver or vehicle already On Trip cannot be assigned to another trip.
- Cargo weight must be less than or equal to vehicle max load capacity.
- Dispatching a trip sets vehicle and driver to `ON_TRIP`.
- Completing a trip sets vehicle and driver back to `AVAILABLE`.
- Cancelling a dispatched trip restores vehicle and driver to `AVAILABLE`.
- Creating active maintenance sets vehicle to `IN_SHOP`.
- Closing maintenance restores vehicle to `AVAILABLE`, unless the vehicle is retired.

## Realtime Events
Emit these events after successful writes:

- `dashboard.updated`
- `vehicle.updated`
- `driver.updated`
- `trip.updated`
- `maintenance.updated`
- `expense.updated`

Payload should include changed entity id, status, and updated KPI summary when possible.

## Seed Data
Create a seed script with:

- Users for all 4 roles
- Vehicle `Van-05`, capacity 500 kg, status Available
- Vehicle `Truck-11`, capacity 5000 kg
- Driver `Alex`, valid license, Available
- Driver `John`, Suspended
- Driver `Priya`, On Trip
- Sample trips, fuel logs, maintenance logs, and expenses

Seed credentials should be written in the project README for the demo.

## Acceptance Checklist
- Backend starts with one command.
- PostgreSQL starts locally through Docker Compose.
- Prisma migration and seed work from scratch.
- Login works for all 4 roles.
- Locked account behavior works after 5 failed attempts.
- Vehicle and driver CRUD are connected to PostgreSQL.
- Server returns clear validation errors.
- Dispatch availability endpoints exclude invalid vehicles/drivers.
- RBAC blocks unauthorized role access.
- Socket.IO emits updates after mutations.
- At least 5 API tests pass for auth, vehicle uniqueness, driver expiry, dispatch capacity, and maintenance status transition.

## Demo Proof Points
In the presentation, show:

1. PostgreSQL tables and Prisma schema.
2. Login as Dispatcher.
3. Try duplicate vehicle registration and show validation.
4. Try assigning overloaded cargo and show blocked dispatch.
5. Show status transitions updating in the database.

