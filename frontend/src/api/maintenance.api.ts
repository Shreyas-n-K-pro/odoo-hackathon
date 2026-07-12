import axiosInstance from './axiosInstance';

export const maintenanceApi = {
  getAll: (params?: any) => axiosInstance.get('/maintenance', { params }),
  create: (data: any)   => axiosInstance.post('/maintenance', data),
  close:  (id: any)     => axiosInstance.patch(`/maintenance/${id}/close`),
};
