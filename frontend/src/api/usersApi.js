import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const usersApi = {
  async getAll() {
    try {
      const response = await axiosClient.get('/users', authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch users');
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await axiosClient.get(`/users/${id}`, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch user details');
      throw error;
    }
  },

  async updateRole(id, role) {
    try {
      const response = await axiosClient.patch(`/users/${id}/role`, { role }, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update user role');
      throw error;
    }
  },
};