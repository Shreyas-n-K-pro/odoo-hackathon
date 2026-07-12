// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Database Seed Script
// Run: node prisma/seed.js  (after npx prisma db push)
// Seeds: 1 settings row, 4 users (one per role), 6 vehicles
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Settings singleton ──────────────────────────────────────────────────
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      depotName: 'Gandhinagar Depot GJ4',
      currency: 'INR (Rs)',
      distanceUnit: 'Kilometers',
    },
  });
  console.log('✅ Settings seeded');

  // ── Users (one per role) ────────────────────────────────────────────────
  const password = await bcrypt.hash('Transit@123', 10);

  const users = [
    { name: 'Arjun Mehta',    email: 'arjun@transitops.in',    role: 'Fleet_Manager' },
    { name: 'Priya Sharma',   email: 'priya@transitops.in',    role: 'Dispatcher' },
    { name: 'Ramesh Nair',    email: 'ramesh@transitops.in',   role: 'Safety_Officer' },
    { name: 'Sneha Patel',    email: 'sneha@transitops.in',    role: 'Financial_Analyst' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: password },
    });
  }
  console.log('✅ Users seeded (password: Transit@123 for all)');

  // ── Vehicles ────────────────────────────────────────────────────────────
  const vehicles = [
    {
      regNumber: 'VAN-05',
      name: 'Tata Ace Gold',
      type: 'Van',
      capacityKg: 750.00,
      odometer: 28450,
      acquisitionCost: 550000.00,
      status: 'Available',
      region: 'North Zone',
    },
    {
      regNumber: 'TRUCK-11',
      name: 'Ashok Leyland Dost',
      type: 'Truck',
      capacityKg: 2000.00,
      odometer: 87200,
      acquisitionCost: 1200000.00,
      status: 'On_Trip',
      region: 'South Zone',
    },
    {
      regNumber: 'MINI-03',
      name: 'Mahindra Jeeto',
      type: 'Mini',
      capacityKg: 500.00,
      odometer: 41000,
      acquisitionCost: 480000.00,
      status: 'In_Shop',
      region: 'East Zone',
    },
    {
      regNumber: 'VAN-09',
      name: 'Force Traveller',
      type: 'Van',
      capacityKg: 900.00,
      odometer: 125000,
      acquisitionCost: 620000.00,
      status: 'Retired',
      region: 'West Zone',
    },
    {
      regNumber: 'TRUCK-07',
      name: 'Eicher Pro 2095',
      type: 'Truck',
      capacityKg: 5000.00,
      odometer: 55000,
      acquisitionCost: 1800000.00,
      status: 'Available',
      region: 'North Zone',
    },
    {
      regNumber: 'VAN-14',
      name: 'Tata Winger',
      type: 'Van',
      capacityKg: 850.00,
      odometer: 32000,
      acquisitionCost: 700000.00,
      status: 'Available',
      region: 'Central Zone',
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { regNumber: v.regNumber },
      update: {},
      create: v,
    });
  }
  console.log('✅ Vehicles seeded (6 vehicles across all statuses)');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('   Fleet Manager   → arjun@transitops.in   / Transit@123');
  console.log('   Dispatcher      → priya@transitops.in   / Transit@123');
  console.log('   Safety Officer  → ramesh@transitops.in  / Transit@123');
  console.log('   Financial Analyst → sneha@transitops.in / Transit@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
