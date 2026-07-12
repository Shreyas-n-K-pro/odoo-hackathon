# Team Member 4 - Analytics, Exports, Bonus Features, QA, and Presentation

## Mission
Own the judge-facing polish: reports, charts, CSV/PDF export, reminders, document management, QA evidence, seed demo flow, and final presentation narrative.

Your job is to turn working features into a convincing product story.

## Recommended Tech Stack
- Charts: Recharts
- CSV export: backend `json2csv` or frontend Blob export
- PDF export: pdfmake or jsPDF
- Email reminders: Nodemailer with Ethereal, Mailtrap, or logged dev emails
- File upload bonus: local `uploads/` folder with metadata stored in PostgreSQL
- Tests: Vitest/Jest, Supertest, Playwright smoke tests if time permits
- API docs: Postman or Thunder Client collection

## Branch
Use:

```bash
git checkout -b feature/analytics-qa-presentation
```

## Reports and Analytics
Route: `/analytics`

Match the rough design:
- KPI cards at top
- Monthly revenue bar chart
- Top costliest vehicles horizontal bars

### KPI Formulas

Fuel Efficiency:

```text
fuelEfficiency = completedTripDistanceKm / fuelLiters
```

Fleet Utilization:

```text
fleetUtilizationPercent = vehiclesOnTrip / nonRetiredVehicles * 100
```

Operational Cost:

```text
operationalCost = fuelCost + maintenanceCost + otherExpenses
```

Vehicle ROI:

```text
vehicleRoiPercent = (revenue - (maintenanceCost + fuelCost + otherExpenses)) / acquisitionCost * 100
```

Top Costliest Vehicles:

```text
sum(fuel + maintenance + expenses) grouped by vehicle
```

Monthly Revenue:

```text
sum(trip.revenue) grouped by month for completed trips
```

## API Routes to Integrate
Coordinate with Team Member 1.

- `GET /analytics/summary`
- `GET /analytics/monthly-revenue`
- `GET /analytics/top-cost-vehicles`
- `GET /analytics/fuel-efficiency`
- `GET /exports/trips.csv`
- `GET /exports/vehicles.csv`
- `GET /exports/analytics.pdf`

## Fuel and Expense Management
Route: `/fuel-expenses`

Match the rough design:
- Fuel logs table:
  - Vehicle
  - Date
  - Liters
  - Fuel cost
- Other expenses table:
  - Trip
  - Vehicle
  - Toll
  - Other
  - Maintenance linked
  - Total
- Total operational cost row

Forms:
- Log Fuel
- Add Expense

Validation:
- Liters must be positive.
- Cost must be positive.
- Expense must be linked to either vehicle or trip.
- Dates cannot be invalid.

## Bonus Features to Add
Pick these in priority order.

### 1. CSV Export
Mandatory from the PDF. Add export buttons on:
- Fleet
- Drivers
- Trips
- Analytics

Make sure exported CSV uses real PostgreSQL data.

### 2. PDF Export
Bonus from the PDF, but highly visible in demo.

Create `Analytics Report` PDF containing:
- Date range
- KPI cards as text/table
- Top costliest vehicles
- Fuel efficiency
- Operational cost
- Vehicle ROI

### 3. Email Reminders for Expiring Licenses
Bonus from the PDF.

Implement a simple reminder job:
- Find drivers whose license expires in the next 30 days.
- Send or log an email reminder.
- Show reminders in dashboard as alerts.

For demo without real email:
- Use Ethereal or log emails to console.
- Show a `reminders` table or dashboard alert.

### 4. Vehicle Document Management
Bonus from the PDF.

Add document upload for:
- RC book
- Insurance
- Pollution certificate
- Permit

Store file metadata:
- vehicleId
- documentType
- fileName
- filePath
- expiryDate

For 8 hours, local storage is enough.

### 5. Dark Mode
Bonus from the PDF.

Add a simple theme toggle:
- Store preference in localStorage.
- Make sure tables and badges remain readable.

## QA Plan
Create a short `QA_CHECKLIST.md` if time allows, or include these in README.

### Must-Test Scenarios
- Duplicate vehicle registration is rejected.
- Retired vehicle does not appear in dispatch selector.
- In Shop vehicle does not appear in dispatch selector.
- Suspended driver cannot be dispatched.
- Expired license driver cannot be dispatched.
- On Trip driver cannot be assigned again.
- Cargo above capacity is blocked.
- Dispatch updates vehicle and driver to On Trip.
- Complete trip updates vehicle and driver to Available.
- Maintenance active updates vehicle to In Shop.
- Maintenance close restores vehicle to Available.
- Dashboard KPIs change after trip and maintenance events.
- CSV export downloads data.
- Analytics formulas match database data.

### Demo Seed Data
Make sure the database has:
- Van-05, 500 kg, Available
- Truck-11, 5 ton, Available
- Mini-03, In Shop
- Alex, valid license, Available, safety score 96
- John, Suspended
- Priya, valid license, On Trip
- One completed trip with fuel log
- One active maintenance record
- A few expenses

## Security and Performance Checklist
- `.env` is not committed.
- Passwords are hashed.
- JWT secret comes from env.
- Backend validates every write request.
- RBAC blocks unauthorized access server-side.
- List APIs have pagination.
- Database has unique indexes for vehicle registration and driver license.
- Search and filters are done through database queries, not frontend-only filtering.
- Error messages are clear but do not leak sensitive details.

## Presentation Structure
Keep it short and confident.

### Speaker Split
All 4 teammates should present.

Team Member 1:
- Database schema
- Auth and RBAC
- Backend validation

Team Member 2:
- UI walkthrough
- Role-based navigation
- Dashboard and CRUD screens

Team Member 3:
- Dispatch lifecycle
- Maintenance automation
- Smart Dispatch Score

Team Member 4:
- Analytics
- Exports and reminders
- QA and scalability

### 5-Minute Demo Flow
1. Login as Dispatcher.
2. Show dashboard KPIs from database.
3. Open Fleet and show Van-05 capacity 500 kg.
4. Open Drivers and show Alex valid, John suspended.
5. Try creating trip with 700 kg cargo and show validation block.
6. Use Smart Dispatch Score for 450 kg cargo.
7. Dispatch trip and show vehicle/driver status update.
8. Complete trip with fuel consumed.
9. Open Analytics and show operational cost and fuel efficiency changed.
10. Export CSV or PDF report.

## Acceptance Checklist
- Analytics page uses real API data.
- All formulas are implemented and explainable.
- Fuel and expense forms save to PostgreSQL.
- CSV export works.
- PDF export works if time permits.
- Email reminder demo works or logs reminder output.
- Vehicle document metadata can be added if time permits.
- QA checklist is completed before final presentation.
- Presentation is split across all team members.

