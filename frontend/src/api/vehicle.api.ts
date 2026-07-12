import axiosInstance from './axiosInstance';

export const vehicleApi = {
  getAll:   (params?: any) => axiosInstance.get('/vehicles', { params }),
  getStats: ()             => axiosInstance.get('/vehicles/stats'),
  getById:  (id: any)      => axiosInstance.get(`/vehicles/${id}`),
  create:   (data: any)    => axiosInstance.post('/vehicles', data),
  update:   (id: any, data: any) => axiosInstance.patch(`/vehicles/${id}`, data),
  retire:   (id: any)      => axiosInstance.delete(`/vehicles/${id}`),
};
