import axiosClient from './axiosClient';
import { getToken } from '../auth/token';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const paymentsApi = {
  async createStripeSession(orderId) {
    const res = await axiosClient.post(
      '/payments/stripe/create-session',
      { order_id: orderId },
      authHeader()
    );
    return res.data;
  },

  async createPayPalOrder(orderId) {
    const res = await axiosClient.post(
      '/payments/paypal/create-order',
      { order_id: orderId },
      authHeader()
    );
    return res.data;
  },

  async createVNPayUrl(orderId) {
    const res = await axiosClient.post(
      '/payments/vnpay/create-url',
      { order_id: orderId },
      authHeader()
    );
    return res.data;
  },

  async confirmPayment(orderId, provider) {
    const res = await axiosClient.post(
      '/payments/confirm',
      { order_id: orderId, provider },
      authHeader()
    );
    return res.data;
  },
};