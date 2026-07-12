const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDrivers = async (query = {}) => {
  const { status, region } = query;
  const where = {};
  if (status) where.status = status;
  if (region) where.region = region;
  
  return await prisma.driver.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

const getDriverById = async (id) => {
  return await prisma.driver.findUnique({
    where: { id: parseInt(id) }
  });
};

const createDriver = async (data) => {
  return await prisma.driver.create({
    data
  });
};

const updateDriver = async (id, data) => {
  return await prisma.driver.update({
    where: { id: parseInt(id) },
    data
  });
};

const deleteDriver = async (id) => {
  // Soft delete or status change, here we will just delete or mark inactive
  return await prisma.driver.update({
    where: { id: parseInt(id) },
    data: { status: 'Inactive' }
  });
};

const checkExpirations = async () => {
  const { sendEmail } = require('../../utils/email');
  
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringDrivers = await prisma.driver.findMany({
    where: {
      licenseExpiry: {
        lte: thirtyDaysFromNow
      }
    }
  });

  const results = [];

  if (expiringDrivers.length === 0) {
    return { count: 0, msg: 'No driver licenses expiring within the next 30 days.' };
  }

  // Send individual emails to drivers who have email addresses
  for (const driver of expiringDrivers) {
    const daysLeft = Math.ceil((new Date(driver.licenseExpiry) - now) / (1000 * 60 * 60 * 24));
    
    let timeLabel = '';
    let subject = '';
    let descriptionText = '';

    if (daysLeft < 0) {
      timeLabel = `EXPIRED (${Math.abs(daysLeft)} days ago)`;
      subject = `🚨 URGENT: Driver License has EXPIRED!`;
      descriptionText = `Your driving license (No: <strong>${driver.licenseNumber}</strong>) has <strong>EXPIRED</strong> as of <strong>${new Date(driver.licenseExpiry).toLocaleDateString()}</strong> (${Math.abs(daysLeft)} days ago).`;
    } else if (daysLeft === 0) {
      timeLabel = `Expires TODAY`;
      subject = `⚠️ URGENT: Driver License Expires TODAY!`;
      descriptionText = `Your driving license (No: <strong>${driver.licenseNumber}</strong>) is expiring <strong>TODAY</strong> (on <strong>${new Date(driver.licenseExpiry).toLocaleDateString()}</strong>).`;
    } else {
      timeLabel = `Expiring in ${daysLeft} days`;
      subject = `⚠️ URGENT: Driver License Expiring in ${daysLeft} Days`;
      descriptionText = `Your driving license (No: <strong>${driver.licenseNumber}</strong>) is expiring on <strong>${new Date(driver.licenseExpiry).toLocaleDateString()}</strong> (in ${daysLeft} days).`;
    }

    if (driver.email) {
      const emailResult = await sendEmail({
        to: driver.email,
        toName: driver.name,
        subject: subject,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #dc2626;">Driver License Expiration Warning</h2>
            <p>Hello <strong>${driver.name}</strong>,</p>
            <p>This is an automated notification from TransitOps. ${descriptionText}</p>
            <p>Please renew your license immediately and submit the updated documents to the Safety Office to avoid suspension of driving privileges.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">TransitOps Automated System. Please do not reply directly to this email.</p>
          </div>
        `
      });
      results.push({ driver: driver.name, email: driver.email, status: 'Sent', details: emailResult });
    } else {
      results.push({ driver: driver.name, email: null, status: 'Skipped (No Email Address)', details: null });
    }
  }

  // Send a master digest to the Safety Officer
  const safetyOfficerEmail = 'ramesh@transitops.in';
  const digestRows = expiringDrivers.map(d => {
    const daysLeft = Math.ceil((new Date(d.licenseExpiry) - now) / (1000 * 60 * 60 * 24));
    let timeLabel = '';
    let labelColor = '#d97706'; // orange

    if (daysLeft < 0) {
      timeLabel = `Expired (${Math.abs(daysLeft)} days ago)`;
      labelColor = '#ef4444'; // red
    } else if (daysLeft === 0) {
      timeLabel = `Expires TODAY`;
      labelColor = '#ef4444'; // red
    } else {
      timeLabel = `${daysLeft} days remaining`;
    }

    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${d.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${d.licenseNumber}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(d.licenseExpiry).toLocaleDateString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${labelColor};">${timeLabel}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${d.email || '<span style="color: #ef4444;">Missing Email</span>'}</td>
      </tr>
    `;
  }).join('');

  await sendEmail({
    to: safetyOfficerEmail,
    toName: 'Ramesh Nair (Safety Officer)',
    subject: `📋 Daily Digest: ${expiringDrivers.length} Expired/Expiring Driver Licenses`,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1e3a8a;">Daily License Expiry Digest</h2>
        <p>Hello Safety Officer,</p>
        <p>The following driver licenses are expired or expiring within the next 30 days. Please verify renewals:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left;">
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Driver</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">License No</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Expiry Date</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Time Remaining</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">Email Status</th>
            </tr>
          </thead>
          <tbody>
            ${digestRows}
          </tbody>
        </table>
        <p style="margin-top: 20px;">Please contact drivers missing an email address directly.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">TransitOps Automated System.</p>
      </div>
    `
  });

  return {
    count: expiringDrivers.length,
    results: results
  };
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  checkExpirations
};
