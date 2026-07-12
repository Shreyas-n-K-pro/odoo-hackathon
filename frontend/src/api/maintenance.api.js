import axiosInstance from './axiosInstance'

export const maintenanceApi = {
  getAll: (params) => axiosInstance.get('/maintenance', { params }),
  create: (data)   => axiosInstance.post('/maintenance', data),
  close:  (id)     => axiosInstance.patch(`/maintenance/${id}/close`),
}
