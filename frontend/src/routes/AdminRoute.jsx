import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập → redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Đã đăng nhập nhưng không phải ADMIN → Access Denied
  if (!isAdmin) {
    return (
      <section style={{
        padding: '60px 24px',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '0 auto',
      }}>
        <h2 style={{ color: 'red', fontSize: '48px' }}>🚫</h2>
        <h2>Access Denied</h2>
        <p style={{ color: '#666', marginTop: '12px' }}>
          Bạn không có quyền truy cập trang này.
        </p>
      </section>
    );
  }

  // Là ADMIN → render route con
  return <Outlet />;
};

export default AdminRoute;