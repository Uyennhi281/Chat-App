import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';

export const authApi = {
  async register(data) {
    try {
      const response = await axiosClient.post('/register', data);
      return response.data; // AuthUser
    } catch (error) {
      handleApiError(error, 'Failed to register');
      throw error;
    }
  },

  async login(data) {
    try {
      const response = await axiosClient.post('/login', data);
      return response.data; // TokenResponse { access_token, token_type, user }
    } catch (error) {
      handleApiError(error, 'Failed to login');
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await axiosClient.post('/forgot-password', { email });
      return response.data; // { message, reset_url }
    } catch (error) {
      handleApiError(error, 'Failed to request password reset');
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await axiosClient.post('/reset-password', {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to reset password');
      throw error;
    }
  },
};