import api from './axiosInstance';

export const getDrivers = (params?: any) => api.get('/drivers', { params }).then(res => res.data.data);
export const createDriver = (data: any) => api.post('/drivers', data).then(res => res.data.data);
export const updateDriver = (id: any, data: any) => api.patch(`/drivers/${id}`, data).then(res => res.data.data);
export const deleteDriver = (id: any) => api.delete(`/drivers/${id}`).then(res => res.data.data);
export const triggerExpiryChecks = () => api.post('/drivers/check-expirations').then(res => res.data.data);
