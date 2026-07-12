import axiosInstance from './axiosInstance';

export const authApi = {
  signup: (data: any) => axiosInstance.post('/auth/signup', data),
  login:  (data: any) => axiosInstance.post('/auth/login', data),
  getMe:  ()          => axiosInstance.get('/auth/me'),
};
