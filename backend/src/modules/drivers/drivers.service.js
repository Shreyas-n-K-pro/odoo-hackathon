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

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};
