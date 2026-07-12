import axiosInstance from './axiosInstance'

export const fuelApi = {
  getFuelLogs: (params) => axiosInstance.get('/fuel-logs', { params }),
  createFuelLog: (data) => axiosInstance.post('/fuel-logs', data),
  getExpenses: (params) => axiosInstance.get('/expenses', { params }),
  createExpense: (data) => axiosInstance.post('/expenses', data),
  getFleetTotalCost: ()  => axiosInstance.get('/operational-cost/total'),
  getVehicleCost: (id)  => axiosInstance.get(`/vehicles/${id}/operational-cost`),
}
