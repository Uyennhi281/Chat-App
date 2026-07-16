import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

// Helper: tạo header có Authorization
const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const productsApi = {
  async getAll(params = {}) {
    try {
      const response = await axiosClient.get('/products', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch products');
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch product');
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await axiosClient.post('/products', data, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create product');
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await axiosClient.put(`/products/${id}`, data, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update product');
      throw error;
    }
  },

  async delete(id) {
  const token = getToken();
  if (!token) {
    throw new Error('Vui lòng đăng nhập');
  }
  
  try {
    await axiosClient.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    // Log chi tiết lỗi
    console.error('Delete error:', error.response?.status, error.response?.data);
    throw error;
  }

  },
};