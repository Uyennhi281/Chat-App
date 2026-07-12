import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const ordersApi = {
  // Checkout – gửi giỏ hàng
  async checkout(cartItems) {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          name:       item.name,
          price:      item.price,
          quantity:   item.quantity,
        })),
      };
      const response = await axiosClient.post('/orders/checkout', payload, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to place order');
      throw error;
    }
  },

  // Lịch sử đơn hàng của user
  async getMyOrders() {
    try {
      const response = await axiosClient.get('/orders/my', authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch orders');
      throw error;
    }
  },

  // Chi tiết 1 đơn hàng
  async getOrderById(id) {
    try {
      const response = await axiosClient.get(`/orders/${id}`, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch order details');
      throw error;
    }
  },

  // ADMIN – xem tất cả đơn
  async getAllForAdmin() {
    try {
      const response = await axiosClient.get('/orders/admin/all', authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch all orders');
      throw error;
    }
  },

  // ADMIN – đổi trạng thái
  async adminUpdateStatus(orderId, status) {
    try {
      const response = await axiosClient.patch(
        `/orders/${orderId}/status`,
        { status },
        authHeader(),
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update order status');
      throw error;
    }
  },

  // ADMIN – đổi số lượng item
  async adminUpdateItemQuantity(orderId, itemId, quantity) {
    try {
      const response = await axiosClient.patch(
        `/orders/${orderId}/items/quantity`,
        { item_id: itemId, quantity },
        authHeader(),
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update item quantity');
      throw error;
    }
  },
};