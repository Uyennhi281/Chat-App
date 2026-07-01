import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';

export const productsApi = {
  async getAll(params = {}) {
    try {
      // Gọi GET /products [cite: 1191]
      const response = await axiosClient.get('/products', { params });
      return response.data; // Mochi-chan lưu ý: backend của tụi mình ở session 6 trả về { items: [...] } đó nha!
    } catch (error) {
      handleApiError(error, 'Failed to fetch products');
      throw error;
    }
  },

  async getById(id) {
    try {
        // Gọi GET /products/:id [cite: 1192]
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch product details');
      throw error;
    }
  },
};