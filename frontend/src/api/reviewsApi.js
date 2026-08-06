import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const reviewsApi = {
  async getByProduct(productId) {
    try {
      const response = await axiosClient.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch reviews');
      throw error;
    }
  },

  async create(productId, { rating, comment }) {
    try {
      const response = await axiosClient.post(
        `/products/${productId}/reviews`,
        { rating, comment },
        authHeader(),
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to submit review');
      throw error;
    }
  },

  async remove(reviewId) {
    try {
      await axiosClient.delete(`/reviews/${reviewId}`, authHeader());
    } catch (error) {
      handleApiError(error, 'Failed to delete review');
      throw error;
    }
  },
};
