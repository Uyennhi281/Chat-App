import axiosClient from './axiosClient';
import { handleApiError } from './errorHandler';
import { getToken } from '../auth/token';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const ordersApi = {
  // Checkout – gửi giỏ hàng
  async checkout(cartItems, shippingProvider = 'IN_HOUSE', shippingFee = 0) {
    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          name:       item.name,
          price:      item.price,
          quantity:   item.quantity,
        })),
        shipping_provider: shippingProvider,
        shipping_fee:      shippingFee,
      };
      const response = await axiosClient.post('/orders/checkout', payload, authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to place order');
      throw error;
    }
  },

  // Tính phí vận chuyển
  async calculateShippingFee(shippingProvider) {
    try {
      const response = await axiosClient.post(
        '/shipping/calculate-fee',
        { shipping_provider: shippingProvider },
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to calculate shipping fee');
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

  // SHIPPER – đơn IN_HOUSE đang chờ nhận
  async getShipperAvailable() {
    try {
      const response = await axiosClient.get('/orders/shipper/available', authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch available orders');
      throw error;
    }
  },

  // SHIPPER – đơn của tôi
  async getShipperMy() {
    try {
      const response = await axiosClient.get('/orders/shipper/my', authHeader());
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch shipper orders');
      throw error;
    }
  },

  // SHIPPER – nhận đơn
  async claimOrder(orderId, location = {}) {
    try {
      const response = await axiosClient.patch(
        `/orders/${orderId}/claim`,
        { lat: location.lat ?? null, lng: location.lng ?? null },
        authHeader(),
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to claim order');
      throw error;
    }
  },

  // SHIPPER – báo kết quả giao hàng
  async deliverOrder(orderId, success, location = {}) {
    try {
      const response = await axiosClient.patch(
        `/orders/${orderId}/deliver`,
        { success, location: { lat: location.lat ?? null, lng: location.lng ?? null } },
        authHeader(),
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update delivery status');
      throw error;
    }
  },
};