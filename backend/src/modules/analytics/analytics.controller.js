const service = require('./analytics.service');
const costService = require('../cost/cost.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try {
    const summary = await service.getSummary();
    return sendSuccess(res, summary, 'Analytics summary retrieved.');
  } catch (err) {
    next(err);
  }
};

const getFuelEfficiency = async (req, res, next) => {
  try {
    const efficiency = await service.getFuelEfficiency();
    return sendSuccess(res, efficiency, 'Fuel efficiency metrics retrieved.');
  } catch (err) {
    next(err);
  }
};

const getVehicleROI = async (req, res, next) => {
  try {
    const roi = await service.getVehicleROI();
    return sendSuccess(res, roi, 'Vehicle ROI metrics retrieved.');
  } catch (err) {
    next(err);
  }
};

const getMonthlyRevenue = async (req, res, next) => {
  try {
    const revenue = await service.getMonthlyRevenue();
    return sendSuccess(res, revenue, 'Monthly revenue trends retrieved.');
  } catch (err) {
    next(err);
  }
};

const getTopCostliestVehicles = async (req, res, next) => {
  try {
    const costliest = await service.getTopCostliestVehicles();
    return sendSuccess(res, costliest, 'Top costliest vehicles retrieved.');
  } catch (err) {
    next(err);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const { reportType } = req.query; // 'summary' | 'roi' | 'cost' | 'efficiency'
    let csvContent = '';
    let filename = 'report.csv';

    if (reportType === 'roi') {
      const { vehicles } = await service.getVehicleROI();
      filename = 'vehicle_roi_report.csv';
      csvContent = 'Vehicle Name,Reg Number,Revenue (₹),Acquisition Cost (₹),Maintenance (₹),Fuel (₹),ROI (%)\n';
      vehicles.forEach(v => {
        csvContent += `"${v.name}","${v.regNumber}",${v.revenue},${v.acquisitionCost},${v.maintenanceCost},${v.fuelCost},${v.roi}\n`;
      });
    } else if (reportType === 'cost') {
      const vehicles = await service.getTopCostliestVehicles();
      filename = 'vehicle_operational_costs.csv';
      csvContent = 'Vehicle Name,Reg Number,Fuel Cost (₹),Maintenance Cost (₹),Total Operational Cost (₹)\n';
      vehicles.forEach(v => {
        csvContent += `"${v.name}","${v.regNumber}",${v.fuelCost},${v.maintenanceCost},${v.totalCost}\n`;
      });
    } else {
      const summary = await service.getSummary();
      filename = 'fleet_analytics_summary.csv';
      csvContent = 'Metric,Value\n';
      csvContent += `Active Vehicles,${summary.activeVehicles}\n`;
      csvContent += `Available Vehicles,${summary.availableVehicles}\n`;
      csvContent += `Vehicles on Trip,${summary.vehiclesOnTrip}\n`;
      csvContent += `Vehicles in Maintenance,${summary.vehiclesInMaintenance}\n`;
      csvContent += `Active Trips,${summary.activeTrips}\n`;
      csvContent += `Completed Trips,${summary.completedTrips}\n`;
      csvContent += `Fleet Utilization (%),${summary.fleetUtilizationPct}%\n`;
      csvContent += `Total Fuel Cost,${summary.totalFuelCost}\n`;
      csvContent += `Total Maintenance Cost,${summary.maintenanceCost}\n`;
      csvContent += `Total Operational Cost,${summary.totalOperationalCost}\n`;
      csvContent += `Total Estimated Revenue,${summary.revenue}\n`;
      csvContent += `Total Profit,${summary.profit}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
  getFuelEfficiency,
  getVehicleROI,
  getMonthlyRevenue,
  getTopCostliestVehicles,
  exportCSV
};
