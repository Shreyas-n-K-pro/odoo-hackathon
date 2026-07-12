import axiosInstance from './axiosInstance'

export const settingsApi = {
  get:         ()       => axiosInstance.get('/settings'),
  update:      (data)   => axiosInstance.patch('/settings', data),
  getRbacMatrix: ()     => axiosInstance.get('/settings/rbac'),
}
