import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // ── Thêm vào giỏ ──────────────────────────────────────────
  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Sản phẩm đã có → tăng quantity
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Chưa có → thêm mới
      return [
        ...prev,
        {
          id:       product.id,
          name:     product.name,
          price:    product.price,
          imageUrl: product.imageUrl,
          quantity,
        },
      ];
    });
  };

  // ── Xóa khỏi giỏ ──────────────────────────────────────────
  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // ── Cập nhật số lượng ─────────────────────────────────────
  const updateQuantity = (productId, newQuantity) => {
    setItems((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((item) => item.id !== productId); // xóa nếu = 0
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // ── Xóa toàn bộ giỏ ──────────────────────────────────────
  const clearCart = () => setItems([]);

  // ── Tính tổng (useMemo tránh tính lại không cần thiết) ────
  const cartSummary = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice    = items.reduce(
      (sum, item) => sum + item.quantity * item.price, 0
    );
    return { totalQuantity, totalPrice };
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    ...cartSummary,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook để dùng Cart
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};