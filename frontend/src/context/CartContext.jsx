import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUser } from '../auth/token';

const CartContext = createContext(null);

const cartKeyFor = (userId) => `shophub_cart_${userId ?? 'guest'}`;

const loadCart = (userId) => {
  try {
    const raw = localStorage.getItem(cartKeyFor(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => getUser()?.id ?? null);
  const [items, setItems]   = useState(() => loadCart(userId));

  // Chuyển sang giỏ hàng của tài khoản tương ứng mỗi khi đăng nhập/đăng xuất
  useEffect(() => {
    const handleAuthChange = () => {
      const newUserId = getUser()?.id ?? null;
      setUserId(newUserId);
      setItems(loadCart(newUserId));
    };
    window.addEventListener('shophub-auth-changed', handleAuthChange);
    return () => window.removeEventListener('shophub-auth-changed', handleAuthChange);
  }, []);

  // Lưu giỏ hàng của tài khoản hiện tại mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem(cartKeyFor(userId), JSON.stringify(items));
  }, [items, userId]);

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