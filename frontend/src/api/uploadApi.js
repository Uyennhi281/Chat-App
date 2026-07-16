import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

export const uploadApi = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  },
};