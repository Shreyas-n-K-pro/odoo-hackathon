# Team Member 2 - Frontend UI, Dashboard, Navigation, and RBAC Experience

## Mission
Own the user-facing TransitOps experience. Recreate the rough Excalidraw design as a clean, interactive, responsive web app with role-aware navigation, polished tables, forms, filters, and clear validation feedback.

Use the sketches as the visual source:
- Auth screen: split dark brand panel and white login form
- Dashboard: left sidebar, top search, KPI cards, recent trips, vehicle status bars
- Fleet: searchable/filterable vehicle registry
- Drivers: safety profile table and status controls
- Settings: general settings and RBAC matrix

## Recommended Tech Stack
- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- UI primitives: Radix UI or shadcn/ui
- Icons: Lucide React
- Routing: React Router
- Server state: TanStack Query
- Forms: React Hook Form with Zod resolver
- Charts: Recharts
- Realtime: Socket.IO client
- Tables: TanStack Table or lightweight custom tables

## Why This Stack Wins
- Vite and React are fast for an 8-hour hackathon.
- Tailwind helps match the sketch quickly with consistent spacing and colors.
- TanStack Query makes real backend data feel responsive.
- React Hook Form plus Zod gives strong form validation.
- Socket.IO client proves the app updates dynamically.

## Branch
Use:

```bash
git checkout -b feature/frontend-ui-rbac
```

## Visual Direction
Keep the design close to the sketches, but make it production-clean.

### Color Tokens
- Primary action: amber/orange, close to `#f2a900`
- Primary blue: `#2f7ac8`
- Success green: `#2da44e`
- Warning orange: `#f08a00`
- Danger red: `#dc3545`
- Sidebar background: `#f1f4f7`
- Login left panel: dark charcoal `#182026`
- Text: near black `#1f2933`

### Layout Rules
- Left sidebar fixed on desktop.
- Top bar with search, logged-in user name, role pill, and avatar initials.
- Main content uses compact operational spacing, not a marketing layout.
- Tables should be easy to scan.
- Status should use colored badges.
- Use cards only for KPIs, repeated records, and forms.
- Keep border radius at 8px or less.

## Screens to Build

### 1. Auth and Login
Route: `/login`

Match the rough design:
- Left dark brand area with TransitOps name and role list.
- Right login form with email, password, role selector, remember me, forgot password.
- Error state:
  - Invalid credentials
  - Account locked after 5 failed attempts
- On success, route user to dashboard.

Frontend validation:
- Email required and valid.
- Password required.
- Role required.

### 2. App Shell
Routes are protected behind auth.

Sidebar items:
- Dashboard
- Fleet
- Drivers
- Trips
- Maintenance
- Fuel & Expenses
- Analytics
- Settings

Role-aware menu:
- Fleet Manager: Dashboard, Fleet, Maintenance, Analytics, Settings view
- Dispatcher: Dashboard, Fleet view, Drivers view, Trips
- Safety Officer: Dashboard, Drivers, Analytics view
- Financial Analyst: Dashboard, Fuel & Expenses, Analytics, Fleet view

Unauthorized access:
- Hide sidebar item.
- Also show a clean `403 Access denied` page if user enters route manually.

### 3. Dashboard
Route: `/dashboard`

Components:
- Search input
- Filters: vehicle type, status, region
- KPI cards:
  - Active Vehicles
  - Available Vehicles
  - Vehicles in Maintenance
  - Active Trips
  - Pending Trips
  - Drivers On Duty
  - Fleet Utilization
- Recent Trips table
- Vehicle Status horizontal bars

Realtime:
- Listen for `dashboard.updated`.
- Refetch dashboard summary or update cached values.

### 4. Vehicle Registry
Route: `/fleet`

Components:
- Search by registration number or model
- Filters by type and status
- Add Vehicle button
- Table columns:
  - Registration Number
  - Name/Model
  - Type
  - Capacity
  - Odometer
  - Acquisition Cost
  - Status
  - Actions

Form validation:
- Registration number required
- Capacity must be positive
- Odometer cannot be negative
- Acquisition cost must be positive

Business hint:
- Show note: Retired and In Shop vehicles are hidden from dispatch.

### 5. Driver Profiles
Route: `/drivers`

Components:
- Add Driver button
- Table columns:
  - Driver
  - License Number
  - Category
  - Expiry
  - Contact
  - Trip Completion
  - Safety Score
  - Status
  - Actions
- Quick status toggles: Available, On Trip, Off Duty, Suspended

Validation feedback:
- Expired license should be visually highlighted.
- Suspended and expired drivers should show `Blocked from dispatch`.

### 6. Settings and RBAC
Route: `/settings`

Components:
- General depot settings:
  - Depot name
  - Currency
  - Distance unit
- RBAC matrix:
  - Fleet
  - Drivers
  - Trips
  - Fuel/Expenses
  - Analytics

Keep this page close to the rough design.

## Shared UI Components
Build reusable components:

- `AppShell`
- `Sidebar`
- `Topbar`
- `KpiCard`
- `StatusBadge`
- `DataTable`
- `ConfirmDialog`
- `FormFieldError`
- `RoleGuard`
- `EmptyState`
- `LoadingSkeleton`

## API Integration Contract
Coordinate with Team Member 1.

Use a single API client:

- Attach JWT token automatically.
- Redirect to login on 401.
- Show toast on validation errors.
- Use query keys like:
  - `['dashboard', filters]`
  - `['vehicles', filters]`
  - `['drivers', filters]`

## No Static JSON Rule
Static mock data is allowed only for the first UI pass. Before demo:

- Dashboard must read from `/api/dashboard/summary`.
- Fleet table must read from `/api/vehicles`.
- Drivers table must read from `/api/drivers`.
- Role menu must use the logged-in user from `/api/auth/me`.

## Acceptance Checklist
- Login screen matches the rough design and handles errors.
- App shell has clean navigation and top search.
- Sidebar adapts to role permissions.
- Dashboard KPIs come from real API data.
- Fleet and Drivers pages support search, filters, sorting, add/edit forms, and status badges.
- Form errors are clear and user-friendly.
- Responsive layout works on laptop and mobile widths.
- Socket events update dashboard or trigger refetch.
- No important text overlaps or spills out of controls.

## Demo Proof Points
In the presentation, show:

1. Failed login and lockout warning.
2. Successful role login.
3. Dispatcher sees Trips but not Fuel & Expenses.
4. Fleet Manager sees Fleet and Maintenance.
5. Updating vehicle status changes the dashboard KPI.

