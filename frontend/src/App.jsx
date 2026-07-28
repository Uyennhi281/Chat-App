import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Components
import Header from './components/Header';
import Banner from './components/Banner';
import Footer from './components/Footer';

// Pages - Public
import ProductPage       from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import CartPage          from './pages/CartPage';
import HomePage          from './pages/HomePage';

// Pages - Admin
import AdminDashboard    from './pages/admin/AdminDashboard';
import ProductCreatePage from './pages/admin/ProductCreatePage';
import ProductEditPage   from './pages/admin/ProductEditPage';

// Routes
import AdminRoute from './routes/AdminRoute';

// Pages - Order
import OrderHistoryPage  from './pages/OrderHistoryPage';
import OrderDetailPage   from './pages/OrderDetailPage';
import AdminOrdersPage   from './pages/admin/AdminOrdersPage';
import PrivateRoute      from './routes/PrivateRoute';

// Pages - Payment
import OrderPaymentPage  from './pages/OrderPaymentPage';
import StripeSuccessPage from './pages/payment/StripeSuccessPage';
import StripeCancelPage  from './pages/payment/StripeCancelPage';
import PayPalSuccessPage from './pages/payment/PayPalSuccessPage';
import PayPalCancelPage  from './pages/payment/PayPalCancelPage';
import VNPaySuccessPage  from './pages/payment/VNPaySuccessPage';
import VNPayCancelPage   from './pages/payment/VNPayCancelPage';

const theme = createTheme({
  palette: {
    primary:    { main: '#1976d2' },
    secondary:  { main: '#ff6b00' },
    background: { default: '#f5f5f5' },
  },
});


// Layout component cho public pages
const PublicLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header />
    <main style={{ flex: 1 }}>
      {children}
    </main>
    <Footer
      studentName="Nguyễn Cao Uyên Nhi"
      courseName="Full-Stack Web Development"
      semester="Summer 2026"
    />
  </div>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Private routes - cần đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/orders"             element={<PublicLayout><OrderHistoryPage /></PublicLayout>} />
          <Route path="/orders/:id"         element={<PublicLayout><OrderDetailPage /></PublicLayout>} />
          <Route path="/orders/:id/payment" element={<PublicLayout><OrderPaymentPage /></PublicLayout>} />
        </Route>


        {/* Public routes - có Header + Footer */}
        <Route path="/"             element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/products"     element={<PublicLayout><ProductPage /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
        <Route path="/cart"         element={<PublicLayout><CartPage /></PublicLayout>} />
        <Route path="/login"        element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route path="/register"     element={<PublicLayout><RegisterPage /></PublicLayout>} />
        {/* Payment callback routes - PUBLIC (redirect từ cổng thanh toán) */}
        <Route path="/payment/stripe/success"  element={<PublicLayout><StripeSuccessPage /></PublicLayout>} />
        <Route path="/payment/stripe/cancel"   element={<PublicLayout><StripeCancelPage /></PublicLayout>} />
        <Route path="/payment/paypal/success"  element={<PublicLayout><PayPalSuccessPage /></PublicLayout>} />
        <Route path="/payment/paypal/cancel"   element={<PublicLayout><PayPalCancelPage /></PublicLayout>} />
        <Route path="/payment/vnpay/success"   element={<PublicLayout><VNPaySuccessPage /></PublicLayout>} />
        <Route path="/payment/vnpay/cancel"    element={<PublicLayout><VNPayCancelPage /></PublicLayout>} />

        {/* Admin routes - có Sidebar, không có Header/Footer */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                      element={<AdminDashboard />} />
            <Route path="/admin/products"             element={<AdminDashboard />} />
            <Route path="/admin/products/new"         element={<ProductCreatePage />} />
            <Route path="/admin/products/edit/:id"    element={<ProductEditPage />} />
            <Route path="/admin/orders"            element={<AdminOrdersPage />} />  
            <Route path="/admin/orders/:id"        element={<OrderDetailPage />} /> 
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <PublicLayout>
            <section style={{ padding: '60px', textAlign: 'center' }}>
              <h2>404 - Không tìm thấy trang</h2>
            </section>
          </PublicLayout>
        } />
      </Routes>
    </ThemeProvider>
  );
};

export default App;