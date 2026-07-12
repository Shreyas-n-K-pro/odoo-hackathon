# Team Member 3 - Trip Dispatch, Maintenance Workflow, and Realtime Logic

## Mission
Own the operational heart of TransitOps: trip creation, dispatch validation, lifecycle transitions, maintenance status automation, realtime updates, and the innovative Smart Dispatch Score.

This is the feature judges will remember because it proves logic, dynamic data, and real workflow control.

## Recommended Tech Stack
- Backend: TypeScript service layer using the API from Team Member 1
- Frontend: React forms and live boards from Team Member 2
- Validation: Zod on backend and frontend
- Realtime: Socket.IO
- Database safety: Prisma transactions
- Optional helper: small rule-engine module for dispatch scoring

## Branch
Use:

```bash
git checkout -b feature/dispatch-maintenance-realtime
```

## Screens to Build

### Trip Dispatcher
Route: `/trips`

Match the rough design:
- Trip lifecycle progress: Draft, Dispatched, Completed, Cancelled
- Create trip form:
  - Source
  - Destination
  - Vehicle, available only
  - Driver, available only
  - Cargo weight in kg
  - Planned distance in km
  - Optional revenue
- Live board on the right:
  - Trip code
  - Source to destination
  - Vehicle and driver
  - Status badge
  - ETA or current note

### Maintenance
Route: `/maintenance`

Match the rough design:
- Log service record form:
  - Vehicle
  - Service type
  - Cost
  - Date
  - Status
  - Notes
- Service log table:
  - Vehicle
  - Service
  - Cost
  - Status
- Visual rule note:
  - Available -> In Shop when maintenance starts
  - In Shop -> Available when maintenance closes

## API Routes to Implement or Integrate
Coordinate with Team Member 1.

### Trips
- `GET /trips?status=&vehicleId=&driverId=`
- `POST /trips`
- `POST /trips/:id/dispatch`
- `POST /trips/:id/complete`
- `POST /trips/:id/cancel`

### Maintenance
- `GET /maintenance`
- `POST /maintenance`
- `POST /maintenance/:id/close`

### Smart Dispatch
- `POST /dispatch/recommendations`

Input:

```json
{
  "source": "Gandhinagar Depot",
  "destination": "Ahmedabad Hub",
  "cargoWeightKg": 450,
  "plannedDistanceKm": 38
}
```

Output:

```json
{
  "recommendedVehicleId": "vehicle-id",
  "recommendedDriverId": "driver-id",
  "score": 92,
  "reasons": [
    "Vehicle capacity fits with 50 kg spare capacity",
    "Driver license is valid",
    "Driver safety score is 96",
    "Vehicle has lower recent cost per km"
  ],
  "warnings": []
}
```

## Mandatory Business Rules
Implement server-side and mirror on frontend for instant feedback.

### Dispatch Validation
Block dispatch if:
- Vehicle status is not `AVAILABLE`.
- Vehicle status is `IN_SHOP` or `RETIRED`.
- Driver status is not `AVAILABLE`.
- Driver status is `SUSPENDED`.
- Driver license expiry date is before today.
- Vehicle or driver is already assigned to a dispatched trip.
- Cargo weight is greater than vehicle max load capacity.

Frontend should show clear messages:
- `Capacity exceeded by 200 kg - dispatch blocked`
- `Driver license expired - dispatch blocked`
- `Vehicle is in maintenance - dispatch blocked`

### Trip Status Transitions
Use Prisma transactions.

Draft to Dispatched:
- Set trip status to `DISPATCHED`.
- Set vehicle status to `ON_TRIP`.
- Set driver status to `ON_TRIP`.
- Emit `trip.updated`, `vehicle.updated`, `driver.updated`, `dashboard.updated`.

Dispatched to Completed:
- Require final odometer.
- Optional: require fuel consumed or allow fuel log after completion.
- Set trip status to `COMPLETED`.
- Set vehicle status to `AVAILABLE`.
- Set driver status to `AVAILABLE`.
- Update vehicle odometer.
- Create fuel log if fuel data is supplied.
- Emit realtime events.

Dispatched to Cancelled:
- Set trip status to `CANCELLED`.
- Restore vehicle and driver to `AVAILABLE`.
- Emit realtime events.

Draft to Cancelled:
- Set trip status to `CANCELLED`.
- No vehicle or driver status restore needed.

### Maintenance Status Transitions
Creating active maintenance:
- Set maintenance status to `ACTIVE`.
- Set vehicle status to `IN_SHOP`.
- Remove vehicle from dispatch availability.

Closing maintenance:
- Set maintenance status to `COMPLETED`.
- If vehicle is not retired, set vehicle status to `AVAILABLE`.
- Emit `maintenance.updated`, `vehicle.updated`, `dashboard.updated`.

## Innovative Feature: Smart Dispatch Score
This is the new idea to impress judges.

Build a transparent recommendation engine that ranks available vehicle-driver pairs. It should not feel like a black box. Show a score and reasons.

### Scoring Inputs
Vehicle score:
- Capacity fit: cargo must fit; smaller unused capacity is better than wasting a huge truck.
- Status: only Available vehicles can score.
- Maintenance risk: reduce score if odometer is high since last service.
- Cost efficiency: prefer lower recent cost per km.
- Fuel efficiency: prefer higher km/l from historical fuel logs.

Driver score:
- Availability: only Available drivers can score.
- License validity: expired license gives hard block.
- Safety score: higher score ranks better.
- Recent workload: prefer driver with fewer active/recent trips if available.

### UI Behavior
In the trip form:
- Add `Recommend` button next to vehicle/driver selectors.
- Show recommended pair with score.
- Show explanation bullets.
- Let dispatcher apply recommendation in one click.

Example:

```text
Recommended: Van-05 + Alex
Confidence: 92%
Why: capacity fits, license valid, high safety score, low recent cost/km
```

## Realtime Requirements
Listen and emit:

- `trip.updated`
- `vehicle.updated`
- `driver.updated`
- `maintenance.updated`
- `dashboard.updated`

When a trip is dispatched:
- Trip board updates instantly.
- Vehicle disappears from available vehicle dropdown.
- Driver disappears from available driver dropdown.
- Dashboard KPIs update.

When maintenance starts:
- Vehicle status changes to In Shop instantly.
- Vehicle disappears from trip selector.

## Acceptance Checklist
- Trip form loads only available vehicles and drivers.
- Over-capacity cargo is blocked with clear error.
- Suspended or expired-license driver is blocked.
- Dispatch changes vehicle and driver to On Trip.
- Complete changes vehicle and driver back to Available.
- Cancel restores vehicle and driver when needed.
- Active maintenance changes vehicle to In Shop.
- Closed maintenance restores vehicle to Available unless retired.
- Smart Dispatch Score returns a recommendation with reasons.
- Realtime events update UI without manual refresh.

## Demo Proof Points
Use this exact story:

1. Register `Van-05` with 500 kg capacity.
2. Register `Alex` with valid license and high safety score.
3. Create trip with 700 kg cargo and show blocked dispatch.
4. Change cargo to 450 kg and dispatch.
5. Show Van-05 and Alex become On Trip.
6. Complete trip with final odometer and fuel consumed.
7. Show both return to Available.
8. Start Oil Change maintenance.
9. Show Van-05 becomes In Shop and disappears from dispatch.

