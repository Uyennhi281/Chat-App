import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const ShipperRoute = () => {
  const { isAuthenticated, isShipper } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isShipper) {
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
          Trang này chỉ dành cho Shipper.
        </p>
      </section>
    );
  }

  return <Outlet />;
};

export default ShipperRoute;
