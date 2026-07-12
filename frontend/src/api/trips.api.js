import api from './axiosInstance';

export const getTrips = (params) => api.get('/trips', { params }).then(res => res.data.data);
export const createTrip = (data) => api.post('/trips', data).then(res => res.data.data);
export const dispatchTrip = (id) => api.patch(`/trips/${id}/dispatch`).then(res => res.data.data);
export const completeTrip = (id, data) => api.patch(`/trips/${id}/complete`, data).then(res => res.data.data);
export const cancelTrip = (id) => api.patch(`/trips/${id}/cancel`).then(res => res.data.data);
