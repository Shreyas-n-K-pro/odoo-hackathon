import api from './axiosInstance';

export const getTrips      = (params?: any)     => api.get('/trips', { params }).then(res => res.data.data);
export const getTripById   = (id: any)          => api.get(`/trips/${id}`).then(res => res.data.data);
export const createTrip    = (data: any)        => api.post('/trips', data).then(res => res.data.data);
export const updateTrip    = (id: any, data: any)   => api.patch(`/trips/${id}`, data).then(res => res.data.data);
export const deleteTrip    = (id: any)          => api.delete(`/trips/${id}`).then(res => res.data);
export const dispatchTrip  = (id: any)          => api.patch(`/trips/${id}/dispatch`).then(res => res.data.data);
export const completeTrip  = (id: any, data: any)   => api.patch(`/trips/${id}/complete`, data).then(res => res.data.data);
export const cancelTrip    = (id: any)          => api.patch(`/trips/${id}/cancel`).then(res => res.data.data);
