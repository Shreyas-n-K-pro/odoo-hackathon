import axiosInstance from './axiosInstance'

export const vehicleApi = {
  getAll:   (params) => axiosInstance.get('/vehicles', { params }),
  getStats: ()       => axiosInstance.get('/vehicles/stats'),
  getById:  (id)     => axiosInstance.get(`/vehicles/${id}`),
  create:   (data)   => axiosInstance.post('/vehicles', data),
  update:   (id, data) => axiosInstance.patch(`/vehicles/${id}`, data),
  retire:   (id)     => axiosInstance.delete(`/vehicles/${id}`),
}
