import api from './axiosInstance';

export const getDrivers = (params) => api.get('/drivers', { params }).then(res => res.data.data);
export const createDriver = (data) => api.post('/drivers', data).then(res => res.data.data);
export const updateDriver = (id, data) => api.patch(`/drivers/${id}`, data).then(res => res.data.data);
export const deleteDriver = (id) => api.delete(`/drivers/${id}`).then(res => res.data.data);
export const triggerExpiryChecks = () => api.post('/drivers/check-expirations').then(res => res.data.data);
