import axiosInstance from './axiosInstance';

export const fuelApi = {
  getFuelLogs: (params?: any) => axiosInstance.get('/fuel-logs', { params }),
  createFuelLog: (data: any) => axiosInstance.post('/fuel-logs', data),
  getExpenses: (params?: any) => axiosInstance.get('/expenses', { params }),
  createExpense: (data: any) => axiosInstance.post('/expenses', data),
  getFleetTotalCost: ()  => axiosInstance.get('/operational-cost/total'),
  getVehicleCost: (id: any)  => axiosInstance.get(`/vehicles/${id}/operational-cost`),
};
